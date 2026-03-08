import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import apiClient from '@/src/utils/apiClient';
import { useTheme } from '@/src/context/ThemeContext';
import { CardSkeleton } from '@/src/components/SkeletonLoader';

// ---------------------------------------------------------------------------
// Client-side fallback guide data (mirrors backend constants).
// Used when the API response is missing waste_guides / waste_disposal_guides,
// which can happen with older DB records that pre-date the guide attachment.
// ---------------------------------------------------------------------------
const CATEGORY_MAP = {
  apple: 'Fruits', 'apple-core': 'Fruits', 'apple-peel': 'Fruits',
  avocado: 'Fruits', 'banana-peel': 'Fruits', 'bitten-apple': 'Fruits',
  calamansi: 'Fruits', mango: 'Fruits',
  orange: 'Fruits', 'orange-peel': 'Fruits',
  pear: 'Fruits', 'pear-core': 'Fruits', 'pear-peel': 'Fruits',
  pineapple: 'Fruits', papaya: 'Fruits', watermelon: 'Fruits',
  'watermelon-rotten': 'Fruits',
  broccoli: 'Vegetables', cabbage: 'Vegetables', 'cabbage-core': 'Vegetables',
  'carrot-peel': 'Vegetables', cucumber: 'Vegetables', garlic: 'Vegetables',
  'garlic-skin': 'Vegetables', kangkong: 'Vegetables', mushroom: 'Vegetables',
  onion: 'Vegetables', 'onion-skin': 'Vegetables', pechay: 'Vegetables',
  potato: 'Vegetables', seed: 'Vegetables', tomato: 'Vegetables',
  bone: 'Proteins', 'bone-fish': 'Proteins', 'chicken-bone': 'Proteins',
  'chicken-skin': 'Proteins', fish: 'Proteins', meat: 'Proteins',
  'mussel-shell': 'Proteins', shrimp: 'Proteins', 'shrimp-shell': 'Proteins',
  'egg-scramble': 'Eggs', 'egg-shell': 'Eggs', eggshell: 'Eggs', 'egg-yolk': 'Eggs',
  bread: 'Grains', bun: 'Grains', noodle: 'Grains', pasta: 'Grains', rice: 'Grains',
  bread_fresh: 'Grains', bread_in_trash: 'Grains', bread_moldy: 'Grains',
  bread_rotten: 'Grains', bread_stale: 'Grains',
  congee: 'Other', malunggay: 'Other', pancake: 'Other', tofu: 'Other',
  'paper-tissue': 'Non-Organics', 'plastic-waste': 'Non-Organics',
};

const BIN_MAP = {
  apple: 'compost', 'apple-core': 'compost', 'apple-peel': 'compost',
  avocado: 'compost', 'banana-peel': 'compost', 'bitten-apple': 'compost',
  calamansi: 'compost', mango: 'compost',
  orange: 'compost', 'orange-peel': 'compost',
  pear: 'compost', 'pear-core': 'compost', 'pear-peel': 'compost',
  pineapple: 'compost', papaya: 'compost', watermelon: 'compost',
  'watermelon-rotten': 'compost',
  broccoli: 'compost', cabbage: 'compost', 'cabbage-core': 'compost',
  'carrot-peel': 'compost', cucumber: 'compost', garlic: 'compost',
  'garlic-skin': 'compost', kangkong: 'compost', mushroom: 'compost',
  onion: 'compost', 'onion-skin': 'compost', pechay: 'compost',
  potato: 'compost', seed: 'compost', tomato: 'compost',
  bone: 'residual', 'bone-fish': 'compost', 'chicken-bone': 'residual',
  'chicken-skin': 'compost', fish: 'compost', meat: 'compost',
  'mussel-shell': 'special handling', shrimp: 'compost', 'shrimp-shell': 'compost',
  'egg-scramble': 'compost', 'egg-shell': 'compost', eggshell: 'compost', 'egg-yolk': 'compost',
  bread: 'compost', bun: 'compost', noodle: 'compost', pasta: 'compost', rice: 'compost',
  bread_fresh: 'compost', bread_in_trash: 'compost', bread_moldy: 'compost',
  bread_rotten: 'compost', bread_stale: 'compost',
  congee: 'compost', malunggay: 'compost', pancake: 'compost', tofu: 'compost',
  'paper-tissue': 'compost', 'plastic-waste': 'residual',
  'plastic-bottle': 'recyclable', 'food-waste': 'compost',
};

