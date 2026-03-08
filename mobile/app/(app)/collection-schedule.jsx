import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import apiClient from '@/src/utils/apiClient';
import DateTimePicker from '@react-native-community/datetimepicker';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CollectionScheduleScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [reminderMinutes, setReminderMinutes] = useState(30);
    const [showTimePicker, setShowTimePicker] = useState(null); // index of schedule being edited

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const response = await apiClient.get('/api/users/me/collection-schedule');
            if (response.data.success) {
                const data = response.data.data;
                setEnabled(data.enabled || false);
                setSchedules(data.schedules || []);
                setReminderMinutes(data.reminderMinutesBefore || 30);
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDay = (dayIndex) => {
        const exists = schedules.findIndex(s => s.day === dayIndex);
        if (exists >= 0) {
            setSchedules(schedules.filter(s => s.day !== dayIndex));
        } else {
            setSchedules([...schedules, { day: dayIndex, time: '07:00', label: '' }].sort((a, b) => a.day - b.day));
        }
    };

    const updateScheduleTime = (index, time) => {
        const updated = [...schedules];
        const hours = String(time.getHours()).padStart(2, '0');
        const mins = String(time.getMinutes()).padStart(2, '0');
        updated[index] = { ...updated[index], time: `${hours}:${mins}` };
        setSchedules(updated);
    };

    const updateScheduleLabel = (index, label) => {
        const updated = [...schedules];
        updated[index] = { ...updated[index], label };
        setSchedules(updated);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiClient.put('/api/users/me/collection-schedule', {
                enabled,
                schedules,
                reminderMinutesBefore: reminderMinutes,
            });
            Alert.alert('Saved!', 'Your collection schedule has been updated.', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error) {
            console.error('Error saving schedule:', error);
            Alert.alert('Error', error?.response?.data?.error || 'Failed to save schedule. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const labelOptions = ['Biodegradable', 'Recyclable', 'Residual', 'Special/Hazardous', ''];

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
                <ActivityIndicator size="large" color={colors.text} style={{ marginTop: 60 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: colors.text }]}>Collection Schedule</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Set when waste trucks pass by your area
                        </Text>
                    </View>
                </View>

                {/* Enable Toggle */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Ionicons name="notifications" size={24} color="#10b981" />
                            <Text style={[styles.toggleLabel, { color: colors.text }]}>Enable Reminders</Text>
                        </View>
                        <Switch
                            value={enabled}
                            onValueChange={setEnabled}
                            trackColor={{ false: colors.border, true: '#10b981' }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                {/* Day Selection */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Collection Days</Text>
                    <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                        Tap the days when waste is collected in your area
                    </Text>
                    <View style={styles.daysGrid}>
                        {DAY_NAMES.map((name, i) => {
                            const isSelected = schedules.some(s => s.day === i);
                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        styles.dayButton,
                                        isSelected && styles.dayButtonSelected,
                                        { borderColor: isSelected ? '#10b981' : (colors.border || '#e5e7eb') },
                                    ]}
                                    onPress={() => toggleDay(i)}
                                >
                                    <Text style={[
                                        styles.dayButtonText,
                                        { color: isSelected ? '#fff' : colors.text },
                                    ]}>
                                        {name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Schedule Details */}
                {schedules.length > 0 && (
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Pickup Times</Text>
                        {schedules.map((schedule, index) => (
                            <View key={schedule.day} style={[styles.scheduleItem, { borderBottomColor: colors.border || '#f4f4f5' }]}>
                                <View style={styles.scheduleHeader}>
                                    <Text style={[styles.scheduleDayName, { color: colors.text }]}>
                                        {DAY_FULL[schedule.day]}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.timeButton}
                                        onPress={() => setShowTimePicker(showTimePicker === index ? null : index)}
                                    >
                                        <Ionicons name="time-outline" size={18} color="#7c3aed" />
                                        <Text style={styles.timeText}>{schedule.time}</Text>
                                    </TouchableOpacity>
                                </View>

                                {showTimePicker === index && (
                                    <DateTimePicker
                                        value={(() => {
                                            const [h, m] = schedule.time.split(':').map(Number);
                                            const d = new Date();
                                            d.setHours(h, m, 0, 0);
                                            return d;
                                        })()}
                                        mode="time"
                                        is24Hour={false}
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(event, date) => {
                                            if (Platform.OS === 'android') setShowTimePicker(null);
                                            if (date) updateScheduleTime(index, date);
                                        }}
                                    />
                                )}

                                {/* Label selector */}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.labelScroll}>
                                    {labelOptions.map((label) => {
                                        const isActive = schedule.label === label;
                                        const displayLabel = label || 'General';
                                        return (
                                            <TouchableOpacity
                                                key={displayLabel}
                                                style={[
                                                    styles.labelChip,
                                                    isActive && styles.labelChipActive,
                                                    { borderColor: isActive ? '#10b981' : (colors.border || '#e5e7eb') },
                                                ]}
                                                onPress={() => updateScheduleLabel(index, label)}
                                            >
                                                <Text style={[
                                                    styles.labelChipText,
                                                    { color: isActive ? '#fff' : colors.textSecondary },
                                                ]}>
                                                    {displayLabel}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        ))}
                    </View>
                )}

                {/* Reminder Timing */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Remind Me Before</Text>
                    <View style={styles.reminderOptions}>
                        {[15, 30, 60].map((mins) => (
                            <TouchableOpacity
                                key={mins}
                                style={[
                                    styles.reminderChip,
                                    reminderMinutes === mins && styles.reminderChipActive,
                                    { borderColor: reminderMinutes === mins ? '#7c3aed' : (colors.border || '#e5e7eb') },
                                ]}
                                onPress={() => setReminderMinutes(mins)}
                            >
                                <Text style={[
                                    styles.reminderChipText,
                                    { color: reminderMinutes === mins ? '#fff' : colors.text },
                                ]}>
                                    {mins} min
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, saving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={22} color="#fff" />
                            <Text style={styles.saveButtonText}>Save Schedule</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 24, paddingBottom: 48 },
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 24 },
    backButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
    title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
    subtitle: { fontSize: 14, fontWeight: '500', marginTop: 4 },
    card: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 2,
    },
    cardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4, letterSpacing: -0.3 },
    cardSubtitle: { fontSize: 13, fontWeight: '500', marginBottom: 16 },
    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    toggleLabel: { fontSize: 16, fontWeight: '700' },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    dayButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayButtonSelected: { backgroundColor: '#10b981', borderColor: '#10b981' },
    dayButtonText: { fontSize: 13, fontWeight: '800' },
    scheduleItem: { paddingVertical: 16, borderBottomWidth: 1 },
    scheduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    scheduleDayName: { fontSize: 16, fontWeight: '700' },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f5f3ff',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    timeText: { fontSize: 15, fontWeight: '800', color: '#7c3aed' },
    labelScroll: { marginTop: 8 },
    labelChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1.5,
        marginRight: 8,
    },
    labelChipActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
    labelChipText: { fontSize: 13, fontWeight: '700' },
    reminderOptions: { flexDirection: 'row', gap: 10, marginTop: 12 },
    reminderChip: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 2,
        alignItems: 'center',
    },
    reminderChipActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
    reminderChipText: { fontSize: 15, fontWeight: '800' },
    saveButton: {
        backgroundColor: '#18181b',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 20,
        gap: 10,
        marginTop: 8,
    },
    saveButtonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
