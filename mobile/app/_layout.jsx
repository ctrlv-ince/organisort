import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHydrated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && hydrated) {
      SplashScreen.hideAsync();

      const inAuthGroup = segments[0] === '(auth)';
      if (isAuthenticated && inAuthGroup) router.replace('/(app)');
      if (!isAuthenticated && !inAuthGroup) router.replace('/(auth)/login');
    }
  }, [isAuthenticated, loading, hydrated, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
