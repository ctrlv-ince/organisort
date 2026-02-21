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
import apiClient from '@/src/utils/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import SkeletonLoader, { StatSkeleton } from '@/src/components/SkeletonLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;

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
  title: { fontSize: 30, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#d1fae5', textAlign: 'center', marginTop: 8 },
  content: { padding: 24 },

  // Section Styles
  section: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: { fontSize: 28, marginRight: 12 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', flex: 1 },

  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#10b981', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  statSubtext: { fontSize: 11, color: '#94a3b8', marginTop: 4 },

  // Impact Card
  impactCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  impactIcon: { fontSize: 32, marginRight: 16, width: 40 },
  impactContent: { flex: 1 },
  impactValue: { fontSize: 20, fontWeight: 'bold', color: '#10b981' },
  impactLabel: { fontSize: 13, color: '#64748b', marginTop: 2 },

  // Chart Container
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
  },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },

  // Waste Type List
  wasteTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  wasteTypeRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  wasteTypeRankText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  wasteTypeName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1e293b' },
  wasteTypeCount: { fontSize: 15, fontWeight: 'bold', color: '#10b981', marginRight: 8 },
  wasteTypePercentage: { fontSize: 13, color: '#64748b' },

  // Progress Bar
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },

  // Composition Chart
  compositionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  compositionColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  compositionLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1e293b' },
  compositionValue: { fontSize: 16, fontWeight: 'bold', color: '#10b981' },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16, opacity: 0.5 },
  emptyText: { fontSize: 16, color: '#64748b', textAlign: 'center' },
});

export default function AnalyticsScreen() {
  const { user } = useAuth();
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Insights & Impact</Text>
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.title}>Analytics</Text>
            <Text style={styles.subtitle}>Insights & Impact</Text>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10b981" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Your Waste Detection Insights</Text>
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
                <Ionicons name="leaf-outline" size={48} color="#10b981" />
                <View style={styles.impactContent}>
                  <Text style={styles.impactValue}>{analytics.impactStats.co2Saved} kg</Text>
                  <Text style={styles.impactLabel}>CO₂ Emissions Avoided</Text>
                </View>
              </View>
              <View style={styles.impactRow}>
                <Text style={styles.impactIcon}>🗑️</Text>
                <View style={styles.impactContent}>
                  <Text style={styles.impactValue}>
                    {analytics.impactStats.landfillDiverted} kg
                  </Text>
                  <Text style={styles.impactLabel}>Landfill Waste Diverted</Text>
                </View>
              </View>
              <View style={styles.impactRow}>
                <Text style={styles.impactIcon}>💧</Text>
                <View style={styles.impactContent}>
                  <Text style={styles.impactValue}>{analytics.impactStats.waterSaved} L</Text>
                  <Text style={styles.impactLabel}>Water Conserved</Text>
                </View>
              </View>
              <View style={[styles.impactRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.impactIcon}>🌳</Text>
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
                      item.rank === 1 && { backgroundColor: '#fbbf24' },
                      item.rank === 2 && { backgroundColor: '#94a3b8' },
                      item.rank === 3 && { backgroundColor: '#f97316' },
                    ]}
                  >
                    <Text style={styles.wasteTypeRankText}>{item.rank}</Text>
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