import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DetectionsPage from './DetectionsPage';
import UsersPage from './UsersPage';
import ActivityLogs from './ActivityLogs';

/**
 * Admin Dashboard Page - Organic Waste Detection
 * Admin dashboard for waste management system and analytics
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalDetections: 0,
    byCategory: {
      organic: 0,
      recyclable: 0,
      'non-recyclable': 0,
      unknown: 0,
    },
    byWasteType: {},
    recentActivity: [],
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
                      OrganiSort Admin Portal - Waste Management System
                    </p>
                    <p className="text-green-200 mt-2">
                      Managing organic waste detection and sustainability 🌱
                    </p>
                  </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6">
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

                  {/* Waste Detections */}
                  <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Waste Detections</p>
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

                  {/* System Accuracy */}
                  <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">System Accuracy</p>
                        <p className="text-3xl font-bold text-blue-700 mt-1">94.2%</p>
                      </div>
                      <div className="bg-blue-100 p-4 rounded-full">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Waste Category Distribution */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <span className="text-2xl">♻️</span>
                    </div>
                    Waste Category Distribution
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Organic</span>
                        <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                          {stats.byCategory.organic}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${stats.totalDetections > 0 ? (stats.byCategory.organic / stats.totalDetections) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Recyclable</span>
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                          {stats.byCategory.recyclable}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${stats.totalDetections > 0 ? (stats.byCategory.recyclable / stats.totalDetections) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Non-Recyclable</span>
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                          {stats.byCategory['non-recyclable']}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ 
                            width: `${stats.totalDetections > 0 ? (stats.byCategory['non-recyclable'] / stats.totalDetections) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Profile Sync Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Admin Profile Synchronization</h2>
                  </div>
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
                        <span className="text-sm text-gray-600 mt-2 block text-center">Syncing...</span>
                      </div>
                    </div>
                  ) : userData ? (
                    <div className="space-y-3">
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
                            Successfully synchronized
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No synchronization data available</p>
                    </div>
                  )}
                </div>

                {/* System Status Panel */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    System Health Status
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                        <span className="text-gray-700 font-medium">Authentication</span>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                        ACTIVE
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                        <span className="text-gray-700 font-medium">Backend API</span>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                        ACTIVE
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                        <span className="text-gray-700 font-medium">Database</span>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                        SYNCED
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Recent Activity
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <p className="text-sm text-gray-700">Logged in successfully</p>
                      <span className="ml-auto text-xs text-gray-500">Just now</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <p className="text-sm text-gray-700">Database synchronized</p>
                      <span className="ml-auto text-xs text-gray-500">2 min ago</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                      <p className="text-sm text-gray-700">Profile data loaded</p>
                      <span className="ml-auto text-xs text-gray-500">5 min ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && <UsersPage />}

            {/* Detections Tab */}
            {activeTab === 'detections' && <DetectionsPage />}

            {/* Activity Logs Tab */}
            {activeTab === 'logs' && <ActivityLogs />}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">Waste Analytics</h1>
                    <p className="text-gray-600 mt-1">Detection insights and performance metrics</p>
                  </div>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <span className="text-6xl mb-4 block">📊</span>
                  <p className="text-gray-600 text-lg">
                    Analytics dashboard under development
                  </p>
                  <p className="text-gray-500 mt-2">
                    View detection statistics, user engagement, and AI model performance
                  </p>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {!['home', 'users', 'detections', 'logs', 'analytics'].includes(activeTab) && (
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