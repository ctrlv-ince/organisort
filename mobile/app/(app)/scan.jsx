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
import apiClient from '@/src/utils/apiClient';

const { width } = Dimensions.get('window');

export default function ScanScreen() {
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan Organic Waste</Text>
          <Text style={styles.headerSubtitle}>
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
              <Ionicons name="images" size={24} color="#10b981" />
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
              {result.detections?.map((detection, index) => (
                <View key={index} style={styles.detectionItem}>
                  <Text style={styles.detectionClass}>{detection.class}</Text>
                  <Text style={styles.detectionConfidence}>
                    {(detection.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>

            {disposalLocations.length > 0 && (
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
                      <Ionicons name="location" size={20} color="#10b981" />
                      <Text style={styles.nearestTitle}>Nearest Location</Text>
                    </View>
                    <Text style={styles.nearestName}>{disposalLocations[0].name}</Text>
                    <Text style={styles.nearestDistance}>{disposalLocations[0].distanceText} away</Text>
                    <TouchableOpacity
                      style={styles.directionsButton}
                      onPress={() => handleDirections(disposalLocations[0])}
                    >
                      <Ionicons name="navigate" size={16} color="white" />
                      <Text style={styles.directionsButtonText}>Get Directions</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.retakeButton} onPress={retake}>
              <Ionicons name="refresh" size={20} color="#10b981" />
              <Text style={styles.retakeButtonText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal visible={showMap} animationType="slide" onRequestClose={() => setShowMap(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Disposal Locations</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowMap(false)}>
                <Ionicons name="close" size={28} color="#fff" />
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
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10b981',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  closeCamera: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 8,
  },
  flashlightToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#10b981',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
  },
  previewContainer: {
    marginBottom: 20,
  },
  preview: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
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
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10b981',
    gap: 8,
  },
  retakeButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    gap: 20,
  },
  resultImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  detectionsList: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  detectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detectionClass: {
    fontSize: 16,
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  detectionConfidence: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  disposalSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disposalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  viewMapButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  viewMapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nearestCard: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  nearestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  nearestTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  nearestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  nearestDistance: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  directionsButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 6,
    gap: 6,
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    backgroundColor: '#10b981',
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
    padding: 4,
  },
  map: {
    flex: 1,
  },
  locationCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  closeLocationCard: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  locationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  locationAddress: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  locationDistance: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 16,
  },
  directionsButtonLarge: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
});