import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import apiClient from '@/src/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import SkeletonLoader, { StatSkeleton } from '@/src/components/SkeletonLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  title: { fontSize: 34, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, marginTop: 4, fontWeight: '500' },
  content: { padding: 24 },

  // Section Styles
  section: { marginBottom: 40 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: { fontSize: 24, marginRight: 12 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#18181b', flex: 1, letterSpacing: -0.5 },

  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderCurve: 'continuous',
    padding: 20,
    flex: 1,
    minWidth: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  statValue: { fontSize: 32, fontWeight: '900', color: '#18181b', marginBottom: 4, letterSpacing: -0.5 },
  statLabel: { fontSize: 13, color: '#a1a1aa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  statSubtext: { fontSize: 12, color: '#10b981', marginTop: 6, fontWeight: '600' },

  // Impact Card
  impactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    borderCurve: 'continuous',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 16,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  impactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  impactIcon: { fontSize: 24 },
  impactContent: { flex: 1 },
  impactValue: { fontSize: 22, fontWeight: '800', color: '#18181b', letterSpacing: -0.5 },
  impactLabel: { fontSize: 14, color: '#71717a', marginTop: 2, fontWeight: '500' },

  // Chart Container
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    borderCurve: 'continuous',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 16,
  },
  chartTitle: { fontSize: 18, fontWeight: '800', color: '#18181b', marginBottom: 20, letterSpacing: -0.5 },

  // Waste Type List
  wasteTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  wasteTypeRank: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  wasteTypeRankText: { color: '#18181b', fontSize: 15, fontWeight: '800' },
  wasteTypeName: { flex: 1, fontSize: 16, fontWeight: '700', color: '#18181b' },
  wasteTypeCount: { fontSize: 16, fontWeight: '800', color: '#18181b', marginRight: 8 },
  wasteTypePercentage: { fontSize: 14, color: '#a1a1aa', fontWeight: '600' },

  // Progress Bar
  progressBar: {
    height: 12,
    backgroundColor: '#f4f4f5',
    borderRadius: 6,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 6,
  },

  // Composition Chart
  compositionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  compositionColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  compositionLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: '#18181b' },
  compositionValue: { fontSize: 18, fontWeight: '800', color: '#18181b' },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    backgroundColor: '#f4f4f5',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: { fontSize: 64, marginBottom: 24, opacity: 0.3 },
  emptyText: { fontSize: 16, color: '#a1a1aa', textAlign: 'center', fontWeight: '500', lineHeight: 24 },
});

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalScans: 0,
    totalItems: 0,
    uniqueTypes: 0,
    averageConfidence: 0,
    organicPercentage: 100,
    nonOrganicPercentage: 0,
    wasteTypes: [],
    topWasteTypes: [],
    weeklyGrowth: 0,
    impactStats: {
      co2Saved: 0,
      landfillDiverted: 0,
      waterSaved: 0,
      treesEquivalent: 0,
    },
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.get('/api/detections/history');
      const detections = response.data.detections || response.data;

      calculateAnalytics(detections);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateAnalytics = (detections) => {
    if (detections.length === 0) {
      setLoading(false);
      return;
    }

    // Basic stats
    const totalScans = detections.length;
    const totalItems = detections.reduce(
      (sum, d) => sum + (d.summary?.total_detections || 0),
      0
    );

    // Waste type frequency
    const wasteTypeCount = {};
    const allWasteTypes = [];

    detections.forEach((detection) => {
      if (detection.detectedWasteTypes) {
        detection.detectedWasteTypes.forEach((type) => {
          allWasteTypes.push(type);
          wasteTypeCount[type] = (wasteTypeCount[type] || 0) + 1;
        });
      }
      // Also count individual detections
      if (detection.detections) {
        detection.detections.forEach((item) => {
          const className = item.class;
          wasteTypeCount[className] = (wasteTypeCount[className] || 0) + 1;
        });
      }
    });

    // Top waste types
    const topWasteTypes = Object.entries(wasteTypeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count], index) => ({
        rank: index + 1,
        name,
        count,
        percentage: ((count / totalItems) * 100).toFixed(1),
      }));

    const uniqueTypes = Object.keys(wasteTypeCount).length;

    // Average confidence
    const totalConfidence = detections.reduce(
      (sum, d) => sum + (d.summary?.average_confidence || 0),
      0
    );
    const averageConfidence = totalConfidence / detections.length;

    // Weekly growth (mock - you'd need date filtering)
    const weeklyGrowth = 12; // Mock data

    // Environmental impact calculations
    // These are estimates based on typical organic waste composting benefits
    const impactStats = {
      co2Saved: (totalItems * 0.3).toFixed(1), // ~0.3 kg CO2 per item
      landfillDiverted: (totalItems * 0.5).toFixed(1), // ~0.5 kg per item
      waterSaved: (totalItems * 2).toFixed(0), // ~2 liters per item
      treesEquivalent: (totalItems * 0.01).toFixed(2), // ~0.01 trees per item
    };

    // For now, assume 100% organic (since your model detects organic waste)
    // In the future, you can categorize based on class_id or class names
    const organicPercentage = 100;
    const nonOrganicPercentage = 0;

    setAnalytics({
      totalScans,
      totalItems,
      uniqueTypes,
      averageConfidence: (averageConfidence * 100).toFixed(1),
      organicPercentage,
      nonOrganicPercentage,
      wasteTypes: topWasteTypes,
      topWasteTypes,
      weeklyGrowth,
      impactStats,
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.bg }]}>
          <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Insights & Impact</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.statsGrid}>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </View>
          <SkeletonLoader width="100%" height={200} borderRadius={12} style={{ marginTop: 24, marginBottom: 16 }} />
          <SkeletonLoader width="100%" height={200} borderRadius={12} style={{ marginBottom: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (analytics.totalScans === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
        <ScrollView style={{ flex: 1 }}>
          <View style={[styles.header, { backgroundColor: colors.bg }]}>
            <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Insights & Impact</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={64} color="#94a3b8" style={{ marginBottom: 16, opacity: 0.5 }} />
              <Text style={styles.emptyText}>
                No data yet.{'\n'}Start scanning to see your analytics!
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.bg }]}>
          <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your Waste Detection Insights</Text>
        </View>

        <View style={styles.content}>
          {/* Overview Stats */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bar-chart-outline" size={28} color="#10b981" style={{ marginRight: 12 }} />
              <Text style={styles.sectionTitle}>Overview</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics.totalScans}</Text>
                <Text style={styles.statLabel}>Total Scans</Text>
                <Text style={styles.statSubtext}>+{analytics.weeklyGrowth}% this week</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics.totalItems}</Text>
                <Text style={styles.statLabel}>Items Detected</Text>
                <Text style={styles.statSubtext}>Across all scans</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics.uniqueTypes}</Text>
                <Text style={styles.statLabel}>Unique Types</Text>
                <Text style={styles.statSubtext}>Different waste categories</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics.averageConfidence}%</Text>
                <Text style={styles.statLabel}>Avg Confidence</Text>
                <Text style={styles.statSubtext}>Detection accuracy</Text>
              </View>
            </View>
          </View>

          {/* Environmental Impact */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="earth-outline" size={28} color="#10b981" style={{ marginRight: 12 }} />
              <Text style={styles.sectionTitle}>Environmental Impact</Text>
            </View>
            <View style={styles.impactCard}>
              <View style={styles.impactRow}>
                <View style={styles.impactIconContainer}>
                  <Text style={styles.impactIcon}>🌱</Text>
                </View>
                <View style={styles.impactContent}>
                  <Text style={styles.impactValue}>{analytics.impactStats.co2Saved} kg</Text>
                  <Text style={styles.impactLabel}>CO₂ Emissions Avoided</Text>
                </View>
              </View>
              <View style={styles.impactRow}>
                <View style={styles.impactIconContainer}>
                  <Text style={styles.impactIcon}>🗑️</Text>
                </View>
                <View style={styles.impactContent}>
                  <Text style={styles.impactValue}>
                    {analytics.impactStats.landfillDiverted} kg
                  </Text>
                  <Text style={styles.impactLabel}>Landfill Waste Diverted</Text>
                </View>
              </View>
              <View style={styles.impactRow}>
                <View style={styles.impactIconContainer}>
                  <Text style={styles.impactIcon}>💧</Text>
                </View>
                <View style={styles.impactContent}>
                  <Text style={styles.impactValue}>{analytics.impactStats.waterSaved} L</Text>
                  <Text style={styles.impactLabel}>Water Conserved</Text>
                </View>
              </View>
              <View style={[styles.impactRow, { borderBottomWidth: 0 }]}>
                <View style={styles.impactIconContainer}>
                  <Text style={styles.impactIcon}>🌳</Text>
                </View>
                <View style={styles.impactContent}>
                  <Text style={styles.impactValue}>
                    {analytics.impactStats.treesEquivalent}
                  </Text>
                  <Text style={styles.impactLabel}>Trees Equivalent Impact</Text>
                </View>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
              *Estimates based on proper organic waste composting
            </Text>
          </View>

          {/* Waste Composition */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pie-chart-outline" size={28} color="#10b981" style={{ marginRight: 12 }} />
              <Text style={styles.sectionTitle}>Waste Composition</Text>
            </View>
            <View style={styles.chartCard}>
              <View style={styles.compositionItem}>
                <View style={[styles.compositionColor, { backgroundColor: '#10b981' }]} />
                <Text style={styles.compositionLabel}>Organic Waste</Text>
                <Text style={styles.compositionValue}>{analytics.organicPercentage}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${analytics.organicPercentage}%` }]}
                />
              </View>

              {analytics.nonOrganicPercentage > 0 && (
                <>
                  <View style={[styles.compositionItem, { marginTop: 16 }]}>
                    <View style={[styles.compositionColor, { backgroundColor: '#ef4444' }]} />
                    <Text style={styles.compositionLabel}>Non-Organic Waste</Text>
                    <Text style={styles.compositionValue}>
                      {analytics.nonOrganicPercentage}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${analytics.nonOrganicPercentage}%`, backgroundColor: '#ef4444' },
                      ]}
                    />
                  </View>
                </>
              )}

              <Text
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  marginTop: 16,
                  textAlign: 'center',
                }}
              >
                Based on {analytics.totalItems} detected items
              </Text>
            </View>
          </View>

          {/* Most Common Waste Types */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trending-up-outline" size={28} color="#10b981" style={{ marginRight: 12 }} />
              <Text style={styles.sectionTitle}>Top Waste Types</Text>
            </View>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Most Frequently Detected</Text>
              {analytics.topWasteTypes.map((item, index) => (
                <View
                  key={item.name}
                  style={[
                    styles.wasteTypeItem,
                    index === analytics.topWasteTypes.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View
                    style={[
                      styles.wasteTypeRank,
                      item.rank === 1 && { backgroundColor: '#fef3c7' },
                      item.rank === 2 && { backgroundColor: '#f1f5f9' },
                      item.rank === 3 && { backgroundColor: '#ffedd5' },
                    ]}
                  >
                    <Text style={[styles.wasteTypeRankText,
                    item.rank === 1 && { color: '#d97706' },
                    item.rank === 2 && { color: '#475569' },
                    item.rank === 3 && { color: '#ea580c' },
                    ]}>{item.rank}</Text>
                  </View>
                  <Text style={styles.wasteTypeName}>{item.name}</Text>
                  <Text style={styles.wasteTypeCount}>{item.count}</Text>
                  <Text style={styles.wasteTypePercentage}>({item.percentage}%)</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Classification Breakdown */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flask-outline" size={28} color="#10b981" style={{ marginRight: 12 }} />
              <Text style={styles.sectionTitle}>Classification Stats</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics.uniqueTypes}</Text>
                <Text style={styles.statLabel}>Waste Categories</Text>
                <Text style={styles.statSubtext}>Identified types</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {(analytics.totalItems / analytics.totalScans).toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Items per Scan</Text>
                <Text style={styles.statSubtext}>Average detection</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <Text style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 16 }}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}