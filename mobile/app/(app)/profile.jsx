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
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/src/utils/apiClient';
import SkeletonLoader, { StatSkeleton } from '@/src/components/SkeletonLoader';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  title: { fontSize: 34, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, marginTop: 4, fontWeight: '500' },
  content: { padding: 24 },

  // Profile Header
  profileHeader: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    borderCurve: 'continuous',
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  avatarText: { fontSize: 40, color: '#18181b', fontWeight: '900', letterSpacing: -0.5 },
  displayName: { fontSize: 26, fontWeight: '900', color: '#18181b', marginBottom: 6, letterSpacing: -0.5 },
  email: { fontSize: 15, color: '#71717a', marginBottom: 20, fontWeight: '500' },
  badge: {
    backgroundColor: '#18181b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderCurve: 'continuous',
  },
  badgeText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },

  // Stats Section
  statsSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#18181b', marginBottom: 20, letterSpacing: -0.5 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderCurve: 'continuous',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  statIcon: { marginBottom: 12, opacity: 0.8 },
  statValue: { fontSize: 28, fontWeight: '900', color: '#18181b', letterSpacing: -0.5 },
  statLabel: { fontSize: 12, color: '#a1a1aa', marginTop: 4, textAlign: 'center', fontWeight: '700', textTransform: 'uppercase' },

  // Info Cards
  infoSection: { marginBottom: 32 },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderCurve: 'continuous',
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  infoIcon: { marginRight: 16, opacity: 0.8 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 13, color: '#71717a', marginBottom: 4, fontWeight: '500' },
  infoValue: { fontSize: 16, fontWeight: '700', color: '#18181b' },
  infoArrow: { fontSize: 24, color: '#d4d4d8', fontWeight: '300' },

  // Action Buttons
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderCurve: 'continuous',
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: { marginRight: 16, opacity: 0.8 },
  actionText: { fontSize: 16, fontWeight: '700', color: '#18181b', flex: 1 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    backgroundColor: '#f4f4f5',
  },
});

export default function ProfileScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
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
      Alert.alert('Error', error?.response?.data?.error || 'Failed to load profile data');
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.bg }]}>
          <Text style={[styles.title, { color: colors.text }]}>My Profile</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>View your account & statistics</Text>
        </View>
        <View style={styles.content}>
          {/* Avatar skeleton */}
          <View style={[styles.profileHeader, { alignItems: 'center', backgroundColor: colors.card }]}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.bg }]}>
          <Text style={[styles.title, { color: colors.text }]}>My Profile</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>View your account & statistics</Text>
        </View>

        <View style={styles.content}>
          {/* Profile Header */}
          <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
            <View style={styles.avatarContainer}>
              {(userData?.photoURL || user?.photoURL) ? (
                <Image source={{ uri: userData?.photoURL || user?.photoURL }} style={styles.avatar} />
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="analytics-outline" size={28} color="#18181b" style={styles.statIcon} />
                <Text style={styles.statValue}>{stats.totalDetections}</Text>
                <Text style={styles.statLabel}>Total Scans</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="cube-outline" size={28} color={colors.text} style={styles.statIcon} />
                <Text style={styles.statValue}>{stats.totalItems}</Text>
                <Text style={styles.statLabel}>Items Detected</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="pricetag-outline" size={28} color={colors.text} style={styles.statIcon} />
                <Text style={styles.statValue}>{stats.uniqueTypes}</Text>
                <Text style={styles.statLabel}>Unique Types</Text>
              </View>
            </View>
          </View>

          {/* Account Info */}
          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Information</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoLeft}>
                <Ionicons name="mail-outline" size={24} color="#18181b" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email Address</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoLeft}>
                <Ionicons name="person-outline" size={24} color="#18181b" style={styles.infoIcon} />
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
                <Ionicons name="calendar-outline" size={24} color="#18181b" style={styles.infoIcon} />
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
                <Ionicons name="checkmark-circle-outline" size={24} color="#18181b" style={styles.infoIcon} />
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/history')}
            >
              <Ionicons name="bar-chart-outline" size={24} color="#18181b" style={styles.actionIcon} />
              <Text style={styles.actionText}>View Detection History</Text>
              <Text style={styles.infoArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Ionicons name="create-outline" size={24} color="#18181b" style={styles.actionIcon} />
              <Text style={styles.actionText}>Edit Profile</Text>
              <Text style={styles.infoArrow}>›</Text>
            </TouchableOpacity>

            {userData?.role === 'admin' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/admin')}
              >
                <Ionicons name="shield-outline" size={24} color="#18181b" style={styles.actionIcon} />
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
