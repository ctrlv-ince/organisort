import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import InfoCard from '../../components/InfoCard';
import PageHeaderCard from '../../components/PageHeaderCard';
import PrimaryButton from '../../components/PrimaryButton';
import { semanticColorClasses } from '../../components/uiTheme';
import { useAuth } from '../../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

/**
 * UserProfile Page
 * View and edit user profile information
 */
const UserProfile = ({ userData, setUserData }) => {
  const { updateUserSession } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
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

      let fetchConfig = {};

      if (avatarFile) {
        const formData = new FormData();
        formData.append('displayName', trimmedDisplayName);
        formData.append('avatar', avatarFile);

        fetchConfig = {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        };
      } else {
        fetchConfig = {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ displayName: trimmedDisplayName }),
        };
      }

      const response = await fetch(`${API_URL}/api/users/profile`, fetchConfig);

      if (response.ok) {
        const data = await response.json();
        setUserData(data.data);
        updateUserSession(data.data);
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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <motion.div
      className="p-6 md:p-10 max-w-5xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeaderCard
          title="My Profile"
          subtitle="Manage your account information securely."
          variant="primary"
          icon={(
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        />
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div variants={itemVariants} className={`rounded-[2rem] p-6 shadow-sm border ${message.includes('success') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="flex items-center font-bold">
            {message.includes('success') ? '✅ ' : '❌ '} {message}
          </div>
        </motion.div>
      )}

      {/* Profile Card */}
      <motion.div variants={itemVariants}>
        <InfoCard className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-8 mb-10">
            <div className="relative group mx-auto md:mx-0 mb-6 md:mb-0">
              {avatarPreview || userData?.photoURL ? (
                <img src={avatarPreview || userData.photoURL} alt="Profile" className="w-32 h-32 rounded-3xl border border-gray-200 object-cover shadow-sm bg-slate-50" />
              ) : (
                <div className="w-32 h-32 bg-green-50 border-2 border-green-100 rounded-3xl flex items-center justify-center text-5xl font-extrabold text-green-600 shadow-sm">
                  {userData?.displayName?.[0] || userData?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}

              {editing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-3xl opacity-0 hover:opacity-100 cursor-pointer transition-opacity z-10 backdrop-blur-sm">
                  <div className="flex flex-col items-center">
                    <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wider">Upload</span>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={!editing}
                  />
                </label>
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>{userData?.displayName || 'User'}</h2>
              <p className="font-medium" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>{userData?.email}</p>
              <span className={`inline-block mt-3 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${userData?.role === 'admin' ? semanticColorClasses.danger.badge : semanticColorClasses.success.badge}`}>
                {userData?.role || 'user'}
              </span>
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Display Name</label>
              <input
                type="text"
                value={editing ? displayName : (userData?.displayName || '')}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!editing}
                className="w-full px-5 py-4 rounded-2xl transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'var(--theme-input-bg, #f9fafb)', border: '1px solid var(--theme-border, #e5e7eb)', color: 'var(--theme-text, #111827)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Account Email</label>
              <input
                type="email"
                value={userData?.email || ''}
                disabled
                className="w-full px-5 py-4 rounded-2xl font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'var(--theme-input-bg, #f9fafb)', border: '1px solid var(--theme-border, #e5e7eb)', color: 'var(--theme-text-secondary, #6b7280)' }}
              />
              <p className="text-xs font-semibold mt-2 ml-1" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Email addresses cannot be modified for security.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-4" style={{ borderTop: '1px solid var(--theme-border, #f0f0f0)' }}>
              {editing ? (
                <>
                  <PrimaryButton onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </PrimaryButton>
                  <PrimaryButton
                    variant="subtle"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setEditing(false);
                      setDisplayName(userData?.displayName || '');
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                  >
                    Cancel Edit
                  </PrimaryButton>
                </>
              ) : (
                <PrimaryButton onClick={() => setEditing(true)} className="w-full sm:w-auto">
                  Edit Profile
                </PrimaryButton>
              )}
            </div>
          </div>
        </InfoCard>
      </motion.div>

      {/* Account Stats */}
      <motion.div variants={itemVariants}>
        <InfoCard>
          <h2 className="text-xl font-bold mb-6 tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>Account Information</h2>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4" style={{ borderBottom: '1px solid var(--theme-border, #f0f0f0)' }}>
              <span className="font-bold uppercase tracking-wider text-xs mb-1 sm:mb-0" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Member Since</span>
              <span className="font-bold text-base" style={{ color: 'var(--theme-text, #111827)' }}>
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4" style={{ borderBottom: '1px solid var(--theme-border, #f0f0f0)' }}>
              <span className="font-bold uppercase tracking-wider text-xs mb-1 sm:mb-0" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Last Login Activity</span>
              <span className="font-semibold text-sm" style={{ color: 'var(--theme-text, #111827)' }}>
                {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4">
              <span className="font-bold uppercase tracking-wider text-xs mb-1 sm:mb-0" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Network Status</span>
              <span className="text-green-600 font-bold flex items-center bg-green-50 px-3 py-1 rounded-full text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
                Active Connection
              </span>
            </div>
          </div>
        </InfoCard>
      </motion.div>
    </motion.div>
  );
};

export default UserProfile;
