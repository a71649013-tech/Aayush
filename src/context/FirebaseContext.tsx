import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  connectionError: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({ user: null, loading: true, connectionError: false });

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        setConnectionError(false);
        if (fbUser) {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          const isAdminEmail = fbUser.email === 'a71649013@gmail.com' || fbUser.email === 'rudhrasha44@gmail.com';
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            // Upgrade to admin if email matches but role is not admin
            if (isAdminEmail && userData.role !== 'admin') {
              const updatedUser = { ...userData, role: 'admin' as const };
              await setDoc(userDocRef, updatedUser);
              setUser(updatedUser);
            } else {
              setUser(userData);
            }
          } else {
            // Bootstrap admin for the specific user email if needed
            const newUser: User = {
              id: fbUser.uid,
              name: fbUser.displayName || 'User',
              email: fbUser.email || '',
              role: isAdminEmail ? 'admin' : 'user'
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Firebase Auth Error:", error);
        if (error instanceof Error && (error.message.includes('offline') || error.message.includes('timeout'))) {
          setConnectionError(true);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, loading, connectionError }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
