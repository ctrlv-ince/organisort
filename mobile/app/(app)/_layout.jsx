import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, useFocusEffect } from 'expo-router';
import { View, Platform, Text } from 'react-native';
import Svg, { Path, Polyline, Circle } from 'react-native-svg';
import ProtectedScreen from '@/src/components/ProtectedScreen';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/src/utils/apiClient';

export default function AppLayout() {
  const { colors } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/api/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      // Silently fail — not critical
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <ProtectedScreen>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopWidth: 0.5,
            borderTopColor: colors.tabBarBorder,
            height: Platform.OS === 'ios' ? 90 : 64,
            paddingBottom: Platform.OS === 'ios' ? 28 : 10,
            paddingTop: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -1 },
            shadowOpacity: 0.03,
            shadowRadius: 8,
            elevation: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <HomeIcon color={color} size={size} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color, size }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <ScanIcon color={color} size={size} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, size }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <HistoryIcon color={color} size={size} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color, size }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="notifications-outline" size={size} color={color} />
                {unreadCount > 0 && (
                  <View style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    backgroundColor: '#ef4444',
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                  }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
          listeners={{
            focus: () => fetchUnreadCount(),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <ProfileIcon color={color} size={size} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: 'More',
            tabBarIcon: ({ color, size }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <MoreIcon color={color} size={size} />
              </View>
            ),
          }}
        />
        {/* Hide admin from tabs but keep it accessible via route */}
        <Tabs.Screen
          name="admin"
          options={{
            href: null, // This hides it from tabs but keeps the route
          }}
        />

        {/* Hide edit-profile from tabs but keep it accessible via route */}
        <Tabs.Screen
          name="edit-profile"
          options={{
            href: null,
          }}
        />

        {/* Hide analytics from tabs but keep it accessible via route */}
        <Tabs.Screen
          name="analytics"
          options={{
            href: null,
          }}
        />

        {/* Hide collection-schedule from tabs */}
        <Tabs.Screen
          name="collection-schedule"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </ProtectedScreen>
  );
}

// Simple SVG-like icon components
function HomeIcon({ color, size = 24 }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
        <Polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

import { Ionicons } from '@expo/vector-icons';

function ScanIcon({ color, size = 24 }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size * 1.2,
        height: size * 1.2,
        borderRadius: size * 0.6,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Ionicons name="camera" size={size * 0.6} color="white" />
      </View>
    </View>
  );
}

function HistoryIcon({ color, size = 24 }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <Path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

function ProfileIcon({ color, size = 24 }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

function MoreIcon({ color, size = 24 }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <Circle cx="12" cy="12" r="1" fill={color} />
        <Circle cx="12" cy="5" r="1" fill={color} />
        <Circle cx="12" cy="19" r="1" fill={color} />
      </Svg>
    </View>
  );
}