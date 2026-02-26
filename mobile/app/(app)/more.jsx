import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import apiClient from '@/src/utils/apiClient';
import { sendTestNotification, scheduleDailyReminder, cancelAllReminders } from '@/src/utils/notifications';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f5' },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#18181b', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#a1a1aa', textAlign: 'center', marginTop: 6, fontWeight: '500' },
  content: { padding: 20 },

  // Section Styles
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#a1a1aa', marginBottom: 12, letterSpacing: 0.8, textTransform: 'uppercase' },

  // Menu Item Styles
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  menuIcon: { marginRight: 14, width: 28 },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600', color: '#18181b', marginBottom: 2 },
  menuSubtitle: { fontSize: 12, color: '#a1a1aa', fontWeight: '500' },
  menuArrow: { fontSize: 18, color: '#d4d4d8' },

  // Settings Toggle
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },

  // Logout Button
  logoutButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },

  // Version
  version: { textAlign: 'center', color: '#d4d4d8', fontSize: 11, marginTop: 20, marginBottom: 6, fontWeight: '600' },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#18181b', letterSpacing: -0.5 },
  modalCloseButton: { padding: 8 },
  modalCloseText: { fontSize: 24, color: '#a1a1aa' },

  // Leaderboard Styles
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: { color: 'white', fontSize: 14, fontWeight: '800' },
  leaderboardName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#18181b' },
  leaderboardScore: { fontSize: 15, fontWeight: '800', color: '#10b981' },

  // Achievement Styles
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fafafa',
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  achievementIcon: { marginRight: 16 },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontSize: 15, fontWeight: '700', color: '#18181b', marginBottom: 4 },
  achievementDesc: { fontSize: 12, color: '#a1a1aa', fontWeight: '500' },
  achievementUnlocked: { fontSize: 10, color: '#10b981', fontWeight: '700', marginTop: 4 },

  loadingContainer: { padding: 40, alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#a1a1aa', fontSize: 14, padding: 20, fontWeight: '500' },
});

