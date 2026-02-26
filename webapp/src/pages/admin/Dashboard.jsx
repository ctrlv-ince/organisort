import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import PageHeaderCard from '../../components/PageHeaderCard';
import DetectionsPage from './DetectionsPage';
import UsersPage from './UsersPage';
import ActivityLogs from './ActivityLogs';
import AnalyticsPage from './AnalyticsPage';
import WasteCategoriesPage from './WasteCategoriesPage';
import ReportsPage from './ReportsPage';
import AdminSettings from './AdminSettings';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

/**
 * Admin Dashboard Page - Organic Waste Detection
 * Admin dashboard for waste management system and analytics
 * UPDATED FOR MULTI-CLASS ORGANIC WASTE DETECTION (45 classes)
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalDetections: 0,
    totalItems: 0,
    byWasteType: {},
    topWasteTypes: [],
    recentActivity: [],
    averageItemsPerScan: 0,
    averageConfidence: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState({
    services: [],
    updatedAt: null,
  });
  const [healthEndpointConfigured, setHealthEndpointConfigured] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const normalizeSystemHealth = (payload) => {
    const data = payload?.data && !Array.isArray(payload?.services)
      ? payload.data
      : payload;

    const services = Array.isArray(data?.services)
      ? data.services
      : [];

    return {
      services,
      updatedAt: data?.updatedAt || null,
    };
  };

  const fetchSystemHealth = async () => {
    const candidateUrls = [`${API_URL}/api/health`, `${API_URL}/health`];

    for (const url of candidateUrls) {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          continue;
        }

        const healthData = await response.json();
        const normalizedHealth = normalizeSystemHealth(healthData);

        if (normalizedHealth.services.length > 0 || normalizedHealth.updatedAt) {
          setSystemHealth(normalizedHealth);
          setHealthEndpointConfigured(true);
          console.log('✅ System health fetched:', normalizedHealth);
          return;
        }
      } catch (error) {
        console.warn(`Failed to fetch system health from ${url}:`, error);
      }
    }

    setHealthEndpointConfigured(false);
    setSystemHealth({
      services: [
        {
          label: 'System Health Endpoint',
          status: 'NOT CONFIGURED',
          healthy: null,
        },
      ],
      updatedAt: null,
    });

    console.warn('Failed to fetch system health from all known endpoints');
  };

  /**
   * Fetch user profile and stats from backend
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch user profile
        const userResponse = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserData(userData.data);
          console.log('✅ User profile fetched:', userData.data);
        } else {
          console.warn('Failed to fetch user profile');
        }

        // Fetch all users
        const usersResponse = await fetch(`${API_URL}/api/users/stats/detections`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.data);
          console.log('✅ All users fetched:', usersData.data);
        } else {
          console.warn('Failed to fetch all users');
        }

        // Fetch detection stats
        const statsResponse = await fetch(`${API_URL}/api/detections/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
          console.log('✅ Detection stats fetched:', statsData);
        } else {
          console.warn('Failed to fetch detection stats');
        }

        // Fetch system health status
        await fetchSystemHealth();

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getServiceBadgeClasses = (healthy) => {
    if (healthy === true) return 'bg-green-100 text-green-800 border-green-200';
    if (healthy === false) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getServiceRowClasses = (healthy) => {
    if (healthy === true) return 'bg-green-50/50 border-green-100';
    if (healthy === false) return 'bg-red-50/50 border-red-100';
    return 'bg-slate-50 border-slate-100';
  };

  const getServiceDotClasses = (healthy) => {
    if (healthy === true) return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
    if (healthy === false) return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
    return 'bg-slate-400';
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            {/* Home Tab */}
            {activeTab === 'home' && (
              <motion.div
                className="space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {/* Welcome Section */}
                <motion.div variants={itemVariants}>
                  <PageHeaderCard
                    title={`Welcome, ${userData?.displayName || userData?.email || 'Admin'}!`}
                    subtitle="OrganiSort Admin Portal - Managing 45 types of organic waste classification 🌱"
                    variant="primary"
                    icon={(
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    )}
                  />
                </motion.div>

                {/* Quick Stats Cards */}
                <motion.div variants={itemVariants} className="grid md:grid-cols-4 gap-6">
                  {/* Total Users */}
                  <div className="bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all p-8 flex flex-col justify-between border border-gray-100 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 bg-green-50 w-32 h-32 rounded-full transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10 flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shadow-sm border border-green-200">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <p className="text-5xl font-black text-gray-900 tracking-tighter">{users.length}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Total Users</p>
                    </div>
                  </div>

                  {/* Total Scans */}
                  <div className="bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all p-8 flex flex-col justify-between border border-gray-100 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 bg-amber-50 w-32 h-32 rounded-full transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10 flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-200">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <p className="text-5xl font-black text-gray-900 tracking-tighter">{stats.totalDetections}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Total Scans</p>
                    </div>
                  </div>

                  {/* Total Items Detected */}
                  <div className="bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all p-8 flex flex-col justify-between border border-gray-100 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 bg-blue-50 w-32 h-32 rounded-full transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10 flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <p className="text-5xl font-black text-gray-900 tracking-tighter">{stats.totalItems}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Items Discovered</p>
                    </div>
                  </div>

                  {/* Average Items per Scan */}
                  <div className="bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all p-8 flex flex-col justify-between border border-gray-100 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 bg-purple-50 w-32 h-32 rounded-full transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10 flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm border border-purple-200">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <p className="text-5xl font-black text-gray-900 tracking-tighter">{stats.averageItemsPerScan}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Avg Items / Scan</p>
                    </div>
                  </div>
                </motion.div>

                {/* Top Waste Types Chart */}
                <motion.div variants={itemVariants} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center">
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl mr-4 shadow-sm">
                      <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    Top 10 Most Detected Waste Types
                  </h2>
                  {stats.topWasteTypes && stats.topWasteTypes.length > 0 ? (
                    <div className="space-y-5">
                      {stats.topWasteTypes.map((item, idx) => (
                        <div key={idx} className="flex items-center group">
                          <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mr-4 shadow-sm group-hover:border-green-200 group-hover:bg-green-50 transition-colors">
                            <span className="text-slate-600 group-hover:text-green-600 font-extrabold text-sm">{idx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-base font-bold text-gray-800 capitalize tracking-wide">{item.type.replace(/-/g, ' ')}</span>
                              <span className="text-base font-extrabold text-green-600 bg-green-50 px-3 py-0.5 rounded-lg">{item.count}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.count / (stats.topWasteTypes[0]?.count || 1)) * 100}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="bg-green-500 h-full rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 font-bold bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      No detection data yet
                    </div>
                  )}
                </motion.div>

                {/* Two Column Layout for Account Info and System Status */}
                <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8">
                  {/* Account Info Panel */}
                  <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center">
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl mr-4 shadow-sm">
                        <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      Admin Overview
                    </h2>
                    {loading ? (
                      <div className="space-y-6">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="space-y-2">
                            <div className="skeleton-shimmer h-3 w-20" />
                            <div className="skeleton-shimmer h-8 w-48 rounded-lg" />
                          </div>
                        ))}
                      </div>
                    ) : userData ? (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</p>
                          <p className="text-gray-900 font-bold">{userData.email}</p>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Display Name</p>
                          <p className="text-gray-900 font-bold">
                            {userData.displayName || '(Not set)'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Admin Since</p>
                          <p className="text-gray-900 font-bold">
                            {new Date(userData.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Activity</p>
                          <p className="text-gray-900 font-bold">
                            {new Date(userData.lastLogin).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                          <div className="flex items-center">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-3 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            <p className="text-sm text-green-800 font-bold tracking-wide uppercase">
                              Admin Access Synchronized
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 font-bold bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        No account data available
                      </div>
                    )}
                  </div>

                  {/* System Health Status */}
                  <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight flex items-center">
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl mr-4 shadow-sm">
                        <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      System Health
                    </h2>
                    <div className="space-y-4">
                      {systemHealth.services.length > 0 ? (
                        systemHealth.services.map((service) => (
                          <div
                            key={service.label}
                            className={`flex items-center justify-between p-5 rounded-2xl border transition-colors hover:shadow-sm ${getServiceRowClasses(service.healthy)}`}
                          >
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-4 animate-pulse ${getServiceDotClasses(service.healthy)}`}></div>
                              <span className="text-gray-900 font-bold tracking-tight">{service.label}</span>
                            </div>
                            <span className={`px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-widest border ${getServiceBadgeClasses(service.healthy)}`}>
                              {service.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm font-semibold text-gray-500 bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center">System health data unavailable.</p>
                      )}
                      {!healthEndpointConfigured && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mt-4">
                          <p className="text-sm text-amber-800 font-bold">
                            Health check disabled!
                          </p>
                          <p className="text-xs text-amber-700 mt-1 font-medium">Add <code>/api/health</code> backend endpoint for live polling.</p>
                        </div>
                      )}
                      {systemHealth.updatedAt && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center pt-2">
                          Last Updated: {new Date(systemHealth.updatedAt).toLocaleString('en-US')}
                        </p>
                      )}
                      <div className="mt-6 p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg border border-slate-700 text-white">
                        <div className="flex items-start">
                          <div className="p-2 bg-white/10 rounded-lg mr-4 border border-white/10 shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-base font-bold tracking-tight">AI Model Deployment</p>
                            <p className="text-sm text-slate-300 font-medium mt-1">45 tracked organic waste classes</p>
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-[10px] uppercase tracking-widest font-extrabold bg-green-500/20 text-green-300 px-2 py-1 rounded border border-green-500/30">
                                AVG ACCURACY
                              </span>
                              <p className="text-sm font-bold text-white">{(parseFloat(stats.averageConfidence) * 100).toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && <UsersPage />}

            {/* Detections Tab */}
            {activeTab === 'detections' && <DetectionsPage />}

            {/* Waste Categories Tab */}
            {activeTab === 'waste-types' && <WasteCategoriesPage />}

            {/* Activity Logs Tab */}
            {activeTab === 'logs' && <ActivityLogs />}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && <AnalyticsPage />}

            {/* Reports Tab */}
            {activeTab === 'reports' && <ReportsPage />}

            {/* Settings Tab */}
            {activeTab === 'settings' && <AdminSettings userData={userData} />}

            {/* Placeholder for other tabs */}
            {!['home', 'users', 'detections', 'waste-types', 'logs', 'analytics', 'reports', 'settings'].includes(activeTab) && (
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-16">
                <div className="text-center">
                  <span className="text-7xl mb-6 block drop-shadow-sm">🚧</span>
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
                  </h2>
                  <p className="text-gray-500 font-medium">This section is currently under development or being redesigned.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
