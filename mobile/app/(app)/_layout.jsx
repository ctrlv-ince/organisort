import React from 'react';
import { Slot, useSegments } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';

export default function AppLayout() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Redirect non-admin users to regular dashboard
  React.useEffect(() => {
    const inAdminGroup = segments.includes('admin');

    if (inAdminGroup && !isAdmin) {
      router.replace('/');
    }
  }, [segments, isAdmin]);

  return <Slot />;
}
