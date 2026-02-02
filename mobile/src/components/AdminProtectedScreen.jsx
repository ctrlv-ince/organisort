import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import LoadingSpinner from './LoadingSpinner';

const AdminProtectedScreen = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If no user, redirect to login
        router.replace('/(auth)/login');
      } else if (user.role !== 'admin') {
        // If user is not an admin, redirect to the user dashboard
        router.replace('/(app)');
      }
    }
  }, [user, loading, router]);

  // While loading, show a spinner
  if (loading) {
    return <LoadingSpinner />;
  }

  // If user is an admin, render the children
  if (user && user.role === 'admin') {
    return <>{children}</>;
  }

  // Otherwise, render nothing (or a fallback) while redirecting
  return null;
};

export default AdminProtectedScreen;
