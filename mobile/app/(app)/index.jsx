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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/src/utils/apiClient';
import { CardSkeleton, StatSkeleton } from '@/src/components/SkeletonLoader';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f5' },
  header: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#f4f4f5',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 34, fontWeight: '900', color: '#18181b', letterSpacing: -0.5 },
  welcomeCard: {
    marginTop: 4,
  },
  welcomeText: { color: '#3f3f46', fontSize: 16, fontWeight: '600' },
  welcomeSubtext: { color: '#71717a', fontSize: 14, marginTop: 2, fontWeight: '500' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderCurve: 'continuous',
    padding: 16,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: { fontSize: 26, fontWeight: '900', color: '#18181b', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: '#a1a1aa', marginTop: 2, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Quick Actions
  actionSection: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18181b',
    marginBottom: 16,
    letterSpacing: -0.5,
    paddingHorizontal: 4,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderCurve: 'continuous',
    padding: 24,
    flex: 1,
    minWidth: '45%',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  quickActionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181b',
  },

  // Recent Detection History
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    borderCurve: 'continuous',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  historyItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: '#ffffff',
  },
  historyImage: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderCurve: 'continuous',
    marginRight: 16,
    backgroundColor: '#f4f4f5',
  },
  historyInfo: { flex: 1, justifyContent: 'center' },
  historyType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 4,
  },
  historyDate: { fontSize: 13, color: '#a1a1aa', fontWeight: '500' },
  historyMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  historyPill: {
    backgroundColor: '#f4f4f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  historyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#52525b',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: { marginBottom: 16, opacity: 0.4 },
  emptyText: { fontSize: 15, color: '#a1a1aa', textAlign: 'center', fontWeight: '500', lineHeight: 22 },

  viewAllButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
    marginTop: 4,
  },
  viewAllText: { color: '#10b981', fontWeight: '700', fontSize: 15 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
  },
});


function QuickActionCard({ icon, label, onPress, color = '#10b981', bg = '#d1fae5' }) {
  return (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIconContainer, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionText}>{label}</Text>
    </TouchableOpacity>
  );
}

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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Loading...</Text>
        </View>
        <View style={{ padding: 24 }}>
          <View style={styles.statsContainer}>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </View>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
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
              <View style={styles.statIconContainer}>
                <Ionicons name="scan-outline" size={22} color="#10b981" />
              </View>
              <Text style={styles.statValue}>{stats.totalDetections}</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="cube-outline" size={22} color="#3b82f6" />
              </View>
              <Text style={styles.statValue}>{stats.totalItems}</Text>
              <Text style={styles.statLabel}>Cataloged</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="color-palette-outline" size={22} color="#8b5cf6" />
              </View>
              <Text style={styles.statValue}>{stats.uniqueTypes}</Text>
              <Text style={styles.statLabel}>Varieties</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <QuickActionCard
                icon="camera-outline"
                label="Launch Scanner"
                onPress={() => router.push('/scan')}
                color="#10b981"
                bg="#ecfdf5"
              />
              <QuickActionCard
                icon="bar-chart-outline"
                label="Activity Ledger"
                onPress={() => router.push('/history')}
                color="#3b82f6"
                bg="#eff6ff"
              />
              <QuickActionCard
                icon="person-outline"
                label="Identity Profile"
                onPress={() => router.push('/profile')}
                color="#8b5cf6"
                bg="#f5f3ff"
              />
              <QuickActionCard
                icon="trophy-outline"
                label="Social Rank"
                onPress={() => router.push('/more')}
                color="#f59e0b"
                bg="#fffbeb"
              />
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
                        defaultSource={require('@/assets/icon.png')}
                      />
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyType} numberOfLines={1}>
                          {item.detectedWasteTypes?.length > 0 ? item.detectedWasteTypes[0] : 'Unknown Object'}
                        </Text>
                        <Text style={styles.historyDate}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                        <View style={styles.historyMetaContainer}>
                          <View style={styles.historyPill}>
                            <Text style={styles.historyPillText}>{item.summary?.total_detections || 0} Items</Text>
                          </View>
                          {item.detectedWasteTypes && item.detectedWasteTypes.length > 1 && (
                            <View style={styles.historyPill}>
                              <Text style={styles.historyPillText}>+{item.detectedWasteTypes.length - 1}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={{ justifyContent: 'center', paddingLeft: 8 }}>
                        <Ionicons name="chevron-forward" size={20} color="#d4d4d8" />
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
                  <Ionicons name="search-outline" size={48} color="#94a3b8" style={styles.emptyIcon} />
                  <Text style={styles.emptyText}>
                    No detections yet.{'\n'}Start by scanning some waste!
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}