import { User, Tenant, Report, Message, LandingPageConfig, PhotoRequest, AccessDuration, SystemMessage, Insertion } from '../types';
import { MOCK_TENANTS } from './mockStore';
import { MOCK_USERS } from '../config/matchRules.config';

// Firebase Imports
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  onSnapshot,
  limit,
  orderBy,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyChAnt8LMwGJItyC821LljU0s7sE8jvJFM",
  authDomain: "lovelink-db-firestore.firebaseapp.com",
  projectId: "lovelink-db-firestore",
  storageBucket: "lovelink-db-firestore.firebasestorage.app",
  messagingSenderId: "723587249789",
  appId: "1:723587249789:web:134dcccd6f4fbceb73a314"
};

export interface IDatabaseService {
  initialize(): Promise<void>;

  // User Operations
  getUser(uid: string): Promise<User | null>;
  subscribeToUser(uid: string, callback: (user: User | null, error?: any) => void): () => void;
  getUserByEmail(email: string): Promise<User | null>;
  getAllUsers(tenantId?: string): Promise<User[]>;
  getBrowsableUsers(tenantId: string, limitCount?: number, lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<{ users: User[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }>;
  getUsersWhoLikedMe(myUid: string): Promise<User[]>;
  saveUser(user: User): Promise<void>;
  updateUser(uid: string, data: Partial<User>): Promise<void>;
  deleteUser(uid: string): Promise<void>;
  deleteAllUsers(): Promise<void>;
  updateLastActive(uid: string): Promise<void>;

  // Tenant Operations
  getAllTenants(): Promise<Tenant[]>;
  saveTenant(tenant: Tenant): Promise<void>;
  deleteTenant(id: string): Promise<void>;

  // Message Operations
  getMessages(userId: string, otherId: string): Promise<Message[]>;
  subscribeToMessages(userId: string, otherId: string, callback: (msgs: Message[]) => void): () => void;
  saveMessage(message: Message): Promise<void>;
  markConversationAsRead(userId: string, otherId: string): Promise<void>;
  markMessageAsViewed(messageId: string): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  subscribeToUnreadCount(userId: string, callback: (count: number) => void): () => void;
  deleteConversation(userId: string, otherId: string): Promise<void>;
  getConversationsSummary(userId: string): Promise<Record<string, number>>;

  // Report Operations
  saveReport(report: Report): Promise<void>;
  getReports(status?: 'PENDING' | 'RESOLVED' | 'DISMISSED'): Promise<Report[]>;
  updateReportStatus(id: string, status: 'RESOLVED' | 'DISMISSED'): Promise<void>;

  // System Messages Operations
  saveSystemMessage(message: SystemMessage): Promise<void>;
  republishSystemMessage(id: string): Promise<void>;
  getSystemMessages(activeOnly?: boolean): Promise<SystemMessage[]>;
  subscribeToSystemMessages(activeOnly: boolean, callback: (msgs: SystemMessage[]) => void): () => void;
  deleteSystemMessage(id: string): Promise<void>;

  // Photo Request Operations
  requestPhotoAccess(request: PhotoRequest): Promise<void>;
  getPhotoRequests(userId: string, type: 'INCOMING' | 'OUTGOING'): Promise<PhotoRequest[]>;
  subscribeToPhotoRequests(userId: string, type: 'INCOMING' | 'OUTGOING', callback: (reqs: PhotoRequest[]) => void): () => void;
  updatePhotoRequestStatus(requestId: string, status: 'APPROVED' | 'REJECTED', duration?: AccessDuration): Promise<void>;

  // System Config Operations
  getLandingPageConfig(): Promise<LandingPageConfig | null>;
  saveLandingPageConfig(config: LandingPageConfig): Promise<void>;

  // Insertion (Ads) Operations
  saveInsertion(insertion: Insertion): Promise<void>;
  getInsertions(tenantId?: string, activeOnly?: boolean): Promise<Insertion[]>;
  deleteInsertion(id: string): Promise<void>;
  toggleInsertionLike(insertionId: string, userId: string): Promise<void>;
}

class FirebaseService implements IDatabaseService {
  private db: any = null;
  private auth: Auth | null = null;
  private app: FirebaseApp | null = null;
  private initialized = false;
  private lastPresenceUpdate: Record<string, number> = {};

  // Circuit Breaker Flag for Missing Index
  private _sortIndexMissing = false;

  constructor() { }

  private getDb() {
    if (!this.db) {
      try {
        const apps = getApps();
        if (apps.length > 0) {
          this.app = apps[0];
          try {
            this.db = getFirestore(this.app);
          } catch {
            this.db = initializeFirestore(this.app, {
              localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager()
              })
            });
          }
        } else {
          this.app = initializeApp(firebaseConfig);
          try {
            this.db = initializeFirestore(this.app, {
              localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager()
              })
            });
          } catch (initErr) {
            console.warn("Firestore Persistence Init Failed, falling back to memory:", initErr);
            this.db = getFirestore(this.app);
          }
        }
        this.auth = getAuth(this.app);
      } catch (e) {
        console.error("Firebase Init Error:", e);
        throw e;
      }
    }
    return this.db;
  }

  public getAuthInstance() {
    this.getDb();
    return this.auth;
  }

  private checkDb() {
    if (!this.getDb()) throw new Error("Database not initialized");
  }

  async initialize(): Promise<void> {
    this.getDb();
    if (!this.initialized) {
      this.initialized = true;
    }
  }

  async getUser(uid: string): Promise<User | null> {
    this.checkDb();
    const snap = await getDoc(doc(this.db, 'users', uid));
    return snap.exists() ? (snap.data() as User) : null;
  }

  subscribeToUser(uid: string, callback: (user: User | null, error?: any) => void): () => void {
    this.checkDb();
    // Added error handling to prevent hanging loading states
    return onSnapshot(
      doc(this.db, 'users', uid),
      (doc) => {
        callback(doc.exists() ? (doc.data() as User) : null);
      },
      (error) => {
        console.error("Snapshot error for user:", uid, error);
        // Pass error to callback instead of just null
        callback(null, error);
      }
    );
  }

  async getUserByEmail(email: string): Promise<User | null> {
    this.checkDb();
    const q = query(collection(this.db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    return snap.empty ? null : snap.docs[0].data() as User;
  }

  async getAllUsers(tenantId?: string): Promise<User[]> {
    this.checkDb();
    let q = tenantId ? query(collection(this.db, 'users'), where('tenantId', '==', tenantId)) : collection(this.db, 'users');
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as User);
  }

  // Optimized fetch for Browse page with Pagination and Circuit Breaker
  async getBrowsableUsers(tenantId: string, limitCount = 20, lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<{ users: User[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    this.checkDb();

    // Fast path: If we already know the index is missing, skip to fallback immediately to prevent console spam.
    if (this._sortIndexMissing) {
      return this.getFallbackBrowsableUsers(tenantId, limitCount);
    }

    // Base query: Active users in tenant, sorted by activity
    let q = query(
      collection(this.db, 'users'),
      where('tenantId', '==', tenantId),
      where('status', '==', 'ACTIVE'),
      orderBy('lastActiveAt', 'desc'),
      limit(limitCount)
    );

    // Apply cursor if provided
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    try {
      const snap = await getDocs(q);
      const users = snap.docs.map(d => d.data() as User);
      const lastVisible = snap.docs[snap.docs.length - 1] || null;
      return { users, lastDoc: lastVisible };
    } catch (e: any) {
      // Handle Missing Index Error specifically
      if (e.code === 'failed-precondition' || e.message.includes('index')) {
        if (!this._sortIndexMissing) {
          console.warn("⚠️ FIRESTORE INDEX MISSING. Switching to fallback (unsorted) query. Check console for creation link.");
          console.error("To create the missing index, visit this link:", e.message);
          this._sortIndexMissing = true; // Trip the circuit breaker
        }
        return this.getFallbackBrowsableUsers(tenantId, limitCount);
      }
      throw e;
    }
  }

  private async getFallbackBrowsableUsers(tenantId: string, limitCount: number) {
    // Fallback query without sorting (No index required)
    // NOTE: Pagination (startAfter) is NOT supported reliably without sort order, so we return lastDoc: null
    const fallbackQ = query(
      collection(this.db, 'users'),
      where('tenantId', '==', tenantId),
      where('status', '==', 'ACTIVE'),
      limit(limitCount)
    );
    const snap = await getDocs(fallbackQ);
    return { users: snap.docs.map(d => d.data() as User), lastDoc: null };
  }

  async getUsersWhoLikedMe(myUid: string): Promise<User[]> {
    this.checkDb();
    const q = query(
      collection(this.db, 'users'),
      where('likedUserIds', 'array-contains', myUid)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as User);
  }

  async saveUser(user: User): Promise<void> {
    this.checkDb();
    await setDoc(doc(this.db, 'users', user.uid), user);
  }

  async updateUser(uid: string, data: Partial<User>): Promise<void> {
    this.checkDb();
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
    await updateDoc(doc(this.db, 'users', uid), cleanData);
  }

  async updateLastActive(uid: string): Promise<void> {
    this.checkDb();
    const now = Date.now();
    const lastUpdate = this.lastPresenceUpdate[uid] || 0;
    if (now - lastUpdate > 5 * 60 * 1000) {
      try {
        await updateDoc(doc(this.db, 'users', uid), { lastActiveAt: new Date().toISOString() });
        this.lastPresenceUpdate[uid] = now;
      } catch (e) {
        console.warn("Failed to update presence", e);
      }
    }
  }

  async deleteUser(uid: string): Promise<void> {
    this.checkDb();
    await deleteDoc(doc(this.db, 'users', uid));
  }

  async deleteAllUsers(): Promise<void> {
    this.checkDb();
    const snap = await getDocs(collection(this.db, 'users'));
    const batch = writeBatch(this.db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }

  async getAllTenants(): Promise<Tenant[]> {
    this.checkDb();
    const snap = await getDocs(collection(this.db, 'tenants'));
    return snap.docs.map(d => d.data() as Tenant);
  }

  async saveTenant(tenant: Tenant): Promise<void> {
    this.checkDb();
    await setDoc(doc(this.db, 'tenants', tenant.id), tenant);
  }

  async deleteTenant(id: string): Promise<void> {
    this.checkDb();
    await deleteDoc(doc(this.db, 'tenants', id));
  }

  async getMessages(userId: string, otherId: string): Promise<Message[]> {
    this.checkDb();
    const q1 = query(collection(this.db, 'messages'), where('senderId', '==', userId), where('receiverId', '==', otherId));
    const q2 = query(collection(this.db, 'messages'), where('senderId', '==', otherId), where('receiverId', '==', userId));
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    let msgs = [...snap1.docs.map(d => d.data() as Message), ...snap2.docs.map(d => d.data() as Message)];
    return msgs.filter(m => !m.isDeleted).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  subscribeToMessages(userId: string, otherId: string, callback: (msgs: Message[]) => void): () => void {
    this.checkDb();
    const q1 = query(collection(this.db, 'messages'), where('senderId', '==', userId), where('receiverId', '==', otherId));
    const q2 = query(collection(this.db, 'messages'), where('senderId', '==', otherId), where('receiverId', '==', userId));

    let msgs1: Message[] = [];
    let msgs2: Message[] = [];

    const update = () => {
      const all = [...msgs1, ...msgs2]
        .filter(m => !m.isDeleted)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      callback(all);
    }

    const unsub1 = onSnapshot(q1, (snap) => {
      msgs1 = snap.docs.map(d => d.data() as Message);
      update();
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      msgs2 = snap.docs.map(d => d.data() as Message);
      update();
    });

    return () => { unsub1(); unsub2(); };
  }

  async saveMessage(message: Message): Promise<void> {
    this.checkDb();
    await setDoc(doc(this.db, 'messages', message.id), message);
  }

  async markConversationAsRead(userId: string, otherId: string): Promise<void> {
    this.checkDb();
    const q = query(collection(this.db, 'messages'), where('senderId', '==', otherId), where('receiverId', '==', userId), where('isRead', '==', false));
    const snap = await getDocs(q);
    const batch = writeBatch(this.db);
    snap.docs.forEach(d => batch.update(d.ref, { isRead: true }));
    if (!snap.empty) await batch.commit();
  }

  async markMessageAsViewed(messageId: string): Promise<void> {
    this.checkDb();
    await updateDoc(doc(this.db, 'messages', messageId), { viewedAt: new Date().toISOString() });
  }

  async deleteMessage(messageId: string): Promise<void> {
    this.checkDb();
    await updateDoc(doc(this.db, 'messages', messageId), { isDeleted: true });
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    this.checkDb();
    const q = query(collection(this.db, 'messages'), where('receiverId', '==', userId), where('isRead', '==', false));
    const snap = await getDocs(q);
    return snap.docs.filter(d => !(d.data() as Message).isDeleted).length;
  }

  subscribeToUnreadCount(userId: string, callback: (count: number) => void): () => void {
    this.checkDb();
    const q = query(collection(this.db, 'messages'), where('receiverId', '==', userId), where('isRead', '==', false));
    return onSnapshot(q, (snap) => {
      const count = snap.docs.filter(d => !(d.data() as Message).isDeleted).length;
      callback(count);
    });
  }

  async deleteConversation(userId: string, otherId: string): Promise<void> {
    this.checkDb();
    const q1 = query(collection(this.db, 'messages'), where('senderId', '==', userId), where('receiverId', '==', otherId));
    const q2 = query(collection(this.db, 'messages'), where('senderId', '==', otherId), where('receiverId', '==', userId));

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    const batch = writeBatch(this.db);
    snap1.docs.forEach(d => batch.delete(d.ref));
    snap2.docs.forEach(d => batch.delete(d.ref));

    if (!snap1.empty || !snap2.empty) await batch.commit();
  }

  async getConversationsSummary(userId: string): Promise<Record<string, number>> {
    this.checkDb();
    const qReceived = query(collection(this.db, 'messages'), where('receiverId', '==', userId));
    const qSent = query(collection(this.db, 'messages'), where('senderId', '==', userId));

    const [rxSnap, txSnap] = await Promise.all([getDocs(qReceived), getDocs(qSent)]);

    const summary: Record<string, number> = {};

    rxSnap.forEach(doc => {
      const m = doc.data() as Message;
      if (m.isDeleted) return;
      const partner = m.senderId;
      if (summary[partner] === undefined) summary[partner] = 0;
      if (!m.isRead) summary[partner]++;
    });

    txSnap.forEach(doc => {
      const m = doc.data() as Message;
      if (m.isDeleted) return;
      const partner = m.receiverId;
      if (summary[partner] === undefined) summary[partner] = 0;
    });

    return summary;
  }

  async saveReport(report: Report): Promise<void> {
    this.checkDb();
    await setDoc(doc(this.db, 'reports', report.id), report);
  }

  async getReports(status?: 'PENDING' | 'RESOLVED' | 'DISMISSED'): Promise<Report[]> {
    this.checkDb();
    const q = status ? query(collection(this.db, 'reports'), where('status', '==', status)) : collection(this.db, 'reports');
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Report);
  }

  async updateReportStatus(id: string, status: 'RESOLVED' | 'DISMISSED'): Promise<void> {
    this.checkDb();
    await updateDoc(doc(this.db, 'reports', id), { status });
  }

  async saveSystemMessage(message: SystemMessage): Promise<void> {
    this.checkDb();
    const cleanData = Object.entries(message).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
    await setDoc(doc(this.db, 'system_announcements', message.id), cleanData);
  }

  async republishSystemMessage(id: string): Promise<void> {
    this.checkDb();
    await updateDoc(doc(this.db, 'system_announcements', id), {
      republishedAt: new Date().toISOString(),
      isActive: true
    });
  }

  async getSystemMessages(activeOnly = false): Promise<SystemMessage[]> {
    this.checkDb();
    let q = collection(this.db, 'system_announcements');
    if (activeOnly) {
      q = query(collection(this.db, 'system_announcements'), where('isActive', '==', true));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as SystemMessage).sort((a, b) => {
      const timeA = new Date(a.republishedAt || a.createdAt).getTime();
      const timeB = new Date(b.republishedAt || b.createdAt).getTime();
      return timeB - timeA;
    });
  }

  subscribeToSystemMessages(activeOnly: boolean, callback: (msgs: SystemMessage[]) => void): () => void {
    this.checkDb();
    let q = collection(this.db, 'system_announcements');
    if (activeOnly) {
      q = query(collection(this.db, 'system_announcements'), where('isActive', '==', true));
    }
    return onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => d.data() as SystemMessage).sort((a, b) => {
        const timeA = new Date(a.republishedAt || a.createdAt).getTime();
        const timeB = new Date(b.republishedAt || b.createdAt).getTime();
        return timeB - timeA;
      });
      callback(msgs);
    });
  }

  async deleteSystemMessage(id: string): Promise<void> {
    this.checkDb();
    await deleteDoc(doc(this.db, 'system_announcements', id));
  }

  async requestPhotoAccess(request: PhotoRequest): Promise<void> {
    this.checkDb();
    await setDoc(doc(this.db, 'photo_requests', request.id), request);
  }

  async getPhotoRequests(userId: string, type: 'INCOMING' | 'OUTGOING'): Promise<PhotoRequest[]> {
    this.checkDb();
    const field = type === 'INCOMING' ? 'ownerId' : 'requesterId';
    const q = query(collection(this.db, 'photo_requests'), where(field, '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as PhotoRequest);
  }

  subscribeToPhotoRequests(userId: string, type: 'INCOMING' | 'OUTGOING', callback: (reqs: PhotoRequest[]) => void): () => void {
    this.checkDb();
    const field = type === 'INCOMING' ? 'ownerId' : 'requesterId';
    const q = query(collection(this.db, 'photo_requests'), where(field, '==', userId));
    return onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => doc.data() as PhotoRequest);
      callback(reqs);
    });
  }

  async updatePhotoRequestStatus(requestId: string, status: 'APPROVED' | 'REJECTED', duration?: AccessDuration): Promise<void> {
    this.checkDb();
    const updates: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (status === 'APPROVED' && duration) {
      updates.accessDuration = duration;
      updates.viewsLeft = duration === 'ONE_TIME' ? 1 : null;
      if (duration === '24_HOURS') {
        const expires = new Date();
        expires.setHours(expires.getHours() + 24);
        updates.expiresAt = expires.toISOString();
      } else {
        updates.expiresAt = null;
      }
    } else if (status === 'REJECTED') {
      updates.accessDuration = null;
      updates.expiresAt = null;
      updates.viewsLeft = 0;
    }
    await updateDoc(doc(this.db, 'photo_requests', requestId), updates);
  }

  async getLandingPageConfig(): Promise<LandingPageConfig | null> {
    this.checkDb();
    try {
      const snap = await getDoc(doc(this.db, 'system_config', 'landing_page'));
      return snap.exists() ? (snap.data() as LandingPageConfig) : null;
    } catch (e) {
      return null;
    }
  }

  async saveLandingPageConfig(config: LandingPageConfig): Promise<void> {
    this.checkDb();
    await setDoc(doc(this.db, 'system_config', 'landing_page'), config);
  }

  async saveInsertion(insertion: Insertion): Promise<void> {
    this.checkDb();
    const cleanData = Object.entries(insertion).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
    await setDoc(doc(this.db, 'insertions', insertion.id), cleanData);
  }

  async getInsertions(tenantId?: string, activeOnly = false): Promise<Insertion[]> {
    this.checkDb();
    let q = collection(this.db, 'insertions');
    const snap = await getDocs(q);
    let ads = snap.docs.map(d => d.data() as Insertion);
    if (activeOnly) ads = ads.filter(a => a.isActive);
    if (tenantId) ads = ads.filter(a => a.tenantId === 'GLOBAL' || a.tenantId === tenantId);
    return ads.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  async deleteInsertion(id: string): Promise<void> {
    this.checkDb();
    await deleteDoc(doc(this.db, 'insertions', id));
  }

  async toggleInsertionLike(insertionId: string, userId: string): Promise<void> {
    this.checkDb();
    const adRef = doc(this.db, 'insertions', insertionId);
    const snap = await getDoc(adRef);
    if (!snap.exists()) return;
    const ad = snap.data() as Insertion;
    let likes = ad.likedUserIds || [];
    if (likes.includes(userId)) {
      likes = likes.filter(id => id !== userId);
    } else {
      likes.push(userId);
    }
    await updateDoc(adRef, { likedUserIds: likes });
  }
}

export const dbService = new FirebaseService();
export const db = dbService;
export const auth = dbService.getAuthInstance();