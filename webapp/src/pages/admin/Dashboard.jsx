import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import DetectionsPage from './DetectionsPage';
import UsersPage from './UsersPage';
import ActivityLogs from './ActivityLogs';
import AnalyticsPage from './AnalyticsPage';
import WasteCategoriesPage from './WasteCategoriesPage';
import ReportsPage from './ReportsPage';

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
    if (healthy === true) return 'bg-green-100 text-green-800';
    if (healthy === false) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-700';
  };

  const getServiceRowClasses = (healthy) => {
    if (healthy === true) return 'bg-green-50 border-green-200';
    if (healthy === false) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getServiceDotClasses = (healthy) => {
    if (healthy === true) return 'bg-green-500';
    if (healthy === false) return 'bg-red-500';
    return 'bg-gray-400';
  };


  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 to-amber-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Home Tab */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-lg shadow-xl p-8 text-white relative overflow-hidden">
                  {/* Decorative pattern */}
                  <div className="absolute top-0 right-0 opacity-10 text-9xl">♻️</div>
                  <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">
                      Welcome, {userData?.displayName || userData?.email}!
                    </h1>
                    <p className="text-green-100 text-lg">
                      OrganiSort Admin Portal - Organic Waste Detection System
                    </p>
                    <p className="text-green-200 mt-2">
                      Managing 45 types of organic waste classification 🌱
                    </p>
                  </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Total Users */}
                  <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Total Users</p>
                        <p className="text-3xl font-bold text-green-700 mt-1">{users.length}</p>
                      </div>
                      <div className="bg-green-100 p-4 rounded-full">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Total Scans */}
                  <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Total Scans</p>
                        <p className="text-3xl font-bold text-amber-700 mt-1">{stats.totalDetections}</p>
                      </div>
                      <div className="bg-amber-100 p-4 rounded-full">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Total Items Detected */}
                  <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Items Detected</p>
                        <p className="text-3xl font-bold text-blue-700 mt-1">{stats.totalItems}</p>
                      </div>
                      <div className="bg-blue-100 p-4 rounded-full">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Average Items per Scan */}
                  <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Avg Items/Scan</p>
                        <p className="text-3xl font-bold text-purple-700 mt-1">{stats.averageItemsPerScan}</p>
                      </div>
                      <div className="bg-purple-100 p-4 rounded-full">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Waste Types Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    Top 10 Most Detected Waste Types
                  </h2>
                  {stats.topWasteTypes && stats.topWasteTypes.length > 0 ? (
                    <div className="space-y-3">
                      {stats.topWasteTypes.map((item, idx) => (
                        <div key={idx} className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-700 font-bold text-sm">{idx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">{item.type}</span>
                              <span className="text-sm font-bold text-green-600">{item.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${(item.count / (stats.topWasteTypes[0]?.count || 1)) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No detection data yet
                    </div>
                  )}
                </div>

                {/* Two Column Layout for Account Info and System Status */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Account Info Panel */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                      <div className="bg-amber-100 p-2 rounded-lg mr-3">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      Account Information
                    </h2>
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="space-y-2">
                            <div className="skeleton-shimmer h-3 w-20" />
                            <div className="skeleton-shimmer h-5 w-48" />
                          </div>
                        ))}
                      </div>
                    ) : userData ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Email</p>
                          <p className="text-gray-800">{userData.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Display Name</p>
                          <p className="text-gray-800">
                            {userData.displayName || '(Not set)'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Admin Since</p>
                          <p className="text-gray-800">
                            {new Date(userData.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Last Activity</p>
                          <p className="text-gray-800">
                            {new Date(userData.lastLogin).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            <p className="text-sm text-green-700 font-semibold">
                              System synchronized
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No account data available</p>
                      </div>
                    )}
                  </div>

                  {/* System Health Status */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      System Health
                    </h2>
                    <div className="space-y-3">
                      {systemHealth.services.length > 0 ? (
                        systemHealth.services.map((service) => (
                          <div
                            key={service.label}
                            className={`flex items-center justify-between p-4 rounded-lg border ${getServiceRowClasses(service.healthy)}`}
                          >
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-3 animate-pulse ${getServiceDotClasses(service.healthy)}`}></div>
                              <span className="text-gray-700 font-medium">{service.label}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getServiceBadgeClasses(service.healthy)}`}>
                              {service.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">System health data unavailable.</p>
                      )}
                      {!healthEndpointConfigured && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                          Health endpoint is not configured on the backend. Add <code>/api/health</code> if you want live service checks.
                        </p>
                      )}
                      {systemHealth.updatedAt && (
                        <p className="text-xs text-gray-500">
                          Last updated: {new Date(systemHealth.updatedAt).toLocaleString('en-US')}
                        </p>
                      )}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-semibold text-blue-800">Model Info</p>
                            <p className="text-xs text-blue-700 mt-1">45 organic waste classes</p>
                            <p className="text-xs text-blue-600 mt-1">Avg confidence: {(parseFloat(stats.averageConfidence) * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

            {/* Placeholder for other tabs */}
            {!['home', 'users', 'detections', 'waste-types', 'logs', 'analytics', 'reports'].includes(activeTab) && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">🚧</span>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
                  </h2>
                  <p className="text-gray-600">This section is under development</p>
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
