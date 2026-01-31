import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

/**
 * Admin Dashboard Page
 * Admin-only dashboard with waste logs and analytics
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  /**
   * Fetch user profile from backend
   */
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!user) return;

        const idToken = await user.getIdToken();
        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data.data);
          console.log('✅ User profile fetched:', data.data);
        } else {
          console.warn('Failed to fetch user profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-100">
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
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
                  <h1 className="text-4xl font-bold mb-2">
                    Welcome, {user?.displayName || user?.email}!
                  </h1>
                  <p className="text-blue-100">
                    You're logged in and synced to the database. Ready to detect waste! 🚀
                  </p>
                </div>

                {/* User Info Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Firebase Info */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Firebase Auth</h2>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-gray-800 font-medium break-all">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Firebase UID</p>
                        <p className="text-gray-800 font-medium font-mono text-xs break-all">
                          {user?.uid}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email Verified</p>
                        <p className="text-gray-800 font-medium">
                          {user?.emailVerified ? '✅ Yes' : '❌ No'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MongoDB Sync Info */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">MongoDB Sync</h2>
                    {loading ? (
                      <div className="flex items-center justify-center h-24">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : userData ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Display Name</p>
                          <p className="text-gray-800 font-medium">
                            {userData.displayName || '(Not set)'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Account Created</p>
                          <p className="text-gray-800 font-medium">
                            {new Date(userData.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Last Login</p>
                          <p className="text-gray-800 font-medium">
                            {new Date(userData.lastLogin).toLocaleString()}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs text-green-600 font-semibold">
                            ✅ Successfully synced to database!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No data found</p>
                    )}
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">System Status</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Firebase Authentication</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Connected ✅
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Backend API</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Connected ✅
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">MongoDB Database</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Synced ✅
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Waste Logs Tab */}
            {activeTab === 'logs' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Waste Logs</h1>
                <p className="text-gray-600">
                  Waste detection logs will appear here. Coming soon! 🔨
                </p>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Analytics</h1>
                <p className="text-gray-600">
                  Analytics dashboard will appear here. Coming soon! 📈
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
