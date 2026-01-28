import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import axios from 'axios';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);

export default function HomeScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      if (!user) return;

      const idToken = await user.getIdToken();
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await axios.get(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserProfile();
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
        style: 'destructive',
      },
    ]);
  };

  if (loading) {
    return (
      <StyledView className="flex-1 bg-light items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </StyledView>
    );
  }

  return (
    <StyledScrollView
      className="flex-1 bg-light"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2563eb" />
      }
    >
      <StyledView className="bg-gradient-to-b from-primary to-blue-600 px-6 pt-8 pb-6 rounded-b-3xl">
        <StyledView className="flex-row items-center justify-between mb-6">
          <StyledText className="text-white text-3xl font-bold">Dashboard</StyledText>
          <StyledTouchableOpacity
            onPress={handleLogout}
            className="bg-danger px-4 py-2 rounded-lg"
          >
            <StyledText className="text-white font-bold">Logout</StyledText>
          </StyledTouchableOpacity>
        </StyledView>

        <StyledView className="bg-white bg-opacity-20 rounded-xl px-4 py-3">
          <StyledText className="text-white text-lg font-semibold">
            Welcome, {user?.displayName || 'User'}! 👋
          </StyledText>
          <StyledText className="text-blue-100 text-sm mt-1">
            Ready to detect waste and make an impact
          </StyledText>
        </StyledView>
      </StyledView>

      <StyledView className="px-6 py-6">
        <StyledView className="bg-white rounded-xl p-6 mb-6 shadow-md">
          <StyledView className="flex-row items-center mb-4">
            <StyledText className="text-2xl mr-3">🔥</StyledText>
            <StyledText className="text-lg font-bold text-dark">Firebase Auth</StyledText>
          </StyledView>

          <StyledView className="space-y-3">
            <StyledView className="border-b border-gray-200 pb-3">
              <StyledText className="text-sm text-gray-600 mb-1">Email</StyledText>
              <StyledText className="text-base font-semibold text-dark">
                {user?.email || 'N/A'}
              </StyledText>
            </StyledView>

            <StyledView className="border-b border-gray-200 pb-3">
              <StyledText className="text-sm text-gray-600 mb-1">UID</StyledText>
              <StyledText className="text-base font-mono text-dark truncate">
                {user?.uid ? user.uid.substring(0, 20) + '...' : 'N/A'}
              </StyledText>
            </StyledView>

            <StyledView className="flex-row items-center justify-between">
              <StyledText className="text-sm text-gray-600">Email Verified</StyledText>
              <StyledView
                className={`px-3 py-1 rounded-full ${
                  user?.emailVerified ? 'bg-success bg-opacity-20' : 'bg-warning bg-opacity-20'
                }`}
              >
                <StyledText
                  className={`text-sm font-bold ${user?.emailVerified ? 'text-success' : 'text-warning'}`}
                >
                  {user?.emailVerified ? '✓ Yes' : '✗ No'}
                </StyledText>
              </StyledView>
            </StyledView>
          </StyledView>
        </StyledView>

        <StyledView className="bg-white rounded-xl p-6 mb-6 shadow-md">
          <StyledView className="flex-row items-center mb-4">
            <StyledText className="text-2xl mr-3">💾</StyledText>
            <StyledText className="text-lg font-bold text-dark">MongoDB Sync</StyledText>
          </StyledView>

          {userProfile ? (
            <StyledView className="space-y-3">
              <StyledView className="border-b border-gray-200 pb-3">
                <StyledText className="text-sm text-gray-600 mb-1">Display Name</StyledText>
                <StyledText className="text-base font-semibold text-dark">
                  {userProfile.displayName || 'Not set'}
                </StyledText>
              </StyledView>

              <StyledView className="border-b border-gray-200 pb-3">
                <StyledText className="text-sm text-gray-600 mb-1">Last Login</StyledText>
                <StyledText className="text-base font-semibold text-dark">
                  {new Date(userProfile.lastLogin).toLocaleString()}
                </StyledText>
              </StyledView>

              <StyledView className="border-b border-gray-200 pb-3">
                <StyledText className="text-sm text-gray-600 mb-1">Account Created</StyledText>
                <StyledText className="text-base font-semibold text-dark">
                  {new Date(userProfile.createdAt).toLocaleString()}
                </StyledText>
              </StyledView>

              <StyledView className="flex-row items-center justify-between">
                <StyledText className="text-sm text-gray-600">Account Status</StyledText>
                <StyledView
                  className={`px-3 py-1 rounded-full ${
                    userProfile.isActive ? 'bg-success bg-opacity-20' : 'bg-danger bg-opacity-20'
                  }`}
                >
                  <StyledText
                    className={`text-sm font-bold ${
                      userProfile.isActive ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {userProfile.isActive ? '● Active' : '● Inactive'}
                  </StyledText>
                </StyledView>
              </StyledView>
            </StyledView>
          ) : (
            <StyledView className="items-center justify-center py-6">
              <ActivityIndicator color="#2563eb" size="small" />
              <StyledText className="text-gray-600 mt-3">Syncing...</StyledText>
            </StyledView>
          )}
        </StyledView>

        <StyledView className="bg-white rounded-xl p-6 shadow-md">
          <StyledView className="flex-row items-center mb-4">
            <StyledText className="text-2xl mr-3">⚙️</StyledText>
            <StyledText className="text-lg font-bold text-dark">System Status</StyledText>
          </StyledView>

          <StyledView className="space-y-3">
            <StyledView className="flex-row items-center justify-between">
              <StyledText className="text-gray-700">Firebase Connected</StyledText>
              <StyledText className="text-2xl">✅</StyledText>
            </StyledView>

            <StyledView className="flex-row items-center justify-between">
              <StyledText className="text-gray-700">Backend Synced</StyledText>
              <StyledText className="text-2xl">{userProfile ? '✅' : '⏳'}</StyledText>
            </StyledView>

            <StyledView className="flex-row items-center justify-between">
              <StyledText className="text-gray-700">Mobile App</StyledText>
              <StyledText className="text-2xl">✅</StyledText>
            </StyledView>
          </StyledView>
        </StyledView>

        <StyledView className="items-center mt-8 mb-4">
          <StyledText className="text-gray-600 text-sm text-center">
            Waste Detection Admin Panel v1.0.0
          </StyledText>
          <StyledText className="text-gray-400 text-xs mt-2">
            Firebase + MongoDB Synced
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledScrollView>
  );
}
