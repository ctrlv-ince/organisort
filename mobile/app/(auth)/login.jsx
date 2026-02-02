import React, { useState, useEffect } from 'react';
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
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#d1d5db' },
  dividerText: { color: '#9ca3af', marginHorizontal: 12, fontSize: 14 },
  googleButton: { width: '100%', paddingVertical: 16, borderRadius: 8, borderWidth: 2, borderColor: '#2563eb', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: 'white' },
  googleText: { color: '#2563eb', fontWeight: 'bold', fontSize: 16 },
  footer: { textAlign: 'center', color: 'white', fontSize: 12 },
});

export default function LoginScreen() {
  const { signInWithEmail, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleEmailSignIn = async () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setEmailLoading(true);
      await signInWithEmail(email, password);
      router.replace('/(app)');
    } catch (error) {
      Alert.alert('Sign-In Error', error.message || 'Invalid email or password');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setEmailLoading(true);
      await signInWithGoogle();
      router.replace('/(app)');
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Google Sign-In Error', error.message || 'Google sign-in failed');
    } finally {
      setEmailLoading(false);
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

        {/* Sign In Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

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
              editable={!emailLoading}
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
              editable={!emailLoading}
            />
            {errors.password && <Text style={styles.error}>{errors.password}</Text>}
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonPrimary,
              (emailLoading || loading) && styles.buttonDisabled
            ]}
            onPress={handleEmailSignIn}
            disabled={emailLoading || loading}
          >
            {emailLoading || loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
          >
            <Text style={{ fontSize: 24, marginRight: 12 }}>🔵</Text>
            <Text style={styles.googleText}>Sign in with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
            <Text style={[styles.footer, { color: "#bfdbfe", textDecorationLine: "underline" }]}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>© 2024 OrganiSort • Waste Detection AI</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
