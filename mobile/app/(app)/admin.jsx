import React, { useState, useEffect } from 'react';
import { apiClient } from '@/src/utils/apiClient';
import AdminProtectedScreen from '@/src/components/AdminProtectedScreen';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SkeletonLoader from '@/src/components/SkeletonLoader';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#10b981', paddingTop: 32, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 30, fontWeight: 'bold', color: 'white' },
  logoutBtn: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: 'white', fontWeight: 'bold' },
  welcomeCard: { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 12, padding: 12 },
  welcomeText: { color: 'white', fontSize: 18, fontWeight: '600' },
  welcomeSubtext: { color: '#d1fae5', fontSize: 14, marginTop: 4 },
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
  adminCard: { backgroundColor: 'white', borderRadius: 12, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  adminCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  adminCardIcon: { fontSize: 24, marginRight: 12, color: '#10b981' },
  adminCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  userCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  userCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  userCardIcon: { fontSize: 18, marginRight: 12 },
  userCardTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  userCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  userCardLabel: { fontSize: 11, color: '#64748b' },
  userCardValue: { fontSize: 12, fontWeight: '500', color: '#1e293b' },
  actionButton: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  errorCard: { backgroundColor: '#fef2f2', borderRadius: 12, padding: 16, marginBottom: 12, borderColor: '#fecaca', borderWidth: 1 },
  errorText: { color: '#991b1b', fontSize: 12 },
});

export default function AdminDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      if (!user) return;

      // Using the apiClient which automatically adds the token
      const response = await apiClient.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please check your authentication and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleRefresh = () => {
    setError(null);
    setRefreshing(true);
    fetchUsers();
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', onPress: () => { }, style: 'cancel' },
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

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await apiClient.put(`/api/users/${userId}/status`, { isActive: !currentStatus });
      Alert.alert('Success', 'User status updated successfully');
      handleRefresh();
    } catch (err) {
      console.error('Failed to update user status:', err);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const deleteUser = (userId) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/api/users/${userId}`);
              Alert.alert('Success', 'User deleted successfully');
              handleRefresh();
            } catch (err) {
              console.error('Failed to delete user:', err);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <AdminProtectedScreen>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.title}>Admin Dashboard</Text>
            </View>
            <View style={styles.welcomeCard}>
              <SkeletonLoader width={200} height={18} borderRadius={4} style={{ marginBottom: 8 }} />
              <SkeletonLoader width={260} height={14} borderRadius={4} />
            </View>
          </View>
          <View style={styles.content}>
            <SkeletonLoader width={140} height={20} style={{ marginBottom: 16 }} />
            <SkeletonLoader width="100%" height={120} borderRadius={12} style={{ marginBottom: 12 }} />
            <SkeletonLoader width="100%" height={120} borderRadius={12} style={{ marginBottom: 12 }} />
            <SkeletonLoader width="100%" height={120} borderRadius={12} style={{ marginBottom: 12 }} />
          </View>
        </SafeAreaView>
      </AdminProtectedScreen>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleRefresh}>
            <Text style={styles.actionButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <AdminProtectedScreen>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor='#10b981' />
          }
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.title}>Admin Dashboard</Text>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeText}>Welcome, {user?.displayName || 'Admin'}!</Text>
              <Text style={styles.welcomeSubtext}>Manage all user accounts and system settings</Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.adminCard}>
              <View style={styles.adminCardHeader}>
                <Ionicons name="people-outline" size={24} color="#10b981" style={{ marginRight: 12 }} />
                <Text style={styles.adminCardTitle}>User Management</Text>
              </View>
              <Text style={[styles.cardLabel, { marginBottom: 16 }]}>
                Total Users: {users?.length || 0}
              </Text>

              {users?.map((user, index) => (
                <View key={user._id} style={styles.userCard}>
                  <View style={styles.userCardHeader}>
                    <Ionicons name="person-outline" size={18} color="#10b981" style={{ marginRight: 12 }} />
                    <Text style={styles.userCardTitle}>{user.displayName || 'User'}</Text>
                  </View>
                  <View style={styles.userCardRow}>
                    <Text style={styles.userCardLabel}>Email</Text>
                    <Text style={styles.userCardValue}>{user.email}</Text>
                  </View>
                  <View style={styles.userCardRow}>
                    <Text style={styles.userCardLabel}>Role</Text>
                    <Text style={styles.userCardValue}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </Text>
                  </View>
                  <View style={styles.userCardRow}>
                    <Text style={styles.userCardLabel}>Status</Text>
                    <View style={[styles.statusBadge, user.isActive ? { backgroundColor: 'rgba(16, 185, 129, 0.2)' } : { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                      <Text style={[styles.statusText, user.isActive ? { color: '#10b981' } : { color: '#ef4444' }]}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.userCardRow}>
                    <Text style={styles.userCardLabel}>Created</Text>
                    <Text style={styles.userCardValue}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        user.isActive ? { backgroundColor: '#f59e0b' } : { backgroundColor: '#10b981' },
                      ]}
                      onPress={() => toggleUserStatus(user._id, user.isActive)}
                    >
                      <Text style={styles.actionButtonText}>
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                      onPress={() => deleteUser(user._id)}
                    >
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.footerText}>OrganiSort Admin Panel v1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AdminProtectedScreen>
  );
}
