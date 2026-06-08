import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';
import { 
  requestNativeNotificationPermission, 
  getNativeNotificationStatus, 
  triggerNativeNotification 
} from '../lib/notifications';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  connectionError: boolean;
  loginAsPinAdmin: () => void;
  logoutPinAdmin: () => void;
  loginAsLocalGuest: () => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  nativePermission: NotificationPermission | 'unsupported';
  requestNotificationPermission: () => Promise<NotificationPermission>;
  activeToast: { id: string; title: string; body: string; category: string } | null;
  dismissToast: () => void;
  dispatchNotification: (title: string, body: string, category: 'promos' | 'activities' | 'orders' | 'chats') => void;
}

const FirebaseContext = createContext<FirebaseContextType>({ 
  user: null, 
  loading: true, 
  connectionError: false,
  loginAsPinAdmin: () => {},
  logoutPinAdmin: () => {},
  loginAsLocalGuest: () => {},
  unreadCount: 13,
  setUnreadCount: () => {},
  nativePermission: 'default',
  requestNotificationPermission: async () => 'default',
  activeToast: null,
  dismissToast: () => {},
  dispatchNotification: () => {}
});

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionStartTime = useRef<number>(Date.now());
  const [connectionError, setConnectionError] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    const cached = localStorage.getItem('messages_unread_count');
    return cached !== null ? parseInt(cached, 10) : 13;
  });

  const [nativePermission, setNativePermission] = useState<NotificationPermission | 'unsupported'>(getNativeNotificationStatus());
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; body: string; category: string } | null>(null);

  const requestNotificationPermission = async () => {
    const res = await requestNativeNotificationPermission();
    setNativePermission(res);
    return res;
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const dispatchNotification = (title: string, body: string, category: 'promos' | 'activities' | 'orders' | 'chats' = 'promos') => {
    // 1. Attempt to trigger native browser notification
    triggerNativeNotification(title, body, {
      tag: `nepali-mart-${category}`,
    });

    // 2. Trigger gorgeous UI-based in-app fallback toast
    setActiveToast({
      id: Math.random().toString(36).substring(2, 9),
      title,
      body,
      category
    });
  };

  const updateUnreadCount = (count: number) => {
    setUnreadCount(count);
    localStorage.setItem('messages_unread_count', count.toString());
  };

  const loginAsPinAdmin = async () => {
    localStorage.setItem('admin_pin_authenticated', 'true');
    setUser({
      id: 'pin-admin',
      name: 'Store Admin',
      email: 'admin@nepalimart.com',
      role: 'admin'
    });

    try {
      const email = 'admin@nepalimart.com';
      const password = 'admin_nepalimart_2026';
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          try {
            await createUserWithEmailAndPassword(auth, email, password);
          } catch (signUpErr) {
            console.error("Autobootstrap masteradmin account error:", signUpErr);
          }
        } else {
          console.error("Silent sign in masteradmin error:", err);
        }
      }
    } catch (e) {
      console.error("Firebase background PIN auth integration error:", e);
    }
  };

  const loginAsLocalGuest = () => {
    localStorage.setItem('local_guest_authenticated', 'true');
    setUser({
      id: 'local-guest',
      name: 'Local Tester',
      email: 'guest@nepalimart.com',
      role: 'user',
      gems: 450,
      streak: 3,
      lastClaimed: '',
      vouchers: []
    });
  };

  const logoutPinAdmin = async () => {
    localStorage.removeItem('admin_pin_authenticated');
    localStorage.removeItem('local_guest_authenticated');
    try {
      await auth.signOut();
    } catch (e) {
      console.error("Signout error during PIN-auth logoff:", e);
    }
    setUser(null);
  };

  useEffect(() => {
    let unsubUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      try {
        setConnectionError(false);
        
        // Clean up previous user snapshot listener if any
        if (unsubUserDoc) {
          unsubUserDoc();
          unsubUserDoc = null;
        }

        const isPinAuth = localStorage.getItem('admin_pin_authenticated') === 'true';
        const isLocalGuest = localStorage.getItem('local_guest_authenticated') === 'true';

        if (fbUser) {
          const userDocRef = doc(db, 'users', fbUser.uid);
          
          unsubUserDoc = onSnapshot(userDocRef, async (userDoc) => {
            try {
              if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                const isAdminEmail = fbUser.email === 'a71649013@gmail.com' || fbUser.email === 'rudhrasha44@gmail.com';
                
                if ((isAdminEmail || isPinAuth) && userData.role !== 'admin') {
                  const updatedUser = { 
                    ...userData, 
                    role: 'admin' as const,
                    id: fbUser.uid 
                  };
                  await setDoc(userDocRef, updatedUser);
                  setUser(updatedUser);
                } else {
                  setUser({
                    gems: 0,
                    streak: 0,
                    lastClaimed: '',
                    vouchers: [],
                    ...userData,
                    id: fbUser.uid,
                    role: (isAdminEmail || isPinAuth) ? 'admin' : userData.role
                  });
                }
              } else {
                const isAdminEmail = fbUser.email === 'a71649013@gmail.com' || fbUser.email === 'rudhrasha44@gmail.com';
                const newUser: User = {
                  id: fbUser.uid,
                  name: fbUser.displayName || 'User',
                  email: fbUser.email || '',
                  role: (isAdminEmail || isPinAuth) ? 'admin' : 'user',
                  gems: 0,
                  streak: 0,
                  lastClaimed: '',
                  vouchers: []
                };
                await setDoc(userDocRef, newUser);
                setUser(newUser);
              }
            } catch (snapErr) {
              console.error("User doc snapshot processing error:", snapErr);
            }
            setLoading(false);
          }, (err) => {
            console.error("User doc snapshot error:", err);
            setLoading(false);
          });
        } else {
          if (isPinAuth) {
            setUser({
              id: 'pin-admin',
              name: 'Store Admin',
              email: 'admin@nepalimart.com',
              role: 'admin'
            });
          } else if (isLocalGuest) {
            setUser({
              id: 'local-guest',
              name: 'Local Tester',
              email: 'guest@nepalimart.com',
              role: 'user',
              gems: 450,
              streak: 3,
              lastClaimed: '',
              vouchers: []
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Firebase Auth Error:", error);
        if (error instanceof Error && (error.message.includes('offline') || error.message.includes('timeout'))) {
          setConnectionError(true);
        }
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubUserDoc) {
        unsubUserDoc();
      }
    };
  }, []);

  // background subscription listener 1: global notifications
  useEffect(() => {
    if (!user || user.role === 'admin') return;

    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (!data.createdAt) return;
          
          const createdTime = data.createdAt.toDate ? data.createdAt.toDate().getTime() : new Date(data.createdAt).getTime();
          // Buffer checking
          if (createdTime > sessionStartTime.current - 15000) {
            dispatchNotification(
              data.title || 'New Store Broadcast Announcement 📢',
              data.desc || 'Check the messages tab for fresh store promotions!',
              data.category || 'promos'
            );
          }
        }
      });
    }, (err) => {
      console.warn("Background notification subscription error:", err);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // background subscription listener 2: customer support responses
  useEffect(() => {
    if (!user || user.role === 'admin' || user.id === 'pin-admin') return;

    const chatDocId = `nepali-mart-cs-${user.id}`;
    const messagesRef = collection(db, 'chats', chatDocId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
    
    let isInitial = true;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isInitial) {
        isInitial = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.sender === 'merchant') {
            dispatchNotification(
              'New support reply from Merchant! 💬',
              data.text || 'We have responded to your query.',
              'chats'
            );
          }
        }
      });
    }, (err) => {
      console.warn("Background user chat message reply listener error:", err);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // background subscription listener 3: Admin notifications for incoming support requests
  useEffect(() => {
    if (user?.role !== 'admin') return;

    const q = query(collection(db, 'chats'), orderBy('updatedAt', 'desc'), limit(1));
    
    let isInitial = true;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isInitial) {
        isInitial = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const data = change.doc.data();
          if (data.unreadByAdmin === true) {
            dispatchNotification(
              `Inbound support from ${data.userName || 'Customer'}`,
              `Last message: "${data.lastMessage || 'Help inquiry'}"`,
              'chats'
            );
          }
        }
      });
    }, (err) => {
      console.warn("Background admin chat monitor error:", err);
    });

    return () => unsubscribe();
  }, [user?.id, user?.role]);

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      loading, 
      connectionError, 
      loginAsPinAdmin, 
      logoutPinAdmin, 
      loginAsLocalGuest,
      unreadCount, 
      setUnreadCount: updateUnreadCount,
      nativePermission,
      requestNotificationPermission,
      activeToast,
      dismissToast,
      dispatchNotification
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
