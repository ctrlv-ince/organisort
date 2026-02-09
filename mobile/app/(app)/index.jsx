import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Image,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import apiClient from '@/src/utils/apiClient';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#10b981',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 30, fontWeight: 'bold', color: 'white' },
  welcomeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
  },
  welcomeText: { color: 'white', fontSize: 18, fontWeight: '600' },
  welcomeSubtext: { color: '#d1fae5', fontSize: 14, marginTop: 4 },
  content: { paddingHorizontal: 24, paddingVertical: 24 },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },

  // Quick Actions
  actionSection: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  quickActionIcon: { fontSize: 40, marginBottom: 12 },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },

  // Recent Detection History
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  historyItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  historyImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#e2e8f0',
  },
  historyInfo: { flex: 1 },
  historyType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  historyDate: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  historyConfidence: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  wasteTypeBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginTop: 4,
  },
  wasteTypeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  wasteTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16, opacity: 0.5 },
  emptyText: { fontSize: 16, color: '#64748b', textAlign: 'center' },

  viewAllButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  viewAllText: { color: 'white', fontWeight: '600', fontSize: 14 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
});

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalDetections: 0,
    totalItems: 0,
    uniqueTypes: 0,
  });
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get('/api/detections/history');
      const detections = response.data.detections || response.data;

      // Calculate stats
      const totalDetections = detections.length;
      const totalItems = detections.reduce(
        (sum, d) => sum + (d.summary?.total_detections || 0),
        0
      );
      const uniqueTypesSet = new Set();

      detections.forEach((d) => {
        if (d.detectedWasteTypes) {
          d.detectedWasteTypes.forEach((type) => uniqueTypesSet.add(type));
        }
      });

      setStats({
        totalDetections,
        totalItems,
        uniqueTypes: uniqueTypesSet.size,
      });

      // Get recent 5 detections
      setDetectionHistory(detections.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#10b981"
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>OrganiSort</Text>
        </View>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>
            Welcome, {user?.displayName || 'User'}! 👋
          </Text>
          <Text style={styles.welcomeSubtext}>
            Scan waste & contribute to sustainability
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>{stats.totalDetections}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statValue}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>Items Found</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏷️</Text>
            <Text style={styles.statValue}>{stats.uniqueTypes}</Text>
            <Text style={styles.statLabel}>Unique Types</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={quickActionCard}
              onPress={() => router.push('/scan')}
            >
              <Text style={styles.quickActionIcon}>📷</Text>
              <Text style={styles.quickActionText}>Scan Waste</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/history')}
            >
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>View History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.quickActionIcon}>👤</Text>
              <Text style={styles.quickActionText}>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/more')}
            >
              <Text style={styles.quickActionIcon}>🏆</Text>
              <Text style={styles.quickActionText}>Leaderboard</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Detection History */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Recent Detections</Text>
          <View style={styles.historyCard}>
            {detectionHistory.length > 0 ? (
              <>
                {detectionHistory.map((item, index) => (
                  <View
                    key={item._id || index}
                    style={[
                      styles.historyItem,
                      index === detectionHistory.length - 1 && {
                        borderBottomWidth: 0,
                      },
                    ]}
                  >
                    <Image
                      source={{
                        uri: item.annotated_image || item.imageUrl,
                      }}
                      style={styles.historyImage}
                      resizeMode="cover"
                    />
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyType}>
                        {item.primaryWasteType ||
                          item.wasteType ||
                          'Unknown'}
                      </Text>
                      <Text style={styles.historyDate}>
                        {new Date(item.createdAt).toLocaleDateString()} at{' '}
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </Text>
                      <Text style={styles.historyConfidence}>
                        {item.summary?.total_detections || 0} items •{' '}
                        {item.summary?.unique_classes || 0} types
                      </Text>
                      {item.detectedWasteTypes &&
                        item.detectedWasteTypes.length > 0 && (
                          <View style={styles.wasteTypesContainer}>
                            {item.detectedWasteTypes
                              .slice(0, 3)
                              .map((type, idx) => (
                                <View
                                  key={idx}
                                  style={styles.wasteTypeBadge}
                                >
                                  <Text style={styles.wasteTypeBadgeText}>
                                    {type}
                                  </Text>
                                </View>
                              ))}
                            {item.detectedWasteTypes.length > 3 && (
                              <View
                                style={[
                                  styles.wasteTypeBadge,
                                  { backgroundColor: '#6b7280' },
                                ]}
                              >
                                <Text style={styles.wasteTypeBadgeText}>
                                  +{item.detectedWasteTypes.length - 3}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                    </View>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => router.push('/history')}
                >
                  <Text style={styles.viewAllText}>View All History</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>
                  No detections yet.{'\n'}Start by scanning some waste!
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}