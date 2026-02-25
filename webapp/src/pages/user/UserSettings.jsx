import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InfoCard from '../../components/InfoCard';
import PageHeaderCard from '../../components/PageHeaderCard';

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
        <motion.div variants={itemVariants} className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-[2rem] shadow-sm font-bold">
          {message}
        </motion.div>
      )}

      {/* Preferences Section */}
      <motion.div variants={itemVariants}>
        <InfoCard>
          <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">System Preferences</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500 font-medium">Receive real-time notifications about your scan activity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-green-500 hover:bg-gray-300 peer-checked:hover:bg-green-600 transition-colors"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Email Updates</p>
                <p className="text-sm text-gray-500 font-medium">Receive weekly summary emails outlining your impact</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailUpdates}
                  onChange={(e) => setEmailUpdates(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-green-500 hover:bg-gray-300 peer-checked:hover:bg-green-600 transition-colors"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Show Feature Tutorials</p>
                <p className="text-sm text-gray-500 font-medium">Display helpful overlay tips for newly introduced features</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTutorial}
                  onChange={(e) => setShowTutorial(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-green-500 hover:bg-gray-300 peer-checked:hover:bg-green-600 transition-colors"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-bold text-gray-900">Auto-Save Detections</p>
                <p className="text-sm text-gray-500 font-medium">Automatically back up detection results to the cloud</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-green-500 hover:bg-gray-300 peer-checked:hover:bg-green-600 transition-colors"></div>
              </label>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-8 py-4 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 ${isSaving ? 'bg-green-400 cursor-not-allowed shadow-none' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                }`}
            >
              {isSaving ? 'Saving Configurations...' : 'Save System Preferences'}
            </button>
          </div>
        </InfoCard>
      </motion.div>

      {/* Privacy Section */}
      <motion.div variants={itemVariants}>
        <InfoCard>
          <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Privacy & Data Management</h2>
          <div className="space-y-4">
            <button className="w-full text-left px-6 py-4 border border-gray-200 bg-slate-50 rounded-2xl hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm transition-all flex items-center justify-between group">
              <span className="font-bold text-gray-900 group-hover:text-blue-700">Download My Data Archive</span>
              <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">System Information</h2>
              <div className="flex space-x-6 mt-3 text-sm text-gray-600 font-medium">
                <p><span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold block mb-1">Version</span> 2.1.0 Premium</p>
                <p><span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold block mb-1">Last Updated</span> February 2026</p>
              </div>
            </div>
            <div className="mt-6 md:mt-0 flex flex-col items-end space-y-2">
              <a href="/terms" className="text-sm font-bold text-gray-500 hover:text-green-600 transition-colors">Terms of Service</a>
              <a href="/privacy" className="text-sm font-bold text-gray-500 hover:text-green-600 transition-colors">Privacy Policy</a>
              <a href="/help" className="text-sm font-bold text-gray-500 hover:text-green-600 transition-colors">Help Center</a>
            </div>
          </div>
        </InfoCard>
      </motion.div>
    </motion.div>
  );
};

export default UserSettings;