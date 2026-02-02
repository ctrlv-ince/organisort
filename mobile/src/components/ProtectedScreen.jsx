import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';

/**
 * Protected Screen Wrapper Component
 * Ensures user is authenticated before rendering content
 * Shows loading spinner while checking auth state
 */
export const ProtectedScreen = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.redirectText}>Redirecting to login...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa', // Equivalent to bg-light
  },
  text: {
    color: '#6c757d', // Equivalent to text-gray-600
    marginTop: 16, // mt-4
  },
  redirectText: {
    color: '#6c757d', // Equivalent to text-gray-600
    fontSize: 18, // text-lg
    marginBottom: 16, // mb-4
  },
});

export default ProtectedScreen;
