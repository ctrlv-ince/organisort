import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '@/src/utils/apiClient';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: { fontSize: 30, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#d1fae5', textAlign: 'center', marginTop: 8 },
  content: { padding: 24 },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#fff',
  },
  inputDisabled: { backgroundColor: '#f1f5f9', color: '#64748b' },
  helper: { fontSize: 12, color: '#64748b', marginTop: 6 },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButton: { backgroundColor: '#e2e8f0' },
  cancelText: { color: '#334155', fontSize: 16, fontWeight: '600' },
  saveButton: { backgroundColor: '#10b981' },
  saveButtonDisabled: { opacity: 0.7 },
  saveText: { color: 'white', fontSize: 16, fontWeight: '700' },
});

export default function EditProfileScreen() {
  const { user, updateUserSession } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarUri, setAvatarUri] = useState(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const trimmedName = displayName.trim();

    if (!trimmedName) {
      Alert.alert('Invalid name', 'Display name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      let payload;
      let headers = {};

      if (avatarUri) {
        payload = new FormData();
        payload.append('displayName', trimmedName);

        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        payload.append('avatar', {
          uri: avatarUri,
          name: filename,
          type,
        });

        headers['Content-Type'] = 'multipart/form-data';
      } else {
        payload = { displayName: trimmedName };
        headers['Content-Type'] = 'application/json';
      }

      const response = await apiClient.put('/api/users/profile', payload, { headers });

      if (response.data?.success && response.data?.data) {
        updateUserSession(response.data.data);
      }

      Alert.alert('Success', 'Your profile has been updated.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Failed to update profile:', error);
      const message = error?.response?.data?.error || 'Failed to update profile. Please try again.';
      Alert.alert('Update failed', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.header, { backgroundColor: colors.accent }]}>
          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>Update your account details</Text>
        </View>

        <View style={styles.content}>
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>

            {/* Avatar Picker */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  backgroundColor: '#f3f4f6',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: avatarUri || user?.photoURL ? colors.accent : colors.cardBorder,
                  borderStyle: avatarUri || user?.photoURL ? 'solid' : 'dashed',
                  overflow: 'hidden',
                }}
              >
                {avatarUri || user?.photoURL ? (
                  <Image
                    source={{ uri: avatarUri || user?.photoURL }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={32} color="#9ca3af" />
                    <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 4, fontWeight: '500' }}>
                      Change
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.email || ''}
              editable={false}
            />

            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your display name"
              autoCapitalize="words"
              maxLength={50}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => router.back()}
                disabled={saving}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
