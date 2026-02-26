import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

// Import user pages
import UserHome from './UserHome';
import ScanWaste from './ScanWaste';
import MyDetections from './MyDetections';
import UserProfile from './UserProfile';
import Achievements from './Achievements';
import Leaderboard from './Leaderboard';
import UserSettings from './UserSettings';
import LandingPageButton from '../../components/LandingPageButton';

/**
 * User Dashboard Page - Main Container
 * Complete user dashboard with sidebar navigation and multiple pages
 */
const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data.data);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Sidebar menu items
  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'scan',
      label: 'Scan Waste',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'detections',
      label: 'My Detections',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--theme-bg, #ffffff)' }}>
        {/* Sidebar skeleton */}
        <aside className="hidden lg:flex flex-col w-64" style={{ background: 'var(--theme-sidebar, #ffffff)', borderRight: '1px solid var(--theme-border, #f0f0f0)' }}>
          <div className="p-6" style={{ borderBottom: '1px solid var(--theme-border, #f0f0f0)' }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl" style={{ background: 'var(--theme-card-hover, #f3f4f6)' }} />
              <div className="space-y-2">
                <div className="h-4 w-20 rounded-lg" style={{ background: 'var(--theme-card-hover, #f3f4f6)' }} />
                <div className="h-3 w-14 rounded-lg" style={{ background: 'var(--theme-card-hover, #f3f4f6)' }} />
              </div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-10 rounded-xl" style={{ background: 'var(--theme-card-hover, #f3f4f6)' }} />
            ))}
          </div>
        </aside>
        {/* Content skeleton */}
        <div className="flex-1 p-8 space-y-6 overflow-y-auto" style={{ background: 'var(--theme-bg-alt, #f9fafb)' }}>
          <div className="skeleton-shimmer h-24 rounded-[2rem]" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-[2rem] p-8 space-y-4" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <div className="skeleton-shimmer h-14 w-14 rounded-2xl" />
                <div className="skeleton-shimmer h-10 w-20" />
                <div className="skeleton-shimmer h-4 w-28" />
              </div>
            ))}
          </div>
          <div className="rounded-[2rem] p-8 space-y-4" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
            <div className="skeleton-shimmer h-6 w-40" />
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-shimmer h-16 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider userData={userData}>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--theme-bg, #ffffff)' }}>
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`} style={{ background: 'var(--theme-sidebar, #ffffff)', borderRight: '1px solid var(--theme-border, #f0f0f0)' }}>
          {/* Sidebar Header */}
          <div className="p-6" style={{ borderBottom: '1px solid var(--theme-border, #f0f0f0)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--theme-accent-surface, #f0fdf4)', border: '1px solid var(--theme-accent-surface-border, #bbf7d0)' }}>
                  <svg className="w-6 h-6" fill="none" stroke="var(--theme-accent, #15803d)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>OrganiSort</h2>
                  <p className="text-xs font-medium" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>User Portal</p>
                </div>
              </div>
              {/* Mobile close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden hover:opacity-80"
                style={{ color: 'var(--theme-text-muted, #9ca3af)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4" style={{ borderBottom: '1px solid var(--theme-border, #f0f0f0)' }}>
            <div className="flex items-center space-x-3 p-3 rounded-xl" style={{ background: 'var(--theme-sidebar-hover, #f3f4f6)' }}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-xl object-cover" style={{ border: '1px solid var(--theme-border, #f0f0f0)' }} />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: 'var(--theme-accent-surface, #f0fdf4)', border: '1px solid var(--theme-accent-surface-border, #bbf7d0)', color: 'var(--theme-accent, #15803d)' }}>
                  {userData?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--theme-text, #111827)' }}>
                  {userData?.displayName || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200"
                style={
                  activeTab === item.id
                    ? {
                      background: 'var(--theme-sidebar-active, #f0fdf4)',
                      color: 'var(--theme-sidebar-active-text, #15803d)',
                      fontWeight: 600,
                      border: '1px solid var(--theme-accent-surface-border, #bbf7d0)',
                    }
                    : {
                      color: 'var(--theme-sidebar-text, #6b7280)',
                      fontWeight: 500,
                      border: '1px solid transparent',
                    }
                }
                onMouseEnter={(e) => { if (activeTab !== item.id) e.currentTarget.style.background = 'var(--theme-sidebar-hover, #f3f4f6)'; }}
                onMouseLeave={(e) => { if (activeTab !== item.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ color: activeTab === item.id ? 'var(--theme-accent, #15803d)' : 'var(--theme-text-muted, #9ca3af)' }}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="px-4 pb-2">
            <LandingPageButton variant="sidebar" />
          </div>

          {/* Logout Button */}
          <div className="p-4" style={{ borderTop: '1px solid var(--theme-border, #f0f0f0)' }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-200 font-semibold text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navbar (mobile) */}
          <header className="lg:hidden" style={{ background: 'var(--theme-navbar, #ffffff)', borderBottom: '1px solid var(--theme-navbar-border, #f0f0f0)' }}>
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="hover:opacity-80 transition-colors"
                style={{ color: 'var(--theme-text-muted, #9ca3af)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-sm font-bold tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>OrganiSort</h1>
              <div className="w-5"></div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto relative" style={{ background: 'var(--theme-bg-alt, #f9fafb)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="min-h-full"
              >
                {activeTab === 'home' && <UserHome userData={userData} setActiveTab={setActiveTab} />}
                {activeTab === 'scan' && <ScanWaste />}
                {activeTab === 'detections' && <MyDetections />}
                {activeTab === 'achievements' && <Achievements userData={userData} />}
                {activeTab === 'leaderboard' && <Leaderboard userData={userData} />}
                {activeTab === 'profile' && <UserProfile userData={userData} setUserData={setUserData} />}
                {activeTab === 'settings' && <UserSettings userData={userData} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default UserDashboard;
