import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2563eb' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  logoContainer: { width: 96, height: 96, backgroundColor: 'white', borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 32, alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  logo: { fontSize: 48 },
  title: { fontSize: 36, fontWeight: 'bold', color: 'white', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#bfdbfe', textAlign: 'center', marginBottom: 48 },
  card: { backgroundColor: 'white', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5, marginBottom: 24 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 24, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { borderWidth: 2, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f8fafc', color: '#1e293b', fontSize: 16 },
  error: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  button: { width: '100%', paddingVertical: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  buttonPrimary: { backgroundColor: '#2563eb' },
  buttonDisabled: { backgroundColor: '#d1d5db' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  footer: { textAlign: 'center', color: 'white', fontSize: 12 },
});

export default function RegisterScreen() {
  const { registerWithEmail, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleRegister = async () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setFormLoading(true);
      await registerWithEmail(email, password);
      router.replace('/(app)');
    } catch (error) {
      Alert.alert('Registration Error', error.message || 'Registration failed');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>♻️</Text>
        </View>

        {/* Header */}
        <Text style={styles.title}>OrganiSort</Text>
        <Text style={styles.subtitle}>Waste Detection App</Text>

        {/* Register Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Register</Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="user@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!formLoading}
            />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!formLoading}
            />
            {errors.password && <Text style={styles.error}>{errors.password}</Text>}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!formLoading}
            />
            {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonPrimary,
              (formLoading || loading) && styles.buttonDisabled
            ]}
            onPress={handleRegister}
            disabled={formLoading || loading}
          >
            {formLoading || loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={[styles.footer, { color: '#bfdbfe', textDecorationLine: 'underline' }]}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>© 2024 OrganiSort • Waste Detection AI</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
