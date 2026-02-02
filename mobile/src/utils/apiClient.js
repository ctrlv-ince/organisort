import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

let onUnauthorized = () => {};

export const setOnUnauthorized = (callback) => {
  onUnauthorized = callback;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.18:5000';
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10);

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized - Invalid or expired token');
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
