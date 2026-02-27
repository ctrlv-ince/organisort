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
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import apiClient from '@/src/utils/apiClient';


export default function MoreScreen() {
  const { user, logout } = useAuth();
  const { theme, colors, setTheme, presets } = useTheme();
  const router = useRouter();

  const [emailUpdates, setEmailUpdates] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
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

  const handleSelectTheme = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(id);
    setShowThemePicker(false);
  };

  // Get the display name of the current theme
  const currentThemeName = presets[theme]?.name || 'Default';

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
        <ScrollView style={{ flex: 1 }}>
          {/* Profile Header */}
          <View style={[styles.header, { backgroundColor: colors.header }]}>
            <View style={{ alignItems: 'center' }}>
              {user?.photoURL ? (
                <Image
                  source={{ uri: user.photoURL }}
                  style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: colors.card, marginBottom: 16 }}
                  contentFit="cover"
                />
              ) : (
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent, borderWidth: 3, borderColor: colors.card, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#ffffff' }}>
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : '?')}
                  </Text>
                </View>
              )}

              <Text style={[styles.title, { color: colors.text }]}>{user?.displayName || 'User Profile'}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{user?.email || 'Settings, stats & more'}</Text>
            </View>
          </View>

          <View style={styles.content}>
            {/* Features Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Features</Text>

              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => router.push('/analytics')}
              >
                <Ionicons name="analytics-outline" size={22} color={colors.accent} style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>Analytics</Text>
                  <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>Detailed insights & impact stats</Text>
                </View>
                <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={openLeaderboard}>
                <Ionicons name="trophy-outline" size={22} color={colors.accent} style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>Leaderboard</Text>
                  <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>See top waste detectors</Text>
                </View>
                <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={openAchievements}>
                <Ionicons name="ribbon-outline" size={22} color={colors.accent} style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>Achievements</Text>
                  <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>View your badges & progress</Text>
                </View>
                <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Settings Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Settings</Text>

              <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.settingLeft}>
                  <Ionicons name="mail-outline" size={22} color={colors.accent} style={styles.menuIcon} />
                  <View style={styles.menuContent}>
                    <Text style={[styles.menuTitle, { color: colors.text }]}>Email Updates</Text>
                    <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>Receive weekly summary emails</Text>
                  </View>
                </View>
                <Switch
                  value={emailUpdates}
                  onValueChange={handleToggleEmailUpdates}
                  trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
                  thumbColor={emailUpdates ? colors.switchThumbOn : colors.switchThumbOff}
                />
              </View>

              <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.settingLeft}>
                  <Ionicons name="book-outline" size={22} color={colors.accent} style={styles.menuIcon} />
                  <View style={styles.menuContent}>
                    <Text style={[styles.menuTitle, { color: colors.text }]}>Show Tutorial</Text>
                    <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>Display useful app hints</Text>
                  </View>
                </View>
                <Switch
                  value={showTutorial}
                  onValueChange={handleToggleTutorial}
                  trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
                  thumbColor={showTutorial ? colors.switchThumbOn : colors.switchThumbOff}
                />
              </View>

              <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.settingLeft}>
                  <Ionicons name="save-outline" size={22} color={colors.accent} style={styles.menuIcon} />
                  <View style={styles.menuContent}>
                    <Text style={[styles.menuTitle, { color: colors.text }]}>Auto-Save Scans</Text>
                    <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>Automatically save detections</Text>
                  </View>
                </View>
                <Switch
                  value={autoSave}
                  onValueChange={handleToggleAutoSave}
                  trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
                  thumbColor={autoSave ? colors.switchThumbOn : colors.switchThumbOff}
                />
              </View>

              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  Alert.alert('Coming Soon', 'Language settings coming soon!');
                }}
              >
                <Ionicons name="globe-outline" size={22} color={colors.accent} style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>Language</Text>
                  <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>English</Text>
                </View>
                <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowThemePicker(true);
                }}
              >
                <Ionicons name="color-palette-outline" size={22} color={colors.accent} style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>Appearance</Text>
                  <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{currentThemeName}</Text>
                </View>
                <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
              </TouchableOpacity>
            </View>

            {/* About Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>

              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  Alert.alert('Help & Support', 'Contact us at support@organisort.com');
                }}
              >
                <Ionicons name="help-circle-outline" size={22} color={colors.accent} style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>Help & Support</Text>
                  <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>Get help or report issues</Text>
                </View>
                <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  Alert.alert('Privacy Policy', 'Your data is secure with us. We never share your information.');
                }}
              >
                <Ionicons name="lock-closed-outline" size={22} color={colors.accent} style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>Privacy Policy</Text>
                  <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>How we protect your data</Text>
                </View>
                <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  Alert.alert('About OrganiSort', 'AI-Powered Waste Detection App\nVersion 1.0.0\n\n© 2026 OrganiSort Team');
                }}
              >
                <Ionicons name="information-circle-outline" size={22} color={colors.accent} style={styles.menuIcon} />
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>About App</Text>
                  <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>Version, credits & more</Text>
                </View>
                <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]} onPress={handleLogout}>
              <Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
            </TouchableOpacity>

            <Text style={[styles.version, { color: colors.textMuted }]}>OrganiSort v1.0.0</Text>
            <Text style={[styles.version, { color: colors.textMuted }]}>Made with 💚 for the environment</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Theme Picker Modal */}
      <Modal visible={showThemePicker} animationType="slide" transparent>
        <View style={[styles.modalContainer, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>🎨 Choose Theme</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowThemePicker(false)}
              >
                <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {Object.values(presets).map((preset) => {
                const isActive = theme === preset.id;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    onPress={() => handleSelectTheme(preset.id)}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: colors.card,
                        borderColor: isActive ? colors.accent : colors.cardBorder,
                        borderWidth: isActive ? 2 : 1,
                      },
                    ]}
                  >
                    {/* Color preview swatches */}
                    <View style={styles.themeSwatches}>
                      <View style={[styles.swatch, { backgroundColor: preset.preview.bg, borderColor: colors.border }]} />
                      <View style={[styles.swatch, { backgroundColor: preset.preview.sidebar, borderColor: colors.border }]} />
                      <View style={[styles.swatch, { backgroundColor: preset.preview.accent, borderColor: colors.border }]} />
                      <View style={[styles.swatch, { backgroundColor: preset.preview.card, borderColor: colors.border }]} />
                    </View>

                    {/* Name & description */}
                    <View style={styles.themeInfo}>
                      <Text style={[styles.themeName, { color: colors.text }]}>{preset.name}</Text>
                      <Text style={[styles.themeDesc, { color: colors.textSecondary }]}>{preset.description}</Text>
                    </View>

                    {/* Active checkmark */}
                    {isActive && (
                      <View style={[styles.themeCheck, { backgroundColor: colors.accent }]}>
                        <Ionicons name="checkmark" size={14} color="#ffffff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Leaderboard Modal */}
      <Modal visible={showLeaderboard} animationType="slide" transparent>
        <View style={[styles.modalContainer, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>🏆 Leaderboard</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowLeaderboard(false)}
              >
                <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.accent} />
                </View>
              ) : leaderboardData.length > 0 ? (
                leaderboardData.map((item) => (
                  <View key={item.id} style={[styles.leaderboardItem, { borderBottomColor: colors.border }]}>
                    <View style={[
                      styles.rankBadge,
                      { backgroundColor: colors.accent },
                      item.rank === 1 && { backgroundColor: '#fbbf24' },
                      item.rank === 2 && { backgroundColor: '#94a3b8' },
                      item.rank === 3 && { backgroundColor: '#f97316' },
                    ]}>
                      <Text style={styles.rankText}>#{item.rank}</Text>
                    </View>
                    <Text style={[styles.leaderboardName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.leaderboardScore, { color: colors.accent }]}>{item.score}</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No leaderboard data available</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Achievements Modal */}
      <Modal visible={showAchievements} animationType="slide" transparent>
        <View style={[styles.modalContainer, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Achievements</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAchievements(false)}
              >
                <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementItem,
                    { backgroundColor: colors.bgAlt, borderLeftColor: colors.accent },
                    !achievement.unlocked && { opacity: 0.5, borderLeftColor: colors.textSecondary },
                  ]}
                >
                  <Ionicons
                    name={achievement.icon}
                    size={36}
                    color={achievement.unlocked ? colors.accent : colors.textSecondary}
                    style={styles.achievementIcon}
                  />
                  <View style={styles.achievementInfo}>
                    <Text style={[styles.achievementTitle, { color: colors.text }]}>{achievement.title}</Text>
                    <Text style={[styles.achievementDesc, { color: colors.textSecondary }]}>{achievement.description}</Text>
                    {achievement.unlocked ? (
                      <Text style={[styles.achievementUnlocked, { color: colors.accent }]}>
                        ✅ Unlocked
                      </Text>
                    ) : (
                      <Text style={[styles.achievementUnlocked, { color: colors.textSecondary }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
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
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 6, fontWeight: '500' },
  content: { padding: 20 },

  // Section Styles
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 12, letterSpacing: 0.8, textTransform: 'uppercase' },

  // Menu Item Styles
  menuItem: {
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
  },
  menuIcon: { marginRight: 14, width: 28 },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  menuSubtitle: { fontSize: 12, fontWeight: '500' },
  menuArrow: { fontSize: 18 },

  // Settings Toggle
  settingItem: {
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
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },

  // Logout Button
  logoutButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
  },
  logoutText: { fontSize: 15, fontWeight: '700' },

  // Version
  version: { textAlign: 'center', fontSize: 11, marginTop: 20, marginBottom: 6, fontWeight: '600' },

  // Modal Styles
  modalContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  modalCloseButton: { padding: 8 },
  modalCloseText: { fontSize: 24 },

  // Theme Picker Styles
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  themeSwatches: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 14,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeInfo: { flex: 1 },
  themeName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  themeDesc: { fontSize: 12, fontWeight: '500' },
  themeCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Leaderboard Styles
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: { color: 'white', fontSize: 14, fontWeight: '800' },
  leaderboardName: { flex: 1, fontSize: 15, fontWeight: '600' },
  leaderboardScore: { fontSize: 15, fontWeight: '800' },

  // Achievement Styles
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderLeftWidth: 3,
  },
  achievementIcon: { marginRight: 16 },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  achievementDesc: { fontSize: 12, fontWeight: '500' },
  achievementUnlocked: { fontSize: 10, fontWeight: '700', marginTop: 4 },

  loadingContainer: { padding: 40, alignItems: 'center' },
  emptyText: { textAlign: 'center', fontSize: 14, padding: 20, fontWeight: '500' },
});
