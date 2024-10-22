import { useEffect, useState } from 'react';
import { auth, googleProvider } from '../lib/firebaseConfig';
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
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

  const logout = async () => await signOut(auth);

  return { user, loading, signInWithGoogle, logout };
};
