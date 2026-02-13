
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, UserRole, GenderType } from '../types';
import { db, auth } from '../services/db';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  setPersistence,
  browserSessionPersistence
} from "firebase/auth";

interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  type: GenderType;
  city: string;
  region: string;
  age: number;
  birthDate: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  blockUser: (targetUid: string) => Promise<void>;
  toggleLike: (targetUid: string) => Promise<void>;
  reportUser: (targetUid: string, targetName: string, reason: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOffline: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);


  // Use ref to track unsubscribe function to avoid closure staleness issues
  const unsubscribeUserRef = useRef<(() => void) | undefined>(undefined);

  // Sync Auth State with DB User Profile
  useEffect(() => {
    const init = async () => {
      try {
        await db.initialize();
        // Enforce Session Persistence: User is logged out when tab/browser closes
        if (auth) {
            await setPersistence(auth, browserSessionPersistence);
        }
      } catch (e) {
        console.error("DB/Auth Init error", e);
      }
    };
    init();

    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      // Clean up previous user subscription immediately
      if (unsubscribeUserRef.current) {
        unsubscribeUserRef.current();
        unsubscribeUserRef.current = undefined;
      }

      if (firebaseUser) {
        // Keep loading true while we fetch/subscribe to the profile
        setIsLoading(true);
        
        // --- SINGLE DEVICE SESSION LOGIC ---
        // 1. Get or Create Session ID for this specific tab/window
        let currentSessionId = sessionStorage.getItem('lovelink_session_id');
        if (!currentSessionId) {
            currentSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('lovelink_session_id', currentSessionId);
            
            // 2. Claim this session in Firestore (Self-healing on login/refresh)
            try {
                await db.updateUser(firebaseUser.uid, { currentSessionId });
            } catch (e) {
                console.warn("Failed to set session ID on login", e);
            }
        }
        // -----------------------------------

        try {
          // Subscribe to user changes for realtime status/role updates
          const unsub = db.subscribeToUser(firebaseUser.uid, (foundUser, subscribeError) => {
            if (subscribeError) {
              console.warn("AuthContext: Snapshot error (likely offline or permission):", subscribeError);
              setIsOffline(true);
              setIsLoading(false);
              return;
            }

            setIsOffline(false);
            if (foundUser) {
              // Check Status
              if (['SUSPENDED', 'BANNED', 'DELETED'].includes(foundUser.status || '')) {
                signOut(auth).then(() => {
                  setUser(null);
                  setError("Account sospeso, bannato o cancellato.");
                });
                return;
              }

              // Check Session ID (Single Device Enforcement)
              if (foundUser.currentSessionId && foundUser.currentSessionId !== currentSessionId) {
                  // The session ID in DB changed, meaning another device logged in
                  // Force logout this device
                  console.warn("Session mismatch. Logging out.");
                  signOut(auth).then(() => {
                      setUser(null);
                      sessionStorage.removeItem('lovelink_session_id'); // Clear local session
                      setError("Sessione terminata. Accesso effettuato da un altro dispositivo.");
                  });
                  return;
              }

              setUser(foundUser);
              // Trigger immediate presence update on login/refresh
              db.updateLastActive(foundUser.uid);
            } else {
              console.warn("User in Auth but not in DB");
            }
            setIsLoading(false);
          });
          unsubscribeUserRef.current = unsub;
        } catch (e) {
          console.error("Failed to fetch user profile", e);
          setError("Errore caricamento profilo. Verifica connessione.");
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      if (unsubscribeUserRef.current) unsubscribeUserRef.current();
      unsubscribeAuth();
    };
  }, []);

  const clearError = () => setError(null);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!password) {
        throw new Error("Password richiesta per l'accesso sicuro.");
      }
      // Persistence is set in useEffect, but we ensure it here just in case for new logins
      await setPersistence(auth!, browserSessionPersistence);
      await signInWithEmailAndPassword(auth!, email, password);
      // onAuthStateChanged will handle setting the user and session ID
    } catch (e: any) {
      console.error(e);
      let msg = "Errore durante il login.";
      if (e.code === 'auth/invalid-credential') msg = "Email o password non corretti.";
      if (e.code === 'auth/user-not-found') msg = "Utente non trovato.";
      if (e.code === 'auth/wrong-password') msg = "Password errata.";
      if (e.code === 'auth/too-many-requests') msg = "Troppi tentativi. Riprova più tardi.";
      setError(msg);
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      await setPersistence(auth!, browserSessionPersistence);
      
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth!, data.email, data.password);
      const firebaseUid = userCredential.user.uid;

      // 2. Prepare DB User Object
      let lookingFor: GenderType[] = ['WOMAN'];
      if (data.type === 'WOMAN') lookingFor = ['MAN'];
      if (data.type === 'COUPLE') lookingFor = ['MAN', 'WOMAN', 'COUPLE'];

      // Generate initial session ID
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('lovelink_session_id', sessionId);

      const newUser: User = {
        uid: firebaseUid,
        email: data.email,
        role: 'USER', // Always USER
        status: 'ACTIVE',
        tenantId: 'default-tenant', // Always default tenant
        displayName: data.displayName,
        type: data.type,
        lookingFor,
        bio: '',
        age: data.age,
        location: `${data.city}, ${data.region}`,
        city: data.city,
        region: data.region,
        photos: [],
        isVerified: false,
        blockedUserIds: [],
        likedUserIds: [],
        interests: [],
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        currentSessionId: sessionId
      };

      // 3. Save to Firestore
      await db.saveUser(newUser);

      // onAuthStateChanged will update state
    } catch (e: any) {
      console.error(e);
      let msg = "Errore durante la registrazione.";
      if (e.code === 'auth/email-already-in-use') msg = "Email già registrata. Prova ad accedere.";
      if (e.code === 'auth/weak-password') msg = "La password è troppo debole (min 6 caratteri).";
      if (e.message.includes("permission-denied") || e.message.includes("Missing or insufficient permissions")) {
        msg = "Errore di sicurezza: Impossibile creare l'utente. Riprova.";
      }
      setError(msg);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Explicitly clear state immediately to update UI
      setUser(null);
      setIsLoading(false);
      sessionStorage.removeItem('lovelink_session_id'); // Clear session token
      
      if (unsubscribeUserRef.current) {
        unsubscribeUserRef.current();
        unsubscribeUserRef.current = undefined;
      }

      await signOut(auth!);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    await db.updateUser(user.uid, updates);
    setUser(updatedUser);

    // Actions usually mean user is active
    db.updateLastActive(user.uid);
  };

  const blockUser = async (targetUid: string) => {
    if (!user) return;
    const currentBlocks = user.blockedUserIds || [];
    if (currentBlocks.includes(targetUid)) return;

    const newBlocks = [...currentBlocks, targetUid];
    await updateUser({ blockedUserIds: newBlocks });
  };

  const toggleLike = async (targetUid: string) => {
    if (!user) return;
    const currentLikes = user.likedUserIds || [];

    let newLikes: string[];
    if (currentLikes.includes(targetUid)) {
      newLikes = currentLikes.filter(id => id !== targetUid);
    } else {
      newLikes = [...currentLikes, targetUid];
    }

    await updateUser({ likedUserIds: newLikes });
  };

  const reportUser = async (targetUid: string, targetName: string, reason: string) => {
    if (!user || !user.tenantId) return;
    await db.saveReport({
      id: `rep-${Date.now()}`,
      reporterId: user.uid,
      targetUserId: targetUid,
      targetUserName: targetName,
      reason,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      tenantId: user.tenantId
    });
    // Auto block reported user
    await blockUser(targetUid);
  };

  const deleteAccount = async (password: string): Promise<boolean> => {
    if (!user) return false;
    try {
      // Perform Soft Delete
      await updateUser({ status: 'DELETED' });
      await logout();
      return true;
    } catch (e) {
      console.error("Delete failed", e);
      setError("Impossibile cancellare l'account al momento.");
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, blockUser, toggleLike, reportUser, deleteAccount, isAuthenticated: !!user, isLoading, isOffline, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
