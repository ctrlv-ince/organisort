import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@/src/utils/apiClient';
import { getApiUrl } from '@/src/utils/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // Verify the token with the backend
          const response = await apiClient.get('/api/users/me');

          // Update user state with the API payload data object
          setUser(response.data?.data || null);
        } else {
          setUser(null);
        }
      } catch (error) {
        // If the token is expired/invalid (401), clean it up so the user
        // is properly treated as unauthenticated and sent to login.
        if (error.response?.status === 401) {
          console.warn('Stored token is expired or invalid — redirecting to login.');
          await AsyncStorage.removeItem('token');
        } else {
          const baseURL = getApiUrl();
          console.error(
            `Error checking auth status. API URL: ${baseURL}. `
            + 'If using a physical device, set EXPO_PUBLIC_API_URL to your computer\'s LAN IP.',
            error
          );
        }
        setUser(null);
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

      if (response.data?.requires2FA) {
        return {
          requires2FA: true,
          challengeToken: response.data.challengeToken,
          message: response.data.message,
        };
      }

      // Store the JWT token in AsyncStorage for API calls
      await AsyncStorage.setItem('token', response.data.token);

      // Update user state with user payload object
      setUser(response.data?.data || null);
      return { requires2FA: false, user: response.data?.data || null };
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const verifyEmailOtp = async (challengeToken, otp) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/api/auth/verify-email-otp', { challengeToken, otp });
      await AsyncStorage.setItem('token', response.data.token);
      setUser(response.data?.data || null);
      return response.data?.data || null;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendEmailOtp = async (challengeToken) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/api/auth/resend-email-otp', { challengeToken });
      return response.data;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email, password, avatarUri = null) => {
    try {
      setLoading(true);

      let payload;
      let headers = {};

      if (avatarUri) {
        payload = new FormData();
        payload.append('email', email);
        payload.append('password', password);

        // React Native specific FormData file upload format
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        payload.append('avatar', {
          uri: avatarUri,
          name: filename,
          type,
        });

        headers['Content-Type'] = 'multipart/form-data';
      } else {
        payload = { email, password };
        headers['Content-Type'] = 'application/json';
      }

      const response = await apiClient.post('/api/auth/register', payload, { headers });

      if (response.data?.requires2FA) {
        return {
          requires2FA: true,
          challengeToken: response.data.challengeToken,
          message: response.data.message,
        };
      }

      // Fallback: if backend ever returns a direct token (e.g. admin bypass)
      await AsyncStorage.setItem('token', response.data.token);
      setUser(response.data?.data || null);
      return { requires2FA: false, user: response.data?.data || null };
    } catch (error) {
      console.error('Email registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (router) => {
    setLoading(true);

    // Clear local auth state FIRST to prevent re-sending an expired token
    const token = await AsyncStorage.getItem('token');
    await AsyncStorage.removeItem('token');
    setUser(null);

    try {
      // Attempt server-side logout with the token we just removed
      if (token) {
        await apiClient.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      // Log if server logout fails, but continue — local state is already cleared
      console.error('Server logout failed:', error);
    } finally {
      setLoading(false);

      if (router) {
        router.replace('/(auth)/login');
      }
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    verifyEmailOtp,
    resendEmailOtp,
    registerWithEmail,
    logout,
    updateUserSession,
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