export default function MoreScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch initial preferences from backend
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await apiClient.get('/api/users/me');
        const prefs = response.data?.data?.preferences;
        if (prefs) {
          setNotificationsEnabled(prefs.pushNotifications ?? true);
          setEmailUpdates(prefs.emailUpdates ?? false);
          setShowTutorial(prefs.showTutorial ?? true);
          setAutoSave(prefs.autoSaveDetections ?? true);
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      }
    };
    fetchPreferences();
  }, []);

  // Generic patch to backend
  const updatePreference = async (key, value) => {
    try {
      await apiClient.put('/api/users/me/preferences', { [key]: value });
    } catch (error) {
      console.error(`Failed to sync ${key} preference:`, error);
    }
  };

  const handleLogout = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/detections/leaderboard');
      const users = response.data?.data || [];

      const leaderboard = users
        .sort((a, b) => (b.detectionCount || 0) - (a.detectionCount || 0))
        .slice(0, 10)
        .map((user, index) => ({
          id: user._id,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          score: user.detectionCount || 0,
          rank: index + 1,
        }));

      setLeaderboardData(leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      Alert.alert('Error', 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/detections/stats');
      const stats = response.data?.data || {};
      const totalScans = stats.totalDetections || 0;
      const totalItems = stats.totalItems || 0;
      const uniqueTypes = stats.uniqueTypes || 0;

      setAchievements([
        {
          id: 1,
          icon: 'star-outline',
          title: 'First Scan',
          description: 'Complete your first waste detection',
          unlocked: totalScans >= 1,
          progress: `${Math.min(totalScans, 1)}/1`,
        },
        {
          id: 2,
          icon: 'flame-outline',
          title: '10 Scans',
          description: 'Detect waste 10 times',
          unlocked: totalScans >= 10,
          progress: `${Math.min(totalScans, 10)}/10`,
        },
        {
          id: 3,
          icon: 'rocket-outline',
          title: '50 Scans',
          description: 'Detect waste 50 times',
          unlocked: totalScans >= 50,
          progress: `${Math.min(totalScans, 50)}/50`,
        },
        {
          id: 4,
          icon: 'layers-outline',
          title: 'Variety Seeker',
          description: 'Detect 5 different waste types',
          unlocked: uniqueTypes >= 5,
          progress: `${Math.min(uniqueTypes, 5)}/5`,
        },
        {
          id: 5,
          icon: 'trophy-outline',
          title: 'Century Club',
          description: 'Detect 100 total items',
          unlocked: totalItems >= 100,
          progress: `${Math.min(totalItems, 100)}/100`,
        },
      ]);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLeaderboard = () => {
    Haptics.selectionAsync();
    setShowLeaderboard(true);
    fetchLeaderboard();
  };

  const openAchievements = () => {
    Haptics.selectionAsync();
    setShowAchievements(true);
    loadAchievements();
  };

  const handleToggleNotifications = async (value) => {
    Haptics.selectionAsync();
    setNotificationsEnabled(value);
    updatePreference('pushNotifications', value);
    if (value) {
      await scheduleDailyReminder(18, 0); // 6:00 PM
    } else {
      await cancelAllReminders();
    }
  };

  const handleToggleEmailUpdates = (value) => {
    Haptics.selectionAsync();
    setEmailUpdates(value);
    updatePreference('emailUpdates', value);
  };

  const handleToggleTutorial = (value) => {
    Haptics.selectionAsync();
    setShowTutorial(value);
    updatePreference('showTutorial', value);
  };

  const handleToggleAutoSave = (value) => {
    Haptics.selectionAsync();
    setAutoSave(value);
    updatePreference('autoSaveDetections', value);
  };

  const handleTestNotification = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendTestNotification();
  };

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={{ flex: 1 }}>
          {/* Profile Header */}
          <View style={[styles.header, { alignItems: 'center' }]}>
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={{ width: 80, height: 80, rounded: 40, borderRadius: 40, borderWidth: 3, borderColor: '#ffffff', marginBottom: 16 }}
                contentFit="cover"
              />
            ) : (
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#34d399', borderWidth: 3, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#ffffff' }}>
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : '?')}
                </Text>
              </View>
            )}

            <Text style={styles.title}>{user?.displayName || 'User Profile'}</Text>
            <Text style={styles.subtitle}>{user?.email || 'Settings, stats & more'}</Text>
          </View>

          <View style={styles.content}>
            {/* Features Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/analytics')}
              >
                <Ionicons name="analytics-outline" size={22} color="#10b981" style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Analytics</Text>
                  <Text style={styles.menuSubtitle}>Detailed insights & impact stats</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={openLeaderboard}>
                <Ionicons name="trophy-outline" size={22} color="#10b981" style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Leaderboard</Text>
                  <Text style={styles.menuSubtitle}>See top waste detectors</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={openAchievements}>
                <Ionicons name="ribbon-outline" size={22} color="#10b981" style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Achievements</Text>
                  <Text style={styles.menuSubtitle}>View your badges & progress</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Settings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="notifications-outline" size={22} color="#10b981" style={styles.menuIcon} />
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>Daily Reminders</Text>
                    <Text style={styles.menuSubtitle}>Remind me to log waste</Text>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: '#cbd5e1', true: '#a7f3d0' }}
                  thumbColor={notificationsEnabled ? '#10b981' : '#f8fafc'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="mail-outline" size={22} color="#10b981" style={styles.menuIcon} />
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>Email Updates</Text>
                    <Text style={styles.menuSubtitle}>Receive weekly summary emails</Text>
                  </View>
                </View>
                <Switch
                  value={emailUpdates}
                  onValueChange={handleToggleEmailUpdates}
                  trackColor={{ false: '#cbd5e1', true: '#a7f3d0' }}
                  thumbColor={emailUpdates ? '#10b981' : '#f8fafc'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="book-outline" size={22} color="#10b981" style={styles.menuIcon} />
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>Show Tutorial</Text>
                    <Text style={styles.menuSubtitle}>Display useful app hints</Text>
                  </View>
                </View>
                <Switch
                  value={showTutorial}
                  onValueChange={handleToggleTutorial}
                  trackColor={{ false: '#cbd5e1', true: '#a7f3d0' }}
                  thumbColor={showTutorial ? '#10b981' : '#f8fafc'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="save-outline" size={22} color="#10b981" style={styles.menuIcon} />
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>Auto-Save Scans</Text>
                    <Text style={styles.menuSubtitle}>Automatically save detections</Text>
                  </View>
                </View>
                <Switch
                  value={autoSave}
                  onValueChange={handleToggleAutoSave}
                  trackColor={{ false: '#cbd5e1', true: '#a7f3d0' }}
                  thumbColor={autoSave ? '#10b981' : '#f8fafc'}
                />
              </View>

              <TouchableOpacity style={styles.menuItem} onPress={handleTestNotification}>
                <Ionicons name="paper-plane-outline" size={22} color="#10b981" style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Test Notification</Text>
                  <Text style={styles.menuSubtitle}>Send a dummy push alert</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  Haptics.selectionAsync();
                  Alert.alert('Coming Soon', 'Language settings coming soon!');
                }}
              >
                <Ionicons name="globe-outline" size={22} color="#10b981" style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Language</Text>
                  <Text style={styles.menuSubtitle}>English</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => Alert.alert('Coming Soon', 'Theme settings coming soon!')}
              >
                <Ionicons name="color-palette-outline" size={22} color="#10b981" style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Appearance</Text>
                  <Text style={styles.menuSubtitle}>Light mode</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* About Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  Haptics.selectionAsync();
                  Alert.alert('Help & Support', 'Contact us at support@organisort.com');
                }}
              >
                <Ionicons name="help-circle-outline" size={22} color="#10b981" style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Help & Support</Text>
                  <Text style={styles.menuSubtitle}>Get help or report issues</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  Haptics.selectionAsync();
                  Alert.alert('Privacy Policy', 'Your data is secure with us. We never share your information.');
                }}
              >
                <Ionicons name="lock-closed-outline" size={22} color="#10b981" style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Privacy Policy</Text>
                  <Text style={styles.menuSubtitle}>How we protect your data</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  Haptics.selectionAsync();
                  Alert.alert('About OrganiSort', 'AI-Powered Waste Detection App\nVersion 1.0.0\n\n© 2026 OrganiSort Team');
                }}
              >
                <Ionicons name="information-circle-outline" size={22} color="#10b981" style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>About App</Text>
                  <Text style={styles.menuSubtitle}>Version, credits & more</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.version}>OrganiSort v1.0.0</Text>
            <Text style={styles.version}>Made with 💚 for the environment</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Leaderboard Modal */}
      <Modal visible={showLeaderboard} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏆 Leaderboard</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowLeaderboard(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#10b981" />
                </View>
              ) : leaderboardData.length > 0 ? (
                leaderboardData.map((item) => (
                  <View key={item.id} style={styles.leaderboardItem}>
                    <View style={[
                      styles.rankBadge,
                      item.rank === 1 && { backgroundColor: '#fbbf24' },
                      item.rank === 2 && { backgroundColor: '#94a3b8' },
                      item.rank === 3 && { backgroundColor: '#f97316' },
                    ]}>
                      <Text style={styles.rankText}>#{item.rank}</Text>
                    </View>
                    <Text style={styles.leaderboardName}>{item.name}</Text>
                    <Text style={styles.leaderboardScore}>{item.score}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No leaderboard data available</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Achievements Modal */}
      <Modal visible={showAchievements} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Achievements</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAchievements(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementItem,
                    !achievement.unlocked && { opacity: 0.5, borderLeftColor: '#9ca3af' },
                  ]}
                >
                  <Ionicons
                    name={achievement.icon}
                    size={36}
                    color={achievement.unlocked ? '#10b981' : '#9ca3af'}
                    style={styles.achievementIcon}
                  />
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDesc}>{achievement.description}</Text>
                    {achievement.unlocked ? (
                      <Text style={styles.achievementUnlocked}>
                        ✅ Unlocked
                      </Text>
                    ) : (
                      <Text style={[styles.achievementUnlocked, { color: '#9ca3af' }]}>
                        Progress: {achievement.progress}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
