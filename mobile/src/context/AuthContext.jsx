import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthSafe } from '../config/firebaseConfig';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUserToBackend = async (firebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await axios.post(
        `${API_URL}/api/users/sync`,
        {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || null,
          emailVerified: firebaseUser.emailVerified || false,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[Mobile] User synced to backend:', response.data);
    } catch (error) {
      console.error('[Mobile] Failed to sync user to backend:', error);
    }
  };

  useEffect(() => {
    let unsubscribe;
    const auth = getAuthSafe();
    if (!auth) {
      console.warn('[Mobile] Firebase auth not available; skipping auth listener.');
      setLoading(false);
      return;
    }

    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            setUser(firebaseUser);
            await syncUserToBackend(firebaseUser);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('[Mobile] Error in auth state change handler:', error);
        } finally {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('[Mobile] Failed to set up auth listener:', error);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      // Note: For mobile, you'll need to use Firebase's native authentication
      // This is a placeholder - implement proper Google OAuth flow for Expo
      console.log('Google sign-in requires proper OAuth setup in Expo');
      throw new Error('Google sign-in not yet configured for mobile');
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      const auth = getAuthSafe();
      if (!auth) throw new Error('Firebase auth not available');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const auth = getAuthSafe();
      if (!auth) throw new Error('Firebase auth not available');
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
