
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, Firestore, collection, doc, getDoc, getDocs, 
  setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, 
  startAfter, onSnapshot, serverTimestamp, DocumentData, 
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { 
  User, Tenant, Report, SystemMessage, Insertion, 
  PhotoRequest, LandingPageConfig, Message 
} from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyChAnt8LMwGJItyC821LljU0s7sE8jvJFM",
  authDomain: "lovelink-db-firestore.firebaseapp.com",
  projectId: "lovelink-db-firestore",
  storageBucket: "lovelink-db-firestore.firebasestorage.app",
  messagingSenderId: "723587249789",
  appId: "1:723587249789:web:134dcccd6f4fbceb73a314"
};

class DBService {
  public db: Firestore | null = null;
  public auth: Auth | null = null;
  private app: FirebaseApp | null = null;
  private initialized = false;
  private lastPresenceUpdate: Record<string, number> = {};
  private _sortIndexMissing = false;

  constructor() {
    // Lazy initialization handled in getDb()
  }

  getDb() {
    if (!this.db) {
      try {
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
        this.auth = getAuth(this.app);
      } catch (e) {
        console.error("Firebase Init Error:", e);
        throw e;
      }
    }
    return this.db;
  }

  getAuthInstance() {
    this.getDb();
    return this.auth;
  }

  private checkDb() {
    if (!this.getDb()) throw new Error("Database not initialized");
  }

  async initialize() {
    this.getDb();
    if (!this.initialized) {
      this.initialized = true;
    }
  }

  // --- Users ---

  async getUser(uid: string): Promise<User | null> {
    this.checkDb();
    const snap = await getDoc(doc(this.db!, 'users', uid));
    return snap.exists() ? (snap.data() as User) : null;
  }

  subscribeToUser(uid: string, callback: (user: User | null, error?: any) => void) {
    this.checkDb();
    return onSnapshot(doc(this.db!, 'users', uid), 
      (snap) => {
        callback(snap.exists() ? (snap.data() as User) : null);
      },
      (error) => {
        console.error("Snapshot error for user:", uid, error);
        callback(null, error);
      }
    );
  }

  async saveUser(user: User): Promise<void> {
    this.checkDb();
    await setDoc(doc(this.db!, 'users', user.uid), user);
  }

  async updateUser(uid: string, data: Partial<User>): Promise<void> {
    this.checkDb();
    // Filter undefined values
    const cleanData = Object.entries(data).reduce((acc, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {} as any);
    await updateDoc(doc(this.db!, 'users', uid), cleanData);
  }

  async updateLastActive(uid: string) {
    this.checkDb();
    const now = Date.now();
    const lastUpdate = this.lastPresenceUpdate[uid] || 0;
    // Throttle updates to every 5 minutes
    if (now - lastUpdate > 5 * 60 * 1000) {
        try {
            await updateDoc(doc(this.db!, 'users', uid), { 
                lastActiveAt: new Date().toISOString() 
            });
            this.lastPresenceUpdate[uid] = now;
        } catch (e) {
            console.warn("Failed to update presence", e);
        }
    }
  }

  async deleteUser(uid: string): Promise<void> {
    this.checkDb();
    await deleteDoc(doc(this.db!, 'users', uid));
  }

  async deleteAllUsers(): Promise<void> {
     this.checkDb();
     const snap = await getDocs(collection(this.db!, 'users'));
     // Naive deletion
     const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
     await Promise.all(deletePromises);
  }

  async getAllUsers(tenantId?: string): Promise<User[]> {
      this.checkDb();
      let q;
      if (tenantId) {
          q = query(collection(this.db!, 'users'), where('tenantId', '==', tenantId));
      } else {
          q = collection(this.db!, 'users');
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as User);
  }

  async getUsersWhoLikedMe(uid: string): Promise<User[]> {
    this.checkDb();
    const q = query(collection(this.db!, 'users'), where('likedUserIds', 'array-contains', uid));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as User);
  }

