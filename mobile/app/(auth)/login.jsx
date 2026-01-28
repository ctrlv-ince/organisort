import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { Svg, Path, Circle } from 'react-native-svg';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function LoginScreen() {
  const { signInWithGoogle, signInWithEmail, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated && !loading) {
      router.replace('/(app)');
    }
  }, [isAuthenticated, loading]);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
      router.replace('/(app)');
    } catch (error) {
      console.error('Google sign-in failed:', error);
      Alert.alert('Sign-In Error', 'Failed to sign in with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter email and password');
      return;
    }

    try {
      setEmailLoading(true);
      await signInWithEmail(email, password);
      router.replace('/(app)');
    } catch (error) {
      console.error('Email sign-in failed:', error);
      Alert.alert('Sign-In Error', 'Invalid email or password. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-gradient-to-b from-primary to-blue-600">
      <ScrollView contentContainerClassName="flex-grow" bounces={false}>
        <StyledView className="flex-1 items-center justify-center px-6 pt-16">
          <StyledView className="w-24 h-24 bg-white rounded-full items-center justify-center mb-8 shadow-lg">
            <StyledText className="text-4xl">♻️</StyledText>
          </StyledView>

          <StyledText className="text-4xl font-bold text-white mb-2 text-center">
            Waste Detection
          </StyledText>
          <StyledText className="text-lg text-blue-100 text-center mb-12">
            Smart waste classification & management
          </StyledText>

          <StyledView className="w-full bg-white rounded-2xl px-6 py-8 shadow-xl">
            <StyledText className="text-xl font-bold text-dark mb-6 text-center">
              Sign In
            </StyledText>

            <StyledView className="mb-4">
              <StyledText className="text-sm font-semibold text-gray-700 mb-2">Email</StyledText>
              <StyledView className="border-2 border-gray-300 rounded-lg px-4 py-3 bg-light">
                <StyledText className="text-gray-600">
                  {email || 'Enter your email'}
                </StyledText>
              </StyledView>
            </StyledView>

            <StyledView className="mb-6">
              <StyledText className="text-sm font-semibold text-gray-700 mb-2">Password</StyledText>
              <StyledView className="border-2 border-gray-300 rounded-lg px-4 py-3 bg-light">
                <StyledText className="text-gray-600">••••••••</StyledText>
              </StyledView>
            </StyledView>

            <StyledTouchableOpacity
              onPress={handleEmailSignIn}
              disabled={emailLoading || loading}
              className={`w-full py-4 rounded-lg mb-6 flex-row items-center justify-center ${
                emailLoading || loading ? 'bg-gray-300' : 'bg-primary'
              }`}
            >
              {emailLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <StyledText className="text-white font-bold text-lg">Sign In with Email</StyledText>
              )}
            </StyledTouchableOpacity>

            <StyledView className="flex-row items-center mb-6">
              <StyledView className="flex-1 h-px bg-gray-300" />
              <StyledText className="text-gray-500 px-3">or</StyledText>
              <StyledView className="flex-1 h-px bg-gray-300" />
            </StyledView>

            <StyledTouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className={`w-full py-4 rounded-lg flex-row items-center justify-center border-2 ${
                googleLoading || loading ? 'border-gray-300 bg-gray-100' : 'border-primary bg-white'
              }`}
            >
              {googleLoading ? (
                <ActivityIndicator color="#2563eb" size="small" />
              ) : (
                <>
                  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="11" stroke="#2563eb" strokeWidth="1" />
                    <Path d="M8 12L10.5 14.5L16 8" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
                  </Svg>
                  <StyledText className="text-primary font-bold text-lg ml-3">
                    Sign in with Google
                  </StyledText>
                </>
              )}
            </StyledTouchableOpacity>
          </StyledView>

          <StyledText className="text-white text-center mt-12 text-sm">
            By signing in, you agree to our Terms of Service
          </StyledText>
        </StyledView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
