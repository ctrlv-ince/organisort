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
      const response = await axios.post(`${API_URL}/api/users/login`, {
        email,
        password,
      });

      // Store the JWT token in localStorage for API calls
      localStorage.setItem('token', response.data.token);
      
      // Update the user state with the user data from the response
      setUser(response.data.data);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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
   * Register with email and password
   */
  const register = async (email, password) => {
    try {
      setError(null);
      
      // Use custom API endpoint for registration
      const response = await axios.post(`${API_URL}/api/users/register`, {
        email,
        password,
      });

      // Store the JWT token in localStorage for API calls
      localStorage.setItem('token', response.data.token);
      
      // Update the user state with the user data from the response
      setUser(response.data.data);
      setError(null);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setError(null);
      
      // Call logout endpoint to invalidate token
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${API_URL}/api/users/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      
      // Clear the token from localStorage
      localStorage.removeItem('token');
      setUser(null);
      console.log('✅ User logged out');
    } catch (err) {
      setError(err.message);
      throw err;
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
