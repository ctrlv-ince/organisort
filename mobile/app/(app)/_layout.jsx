import React from 'react';
import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import ProtectedScreen from '@/src/components/ProtectedScreen';

export default function AppLayout() {
  return (
    <ProtectedScreen>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#10b981',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            height: Platform.OS === 'ios' ? 88 : 60,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
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
      </Tabs>
    </ProtectedScreen>
  );
}

// Simple SVG-like icon components
function HomeIcon({ color, size = 24 }) {
  return (
    <View style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </View>
  );
}

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
        <View style={{ fontSize: size * 0.7, color: 'white' }}>📷</View>
      </View>
    </View>
  );
}

function HistoryIcon({ color, size = 24 }) {
  return (
    <View style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </View>
  );
}

function ProfileIcon({ color, size = 24 }) {
  return (
    <View style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </View>
  );
}

function MoreIcon({ color, size = 24 }) {
  return (
    <View style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <circle cx="12" cy="12" r="1" fill={color}/>
        <circle cx="12" cy="5" r="1" fill={color}/>
        <circle cx="12" cy="19" r="1" fill={color}/>
      </svg>
    </View>
  );
}