import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import apiClient from '@/src/utils/apiClient';

export default function SubmitReviewScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleRating = (value) => {
        Haptics.selectionAsync();
        setRating(value);
    };

    const handleSubmit = async () => {
        if (!comment.trim()) {
            Alert.alert('Hold On', 'Please write a short comment about your experience.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await apiClient.post('/api/reviews', {
                rating,
                comment,
            });

            if (response.data.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                    'Thank You!',
                    'Your review has been submitted successfully.',
                    [{ text: 'Great', onPress: () => router.back() }]
                );
            } else {
                throw new Error(response.data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            Alert.alert('Error', 'Failed to submit review. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
            <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        Haptics.selectionAsync();
                        router.back();
                    }}
                    disabled={submitting}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Leave a Review</Text>
                <View style={{ width: 40 }} /> {/* Spacer */}
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

                        {/* Rating Stars */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Overall Experience</Text>
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => handleRating(star)}
                                    style={styles.starButton}
                                    disabled={submitting}
                                >
                                    <Ionicons
                                        name={rating >= star ? 'star' : 'star-outline'}
                                        size={40}
                                        color={rating >= star ? '#fbbf24' : colors.textMuted}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Comment Input */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Tell us more (Taglish accepted!)</Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                {
                                    backgroundColor: colors.bgAlt,
                                    color: colors.text,
                                    borderColor: colors.border,
                                },
                            ]}
                            placeholder="Ang ganda ng app, very helpful..."
                            placeholderTextColor={colors.textMuted}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={comment}
                            onChangeText={setComment}
                            editable={!submitting}
                        />

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.accent, opacity: submitting ? 0.7 : 1 }]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <>
                            <Text style={styles.submitButtonText}>Submit Review</Text>
                            <Ionicons name="send" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        width: 40,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    scrollContent: {
        padding: 20,
    },
    card: {
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 16,
        textAlign: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
        gap: 8,
    },
    starButton: {
        padding: 4,
    },
    divider: {
        height: 1,
        marginVertical: 20,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        minHeight: 150,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
});
