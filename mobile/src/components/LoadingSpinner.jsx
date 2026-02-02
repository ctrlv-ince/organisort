import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export const LoadingSpinner = ({ message = 'Loading...', size = 'large' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#2563eb" />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
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
    fontSize: 16, // text-base
  },
});

export default LoadingSpinner;
