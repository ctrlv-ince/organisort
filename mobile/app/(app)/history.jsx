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
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '@/src/utils/apiClient';

// ---------------------------------------------------------------------------
// Client-side fallback guide data (mirrors backend constants).
// Used when the API response is missing waste_guides / waste_disposal_guides,
// which can happen with older DB records that pre-date the guide attachment.
// ---------------------------------------------------------------------------
const CATEGORY_MAP = {
  apple: 'Fruits', 'apple-core': 'Fruits', 'apple-peel': 'Fruits',
  avocado: 'Fruits', 'banana-peel': 'Fruits', calamansi: 'Fruits',
  orange: 'Fruits', 'orange-peel': 'Fruits', papaya: 'Fruits',
  pear: 'Fruits', 'pear-core': 'Fruits', 'pear-peel': 'Fruits',
  pineapple: 'Fruits', watermelon: 'Fruits',
  broccoli: 'Vegetables', cucumber: 'Vegetables', garlic: 'Vegetables',
  leaf: 'Vegetables', mushroom: 'Vegetables', onion: 'Vegetables',
  potato: 'Vegetables', tomato: 'Vegetables',
  bone: 'Proteins', 'bone-fish': 'Proteins', 'chicken-skin': 'Proteins',
  fish: 'Proteins', meat: 'Proteins', mussel: 'Proteins',
  'mussel-shell': 'Proteins', shrimp: 'Proteins', 'shrimp-shell': 'Proteins',
  'egg-scramble': 'Eggs', 'egg-shell': 'Eggs', eggshell: 'Eggs', 'egg-yolk': 'Eggs',
  bread: 'Grains', bun: 'Grains', noodle: 'Grains', pasta: 'Grains', rice: 'Grains',
  congee: 'Other', good: 'Other', malunggay: 'Other', pancake: 'Other', tofu: 'Other',
};

const BIN_MAP = {
  apple: 'compost', 'apple-core': 'compost', 'apple-peel': 'compost',
  avocado: 'compost', 'banana-peel': 'compost', calamansi: 'compost',
  orange: 'compost', 'orange-peel': 'compost', papaya: 'compost',
  pear: 'compost', 'pear-core': 'compost', 'pear-peel': 'compost',
  pineapple: 'compost', watermelon: 'compost',
  broccoli: 'compost', cucumber: 'compost', garlic: 'compost',
  leaf: 'compost', mushroom: 'compost', onion: 'compost',
  potato: 'compost', tomato: 'compost',
  bone: 'residual', 'bone-fish': 'compost', 'chicken-skin': 'compost',
  fish: 'compost', meat: 'compost', mussel: 'compost',
  'mussel-shell': 'special handling', shrimp: 'compost', 'shrimp-shell': 'compost',
  'egg-scramble': 'compost', 'egg-shell': 'compost', eggshell: 'compost', 'egg-yolk': 'compost',
  bread: 'compost', bun: 'compost', noodle: 'compost', pasta: 'compost', rice: 'compost',
  congee: 'compost', good: 'compost', malunggay: 'compost', pancake: 'compost', tofu: 'compost',
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
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#10b981',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    padding: 24,
  },
  statsRow: {
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
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  historyImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e2e8f0',
  },
  historyContent: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  wasteType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 20,
  },
  detectionInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  infoBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  infoBadgeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  viewDetailsButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  viewDetailsText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  detectionItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  detectionClass: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  detectionConfidence: {
    fontSize: 14,
    color: '#64748b',
  },
  guideCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  guideText: {
    fontSize: 13,
    color: '#1e40af',
    marginBottom: 2,
  },
  disposalGuideCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  disposalGuideTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 4,
  },
  disposalGuideText: {
    fontSize: 13,
    color: '#047857',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 8,
  },
});

