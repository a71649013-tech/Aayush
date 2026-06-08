import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  connectionError: boolean;
  loginAsPinAdmin: () => void;
  logoutPinAdmin: () => void;
}

const FirebaseContext = createContext<FirebaseContextType>({ 
  user: null, 
  loading: true, 
  connectionError: false,
  loginAsPinAdmin: () => {},
  logoutPinAdmin: () => {}
});

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

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

  const logoutPinAdmin = async () => {
    localStorage.removeItem('admin_pin_authenticated');
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

  return (
    <FirebaseContext.Provider value={{ user, loading, connectionError, loginAsPinAdmin, logoutPinAdmin }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
