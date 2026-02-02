import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@/src/utils/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Token retrieved in checkAuthStatus:', token);
        if (token) {
          // Verify the token with the backend
          const response = await apiClient.get('/api/auth/me');
          
          // Update the user state with the user data from the response
          setUser(response.data.data);
          
          // Check if user is admin
          setIsAdmin(response.data.data.role === 'admin');
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
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
      const response = await apiClient.post('/api/auth/login', { email, password });
      
      // Store the JWT token in AsyncStorage for API calls
      await AsyncStorage.setItem('token', response.data.token);
      console.log('Token stored in AsyncStorage:', response.data.token);
      
      // Update the user state with the user data from the response
      setUser(response.data.data);
      setIsAdmin(response.data.data.role === 'admin');
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/api/auth/register', { email, password });
      
      // Store the JWT token in AsyncStorage for API calls
      await AsyncStorage.setItem('token', response.data.token);
      
      // Update the user state with the user data from the response
      setUser(response.data.data);
      setIsAdmin(response.data.data.role === 'admin');
    } catch (error) {
      console.error('Email registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    // Immediately clear local authentication state
    await AsyncStorage.removeItem('token');
    setUser(null);
    setIsAdmin(false);

    try {
      // Attempt to log out from the server, but don't let it block client-side logout
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      // Log if server logout fails, but local state is already cleared
      console.error('Server logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAdmin,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
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
