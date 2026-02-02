import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import apiClient from '@/src/utils/apiClient';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#2563eb', paddingTop: 32, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 30, fontWeight: 'bold', color: 'white' },
  logoutBtn: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: 'white', fontWeight: 'bold' },
  welcomeCard: { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 12, padding: 12 },
  welcomeText: { color: 'white', fontSize: 18, fontWeight: '600' },
  welcomeSubtext: { color: '#e0e7ff', fontSize: 14, marginTop: 4 },
  content: { paddingHorizontal: 24, paddingVertical: 24 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardIcon: { fontSize: 24, marginRight: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  cardRow: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 12, marginBottom: 12 },
  cardLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  cardValue: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 14, fontWeight: 'bold' },
  footerText: { textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 32, marginBottom: 16 },
  footerSubtext: { textAlign: 'center', color: '#94a3b8', fontSize: 12 },
  logoutBtn: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default function HomeScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Navigation handled by Root layout; avoid navigate-before-mount here

  const fetchUserProfile = async () => {
    try {
      if (!user) return;
      
      const response = await apiClient.get('/api/auth/me');

      setUserProfile(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError('Failed to fetch user profile. Please check your authentication and try again.');
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
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 16, color: '#dc2626', textAlign: 'center', marginBottom: 16 }}>
          {error}
        </Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2563eb" />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Dashboard</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Welcome, {user?.displayName || 'User'}! 👋</Text>
          <Text style={styles.welcomeSubtext}>Ready to detect waste and make an impact</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🔥</Text>
            <Text style={styles.cardTitle}>Firebase Auth</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Email</Text>
            <Text style={styles.cardValue}>{user?.email || 'N/A'}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>UID</Text>
            <Text style={styles.cardValue}>{user?.uid ? user.uid.substring(0, 20) + '...' : 'N/A'}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.cardLabel}>Email Verified</Text>
            <View style={[styles.statusBadge, user?.emailVerified ? { backgroundColor: 'rgba(16, 185, 129, 0.2)' } : { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Text style={[styles.statusText, user?.emailVerified ? { color: '#10b981' } : { color: '#f59e0b' }]}>
                {user?.emailVerified ? '✓ Yes' : '✗ No'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💾</Text>
            <Text style={styles.cardTitle}>MongoDB Sync</Text>
          </View>
          {userProfile ? (
            <>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Display Name</Text>
                <Text style={styles.cardValue}>{userProfile.displayName || 'Not set'}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Last Login</Text>
                <Text style={styles.cardValue}>{new Date(userProfile.lastLogin).toLocaleString()}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Account Created</Text>
                <Text style={styles.cardValue}>{new Date(userProfile.createdAt).toLocaleString()}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.cardLabel}>Account Status</Text>
                <View style={[styles.statusBadge, userProfile.isActive ? { backgroundColor: 'rgba(16, 185, 129, 0.2)' } : { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                  <Text style={[styles.statusText, userProfile.isActive ? { color: '#10b981' } : { color: '#ef4444' }]}>
                    {userProfile.isActive ? '● Active' : '● Inactive'}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 24 }}>
              <ActivityIndicator color="#2563eb" size="small" />
              <Text style={[styles.cardLabel, { marginTop: 12 }]}>Syncing...</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>⚙️</Text>
            <Text style={styles.cardTitle}>System Status</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.cardLabel}>Firebase Connected</Text>
            <Text style={{ fontSize: 24 }}>✅</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.cardLabel}>Backend Synced</Text>
            <Text style={{ fontSize: 24 }}>{userProfile ? '✅' : '⏳'}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.cardLabel}>Mobile App</Text>
            <Text style={{ fontSize: 24 }}>✅</Text>
          </View>
        </View>

        <Text style={styles.footerText}>Waste Detection Admin Panel v1.0.0</Text>
        <Text style={styles.footerSubtext}>Firebase + MongoDB Synced</Text>
      </View>
    </ScrollView>
  );
}
