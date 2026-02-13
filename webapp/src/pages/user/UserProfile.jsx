import React, { useEffect, useState } from 'react';
import InfoCard from '../../components/InfoCard';
import PageHeaderCard from '../../components/PageHeaderCard';
import PrimaryButton from '../../components/PrimaryButton';
import { semanticColorClasses } from '../../components/uiTheme';

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
      <PageHeaderCard
        title="My Profile"
        subtitle="Manage your account information"
        variant="primary"
        icon={(
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      />

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 ${message.includes('success') ? semanticColorClasses.success.surface : semanticColorClasses.danger.surface}`}>
          {message}
        </div>
      )}

      {/* Profile Card */}
      <InfoCard>
        <div className="flex items-center space-x-6 mb-6">
          {userData?.photoURL ? (
            <img src={userData.photoURL} alt="Profile" className="w-24 h-24 rounded-full border-4 border-primary/25" />
          ) : (
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl font-bold text-white">
              {userData?.displayName?.[0] || userData?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{userData?.displayName || 'User'}</h2>
            <p className="text-gray-600">{userData?.email}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${userData?.role === 'admin' ? semanticColorClasses.danger.badge : semanticColorClasses.info.badge}`}>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/40 disabled:bg-gray-100"
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
                <PrimaryButton onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </PrimaryButton>
                <PrimaryButton
                  variant="subtle"
                  onClick={() => {
                    setEditing(false);
                    setDisplayName(userData?.displayName || '');
                  }}
                >
                  Cancel
                </PrimaryButton>
              </>
            ) : (
              <PrimaryButton onClick={() => setEditing(true)}>
                Edit Profile
              </PrimaryButton>
            )}
          </div>
        </div>
      </InfoCard>

      {/* Account Stats */}
      <InfoCard title="Account Information" titleClassName="text-xl">
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
            <span className="text-primary font-semibold flex items-center">
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              Active
            </span>
          </div>
        </div>
      </InfoCard>
    </div>
  );
};

export default UserProfile;
