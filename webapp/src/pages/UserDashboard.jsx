import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

/**
 * User Dashboard Page - Organic Waste Detection
 * Regular user dashboard with waste detection and eco-friendly features
 * UCAP green/brown theme
 */
const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detections, setDetections] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  /**
   * Fetch user profile and detection history from backend
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
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
          const data = await userResponse.json();
          setUserData(data.data);
          console.log('✅ User profile fetched:', data.data);
        } else {
          console.warn('Failed to fetch user profile');
        }

        // Fetch detection history
        const detectionsResponse = await fetch(`${API_URL}/api/detections/history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (detectionsResponse.ok) {
          const detectionsData = await detectionsResponse.json();
          const detectionData = detectionsData.detections || detectionsData;
          setDetections(detectionData);
          console.log('✅ Detection history fetched:', detectionData);
        } else {
          console.warn('Failed to fetch detection history');
        }

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-amber-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg shadow-xl p-8 text-white mb-8 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 opacity-10 text-9xl">♻️</div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">
              Welcome, {userData?.displayName || userData?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-green-100 text-lg">
              Start detecting waste and contributing to a sustainable future 🌱
            </p>
            <p className="text-green-200 mt-2 text-sm">
              Every detection helps our planet. Let's make a difference together!
            </p>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Detections Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-green-700 mb-2">{detections.length}</div>
            <p className="text-gray-700 font-semibold">Waste Detections</p>
            <p className="text-sm text-gray-500 mt-1">Detections this month</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-green-600 font-medium">🎯 Goal: 10 detections</p>
            </div>
          </div>

          {/* Points Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-600 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-amber-700 mb-2">0</div>
            <p className="text-gray-700 font-semibold">Eco Points</p>
            <p className="text-sm text-gray-500 mt-1">Keep contributing!</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-amber-600 font-medium">⭐ Next reward at 100 points</p>
            </div>
          </div>

          {/* Level Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-blue-700 mb-2">1</div>
            <p className="text-gray-700 font-semibold">Current Level</p>
            <p className="text-sm text-gray-500 mt-1">Eco Beginner 🌱</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <p className="text-xs text-blue-600 font-medium mt-2">0/50 XP to Level 2</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* User Profile - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border-t-4 border-green-600">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Firebase Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Account Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Email Address</p>
                    <p className="text-gray-800 break-all">{userData?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Verification Status</p>
                    <div className="flex items-center mt-1">
                      {userData?.emailVerified ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Verified
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                          ⚠️ Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">User ID</p>
                    <p className="text-xs text-gray-500 font-mono bg-white p-2 rounded mt-1 break-all">
                      {userData?._id?.substring(0, 20)}...
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  Activity Stats
                </h3>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
                    </div>
                  </div>
                ) : userData ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Member Since</p>
                      <p className="text-gray-800">
                        {new Date(userData.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Last Active</p>
                      <p className="text-gray-800">
                        {new Date(userData.lastLogin).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Sessions</p>
                      <p className="text-gray-800 font-bold text-lg">1</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No activity data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-amber-600">
            <div className="flex items-center mb-6">
              <div className="bg-amber-100 p-2 rounded-lg mr-3">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center group">
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Start Detection
              </button>
              
              <button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center group">
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                View Achievements
              </button>

              <button className="w-full border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center group">
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-lg p-6 shadow-md">
          <div className="flex items-start">
            <div className="bg-green-600 p-3 rounded-full mr-4 flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-900 mb-3">💡 Tips to Get Started</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">✓</span>
                  <p className="text-green-800 text-sm font-medium">Enable camera permissions for waste detection</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">✓</span>
                  <p className="text-green-800 text-sm font-medium">Take photos of organic waste to contribute</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">✓</span>
                  <p className="text-green-800 text-sm font-medium">Earn eco points and unlock achievements</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">✓</span>
                  <p className="text-green-800 text-sm font-medium">Help train our AI for better accuracy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
          </div>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">No activity yet</p>
            <p className="text-gray-400 text-sm">Start detecting waste to see your activity here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;