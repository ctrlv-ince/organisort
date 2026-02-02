import React, { useEffect } from 'react';
import { Slot, useSegments, useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import LoadingSpinner from '@/src/components/LoadingSpinner';

export default function AppLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Wait until authentication status is determined
    if (loading) {
      return;
    }

    const inAppGroup = segments[0] === '(app)';

    if (inAppGroup) {
      // If user data is available, check role
      if (user) {
        if (user.role === 'admin') {
          router.replace('/(app)/admin');
        } else {
          router.replace('/(app)');
        }
      } else {
        // If no user, redirect to login
        router.replace('/(auth)/login');
      }
    }
  }, [user, loading, segments, router]);

  // Show a loading screen while we determine auth status
  if (loading) {
    return <LoadingSpinner />;
  }

  // Render the currently active route
  return <Slot />;
}
