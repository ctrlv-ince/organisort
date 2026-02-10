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
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import apiClient from '@/src/utils/apiClient';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#8b5cf6',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: { fontSize: 30, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#e9d5ff', textAlign: 'center', marginTop: 8 },
  content: { padding: 24 },
  
  // Section Styles
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  
  // Menu Item Styles
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: { fontSize: 24, marginRight: 16, width: 30 },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  menuSubtitle: { fontSize: 12, color: '#64748b' },
  menuArrow: { fontSize: 20, color: '#9ca3af' },
  
  // Settings Toggle
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  
  // Logout Button
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  
  // Version
  version: { textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 24, marginBottom: 8 },
  
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  modalCloseButton: { padding: 8 },
  modalCloseText: { fontSize: 24, color: '#64748b' },
  
  // Leaderboard Styles
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  leaderboardName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1e293b' },
  leaderboardScore: { fontSize: 16, fontWeight: 'bold', color: '#8b5cf6' },
  
  // Achievement Styles
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  achievementIcon: { fontSize: 40, marginRight: 16 },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  achievementDesc: { fontSize: 12, color: '#64748b' },
  achievementUnlocked: { fontSize: 10, color: '#10b981', fontWeight: '600', marginTop: 4 },
  
  loadingContainer: { padding: 40, alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#64748b', fontSize: 14, padding: 20 },
});

export default function MoreScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
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
      const response = await apiClient.get('/api/users/stats/detections');
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

  const loadAchievements = () => {
    // Mock achievements - replace with actual backend data
    setAchievements([
      {
        id: 1,
        icon: '🌟',
        title: 'First Scan',
        description: 'Complete your first waste detection',
        unlocked: true,
        unlockedDate: 'Jan 15, 2024',
      },
      {
        id: 2,
        icon: '🔥',
        title: '10 Scans',
        description: 'Detect waste 10 times',
        unlocked: true,
        unlockedDate: 'Jan 20, 2024',
      },
      {
        id: 3,
        icon: '💯',
        title: 'Perfect Detection',
        description: 'Get 100% confidence on a scan',
        unlocked: false,
      },
      {
        id: 4,
        icon: '🏆',
        title: 'Top 10',
        description: 'Reach top 10 on leaderboard',
        unlocked: false,
      },
    ]);
  };

  const openLeaderboard = () => {
    setShowLeaderboard(true);
    fetchLeaderboard();
  };

  const openAchievements = () => {
    setShowAchievements(true);
    loadAchievements();
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>More</Text>
          <Text style={styles.subtitle}>Settings, stats & more</Text>
        </View>

        <View style={styles.content}>
          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/analytics')}
            >
              <Text style={styles.menuIcon}>📊</Text>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Analytics</Text>
                <Text style={styles.menuSubtitle}>Detailed insights & impact stats</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={openLeaderboard}>
              <Text style={styles.menuIcon}>🏆</Text>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Leaderboard</Text>
                <Text style={styles.menuSubtitle}>See top waste detectors</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={openAchievements}>
              <Text style={styles.menuIcon}>🎖️</Text>
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
                <Text style={styles.menuIcon}>🔔</Text>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Notifications</Text>
                  <Text style={styles.menuSubtitle}>Get detection reminders</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={notificationsEnabled ? '#10b981' : '#f3f4f6'}
              />
            </View>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => Alert.alert('Coming Soon', 'Language settings coming soon!')}
            >
              <Text style={styles.menuIcon}>🌐</Text>
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
              <Text style={styles.menuIcon}>🎨</Text>
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
              onPress={() => Alert.alert('Help & Support', 'Contact us at support@organisort.com')}
            >
              <Text style={styles.menuIcon}>❓</Text>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Help & Support</Text>
                <Text style={styles.menuSubtitle}>Get help or report issues</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => Alert.alert('Privacy Policy', 'Your data is secure with us. We never share your information.')}
            >
              <Text style={styles.menuIcon}>🔒</Text>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Privacy Policy</Text>
                <Text style={styles.menuSubtitle}>How we protect your data</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => Alert.alert('About OrganiSort', 'AI-Powered Waste Detection App\nVersion 1.0.0\n\n© 2024 OrganiSort Team')}
            >
              <Text style={styles.menuIcon}>ℹ️</Text>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>About App</Text>
                <Text style={styles.menuSubtitle}>Version, credits & more</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>

          <Text style={styles.version}>OrganiSort v1.0.0</Text>
          <Text style={styles.version}>Made with 💚 for the environment</Text>
        </View>
      </ScrollView>

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
                  <ActivityIndicator size="large" color="#8b5cf6" />
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
              <Text style={styles.modalTitle}>🎖️ Achievements</Text>
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
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDesc}>{achievement.description}</Text>
                    {achievement.unlocked && (
                      <Text style={styles.achievementUnlocked}>
                        ✅ Unlocked: {achievement.unlockedDate}
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
