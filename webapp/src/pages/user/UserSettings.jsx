import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InfoCard from '../../components/InfoCard';
import PageHeaderCard from '../../components/PageHeaderCard';
import { useTheme } from '../../context/ThemeContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

/**
 * UserSettings Page
 * Manage user preferences and settings
 */
const UserSettings = ({ userData }) => {
  const { theme, setTheme, presets } = useTheme();
  const [notifications, setNotifications] = useState(userData?.preferences?.pushNotifications ?? true);
  const [emailUpdates, setEmailUpdates] = useState(userData?.preferences?.emailUpdates ?? false);
  const [showTutorial, setShowTutorial] = useState(userData?.preferences?.showTutorial ?? true);
  const [autoSave, setAutoSave] = useState(userData?.preferences?.autoSaveDetections ?? true);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/me/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pushNotifications: notifications,
          emailUpdates,
          showTutorial,
          autoSaveDetections: autoSave
        })
      });

      if (!response.ok) throw new Error('Failed to save preferences');

      setMessage('Settings saved successfully!');
    } catch (error) {
      console.error(error);
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Toggle row component to avoid repetition
  const ToggleRow = ({ label, description, checked, onChange, isLast }) => (
    <div
      className="flex items-center justify-between py-4"
      style={isLast ? {} : { borderBottom: '1px solid var(--theme-border, #f0f0f0)' }}
    >
      <div>
        <p className="font-bold" style={{ color: 'var(--theme-text, #111827)' }}>{label}</p>
        <p className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className="w-12 h-7 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[22px] after:w-[22px] after:transition-all transition-colors"
          style={{
            backgroundColor: checked ? 'var(--theme-accent, #15803d)' : 'var(--theme-toggle-bg, #e5e7eb)',
          }}
        ></div>
      </label>
    </div>
  );

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
          title="Account Settings"
          subtitle="Customize your experience and manage data"
          variant="primary"
          icon={(
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        />
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-[2rem] shadow-sm font-bold"
          style={{
            background: 'var(--theme-accent-surface, #f0fdf4)',
            border: '1px solid var(--theme-accent-surface-border, #bbf7d0)',
            color: 'var(--theme-accent, #15803d)',
          }}
        >
          {message}
        </motion.div>
      )}

      {/* Dashboard Theme */}
      <motion.div variants={itemVariants}>
        <InfoCard>
          <h2 className="text-xl font-bold mb-2 tracking-tight flex items-center" style={{ color: 'var(--theme-text, #111827)' }}>
            <div className="p-2 rounded-xl mr-3" style={{ background: 'var(--theme-accent-surface, #f0fdf4)', border: '1px solid var(--theme-accent-surface-border, #bbf7d0)' }}>
              <svg className="w-5 h-5" fill="none" stroke="var(--theme-accent, #15803d)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            Dashboard Theme
          </h2>
          <p className="text-sm font-medium mb-6 ml-12" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>Choose a visual preset to personalize your dashboard experience.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.values(presets).map((preset) => {
              const isActive = theme === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setTheme(preset.id)}
                  className="relative p-4 rounded-2xl border-2 transition-all duration-200 text-left group"
                  style={{
                    borderColor: isActive ? 'var(--theme-accent, #15803d)' : 'var(--theme-border, #f0f0f0)',
                    boxShadow: isActive ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none',
                    background: 'var(--theme-card, #ffffff)',
                  }}
                >
                  {/* Active checkmark */}
                  {isActive && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'var(--theme-accent, #15803d)' }}>
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* Color swatches */}
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-8 h-8 rounded-lg" style={{ background: preset.preview.bg, border: '1px solid var(--theme-border, #f0f0f0)' }} title="Background" />
                    <div className="w-8 h-8 rounded-lg" style={{ background: preset.preview.sidebar, border: '1px solid var(--theme-border, #f0f0f0)' }} title="Sidebar" />
                    <div className="w-8 h-8 rounded-lg" style={{ background: preset.preview.accent, border: '1px solid var(--theme-border, #f0f0f0)' }} title="Accent" />
                    <div className="w-8 h-8 rounded-lg" style={{ background: preset.preview.card, border: '1px solid var(--theme-border, #f0f0f0)' }} title="Card" />
                  </div>

                  {/* Name & description */}
                  <p className="font-bold text-sm tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>{preset.name}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>{preset.description}</p>
                </button>
              );
            })}
          </div>
        </InfoCard>
      </motion.div>

      {/* Preferences Section */}
      <motion.div variants={itemVariants}>
        <InfoCard>
          <h2 className="text-xl font-bold mb-6 tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>System Preferences</h2>
          <div className="space-y-2">
            <ToggleRow
              label="Push Notifications"
              description="Receive real-time notifications about your scan activity"
              checked={notifications}
              onChange={setNotifications}
            />
            <ToggleRow
              label="Email Updates"
              description="Receive weekly summary emails outlining your impact"
              checked={emailUpdates}
              onChange={setEmailUpdates}
            />
            <ToggleRow
              label="Show Feature Tutorials"
              description="Display helpful overlay tips for newly introduced features"
              checked={showTutorial}
              onChange={setShowTutorial}
            />
            <ToggleRow
              label="Auto-Save Detections"
              description="Automatically back up detection results to the cloud"
              checked={autoSave}
              onChange={setAutoSave}
              isLast
            />
          </div>

          <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--theme-border, #f0f0f0)' }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-4 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
              style={{
                background: isSaving ? 'var(--theme-text-muted, #9ca3af)' : 'var(--theme-accent, #15803d)',
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              {isSaving ? 'Saving Configurations...' : 'Save System Preferences'}
            </button>
          </div>
        </InfoCard>
      </motion.div>

      {/* Privacy Section */}
      <motion.div variants={itemVariants}>
        <InfoCard>
          <h2 className="text-xl font-bold mb-6 tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>Privacy & Data Management</h2>
          <div className="space-y-4">
            <button
              className="w-full text-left px-6 py-4 rounded-2xl transition-all flex items-center justify-between group"
              style={{
                background: 'var(--theme-input-bg, #f9fafb)',
                border: '1px solid var(--theme-border, #f0f0f0)',
              }}
            >
              <span className="font-bold" style={{ color: 'var(--theme-text, #111827)' }}>Download My Data Archive</span>
              <svg className="w-6 h-6" fill="none" stroke="var(--theme-text-muted, #9ca3af)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>

            <button className="w-full text-left px-6 py-4 border border-red-100 bg-red-50/30 rounded-2xl hover:border-red-500 hover:bg-red-50 hover:shadow-sm transition-all flex items-center justify-between group">
              <span className="font-bold text-red-600 group-hover:text-red-700">Dangerous: Delete All Account Data</span>
              <svg className="w-6 h-6 text-red-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </InfoCard>
      </motion.div>

      {/* About Section */}
      <motion.div variants={itemVariants}>
        <InfoCard>
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>System Information</h2>
              <div className="flex space-x-6 mt-3 text-sm font-medium" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>
                <p><span className="uppercase tracking-widest text-[10px] font-bold block mb-1" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Version</span> 2.1.0 Premium</p>
                <p><span className="uppercase tracking-widest text-[10px] font-bold block mb-1" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Last Updated</span> February 2026</p>
              </div>
            </div>
            <div className="mt-6 md:mt-0 flex flex-col items-end space-y-2">
              <a href="/terms" className="text-sm font-bold transition-colors" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Terms of Service</a>
              <a href="/privacy" className="text-sm font-bold transition-colors" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Privacy Policy</a>
              <a href="/help" className="text-sm font-bold transition-colors" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Help Center</a>
            </div>
          </div>
        </InfoCard>
      </motion.div>
    </motion.div>
  );
};

export default UserSettings;