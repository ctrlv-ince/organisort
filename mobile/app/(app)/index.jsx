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
  Image,
  Modal,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
    borderBottomRightRadius: 24 
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  title: { fontSize: 30, fontWeight: 'bold', color: 'white' },
  logoutBtn: { 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 8 
  },
  logoutText: { color: 'white', fontWeight: 'bold' },
  welcomeCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: 12, 
    padding: 12 
  },
  welcomeText: { color: 'white', fontSize: 18, fontWeight: '600' },
  welcomeSubtext: { color: '#d1fae5', fontSize: 14, marginTop: 4 },
  content: { paddingHorizontal: 24, paddingVertical: 24 },
  
  // Stats Cards
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 24 
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
    elevation: 3 
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  
  // Action Buttons
  actionSection: { marginBottom: 24 },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1e293b', 
    marginBottom: 16 
  },
  actionButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 12 
  },
  actionButton: { 
    flex: 1, 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 20, 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 4,
    borderWidth: 2,
    borderColor: '#10b981'
  },
  actionIcon: { fontSize: 48, marginBottom: 12 },
  actionText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1e293b', 
    textAlign: 'center' 
  },
  
  // History Section
  historyCard: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 20, 
    marginBottom: 16,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3, 
    elevation: 3 
  },
  historyItem: { 
    flexDirection: 'row', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0' 
  },
  historyImage: { 
    width: 60, 
    height: 60, 
    borderRadius: 8, 
    marginRight: 12,
    backgroundColor: '#e2e8f0'
  },
  historyInfo: { flex: 1 },
  historyType: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1e293b', 
    marginBottom: 4 
  },
  historyDate: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  historyConfidence: { 
    fontSize: 12, 
    color: '#10b981', 
    fontWeight: '600' 
  },
  
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 40 
  },
  emptyIcon: { fontSize: 64, marginBottom: 16, opacity: 0.5 },
  emptyText: { fontSize: 16, color: '#64748b', textAlign: 'center' },
  
  viewAllButton: { 
    backgroundColor: '#10b981', 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 12 
  },
  viewAllText: { color: 'white', fontWeight: '600', fontSize: 14 },
  
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: 'white',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },

  // Results Modal
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
    backgroundColor: '#10b981',
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
  resultImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  resultsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  resultsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  detectionsList: {
    marginTop: 10,
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

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [stats, setStats] = useState({
    totalDetections: 0,
    organicWaste: 0,
    recyclable: 0,
  });
  const [detecting, setDetecting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [detectionResults, setDetectionResults] = useState(null);

  const fetchUserProfile = async () => {
    try {
      if (!user) return;
      
      const response = await apiClient.get('/api/users/me');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError('Failed to fetch user profile. Please check your authentication and try again.');
    }
  };

  const fetchDetectionHistory = async () => {
    try {
      const response = await apiClient.get('/api/detections/history?limit=5');
      
      // Handle both array and object responses
      const detectionData = response.data.detections || response.data;
      setDetectionHistory(Array.isArray(detectionData) ? detectionData : []);
      
      // Calculate stats
      const total = detectionData.length;
      const organic = detectionData.filter(d => d.category === 'organic').length;
      const recyclable = detectionData.filter(d => d.category === 'recyclable').length;
      
      setStats({
        totalDetections: total,
        organicWaste: organic,
        recyclable: recyclable,
      });
    } catch (error) {
      console.error('Failed to fetch detection history:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUserProfile(), fetchDetectionHistory()]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and media library permissions to use this feature.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const processImage = async (imageUri) => {
    setDetecting(true);
    try {
      console.log('Processing image:', imageUri);

      // Create form data for image upload
      const formData = new FormData();
      
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileName = `photo_${Date.now()}.${fileType}`;

      const file = {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        type: `image/${fileType}`,
        name: fileName,
      };

      formData.append('image', file);

      console.log('Sending image to backend for detection...');

      // Call your Node.js backend (it will save automatically and proxy to Flask)
      const response = await apiClient.post('/api/detections/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      console.log('Detection response received');

      if (!response.data.success) {
        throw new Error(response.data.error || 'Detection failed');
      }

      // Store results and show modal
      setDetectionResults({
        ...response.data,
        originalImage: imageUri,
      });
      setShowResults(true);

      // Refresh history after successful detection
      await fetchDetectionHistory();

    } catch (error) {
      console.error('Detection failed:', error);
      
      let errorMessage = 'Failed to analyze the image. ';
      
      if (error.response) {
        errorMessage += `Server error: ${error.response.data?.message || error.response.status}`;
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your network connection.';
      } else {
        errorMessage += error.message;
      }
      
      Alert.alert('Detection Failed', errorMessage, [{ text: 'OK' }]);
    } finally {
      setDetecting(false);
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const handleUploadPhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
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

  const handleViewAllHistory = () => {
    router.push('/history');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 16, color: '#dc2626', textAlign: 'center', marginBottom: 16 }}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: '#10b981' }]} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10b981" />
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
            <Text style={styles.welcomeSubtext}>Start detecting waste and make an impact</Text>
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
              <Text style={styles.statIcon}>🌱</Text>
              <Text style={styles.statValue}>{stats.organicWaste}</Text>
              <Text style={styles.statLabel}>Organic</Text>
            </View>
            {/* <View style={styles.statCard}>
              <Text style={styles.statIcon}>♻️</Text>
              <Text style={styles.statValue}>{stats.recyclable}</Text>
              <Text style={styles.statLabel}>Recyclable</Text>
            </View> */}
          </View>

          {/* Detection Actions */}
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Detect Waste</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
                <Text style={styles.actionIcon}>📷</Text>
                <Text style={styles.actionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleUploadPhoto}>
                <Text style={styles.actionIcon}>🖼️</Text>
                <Text style={styles.actionText}>Upload Photo</Text>
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
                        index === detectionHistory.length - 1 && { borderBottomWidth: 0 }
                      ]}
                    >
                      <Image 
                        source={{ uri: item.annotated_image || item.imageUrl }} 
                        style={styles.historyImage}
                        resizeMode="cover"
                      />
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyType}>
                          {item.wasteType || 'Unknown'}
                        </Text>
                        <Text style={styles.historyDate}>
                          {new Date(item.createdAt).toLocaleDateString()} at{' '}
                          {new Date(item.createdAt).toLocaleTimeString()}
                        </Text>
                        <Text style={styles.historyConfidence}>
                          {item.summary?.total_detections || 0} items detected
                        </Text>
                      </View>
                    </View>
                  ))}
                  <TouchableOpacity 
                    style={styles.viewAllButton} 
                    onPress={handleViewAllHistory}
                  >
                    <Text style={styles.viewAllText}>View All History</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyText}>
                    No detections yet.{'\n'}Start by taking or uploading a photo!
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay during detection */}
      {detecting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Analyzing image...</Text>
        </View>
      )}

      {/* Results Modal */}
      <Modal
        visible={showResults}
        animationType="slide"
        onRequestClose={() => setShowResults(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detection Complete! ✅</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowResults(false);
                setDetectionResults(null);
              }}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {detectionResults && (
              <>
                {/* Annotated Image */}
                <Image
                  source={{ uri: detectionResults.annotated_image }}
                  style={styles.resultImage}
                />

                {/* Results Card */}
                <View style={styles.resultsCard}>
                  <View style={styles.resultsSummary}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>
                        {detectionResults.summary?.total_detections || 0}
                      </Text>
                      <Text style={styles.summaryLabel}>Found</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>
                        {detectionResults.summary?.highest_confidence 
                          ? (detectionResults.summary.highest_confidence * 100).toFixed(0)
                          : 0}%
                      </Text>
                      <Text style={styles.summaryLabel}>Confidence</Text>
                    </View>
                  </View>

                  {/* Detections List */}
                  {detectionResults.detections && detectionResults.detections.length > 0 ? (
                    <View style={styles.detectionsList}>
                      <Text style={[styles.sectionTitle, { fontSize: 16, marginBottom: 12 }]}>
                        Detected Items:
                      </Text>
                      {detectionResults.detections.map((detection, index) => (
                        <View key={index} style={styles.detectionItem}>
                          <Text style={styles.detectionClass}>
                            {detection.class}
                          </Text>
                          <Text style={styles.detectionConfidence}>
                            Confidence: {(detection.confidence * 100).toFixed(1)}%
                          </Text>
                        </View>
                      ))}
                      <Text style={[styles.emptyText, { marginTop: 16, fontSize: 14 }]}>
                        ✅ Detection saved to history automatically
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>No waste detected in this image.</Text>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}