import { useEffect, useState } from 'react';
import { auth, googleProvider } from '../lib/firebaseConfig';
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // Add user to Firestore
          await setDoc(userDocRef, {
            name: user.displayName,
            email: user.email,
            photoUrl: user.photoURL,
            createdAt: new Date(),
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const logout = async () => {
    try {
      // Clear states before signing out
      setUser(null);
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear any local state if needed
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return { user, loading, signInWithGoogle, logout };
};
