import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/src/utils/apiClient';
import SkeletonLoader, { StatSkeleton } from '@/src/components/SkeletonLoader';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#10b981',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: { fontSize: 30, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#d1fae5', textAlign: 'center', marginTop: 8 },
  content: { padding: 24 },

  // Profile Header
  profileHeader: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#d1fae5',
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  avatarText: { fontSize: 48, color: 'white', fontWeight: 'bold' },
  displayName: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  email: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  badge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: { color: 'white', fontSize: 14, fontWeight: '600' },

  // Stats Section
  statsSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statIcon: { marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#10b981' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4, textAlign: 'center' },

  // Info Cards
  infoSection: { marginBottom: 24 },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  infoIcon: { marginRight: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  infoArrow: { fontSize: 20, color: '#9ca3af' },

  // Action Buttons
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: { marginRight: 12 },
  actionText: { fontSize: 16, fontWeight: '600', color: '#1e293b', flex: 1 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
});

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalDetections: 0,
    totalItems: 0,
    uniqueTypes: 0,
    rank: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [])
  );

  const fetchProfileData = async () => {
    try {
      // Fetch user data
      const userResponse = await apiClient.get('/api/users/me');
      setUserData(userResponse.data?.data || null);

      // Fetch user stats
      const detectionResponse = await apiClient.get('/api/detections/history');
      const detections = detectionResponse.data.detections || detectionResponse.data;

      calculateStats(detections);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (detections) => {
    const totalDetections = detections.length;
    const totalItems = detections.reduce((sum, d) => sum + (d.summary?.total_detections || 0), 0);
    const uniqueTypesSet = new Set();

    detections.forEach(d => {
      if (d.detectedWasteTypes) {
        d.detectedWasteTypes.forEach(type => uniqueTypesSet.add(type));
      }
    });

    setStats({
      totalDetections,
      totalItems,
      uniqueTypes: uniqueTypesSet.size,
      rank: 0, // Would need leaderboard data for this
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>View your account & statistics</Text>
        </View>
        <View style={styles.content}>
          {/* Avatar skeleton */}
          <View style={[styles.profileHeader, { alignItems: 'center' }]}>
            <SkeletonLoader width={120} height={120} borderRadius={60} style={{ marginBottom: 16 }} />
            <SkeletonLoader width={160} height={20} style={{ marginBottom: 8 }} />
            <SkeletonLoader width={200} height={14} style={{ marginBottom: 16 }} />
            <SkeletonLoader width={100} height={32} borderRadius={20} />
          </View>
          {/* Stats skeleton */}
          <View style={styles.statsSection}>
            <SkeletonLoader width={120} height={20} style={{ marginBottom: 16 }} />
            <View style={styles.statsGrid}>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </View>
          </View>
          {/* Info cards skeleton */}
          <SkeletonLoader width="100%" height={56} borderRadius={12} style={{ marginBottom: 12 }} />
          <SkeletonLoader width="100%" height={56} borderRadius={12} style={{ marginBottom: 12 }} />
          <SkeletonLoader width="100%" height={56} borderRadius={12} style={{ marginBottom: 12 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10b981" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>View your account & statistics</Text>
        </View>

        <View style={styles.content}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
              ) : (
                <Text style={styles.avatarText}>
                  {userData?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </Text>
              )}
            </View>
            <Text style={styles.displayName}>
              {userData?.displayName || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {userData?.role === 'admin' ? '👑 Admin' : '🌱 User'}
              </Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="analytics-outline" size={28} color="#10b981" style={styles.statIcon} />
                <Text style={styles.statValue}>{stats.totalDetections}</Text>
                <Text style={styles.statLabel}>Total Scans</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="cube-outline" size={28} color="#10b981" style={styles.statIcon} />
                <Text style={styles.statValue}>{stats.totalItems}</Text>
                <Text style={styles.statLabel}>Items Detected</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="pricetag-outline" size={28} color="#10b981" style={styles.statIcon} />
                <Text style={styles.statValue}>{stats.uniqueTypes}</Text>
                <Text style={styles.statLabel}>Unique Types</Text>
              </View>
            </View>
          </View>

          {/* Account Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Account Information</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoLeft}>
                <Ionicons name="mail-outline" size={24} color="#10b981" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email Address</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoLeft}>
                <Ionicons name="person-outline" size={24} color="#10b981" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Display Name</Text>
                  <Text style={styles.infoValue}>
                    {userData?.displayName || 'Not set'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoLeft}>
                <Ionicons name="calendar-outline" size={24} color="#10b981" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(userData?.createdAt)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoLeft}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Account Status</Text>
                  <Text style={styles.infoValue}>
                    {userData?.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/history')}
            >
              <Ionicons name="bar-chart-outline" size={24} color="#10b981" style={styles.actionIcon} />
              <Text style={styles.actionText}>View Detection History</Text>
              <Text style={styles.infoArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Ionicons name="create-outline" size={24} color="#10b981" style={styles.actionIcon} />
              <Text style={styles.actionText}>Edit Profile</Text>
              <Text style={styles.infoArrow}>›</Text>
            </TouchableOpacity>

            {userData?.role === 'admin' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/admin')}
              >
                <Ionicons name="shield-outline" size={24} color="#10b981" style={styles.actionIcon} />
                <Text style={styles.actionText}>Admin Dashboard</Text>
                <Text style={styles.infoArrow}>›</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
