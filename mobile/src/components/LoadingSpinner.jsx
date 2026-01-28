import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

export const LoadingSpinner = ({ message = 'Loading...', size = 'large' }) => {
  return (
    <StyledView className="flex-1 items-center justify-center bg-light">
      <ActivityIndicator size={size} color="#2563eb" />
      {message && <StyledText className="text-gray-600 mt-4 text-base">{message}</StyledText>}
    </StyledView>
  );
};

export default LoadingSpinner;