/**
 * Build waste_guides and waste_disposal_guides from a raw detections array.
 * This mirrors attachDetectionGuides() on the backend and acts as a fallback.
 */
const buildGuidesFromDetections = (detections = []) => {
  const wasteGuides = {};
  const wasteDisposalGuides = {};

  detections.forEach((item) => {
    const cls = item?.class;
    if (!cls) return;

    if (!wasteGuides[cls]) {
      const category = CATEGORY_MAP[cls] || 'Unknown';
      const isOrganic = (BIN_MAP[cls] || 'residual') === 'compost';
      wasteGuides[cls] = {
        category,
        description: `${cls.replace(/-/g, ' ')} — ${category.toLowerCase()} waste`,
        compostable: isOrganic,
        avgDecompositionDays: isOrganic ? '7-90' : null,
        color: '#9ca3af',
        count: 0,
      };
    }
    wasteGuides[cls].count += 1;

    if (!wasteDisposalGuides[cls]) {
      const bin = BIN_MAP[cls] || 'residual';
      wasteDisposalGuides[cls] = {
        bin,
        instructions: [
          `Place ${cls.replace(/-/g, ' ')} in the ${bin} bin.`,
          'Check your local waste segregation rules for additional guidance.',
        ],
        notes: null,
        count: 0,
      };
    }
    wasteDisposalGuides[cls].count += 1;
  });

  return { wasteGuides, wasteDisposalGuides };
};

/**
 * Ensure a detection object always has populated guide fields.
 * If the API already returned them, use those; otherwise build from detections[].
 */
