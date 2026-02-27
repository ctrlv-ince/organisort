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
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/src/utils/apiClient';
import { CardSkeleton, StatSkeleton } from '@/src/components/SkeletonLoader';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 34, fontWeight: '900', letterSpacing: -0.5 },
  welcomeCard: {
    marginTop: 4,
  },
  welcomeText: { fontSize: 16, fontWeight: '600' },
  welcomeSubtext: { fontSize: 14, marginTop: 2, fontWeight: '500' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Quick Actions
  actionSection: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
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
  },

  // Recent Detection History
  historyCard: {
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
  },
  historyImage: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderCurve: 'continuous',
    marginRight: 16,
  },
  historyInfo: { flex: 1, justifyContent: 'center' },
  historyType: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  historyDate: { fontSize: 13, fontWeight: '500' },
  historyMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  historyPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  historyPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: { marginBottom: 16, opacity: 0.4 },
  emptyText: { fontSize: 15, textAlign: 'center', fontWeight: '500', lineHeight: 22 },

  viewAllButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 4,
  },
  viewAllText: { fontWeight: '700', fontSize: 15 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


function QuickActionCard({ icon, label, onPress, color, bg, cardBg, textColor }) {
  return (
    <TouchableOpacity
      style={[styles.quickActionCard, { backgroundColor: cardBg }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIconContainer, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.quickActionText, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.bg }]}>
          <Text style={[styles.title, { color: colors.textSecondary }]}>Loading...</Text>
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <View style={[styles.header, { backgroundColor: colors.bg }]}>
          <View style={styles.headerTop}>
            <Text style={[styles.title, { color: colors.text }]}>OrganiSort</Text>
          </View>
          <View style={styles.welcomeCard}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              Welcome, {user?.displayName || 'User'}! 👋
            </Text>
            <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>
              Scan waste & contribute to sustainability
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.bgAlt }]}>
                <Ionicons name="scan-outline" size={22} color={colors.accent} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalDetections}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Scans</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.bgAlt }]}>
                <Ionicons name="cube-outline" size={22} color="#3b82f6" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalItems}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cataloged</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.bgAlt }]}>
                <Ionicons name="color-palette-outline" size={22} color="#8b5cf6" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.uniqueTypes}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Varieties</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <QuickActionCard
                icon="camera-outline"
                label="Launch Scanner"
                onPress={() => router.push('/scan')}
                color={colors.accent}
                bg={colors.accentSurface}
                cardBg={colors.card}
                textColor={colors.text}
              />
              <QuickActionCard
                icon="bar-chart-outline"
                label="Activity Ledger"
                onPress={() => router.push('/history')}
                color="#3b82f6"
                bg="#eff6ff"
                cardBg={colors.card}
                textColor={colors.text}
              />
              <QuickActionCard
                icon="person-outline"
                label="Identity Profile"
                onPress={() => router.push('/profile')}
                color="#8b5cf6"
                bg="#f5f3ff"
                cardBg={colors.card}
                textColor={colors.text}
              />
              <QuickActionCard
                icon="trophy-outline"
                label="Social Rank"
                onPress={() => router.push('/more')}
                color="#f59e0b"
                bg="#fffbeb"
                cardBg={colors.card}
                textColor={colors.text}
              />
            </View>
          </View>

          {/* Recent Detection History */}
          <View style={styles.actionSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Detections</Text>
            <View style={[styles.historyCard, { backgroundColor: colors.card }]}>
              {detectionHistory.length > 0 ? (
                <>
                  {detectionHistory.map((item, index) => (
                    <View
                      key={item._id || index}
                      style={[
                        styles.historyItem,
                        { backgroundColor: colors.card },
                        index === detectionHistory.length - 1 && {
                          borderBottomWidth: 0,
                        },
                      ]}
                    >
                      <Image
                        source={{
                          uri: item.annotated_image || item.imageUrl,
                        }}
                        style={[styles.historyImage, { backgroundColor: colors.bgAlt }]}
                        resizeMode="cover"
                        defaultSource={require('@/assets/icon.png')}
                      />
                      <View style={styles.historyInfo}>
                        <Text style={[styles.historyType, { color: colors.text }]} numberOfLines={1}>
                          {item.detectedWasteTypes?.length > 0 ? item.detectedWasteTypes[0] : 'Unknown Object'}
                        </Text>
                        <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                        <View style={styles.historyMetaContainer}>
                          <View style={[styles.historyPill, { backgroundColor: colors.bgAlt }]}>
                            <Text style={[styles.historyPillText, { color: colors.textSecondary }]}>{item.summary?.total_detections || 0} Items</Text>
                          </View>
                          {item.detectedWasteTypes && item.detectedWasteTypes.length > 1 && (
                            <View style={[styles.historyPill, { backgroundColor: colors.bgAlt }]}>
                              <Text style={[styles.historyPillText, { color: colors.textSecondary }]}>+{item.detectedWasteTypes.length - 1}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={{ justifyContent: 'center', paddingLeft: 8 }}>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                      </View>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={[styles.viewAllButton, { borderTopColor: colors.border }]}
                    onPress={() => router.push('/history')}
                  >
                    <Text style={[styles.viewAllText, { color: colors.accent }]}>View All History</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color={colors.textSecondary} style={styles.emptyIcon} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
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