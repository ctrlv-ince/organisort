import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

/**
 * AuthContext
 * Manages authentication state and provides auth functions to the entire app
 * Also handles sync to MongoDB backend after login
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  /**
   * Sync user to MongoDB backend
   * Called after successful Firebase login
   */
  const syncUserToBackend = async (firebaseUser, idToken) => {
    try {
      const response = await fetch(`${API_URL}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || null,
          emailVerified: firebaseUser.emailVerified || false,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to sync user to backend:', response.statusText);
      } else {
        console.log('✅ User synced to MongoDB');
      }
    } catch (err) {
      console.error('❌ Error syncing user:', err);
    }
  };

  /**
   * Login with email and password
   */
  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      // Sync to backend
      await syncUserToBackend(firebaseUser, idToken);

      setUser(firebaseUser);
      return firebaseUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Login with Google
   */
  const googleLogin = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      // Sync to backend
      await syncUserToBackend(firebaseUser, idToken);

      setUser(firebaseUser);
      return firebaseUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      console.log('✅ User logged out');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Track auth state changes with Firebase onAuthStateChanged
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          // Sync on every auth state change (handles token refresh)
          await syncUserToBackend(firebaseUser, idToken);
          setUser(firebaseUser);
        } catch (err) {
          console.error('Error in auth state change:', err);
          setUser(firebaseUser); // Still set user even if sync fails
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    googleLogin,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use AuthContext
 * Usage: const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
