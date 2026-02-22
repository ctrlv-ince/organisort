import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

/**
 * AuthContext
 * Manages authentication state and provides auth functions to the entire app
 * Uses backend API for authentication instead of Firebase
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  /**
   * Login with email and password
   */
  const login = async (email, password) => {
    try {
      setError(null);

      // Use custom API endpoint for email/password authentication
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      if (response.data?.requires2FA) {
        return {
          requires2FA: true,
          challengeToken: response.data.challengeToken,
          message: response.data.message,
        };
      }

      // Store the JWT token in localStorage for API calls
      localStorage.setItem('token', response.data.token);

      // Update the user state with the user data from the response
      setUser(response.data.data);
      setError(null);
      return {
        requires2FA: false,
        user: response.data.data,
      };
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    }
  };

  const verifyEmailOtp = async (challengeToken, otp) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/api/auth/verify-email-otp`, {
        challengeToken,
        otp,
      });

      localStorage.setItem('token', response.data.token);
      setUser(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed');
      throw err;
    }
  };

  const resendEmailOtp = async (challengeToken) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/api/auth/resend-email-otp`, {
        challengeToken,
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
      throw err;
    }
  };

  /**
   * Login with Google
   */
  const googleLogin = async () => {
    try {
      setError(null);
      // For web, we'll use the backend's Google OAuth endpoint
      // This would typically redirect to Google OAuth and then back to the app
      // For now, we'll simulate the flow
      console.log('Google login requires OAuth setup with backend');
      throw new Error('Google login not yet configured for web');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Register with email and password (and optional avatar image)
   */
  const register = async (email, password, avatarFile = null) => {
    try {
      setError(null);

      let payload;
      let headers = {};

      if (avatarFile) {
        payload = new FormData();
        payload.append('email', email);
        payload.append('password', password);
        payload.append('avatar', avatarFile);
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        payload = { email, password };
        headers['Content-Type'] = 'application/json';
      }

      // Use custom API endpoint for registration
      const response = await axios.post(`${API_URL}/api/auth/register`, payload, { headers });

      if (response.data?.requires2FA) {
        return {
          requires2FA: true,
          challengeToken: response.data.challengeToken,
          message: response.data.message,
        };
      }

      // Fallback: if backend ever returns a direct token (e.g. admin bypass)
      localStorage.setItem('token', response.data.token);
      setUser(response.data.data);
      setError(null);
      return { requires2FA: false, user: response.data.data };
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    }
  };

  /**
   * Instantly sync the global user session state after a profile edit or preference change
   * without needing to hard refresh or re-fetch from the API
   */
  const updateUserSession = (newUserData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...newUserData,
    }));
  };

  /**
   * Logout user
   */
  const logout = async () => {
    const token = localStorage.getItem('token');

    try {
      setError(null);

      // Call logout endpoint to invalidate token
      if (token) {
        await axios.post(`${API_URL}/api/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Clear the token from localStorage
      console.log('✅ User logged out');
    } catch (err) {
      // A backend failure should not keep a stale local session alive.
      console.warn('Logout API call failed, clearing local session anyway:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  /**
   * Track auth state changes with backend
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify the token with the backend
          const response = await axios.get(`${API_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.status === 200) {
            setUser(response.data.data);
          } else {
            throw new Error('Invalid token');
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    googleLogin,
    logout,
    register,
    verifyEmailOtp,
    resendEmailOtp,
    updateUserSession,
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