const ensureGuides = (detection) => {
  const hasWasteGuides = detection.waste_guides && Object.keys(detection.waste_guides).length > 0;
  const hasDisposalGuides = detection.waste_disposal_guides && Object.keys(detection.waste_disposal_guides).length > 0;

  if (hasWasteGuides && hasDisposalGuides) return detection;

  const { wasteGuides, wasteDisposalGuides } = buildGuidesFromDetections(detection.detections || []);
  return {
    ...detection,
    waste_guides: hasWasteGuides ? detection.waste_guides : wasteGuides,
    waste_disposal_guides: hasDisposalGuides ? detection.waste_disposal_guides : wasteDisposalGuides,
  };
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    padding: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    borderRadius: 24,
    borderCurve: 'continuous',
    padding: 20,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyCard: {
    borderRadius: 32,
    borderCurve: 'continuous',
    padding: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  historyImage: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: '#f4f4f5',
  },
  historyContent: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wasteType: {
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
    letterSpacing: -0.5,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff1f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timestamp: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  detectionInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  infoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderCurve: 'continuous',
    marginRight: 8,
    marginBottom: 8,
  },
  infoBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  detectedTypesSection: {
    marginBottom: 12,
  },
  detectedTypesLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  detectedTypesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detectedTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  detectedTypeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  viewDetailsButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontWeight: '700',
    fontSize: 15,
  },
  findDisposalButton: {
    flex: 1,
    backgroundColor: '#18181b',
    paddingVertical: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  findDisposalText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 24,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#18181b',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
  },
  emptyButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalImage: {
    width: '100%',
    height: 360,
    borderRadius: 32,
    borderCurve: 'continuous',
    marginBottom: 24,
    backgroundColor: '#e4e4e7',
  },
  detailsCard: {
    borderRadius: 32,
    borderCurve: 'continuous',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 40,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  detectionItem: {
    padding: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    marginBottom: 12,
  },
  detectionClass: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  detectionConfidence: {
    fontSize: 14,
    fontWeight: '500',
  },
  aiTipsSection: {
    padding: 24,
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 1,
    marginTop: 24,
  },
  aiTipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  aiTipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  aiTipBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  aiTipBulletText: {
    fontSize: 12,
    fontWeight: '800',
  },
  aiTipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  guideCard: {
    borderRadius: 16,
    borderCurve: 'continuous',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  guideText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  disposalGuideCard: {
    borderRadius: 16,
    borderCurve: 'continuous',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  disposalGuideTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  disposalGuideText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },

  // Disposal Map Modal Styles
  disposalModalContainer: {
    flex: 1,
  },
  disposalModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  disposalModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  disposalModalSubtitle: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  disposalMap: {
    flex: 1,
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLocationText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  noLocationsOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 24,
    right: 24,
    borderRadius: 32,
    borderCurve: 'continuous',
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 5,
  },
  noLocationsText: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
    textAlign: 'center',
  },
  noLocationsSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  locationCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 32,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
  },
  closeLocationCard: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    paddingRight: 40,
    letterSpacing: -0.5,
  },
  locationAddress: {
    fontSize: 15,
    marginBottom: 6,
  },
  locationDistance: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 20,
  },
  wasteTypesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  wasteTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  wasteTypeBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  directionsButton: {
    backgroundColor: '#18181b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    gap: 8,
  },
  directionsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default function HistoryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [disposalLocations, setDisposalLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  const [showDisposalMap, setShowDisposalMap] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);

  const fetchHistory = async () => {
    try {
      const response = await apiClient.get('/api/detections/history');

      // Handle both array and object responses
      const detectionData = response.data.detections || response.data;
      setDetections(Array.isArray(detectionData) ? detectionData.map(ensureGuides) : []);

      // Calculate stats from the data
      calculateStats(detectionData);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      Alert.alert('Error', error?.response?.data?.error || 'Failed to load detection history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (detectionData) => {
    const total = detectionData.length;
    let totalConfidence = 0;
    let countWithConfidence = 0;

    detectionData.forEach(d => {
      if (d.summary?.average_confidence) {
        totalConfidence += d.summary.average_confidence;
        countWithConfidence++;
      } else if (d.detections && d.detections.length > 0) {
        const avg = d.detections.reduce((sum, det) => sum + det.confidence, 0) / d.detections.length;
        totalConfidence += avg;
        countWithConfidence++;
      }
    });

    const avgConf = countWithConfidence > 0
      ? `${((totalConfidence / countWithConfidence) * 100).toFixed(0)}%`
      : 'N/A';

    setStats({
      total,
      avgConfidence: avgConf,
    });
  };

  useEffect(() => {
    fetchHistory();
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleFindDisposal = async (detection) => {
    if (!userLocation) {
      Alert.alert(
        'Location Required',
        'Please enable location services to find nearby disposal locations.'
      );
      return;
    }

    try {
      setLoadingLocations(true);
      setSelectedDetection(detection);

      const wasteTypes =
        detection.detectedWasteTypes ||
        detection.detections?.map((d) => d.class) ||
        [];

      const response = await apiClient.get('/api/disposal-locations/recommended', {
        params: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          wasteTypes: wasteTypes.join(','),
        },
      });

      if (response.data.success) {
        setDisposalLocations(response.data.data || []);
        setShowDisposalMap(true);
      }
    } catch (error) {
      console.error('Error fetching disposal locations:', error);
      Alert.alert('Error', error?.response?.data?.error || 'Failed to fetch disposal locations.');
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleDirections = (location) => {
    if (!userLocation) return;
    const url = `https://www.openstreetmap.org/directions?from=${userLocation.latitude},${userLocation.longitude}&to=${location.location.coordinates[1]},${location.location.coordinates[0]}`;
    Linking.openURL(url);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleDelete = async (detectionId) => {
    Alert.alert(
      'Delete Detection',
      'Are you sure you want to delete this detection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/api/detections/${detectionId}`);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              // Remove from local state
              setDetections(detections.filter(d => d._id !== detectionId));
              Alert.alert('Success', 'Detection deleted');
            } catch (error) {
              console.error('Failed to delete:', error);
              Alert.alert('Error', error?.response?.data?.error || 'Failed to delete detection');
            }
          },
        },
      ]
    );
  };



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleViewDetails = (detection) => {
    setSelectedDetection(ensureGuides(detection));
    setShowDetails(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.bg }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerPlaceholder} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Detection History</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </View>
        <View style={{ padding: 16 }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.bg }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.card }]} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Ledger</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
          }
        >
          {/* Stats */}
          {stats && (
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.avgConfidence}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Confidence</Text>
              </View>
            </View>
          )}

          {/* History List */}
          {detections.length > 0 ? (
            detections.map((detection) => (
              <View key={detection._id} style={[styles.historyCard, { backgroundColor: colors.card }]}>
                {detection.annotated_image && !failedImages[detection._id] ? (
                  <Image
                    source={{ uri: detection.annotated_image || detection.imageUrl }}
                    style={styles.historyImage}
                    resizeMode="cover"
                    onError={() => setFailedImages(prev => ({ ...prev, [detection._id]: true }))}
                  />
                ) : (
                  <View style={[styles.historyImage, { backgroundColor: colors.bgAlt, alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
                  </View>
                )}
                <View style={styles.historyContent}>
                  <View style={styles.historyHeader}>
                    <Text style={[styles.wasteType, { color: colors.text }]}>
                      {detection.summary?.total_detections || detection.detections?.length || 0} Items
                    </Text>
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: colors.dangerBg || '#fff1f2' }]}
                      onPress={() => handleDelete(detection._id)}
                    >
                      <Ionicons name="trash" size={20} color={colors.danger || '#f43f5e'} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{formatDate(detection.createdAt)}</Text>

                  <View style={styles.detectionInfo}>
                    <View style={[styles.infoBadge, { backgroundColor: colors.bgAlt }]}>
                      <Text style={[styles.infoBadgeText, { color: colors.textSecondary }]}>
                        {detection.summary?.average_confidence
                          ? `${(detection.summary.average_confidence * 100).toFixed(1)}%`
                          : 'N/A'}{' '}
                        confidence
                      </Text>
                    </View>
                  </View>

                  {/* Detected Types */}
                  {(detection.detectedWasteTypes?.length > 0 || detection.detections?.length > 0) && (
                    <View style={styles.detectedTypesSection}>
                      <Text style={[styles.detectedTypesLabel, { color: colors.textSecondary }]}>DETECTED TYPES</Text>
                      <View style={styles.detectedTypesList}>
                        {(detection.detectedWasteTypes || detection.detections?.map(d => d.class) || [])
                          .filter((v, i, a) => a.indexOf(v) === i)
                          .slice(0, 3)
                          .map((type, i) => (
                            <View key={i} style={[styles.detectedTypeBadge, { backgroundColor: colors.bgAlt }]}>
                              <Text style={[styles.detectedTypeBadgeText, { color: colors.text }]}>{type}</Text>
                            </View>
                          ))}
                        {(detection.detectedWasteTypes || detection.detections?.map(d => d.class) || [])
                          .filter((v, i, a) => a.indexOf(v) === i).length > 3 && (
                            <View style={[styles.detectedTypeBadge, { backgroundColor: colors.border }]}>
                              <Text style={[styles.detectedTypeBadgeText, { color: colors.textSecondary }]}>
                                +{(detection.detectedWasteTypes || detection.detections?.map(d => d.class) || [])
                                  .filter((v, i, a) => a.indexOf(v) === i).length - 3}
                              </Text>
                            </View>
                          )}
                      </View>
                    </View>
                  )}

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.viewDetailsButton, { backgroundColor: colors.bgAlt }]}
                      onPress={() => handleViewDetails(detection)}
                    >
                      <Text style={[styles.viewDetailsText, { color: colors.text }]}>View Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.findDisposalButton,
                        { backgroundColor: colors.text },
                        (!detection.detections?.length && !detection.summary?.total_detections) ? { opacity: 0.5 } : null
                      ]}
                      onPress={() => handleFindDisposal(detection)}
                      disabled={loadingLocations || (!detection.detections?.length && !detection.summary?.total_detections)}
                    >
                      {loadingLocations && selectedDetection?._id === detection._id ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Ionicons name="navigate" size={16} color={colors.bg} />
                          <Text style={[styles.findDisposalText, { color: colors.bg }]}>Find Disposal</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open" size={64} color={colors.textSecondary} style={styles.emptyIcon} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No environmental data logged.{'\n'}Begin scanning objects to build your ledger.
              </Text>
              <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.text }]} onPress={() => router.back()}>
                <Text style={[styles.emptyButtonText, { color: colors.bg }]}>Start Scanning</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Details Modal */}
      <Modal visible={showDetails} animationType="slide" onRequestClose={() => setShowDetails(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Intelligence</Text>
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.bgAlt }]} onPress={() => setShowDetails(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: 60 }}>
            {selectedDetection && (
              <>
                <Image
                  source={{ uri: selectedDetection.annotated_image || selectedDetection.imageUrl }}
                  style={[styles.modalImage, { backgroundColor: colors.bgAlt }]}
                />

                <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.detailsTitle, { color: colors.text }]}>Detected Items:</Text>
                  {selectedDetection.detections?.length > 0 ? (
                    selectedDetection.detections.map((detection, index) => (
                      <View key={index} style={[styles.detectionItem, { backgroundColor: colors.bgAlt }]}>
                        <Text style={[styles.detectionClass, { color: colors.text }]}>{detection.class}</Text>
                        <Text style={[styles.detectionConfidence, { color: colors.textSecondary }]}>
                          Confidence: {(detection.confidence * 100).toFixed(1)}%
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={[styles.detectionConfidence, { color: colors.textSecondary }]}>No items were detected in this image.</Text>
                  )}

                  {selectedDetection.ai_tips && selectedDetection.ai_tips.length > 0 && (
                    <View style={[styles.aiTipsSection, { backgroundColor: colors.bgAlt, borderColor: colors.accentSurfaceBorder }]}>
                      <View style={styles.aiTipsHeader}>
                        <Ionicons name="sparkles" size={20} color={colors.accent} />
                        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 0, marginBottom: 0 }]}>AI Smart Tips</Text>
                      </View>
                      {selectedDetection.ai_tips.map((tip, index) => (
                        <View key={index} style={[styles.aiTipItem, { borderBottomColor: colors.border }]}>
                          <View style={[styles.aiTipBullet, { backgroundColor: colors.accentSurface }]}>
                            <Text style={[styles.aiTipBulletText, { color: colors.accent }]}>{index + 1}</Text>
                          </View>
                          <Text style={[styles.aiTipText, { color: colors.textSecondary }]}>{tip}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {(!selectedDetection.ai_tips || selectedDetection.ai_tips.length === 0) && (
                    <>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>Waste Guides</Text>
                      {Object.entries(selectedDetection.waste_guides || {}).length > 0 ? (
                        Object.entries(selectedDetection.waste_guides || {}).map(([className, guide]) => (
                          <View key={`waste-guide-${className}`} style={[styles.guideCard, { backgroundColor: colors.bgAlt, borderColor: colors.border }]}>
                            <Text style={[styles.guideTitle, { color: colors.text }]}>{className}</Text>
                            <Text style={[styles.guideText, { color: colors.textSecondary }]}>{guide.description || 'No description available.'}</Text>
                            <Text style={[styles.guideText, { color: colors.textSecondary }]}>
                              Category: {guide.category || 'Unknown'} • Compostable: {guide.compostable === null ? 'Unknown' : guide.compostable ? 'Yes' : 'No'}
                            </Text>
                            {guide.avgDecompositionDays ? (
                              <Text style={[styles.guideText, { color: colors.textSecondary }]}>Decomposition: {guide.avgDecompositionDays} days</Text>
                            ) : null}
                            {guide.count ? <Text style={[styles.guideText, { color: colors.textSecondary }]}>Detected count: {guide.count}</Text> : null}
                          </View>
                        ))
                      ) : (
                        <Text style={[styles.detectionConfidence, { color: colors.textSecondary }]}>No waste-guide metadata available for this detection.</Text>
                      )}

                      <Text style={[styles.sectionTitle, { color: colors.text }]}>Waste Disposal Guides</Text>
                      {Object.entries(selectedDetection.waste_disposal_guides || {}).length > 0 ? (
                        Object.entries(selectedDetection.waste_disposal_guides || {}).map(([className, guide]) => (
                          <View key={`disposal-guide-${className}`} style={[styles.disposalGuideCard, { backgroundColor: colors.bgAlt, borderColor: colors.border }]}>
                            <Text style={[styles.disposalGuideTitle, { color: colors.text }]}>{className}</Text>
                            <Text style={[styles.disposalGuideText, { color: colors.textSecondary }]}>Bin: {(guide.bin || 'residual').toUpperCase()}</Text>
                            {Array.isArray(guide.instructions) && guide.instructions.map((instruction, idx) => (
                              <Text key={`${className}-instruction-${idx}`} style={[styles.disposalGuideText, { color: colors.textSecondary }]}>• {instruction}</Text>
                            ))}
                            {guide.notes ? <Text style={[styles.disposalGuideText, { color: colors.textSecondary }]}>Note: {guide.notes}</Text> : null}
                            {guide.count ? <Text style={[styles.disposalGuideText, { color: colors.textSecondary }]}>Detected count: {guide.count}</Text> : null}
                          </View>
                        ))
                      ) : (
                        <Text style={[styles.detectionConfidence, { color: colors.textSecondary }]}>No waste-disposal guide available for this detection.</Text>
                      )}
                    </>
                  )}

                  <Text style={[styles.timestamp, { color: colors.textSecondary, marginTop: 16, textAlign: 'center' }]}>
                    Detected on {new Date(selectedDetection.createdAt).toLocaleString()}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Disposal Locations Map Modal */}
      <Modal visible={showDisposalMap} animationType="slide" onRequestClose={() => setShowDisposalMap(false)}>
        <View style={[styles.disposalModalContainer, { backgroundColor: colors.bg }]}>
          <View style={[styles.disposalModalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.disposalModalTitle, { color: colors.text }]}>Facilities</Text>
              <Text style={[styles.disposalModalSubtitle, { color: colors.textSecondary }]}>
                {disposalLocations.length} match{disposalLocations.length !== 1 ? 'es' : ''} found
              </Text>
            </View>
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.bgAlt }]} onPress={() => { setShowDisposalMap(false); setSelectedMapLocation(null); }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {userLocation && (
            <MapView
              style={styles.disposalMap}
              initialRegion={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              showsUserLocation={true}
            >

              <Circle
                center={userLocation}
                radius={500}
                strokeColor="rgba(16, 185, 129, 0.5)"
                fillColor="rgba(16, 185, 129, 0.1)"
              />
              {disposalLocations.map((location) => (
                <Marker
                  key={location._id}
                  coordinate={{
                    latitude: location.location.coordinates[1],
                    longitude: location.location.coordinates[0],
                  }}
                  pinColor="#10b981"
                  onPress={() => setSelectedMapLocation(location)}
                />
              ))}
            </MapView>
          )}

          {!userLocation && (
            <View style={styles.noLocationContainer}>
              <Ionicons name="location-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.noLocationText, { color: colors.textSecondary }]}>Location not available</Text>
            </View>
          )}

          {disposalLocations.length === 0 && (
            <View style={[styles.noLocationsOverlay, { backgroundColor: colors.card }]}>
              <Ionicons name="location-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.noLocationsText, { color: colors.text }]}>No disposal locations found nearby</Text>
              <Text style={[styles.noLocationsSubtext, { color: colors.textSecondary }]}>
                Check with your local waste management authority for proper disposal.
              </Text>
            </View>
          )}

          {selectedMapLocation && (
            <View style={[styles.locationCard, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={[styles.closeLocationCard, { backgroundColor: colors.bgAlt }]}
                onPress={() => setSelectedMapLocation(null)}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.locationName, { color: colors.text }]}>{selectedMapLocation.name}</Text>
              <Text style={[styles.locationAddress, { color: colors.textSecondary }]}>{selectedMapLocation.address}</Text>
              <Text style={[styles.locationDistance, { color: colors.text }]}>{selectedMapLocation.distanceText} away</Text>

              {selectedMapLocation.acceptedWasteTypes && (
                <View style={styles.wasteTypesRow}>
                  {selectedMapLocation.acceptedWasteTypes.slice(0, 4).map((type, i) => (
                    <View key={i} style={[styles.wasteTypeBadge, { backgroundColor: colors.bgAlt }]}>
                      <Text style={[styles.wasteTypeBadgeText, { color: colors.textSecondary }]}>{type}</Text>
                    </View>
                  ))}
                  {selectedMapLocation.acceptedWasteTypes.length > 4 && (
                    <View style={[styles.wasteTypeBadge, { backgroundColor: colors.bgAlt }]}>
                      <Text style={[styles.wasteTypeBadgeText, { color: colors.textSecondary }]}>
                        +{selectedMapLocation.acceptedWasteTypes.length - 4}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={[styles.directionsButton, { backgroundColor: colors.text }]}
                onPress={() => handleDirections(selectedMapLocation)}
              >
                <Ionicons name="navigate" size={20} color={colors.bg} />
                <Text style={[styles.directionsButtonText, { color: colors.bg }]}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}
