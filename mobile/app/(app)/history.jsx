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
      setDetections(detectionData);
      
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
    const organic = detectionData.filter(d => d.category === 'organic').length;
    const recyclable = detectionData.filter(d => d.category === 'recyclable').length;

    setStats({
      total,
      organic,
      recyclable,
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

  const getCategoryColor = (category) => {
    const colors = {
      organic: '#10b981',
      recyclable: '#3b82f6',
      'non-recyclable': '#ef4444',
      unknown: '#6b7280',
    };
    return colors[category] || colors.unknown;
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
    setSelectedDetection(detection);
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
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.recyclable}</Text>
                <Text style={styles.statLabel}>Recyclable</Text>
              </View>
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
                      {detection.wasteType || 'Unknown Waste'}
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
                        { backgroundColor: getCategoryColor(detection.category) },
                      ]}
                    >
                      <Text style={styles.categoryBadgeText}>
                        {detection.category?.toUpperCase() || 'UNKNOWN'}
                      </Text>
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