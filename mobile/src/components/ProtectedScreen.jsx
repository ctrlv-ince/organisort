import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

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
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-light">
        <ActivityIndicator size="large" color="#2563eb" />
        <StyledText className="text-gray-600 mt-4">Loading...</StyledText>
      </StyledView>
    );
  }

  if (!isAuthenticated) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-light">
        <StyledText className="text-gray-600 text-lg mb-4">Redirecting to login...</StyledText>
      </StyledView>
    );
  }

  return <>{children}</>;
};

export default ProtectedScreen;
