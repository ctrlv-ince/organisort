// mobile/app/(app)/scan.jsx - Updated with OpenStreetMap disposal locations
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  Linking,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/context/ThemeContext';
import apiClient from '@/src/utils/apiClient';

const { width } = Dimensions.get('window');

export default function ScanScreen() {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [disposalLocations, setDisposalLocations] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  let cameraRef = null;

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (result && userLocation) {
      fetchDisposalLocations();
    }
  }, [result, userLocation]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to find nearby disposal locations');
        return;
      }

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

  const fetchDisposalLocations = async () => {
    try {
      if (!userLocation || !result?.detections) return;

      const wasteTypes = result.detections.map(d => d.class);

      const response = await apiClient.get('/api/disposal-locations/recommended', {
        params: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          wasteTypes: wasteTypes.join(','),
        },
      });

      if (response.data.success) {
        setDisposalLocations(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching disposal locations:', error);
    }
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to scan waste');
        return;
      }
    }
    setIsCameraActive(true);
    setIsFlashlightOn(false);
    setCapturedImage(null);
    setResult(null);
    setDisposalLocations([]);
  };

  const takePicture = async () => {
    if (cameraRef) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.takePictureAsync({ quality: 0.8 });
      setCapturedImage(photo.uri);
      setIsCameraActive(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery permission is required to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      await Haptics.selectionAsync();
      setCapturedImage(result.assets[0].uri);
      setResult(null);
      setDisposalLocations([]);
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    try {
      setAnalyzing(true);

      const formData = new FormData();
      formData.append('image', {
        uri: capturedImage,
        type: 'image/jpeg',
        name: 'waste.jpg',
      });

      const response = await apiClient.post('/api/detections/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      if (response.data.no_detections) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          'No Waste Detected',
          'We couldn\'t detect any waste items in this image.\n\n• Make sure the waste item is clearly visible\n• Use good lighting\n• Move closer to the item\n• Avoid blurry photos',
          [
            { text: 'Try Again', onPress: () => { setCapturedImage(null); setIsCameraActive(true); } },
            { text: 'Pick Another', onPress: () => { setCapturedImage(null); pickImage(); } },
          ]
        );
        return;
      }

      if (response.data.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setResult(response.data);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Analysis Failed', response.data.error || 'Could not analyze the image');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to analyze the image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleToggleFlashlight = async () => {
    await Haptics.selectionAsync();
    setIsFlashlightOn(!isFlashlightOn);
  };

  const handleDirections = (location) => {
    const url = `https://www.openstreetmap.org/directions?from=${userLocation.latitude},${userLocation.longitude}&to=${location.location.coordinates[1]},${location.location.coordinates[0]}`;
    Linking.openURL(url);
  };

  const retake = () => {
    setCapturedImage(null);
    setResult(null);
    setDisposalLocations([]);
    setShowMap(false);
  };

  if (isCameraActive) {
    return (
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          ref={(ref) => (cameraRef = ref)}
          facing="back"
          enableTorch={isFlashlightOn}
        >
          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.closeCamera} onPress={() => setIsCameraActive(false)}>
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.flashlightToggle} onPress={handleToggleFlashlight}>
              <Ionicons
                name={isFlashlightOn ? "flash" : "flash-off"}
                size={28}
                color={isFlashlightOn ? "#fbbf24" : "white"}
              />
            </TouchableOpacity>

            <View style={styles.captureButtonContainer}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Scan Organic Waste</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Detect waste and find nearby disposal locations
          </Text>
        </View>

        {!capturedImage && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={openCamera}>
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.buttonText}>Open Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
              <Ionicons name="images" size={24} color="#18181b" />
              <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {capturedImage && !result && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: capturedImage }} style={styles.preview} />
            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.retakeButton} onPress={retake}>
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
                onPress={analyzeImage}
                disabled={analyzing}
              >
                {analyzing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.analyzeButtonText}>Analyze</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {result && (
          <View style={styles.resultContainer}>
            <Image
              source={{ uri: result.annotated_image }}
              style={styles.resultImage}
            />

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{result.summary?.total_detections || 0}</Text>
                <Text style={styles.statLabel}>Items</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{result.summary?.unique_classes || 0}</Text>
                <Text style={styles.statLabel}>Types</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {result.summary?.average_confidence
                    ? `${(result.summary.average_confidence * 100).toFixed(0)}%`
                    : 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Confidence</Text>
              </View>
            </View>

            <View style={styles.detectionsList}>
              <Text style={styles.sectionTitle}>Detected Items</Text>
              {result.detections?.length > 0 ? (
                result.detections.map((detection, index) => (
                  <View key={index} style={styles.detectionItem}>
                    <Text style={styles.detectionClass}>{detection.class}</Text>
                    <Text style={styles.detectionConfidence}>
                      {(detection.confidence * 100).toFixed(1)}%
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.detectionItem}>
                  <Text style={styles.detectionClass}>No items were detected in this image.</Text>
                </View>
              )}
            </View>

            {result.ai_tips && result.ai_tips.length > 0 && (
              <View style={styles.aiTipsSection}>
                <View style={styles.aiTipsHeader}>
                  <Ionicons name="sparkles" size={20} color="#8b5cf6" />
                  <Text style={styles.sectionTitle}>AI Smart Tips</Text>
                </View>
                {result.ai_tips.map((tip, index) => (
                  <View key={index} style={styles.aiTipItem}>
                    <View style={styles.aiTipBullet}>
                      <Text style={styles.aiTipBulletText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.aiTipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {disposalLocations.length > 0 ? (
              <View style={styles.disposalSection}>
                <Text style={styles.sectionTitle}>Nearby Disposal Locations</Text>
                <Text style={styles.disposalSubtitle}>
                  Found {disposalLocations.length} location{disposalLocations.length !== 1 ? 's' : ''} that accept this waste
                </Text>

                <TouchableOpacity
                  style={styles.viewMapButton}
                  onPress={() => setShowMap(true)}
                >
                  <Ionicons name="map" size={20} color="white" />
                  <Text style={styles.viewMapButtonText}>View on Map</Text>
                </TouchableOpacity>

                {disposalLocations[0] && (
                  <View style={styles.nearestCard}>
                    <View style={styles.nearestHeader}>
                      <Ionicons name="location" size={20} color="#18181b" />
                      <Text style={styles.nearestTitle}>Nearest Location</Text>
                    </View>
                    <Text style={styles.nearestName}>{disposalLocations[0].name}</Text>
                    <Text style={styles.nearestDistance}>{disposalLocations[0].distanceText} away</Text>
                    <TouchableOpacity
                      style={styles.directionsButton}
                      onPress={() => handleDirections(disposalLocations[0])}
                    >
                      <Ionicons name="navigate" size={16} color="#18181b" />
                      <Text style={styles.directionsButtonText}>Get Directions</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateIconWrapper}>
                  <Ionicons name="location-outline" size={32} color="#a1a1aa" />
                </View>
                <Text style={styles.emptyStateTitle}>No facilities located nearby</Text>
                <Text style={styles.emptyStateText}>
                  We couldn't lock onto any affiliated disposal drop-offs in your specific region. Please check with local sorting authorities.
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.retakeButton} onPress={retake}>
              <Ionicons name="refresh" size={20} color="#18181b" />
              <Text style={styles.retakeButtonText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal visible={showMap} animationType="slide" onRequestClose={() => setShowMap(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Disposal Locations</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowMap(false)}>
                <Ionicons name="close" size={24} color="#18181b" />
              </TouchableOpacity>
            </View>

            {userLocation && (
              <MapView
                style={styles.map}
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
                    onPress={() => setSelectedLocation(location)}
                  />
                ))}
              </MapView>
            )}

            {selectedLocation && (
              <View style={styles.locationCard}>
                <TouchableOpacity
                  style={styles.closeLocationCard}
                  onPress={() => setSelectedLocation(null)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
                <Text style={styles.locationName}>{selectedLocation.name}</Text>
                <Text style={styles.locationAddress}>{selectedLocation.address}</Text>
                <Text style={styles.locationDistance}>{selectedLocation.distanceText} away</Text>
                <TouchableOpacity
                  style={styles.directionsButtonLarge}
                  onPress={() => handleDirections(selectedLocation)}
                >
                  <Ionicons name="navigate" size={20} color="white" />
                  <Text style={styles.directionsButtonText}>Get Directions</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f5',
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#18181b',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#71717a',
    fontWeight: '500',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#18181b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 24,
    borderCurve: 'continuous',
    gap: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 2,
    borderColor: '#f4f4f5',
    gap: 12,
  },
  secondaryButtonText: {
    color: '#18181b',
    fontSize: 18,
    fontWeight: '700',
  },
  camera: {
    flex: 1,
    borderRadius: 40,
    borderCurve: 'continuous',
    overflow: 'hidden',
    margin: 16,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  closeCamera: {
    position: 'absolute',
    top: 32,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashlightToggle: {
    position: 'absolute',
    top: 32,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonContainer: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
  },
  previewContainer: {
    marginBottom: 24,
  },
  preview: {
    width: '100%',
    height: 400,
    borderRadius: 32,
    borderCurve: 'continuous',
    backgroundColor: '#e4e4e7',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: '#f4f4f5',
    gap: 8,
  },
  retakeButtonText: {
    color: '#18181b',
    fontSize: 16,
    fontWeight: '700',
  },
  analyzeButton: {
    flex: 2,
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultContainer: {
    gap: 24,
  },
  resultImage: {
    width: '100%',
    height: 400,
    borderRadius: 32,
    borderCurve: 'continuous',
    backgroundColor: '#e4e4e7',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 24,
    borderCurve: 'continuous',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#18181b',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: '#a1a1aa',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detectionsList: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 32,
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18181b',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  detectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  detectionClass: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
    textTransform: 'capitalize',
  },
  detectionConfidence: {
    fontSize: 15,
    color: '#71717a',
    fontWeight: '600',
  },
  disposalSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 32,
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  disposalSubtitle: {
    fontSize: 15,
    color: '#71717a',
    marginBottom: 20,
    lineHeight: 22,
  },
  viewMapButton: {
    backgroundColor: '#18181b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    gap: 8,
    marginBottom: 20,
  },
  viewMapButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  nearestCard: {
    backgroundColor: '#fafafa',
    padding: 20,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  nearestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  nearestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b',
  },
  nearestName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18181b',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  nearestDistance: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 16,
  },
  directionsButton: {
    backgroundColor: '#f4f4f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderCurve: 'continuous',
    gap: 8,
  },
  directionsButtonText: {
    color: '#18181b',
    fontSize: 15,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f4f4f5',
  },
  modalHeader: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18181b',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 1,
  },
  locationCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
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
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#18181b',
    marginBottom: 8,
    paddingRight: 40,
    letterSpacing: -0.5,
  },
  locationAddress: {
    fontSize: 15,
    color: '#71717a',
    marginBottom: 6,
  },
  locationDistance: {
    fontSize: 15,
    color: '#18181b',
    fontWeight: '800',
    marginBottom: 20,
  },
  directionsButtonLarge: {
    backgroundColor: '#18181b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    gap: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 32,
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  emptyStateIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18181b',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 22,
  },
  aiTipsSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 32,
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ede9fe',
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
    borderBottomColor: '#f5f3ff',
  },
  aiTipBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  aiTipBulletText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7c3aed',
  },
  aiTipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#3f3f46',
    fontWeight: '500',
  },
});