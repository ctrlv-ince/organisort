import { Platform } from 'react-native';

export const validateEnv = () => {
  const requiredVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  ];

  const missingVars = requiredVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0) {
    console.warn(`Missing environment variables: ${missingVars.join(', ')}`);
    return false;
  }

  if (!process.env.EXPO_PUBLIC_API_URL) {
    console.warn(
      'EXPO_PUBLIC_API_URL is not set. Falling back to a local default URL for simulator/emulator use.'
    );
  }

  return true;
};

export const getApiUrl = () => {
  const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (configuredApiUrl) {
    return configuredApiUrl;
  }

  // Fallbacks for local development.
  // IMPORTANT: Physical devices cannot reach localhost of your dev machine.
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  if (Platform.OS === 'ios') {
    return 'http://127.0.0.1:5000';
  }

  return 'http://localhost:5000';
};

export const getFirebaseConfig = () => {
  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
};
