import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

/**
 * User Dashboard Page
 * Regular user dashboard with basic info and waste detection
 */
const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  /**
   * Fetch user profile from backend
   */
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-8 text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome, {user?.displayName || user?.email}!
          </h1>
          <p className="text-green-100">
            Start detecting waste and contributing to a cleaner environment 🌱
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Detections Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
              <p className="text-gray-600 font-medium">Waste Detections</p>
              <p className="text-sm text-gray-500 mt-1">Detections this month</p>
            </div>
          </div>

          {/* Points Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">0</div>
              <p className="text-gray-600 font-medium">Points Earned</p>
              <p className="text-sm text-gray-500 mt-1">Keep it up!</p>
            </div>
          </div>

          {/* Level Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">1</div>
              <p className="text-gray-600 font-medium">Current Level</p>
              <p className="text-sm text-gray-500 mt-1">Beginner</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Profile</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Firebase Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Account Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-800 font-medium break-all">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email Verified</p>
                  <p className="text-gray-800 font-medium">
                    {user?.emailVerified ? '✅ Yes' : '❌ No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Account Stats</h3>
              {loading ? (
                <div className="flex items-center justify-center h-24">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : userData ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Account Created</p>
                    <p className="text-gray-800 font-medium">
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Active</p>
                    <p className="text-gray-800 font-medium">
                      {new Date(userData.lastLogin).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No data found</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200">
              📷 Start Detection
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition duration-200">
              🏆 View Achievements
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips to Get Started</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>✓ Enable camera permissions for waste detection</li>
            <li>✓ Take photos of recyclable materials to contribute</li>
            <li>✓ Earn points and unlock achievements</li>
            <li>✓ Help train our AI model for better accuracy</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
