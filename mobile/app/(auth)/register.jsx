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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10b981' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  logoContainer: { width: 96, height: 96, backgroundColor: 'white', borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 32, alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  logo: { fontSize: 48 },
  title: { fontSize: 36, fontWeight: 'bold', color: 'white', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#d1fae5', textAlign: 'center', marginBottom: 48 },
  card: { backgroundColor: 'white', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5, marginBottom: 24 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 24, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { borderWidth: 2, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f8fafc', color: '#1e293b', fontSize: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, marginRight: 8 },
  toggleButton: { minWidth: 44, minHeight: 44, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  toggleText: { fontSize: 20 },
  error: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  button: { width: '100%', paddingVertical: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  buttonPrimary: { backgroundColor: '#10b981' },
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      const result = await registerWithEmail(email, password);
      if (result?.requires2FA) {
        // Redirect to login screen with OTP challenge params
        router.replace({
          pathname: '/(auth)/login',
          params: {
            challengeToken: result.challengeToken,
            otpMessage: result.message || 'Enter the OTP sent to your email to complete registration.',
          },
        });
      } else {
        router.replace('/(app)');
      }
    } catch (error) {
      Alert.alert('Registration Error', error?.response?.data?.error || error.message || 'Registration failed');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={48} color="#10b981" />
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
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!formLoading}
                />
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => setShowPassword((current) => !current)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  accessibilityState={{ pressed: showPassword }}
                >
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#64748b" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.error}>{errors.password}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!formLoading}
                />
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => setShowConfirmPassword((current) => !current)}
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  accessibilityState={{ pressed: showConfirmPassword }}
                >
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#64748b" />
                </TouchableOpacity>
              </View>
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
              <Text style={[styles.footer, { color: '#d1fae5', textDecorationLine: 'underline' }]}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>© 2026 OrganiSort • Waste Detection AI</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