export default function HistoryScreen() {
  const router = useRouter();
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

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
      Alert.alert('Error', 'Failed to load detection history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (detectionData) => {
    const total = detectionData.length;
    const organic = total; // All detections are organic

    setStats({
      total,
      organic,
    });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
              // Remove from local state
              setDetections(detections.filter(d => d._id !== detectionId));
              Alert.alert('Success', 'Detection deleted');
            } catch (error) {
              console.error('Failed to delete:', error);
              Alert.alert('Error', 'Failed to delete detection');
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detection History</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10b981" />
          }
        >
          {/* Stats */}
          {stats && (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.organic}</Text>
                <Text style={styles.statLabel}>Organic</Text>
              </View>
              {/* <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.recyclable}</Text>
                <Text style={styles.statLabel}>Recyclable</Text>
              </View> */}
            </View>
          )}

          {/* History List */}
          {detections.length > 0 ? (
            detections.map((detection) => (
              <View key={detection._id} style={styles.historyCard}>
                <Image
                  source={{ uri: detection.annotated_image || detection.imageUrl }}
                  style={styles.historyImage}
                  resizeMode="cover"
                />
                <View style={styles.historyContent}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.wasteType}>
                      {detection.primaryWasteType
                        || detection.wasteType
                        || detection.detectedWasteTypes?.[0]
                        || detection.detections?.[0]?.class
                        || 'Unknown Waste'}
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(detection._id)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.detectionInfo}>
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: '#10b981' /* Organic Green */ },
                      ]}
                    >
                      <Text style={styles.categoryBadgeText}>ORGANIC</Text>
                    </View>
                    <View style={styles.infoBadge}>
                      <Text style={styles.infoBadgeText}>
                        {detection.summary?.total_detections || detection.detections?.length || 0}{' '}
                        items
                      </Text>
                    </View>
                    <View style={styles.infoBadge}>
                      <Text style={styles.infoBadgeText}>
                        {detection.summary?.highest_confidence
                          ? `${(detection.summary.highest_confidence * 100).toFixed(0)}%`
                          : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.timestamp}>{formatDate(detection.createdAt)}</Text>

                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => handleViewDetails(detection)}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>
                No detection history yet.{'\n'}Start detecting waste to build your history!
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => router.back()}>
                <Text style={styles.emptyButtonText}>Start Detecting</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Details Modal */}
      <Modal visible={showDetails} animationType="slide" onRequestClose={() => setShowDetails(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detection Details</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetails(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedDetection && (
              <>
                <Image
                  source={{ uri: selectedDetection.annotated_image || selectedDetection.imageUrl }}
                  style={styles.modalImage}
                />

                <View style={styles.detailsCard}>
                  <Text style={styles.detailsTitle}>Detected Items:</Text>
                  {selectedDetection.detections?.map((detection, index) => (
                    <View key={index} style={styles.detectionItem}>
                      <Text style={styles.detectionClass}>{detection.class}</Text>
                      <Text style={styles.detectionConfidence}>
                        Confidence: {(detection.confidence * 100).toFixed(1)}%
                      </Text>
                    </View>
                  ))}

                  <Text style={styles.sectionTitle}>Waste Guides</Text>
                  {Object.entries(selectedDetection.waste_guides || {}).length > 0 ? (
                    Object.entries(selectedDetection.waste_guides || {}).map(([className, guide]) => (
                      <View key={`waste-guide-${className}`} style={styles.guideCard}>
                        <Text style={styles.guideTitle}>{className}</Text>
                        <Text style={styles.guideText}>{guide.description || 'No description available.'}</Text>
                        <Text style={styles.guideText}>
                          Category: {guide.category || 'Unknown'} • Compostable: {guide.compostable === null ? 'Unknown' : guide.compostable ? 'Yes' : 'No'}
                        </Text>
                        {guide.avgDecompositionDays ? (
                          <Text style={styles.guideText}>Decomposition: {guide.avgDecompositionDays} days</Text>
                        ) : null}
                        {guide.count ? <Text style={styles.guideText}>Detected count: {guide.count}</Text> : null}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.detectionConfidence}>No waste-guide metadata available for this detection.</Text>
                  )}

                  <Text style={styles.sectionTitle}>Waste Disposal Guides</Text>
                  {Object.entries(selectedDetection.waste_disposal_guides || {}).length > 0 ? (
                    Object.entries(selectedDetection.waste_disposal_guides || {}).map(([className, guide]) => (
                      <View key={`disposal-guide-${className}`} style={styles.disposalGuideCard}>
                        <Text style={styles.disposalGuideTitle}>{className}</Text>
                        <Text style={styles.disposalGuideText}>Bin: {(guide.bin || 'residual').toUpperCase()}</Text>
                        {Array.isArray(guide.instructions) && guide.instructions.map((instruction, idx) => (
                          <Text key={`${className}-instruction-${idx}`} style={styles.disposalGuideText}>• {instruction}</Text>
                        ))}
                        {guide.notes ? <Text style={styles.disposalGuideText}>Note: {guide.notes}</Text> : null}
                        {guide.count ? <Text style={styles.disposalGuideText}>Detected count: {guide.count}</Text> : null}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.detectionConfidence}>No waste-disposal guide available for this detection.</Text>
                  )}

                  <Text style={[styles.timestamp, { marginTop: 16, textAlign: 'center' }]}>
                    Detected on {new Date(selectedDetection.createdAt).toLocaleString()}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
