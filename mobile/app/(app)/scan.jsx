import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
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
    borderBottomRightRadius: 24,
  },
  title: { fontSize: 30, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#d1fae5', textAlign: 'center', marginTop: 8 },
  content: { padding: 24 },
  
  // Main Scan Buttons
  scanSection: { marginBottom: 32 },
  scanButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#10b981',
  },
  scanButtonSecondary: {
    borderColor: '#3b82f6',
  },
  scanIcon: { fontSize: 80, marginBottom: 16 },
  scanButtonTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  scanButtonText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  
  // Info Cards
  infoSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: { fontSize: 32, marginRight: 16 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  infoText: { fontSize: 14, color: '#64748b' },
  
  // Loading & Modal Styles
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
  loadingText: { color: 'white', marginTop: 12, fontSize: 16, fontWeight: '600' },
  
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  closeButton: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  closeButtonText: { color: 'white', fontWeight: 'bold' },
  modalContent: { flex: 1, padding: 20 },
  resultImage: { width: '100%', height: 300, borderRadius: 12, marginBottom: 20, resizeMode: 'contain' },
  resultsCard: { backgroundColor: 'white', borderRadius: 12, padding: 20 },
  resultsSummary: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 32, fontWeight: 'bold', color: '#10b981' },
  summaryLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  detectionsList: { marginTop: 12 },
  detectionItem: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#10b981' },
  detectionClass: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  detectionConfidence: { fontSize: 14, color: '#64748b', marginBottom: 4 },
  classIdBadge: { fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
});

export default function ScanScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [detecting, setDetecting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [detectionResults, setDetectionResults] = useState(null);

  // Request camera permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and media library permissions are required to scan waste.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Upload photo from gallery
  const handleUploadPhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    }
  };

  // Process image for detection
  const processImage = async (imageUri) => {
    try {
      setDetecting(true);

      // Create form data
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      });

      // Send to detection API
      const response = await apiClient.post('/api/detections/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDetectionResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Detection error:', error);
      Alert.alert('Detection Failed', 'Could not process the image. Please try again.');
    } finally {
      setDetecting(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Scan Waste</Text>
          <Text style={styles.subtitle}>AI-Powered Waste Detection</Text>
        </View>

        <View style={styles.content}>
          {/* Main Scan Buttons */}
          <View style={styles.scanSection}>
            <TouchableOpacity style={styles.scanButton} onPress={handleTakePhoto}>
              <Text style={styles.scanIcon}>📷</Text>
              <Text style={styles.scanButtonTitle}>Take Photo</Text>
              <Text style={styles.scanButtonText}>
                Use your camera to scan waste in real-time
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.scanButton, styles.scanButtonSecondary]} 
              onPress={handleUploadPhoto}
            >
              <Text style={styles.scanIcon}>🖼️</Text>
              <Text style={styles.scanButtonTitle}>Upload Photo</Text>
              <Text style={styles.scanButtonText}>
                Select an existing photo from your gallery
              </Text>
            </TouchableOpacity>
          </View>

          {/* How it Works */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>1️⃣</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Capture or Upload</Text>
                <Text style={styles.infoText}>Take a photo or upload from gallery</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>2️⃣</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>AI Analysis</Text>
                <Text style={styles.infoText}>Our 45-class model detects organic waste</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>3️⃣</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Get Results</Text>
                <Text style={styles.infoText}>View detected items with confidence scores</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>4️⃣</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Track Progress</Text>
                <Text style={styles.infoText}>All scans saved to your history automatically</Text>
              </View>
            </View>
          </View>

          {/* Tips */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>📋 Tips for Best Results</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>💡</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Good Lighting</Text>
                <Text style={styles.infoText}>Ensure waste is well-lit and visible</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🎯</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Clear Focus</Text>
                <Text style={styles.infoText}>Keep waste items centered and in focus</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>📏</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Proper Distance</Text>
                <Text style={styles.infoText}>Not too close, not too far - fill the frame</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {detecting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Analyzing with 45-class AI model...</Text>
          <Text style={[styles.loadingText, { fontSize: 12, marginTop: 4 }]}>
            Detecting specific organic waste types
          </Text>
        </View>
      )}

      {/* Results Modal */}
      <Modal visible={showResults} animationType="slide" onRequestClose={() => setShowResults(false)}>
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
                <Image
                  source={{ uri: detectionResults.annotated_image }}
                  style={styles.resultImage}
                />

                <View style={styles.resultsCard}>
                  <View style={styles.resultsSummary}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>
                        {detectionResults.summary?.total_detections || 0}
                      </Text>
                      <Text style={styles.summaryLabel}>Items Found</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>
                        {detectionResults.summary?.unique_classes || 0}
                      </Text>
                      <Text style={styles.summaryLabel}>Unique Types</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>
                        {detectionResults.summary?.average_confidence 
                          ? (detectionResults.summary.average_confidence * 100).toFixed(0)
                          : 0}%
                      </Text>
                      <Text style={styles.summaryLabel}>Avg Confidence</Text>
                    </View>
                  </View>

                  {detectionResults.detections && detectionResults.detections.length > 0 ? (
                    <View style={styles.detectionsList}>
                      <Text style={[styles.sectionTitle, { fontSize: 16, marginBottom: 12 }]}>
                        Detected Items ({detectionResults.detections.length}):
                      </Text>
                      {detectionResults.detections.map((detection, index) => (
                        <View key={index} style={styles.detectionItem}>
                          <Text style={styles.detectionClass}>{detection.class}</Text>
                          <Text style={styles.detectionConfidence}>
                            Confidence: {(detection.confidence * 100).toFixed(1)}%
                          </Text>
                          <Text style={styles.classIdBadge}>
                            Class ID: {detection.class_id}
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