  // Optimized fetch for Browse page with Pagination and Circuit Breaker
  async getBrowsableUsers(tenantId: string, limitCount = 20, lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<{ users: User[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    this.checkDb();

    if (this._sortIndexMissing) {
      return this.getFallbackBrowsableUsers(tenantId, limitCount, lastDoc);
    }

    let q = query(
      collection(this.db!, 'users'),
      where('tenantId', '==', tenantId),
      where('status', '==', 'ACTIVE'),
      orderBy('lastActiveAt', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    try {
      const snap = await getDocs(q);
      const users = snap.docs.map(d => d.data() as User);
      const lastVisible = snap.docs[snap.docs.length - 1] || null;
      return { users, lastDoc: lastVisible };
    } catch (e: any) {
      if (e.code === 'failed-precondition' || e.message.includes('index')) {
        if (!this._sortIndexMissing) {
          console.warn("⚠️ FIRESTORE INDEX MISSING. Switching to fallback (unsorted) query. Performance may be impacted.");
          this._sortIndexMissing = true; 
        }
        return this.getFallbackBrowsableUsers(tenantId, limitCount, lastDoc);
      }
      throw e;
    }
  }

  private async getFallbackBrowsableUsers(tenantId: string, limitCount: number, lastDoc?: QueryDocumentSnapshot<DocumentData>) {
    let fallbackQ = query(
      collection(this.db!, 'users'),
      where('tenantId', '==', tenantId),
      where('status', '==', 'ACTIVE'),
      limit(limitCount)
    );

    if (lastDoc) {
        fallbackQ = query(fallbackQ, startAfter(lastDoc));
    }

    const snap = await getDocs(fallbackQ);
    const users = snap.docs.map(d => d.data() as User);
    const lastVisible = snap.docs[snap.docs.length - 1] || null;

    return { users, lastDoc: lastVisible };
  }

  // --- Tenants ---

  async getAllTenants(): Promise<Tenant[]> {
      this.checkDb();
      const snap = await getDocs(collection(this.db!, 'tenants'));
      return snap.docs.map(d => d.data() as Tenant);
  }

  async saveTenant(tenant: Tenant) {
      this.checkDb();
      await setDoc(doc(this.db!, 'tenants', tenant.id), tenant);
  }

  async deleteTenant(id: string) {
      this.checkDb();
      await deleteDoc(doc(this.db!, 'tenants', id));
  }

  // --- Messages ---

  subscribeToMessages(userId: string, otherId: string, callback: (msgs: Message[]) => void) {
      this.checkDb();
      const q1 = query(collection(this.db!, 'messages'), where('senderId', '==', userId), where('receiverId', '==', otherId));
      const q2 = query(collection(this.db!, 'messages'), where('senderId', '==', otherId), where('receiverId', '==', userId));
      
      let msgs1: Message[] = [];
      let msgs2: Message[] = [];
      
      const update = () => {
          const all = [...msgs1, ...msgs2].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          callback(all);
      };

      const unsub1 = onSnapshot(q1, (snap) => {
          msgs1 = snap.docs.map(d => d.data() as Message);
          update();
      }, (error) => console.error("subscribeToMessages q1 error:", error));

      const unsub2 = onSnapshot(q2, (snap) => {
          msgs2 = snap.docs.map(d => d.data() as Message);
          update();
      }, (error) => console.error("subscribeToMessages q2 error:", error));

      return () => { unsub1(); unsub2(); };
  }

  async saveMessage(msg: Message) {
      this.checkDb();
      await setDoc(doc(this.db!, 'messages', msg.id), msg);
  }
  
  async markMessageAsViewed(msgId: string) {
      this.checkDb();
      await updateDoc(doc(this.db!, 'messages', msgId), { viewedAt: new Date().toISOString() });
  }

  async deleteMessage(msgId: string) {
      this.checkDb();
      await updateDoc(doc(this.db!, 'messages', msgId), { isDeleted: true });
  }

  async deleteConversation(userId: string, otherId: string) {
      this.checkDb();
      const q1 = query(collection(this.db!, 'messages'), where('senderId', '==', userId), where('receiverId', '==', otherId));
      const q2 = query(collection(this.db!, 'messages'), where('senderId', '==', otherId), where('receiverId', '==', userId));
      
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      for (const d of [...snap1.docs, ...snap2.docs]) {
        await deleteDoc(d.ref);
      }
  }

  async markConversationAsRead(userId: string, otherId: string) {
      this.checkDb();
      const q = query(collection(this.db!, 'messages'), 
        where('receiverId', '==', userId), 
        where('senderId', '==', otherId), 
        where('isRead', '==', false)
      );
      const snap = await getDocs(q);
      const updatePromises = snap.docs.map(d => updateDoc(d.ref, { isRead: true }));
      await Promise.all(updatePromises);
  }

  async getConversationsSummary(userId: string): Promise<Record<string, number>> {
      this.checkDb();
      const q = query(collection(this.db!, 'messages'), where('receiverId', '==', userId));
      const snap = await getDocs(q);
      const counts: Record<string, number> = {};
      
      snap.docs.forEach(d => {
          const m = d.data() as Message;
          if (!m.isRead && !m.isDeleted) {
              counts[m.senderId] = (counts[m.senderId] || 0) + 1;
          }
          if (counts[m.senderId] === undefined) counts[m.senderId] = 0;
      });
      return counts;
  }
  
  subscribeToUnreadCount(userId: string, callback: (count: number) => void) {
      this.checkDb();
      const q = query(collection(this.db!, 'messages'), where('receiverId', '==', userId), where('isRead', '==', false));
      return onSnapshot(q, snap => {
          const count = snap.docs.filter(d => !(d.data() as Message).isDeleted).length;
          callback(count);
      }, (error) => console.error("subscribeToUnreadCount error:", error));
  }

  // --- Reports ---

  async saveReport(report: Report) {
      this.checkDb();
      await setDoc(doc(this.db!, 'reports', report.id), report);
  }

  async getReports(status?: string): Promise<Report[]> {
      this.checkDb();
      let q;
      if (status) {
          q = query(collection(this.db!, 'reports'), where('status', '==', status));
      } else {
          q = collection(this.db!, 'reports');
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as Report);
  }

  async updateReportStatus(id: string, status: 'RESOLVED' | 'DISMISSED') {
      this.checkDb();
      await updateDoc(doc(this.db!, 'reports', id), { status });
  }

  // --- System Messages (Announcements) ---

  async getSystemMessages(): Promise<SystemMessage[]> {
      this.checkDb();
      const q = query(collection(this.db!, 'system_announcements'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as SystemMessage);
  }

  subscribeToSystemMessages(activeOnly: boolean, callback: (msgs: SystemMessage[]) => void) {
      this.checkDb();
      let q;
      if (activeOnly) {
          q = query(collection(this.db!, 'system_announcements'), where('isActive', '==', true));
      } else {
          q = collection(this.db!, 'system_announcements');
      }
      return onSnapshot(q, snap => {
          callback(snap.docs.map(d => d.data() as SystemMessage));
      }, (error) => console.error("subscribeToSystemMessages error:", error));
  }

  async saveSystemMessage(msg: SystemMessage) {
      this.checkDb();
      await setDoc(doc(this.db!, 'system_announcements', msg.id), msg);
  }

  async deleteSystemMessage(id: string) {
      this.checkDb();
      await deleteDoc(doc(this.db!, 'system_announcements', id));
  }
  
  async republishSystemMessage(id: string) {
      this.checkDb();
      await updateDoc(doc(this.db!, 'system_announcements', id), { republishedAt: new Date().toISOString(), isActive: true });
  }

  // --- Insertions (Ads) ---

  async getInsertions(tenantId?: string, activeOnly: boolean = false): Promise<Insertion[]> {
      this.checkDb();
      const q = collection(this.db!, 'insertions');
      const snap = await getDocs(q);
      let ads = snap.docs.map(d => d.data() as Insertion);
      
      if (activeOnly) {
          ads = ads.filter(a => a.isActive);
      }
      if (tenantId) {
          ads = ads.filter(a => a.tenantId === 'GLOBAL' || a.tenantId === tenantId);
      }
      return ads;
  }

  async saveInsertion(ad: Insertion) {
      this.checkDb();
      await setDoc(doc(this.db!, 'insertions', ad.id), ad);
  }

  async deleteInsertion(id: string) {
      this.checkDb();
      await deleteDoc(doc(this.db!, 'insertions', id));
  }

  async toggleInsertionLike(adId: string, userId: string) {
      this.checkDb();
      const ref = doc(this.db!, 'insertions', adId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
          const ad = snap.data() as Insertion;
          const likes = ad.likedUserIds || [];
          const newLikes = likes.includes(userId) ? likes.filter(id => id !== userId) : [...likes, userId];
          await updateDoc(ref, { likedUserIds: newLikes });
      }
  }

  // --- Photos ---

  async requestPhotoAccess(req: PhotoRequest) {
      this.checkDb();
      await setDoc(doc(this.db!, 'photo_requests', req.id), req);
  }

  async getPhotoRequests(userId: string, direction: 'INCOMING' | 'OUTGOING'): Promise<PhotoRequest[]> {
      this.checkDb();
      const field = direction === 'INCOMING' ? 'ownerId' : 'requesterId';
      const q = query(collection(this.db!, 'photo_requests'), where(field, '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as PhotoRequest);
  }
  
  subscribeToPhotoRequests(userId: string, direction: 'INCOMING' | 'OUTGOING', callback: (reqs: PhotoRequest[]) => void) {
      this.checkDb();
      const field = direction === 'INCOMING' ? 'ownerId' : 'requesterId';
      const q = query(collection(this.db!, 'photo_requests'), where(field, '==', userId));
      return onSnapshot(q, snap => {
          callback(snap.docs.map(d => d.data() as PhotoRequest));
      }, (error) => console.error("subscribeToPhotoRequests error:", error));
  }

  async updatePhotoRequestStatus(id: string, status: 'APPROVED' | 'REJECTED') {
      this.checkDb();
      await updateDoc(doc(this.db!, 'photo_requests', id), { status });
  }

  // --- Config (System Config) ---

  async getLandingPageConfig(): Promise<LandingPageConfig | null> {
      this.checkDb();
      // Changed 'config' to 'system_config' to match rules
      const snap = await getDoc(doc(this.db!, 'system_config', 'landing_page'));
      return snap.exists() ? (snap.data() as LandingPageConfig) : null;
  }

  async saveLandingPageConfig(config: LandingPageConfig) {
      this.checkDb();
      // Changed 'config' to 'system_config' to match rules
      await setDoc(doc(this.db!, 'system_config', 'landing_page'), config);
  }
}

export const db = new DBService();
export const auth = db.getAuthInstance();
