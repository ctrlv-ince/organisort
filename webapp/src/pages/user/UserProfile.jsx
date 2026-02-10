import React, { useEffect, useState } from 'react';

/**
 * UserProfile Page
 * View and edit user profile information
 */
const UserProfile = ({ userData, setUserData }) => {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    setDisplayName(userData?.displayName || '');
  }, [userData?.displayName]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const trimmedDisplayName = displayName.trim();
      if (!trimmedDisplayName) {
        setMessage('Display name cannot be empty');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName: trimmedDisplayName }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.data);
        setMessage('Profile updated successfully!');
        setEditing(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(errorData?.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      setMessage('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          My Profile
        </h1>
        <p className="text-purple-100">Manage your account information</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-6 mb-6">
          {userData?.photoURL ? (
            <img src={userData.photoURL} alt="Profile" className="w-24 h-24 rounded-full border-4 border-purple-200" />
          ) : (
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white">
              {userData?.displayName?.[0] || userData?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{userData?.displayName || 'User'}</h2>
            <p className="text-gray-600">{userData?.email}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${userData?.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
              {userData?.role || 'user'}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={editing ? displayName : (userData?.displayName || '')}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={!editing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={userData?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setDisplayName(userData?.displayName || '');
                  }}
                  className="px-6 py-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Member Since</span>
            <span className="text-gray-800 font-semibold">
              {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Last Login</span>
            <span className="text-gray-800 font-semibold">
              {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-600 font-medium">Account Status</span>
            <span className="text-green-600 font-semibold flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
