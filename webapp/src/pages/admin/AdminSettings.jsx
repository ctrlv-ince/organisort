import React, { useState, useEffect } from 'react';
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

const ToggleSwitch = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-green-500 hover:bg-gray-300 peer-checked:hover:bg-green-600 transition-colors"></div>
    </label>
);

/**
 * AdminSettings Page
 * System-level configuration for administrators
 */
const AdminSettings = ({ userData }) => {
    // Admin notification preferences
    const [newUserAlerts, setNewUserAlerts] = useState(true);
    const [systemErrorAlerts, setSystemErrorAlerts] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(true);
    const [detectionAnomalies, setDetectionAnomalies] = useState(false);

    // Platform policies
    const [autoApproveUsers, setAutoApproveUsers] = useState(true);
    const [requireEmailVerification, setRequireEmailVerification] = useState(false);
    const [allowPublicRegistration, setAllowPublicRegistration] = useState(true);

    // Data & retention
    const [retentionPeriod, setRetentionPeriod] = useState('365');
    const [exportFormat, setExportFormat] = useState('csv');

    // UI state
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
                    adminNotifications: {
                        newUserAlerts,
                        systemErrorAlerts,
                        weeklyDigest,
                        detectionAnomalies
                    },
                    platformPolicies: {
                        autoApproveUsers,
                        requireEmailVerification,
                        allowPublicRegistration
                    },
                    dataSettings: {
                        retentionPeriod: parseInt(retentionPeriod),
                        exportFormat
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to save');
            setMessage('Admin configuration saved successfully.');
        } catch (error) {
            console.error(error);
            setMessage('Failed to save configuration. Please try again.');
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
                    title="Admin Configuration"
                    subtitle="System-level settings, platform policies, and admin controls"
                    variant="primary"
                    icon={(
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    )}
                />
            </motion.div>

            {/* Success/Error Message */}
            {message && (
                <motion.div variants={itemVariants} className={`p-6 rounded-[2rem] shadow-sm font-bold ${message.includes('success') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                    {message}
                </motion.div>
            )}

            {/* Admin Notifications */}
            <motion.div variants={itemVariants}>
                <InfoCard>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight flex items-center">
                        <div className="bg-blue-50 p-2 rounded-xl mr-3 border border-blue-100">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        Admin Notifications
                    </h2>
                    <p className="text-sm text-gray-500 font-medium mb-6 ml-12">Configure which platform events you want to be alerted about.</p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between py-4 border-b border-gray-100">
                            <div>
                                <p className="font-bold text-gray-900">New User Registrations</p>
                                <p className="text-sm text-gray-500 font-medium">Get notified when a new user signs up on the platform</p>
                            </div>
                            <ToggleSwitch checked={newUserAlerts} onChange={(e) => setNewUserAlerts(e.target.checked)} />
                        </div>
                        <div className="flex items-center justify-between py-4 border-b border-gray-100">
                            <div>
                                <p className="font-bold text-gray-900">System Error Alerts</p>
                                <p className="text-sm text-gray-500 font-medium">Receive critical alerts when backend services encounter failures</p>
                            </div>
                            <ToggleSwitch checked={systemErrorAlerts} onChange={(e) => setSystemErrorAlerts(e.target.checked)} />
                        </div>
                        <div className="flex items-center justify-between py-4 border-b border-gray-100">
                            <div>
                                <p className="font-bold text-gray-900">Weekly Admin Digest</p>
                                <p className="text-sm text-gray-500 font-medium">Condensed email report of key platform metrics every Monday</p>
                            </div>
                            <ToggleSwitch checked={weeklyDigest} onChange={(e) => setWeeklyDigest(e.target.checked)} />
                        </div>
                        <div className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-bold text-gray-900">Detection Anomalies</p>
                                <p className="text-sm text-gray-500 font-medium">Flag unusual detection patterns or confidence drops across users</p>
                            </div>
                            <ToggleSwitch checked={detectionAnomalies} onChange={(e) => setDetectionAnomalies(e.target.checked)} />
                        </div>
                    </div>
                </InfoCard>
            </motion.div>

            {/* Platform Policies */}
            <motion.div variants={itemVariants}>
                <InfoCard>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight flex items-center">
                        <div className="bg-purple-50 p-2 rounded-xl mr-3 border border-purple-100">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        Platform Policies
                    </h2>
                    <p className="text-sm text-gray-500 font-medium mb-6 ml-12">Control how users interact with the registration and onboarding flow.</p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between py-4 border-b border-gray-100">
                            <div>
                                <p className="font-bold text-gray-900">Auto-Approve New Users</p>
                                <p className="text-sm text-gray-500 font-medium">Automatically activate accounts upon registration</p>
                            </div>
                            <ToggleSwitch checked={autoApproveUsers} onChange={(e) => setAutoApproveUsers(e.target.checked)} />
                        </div>
                        <div className="flex items-center justify-between py-4 border-b border-gray-100">
                            <div>
                                <p className="font-bold text-gray-900">Require Email Verification</p>
                                <p className="text-sm text-gray-500 font-medium">Users must verify their email before accessing the dashboard</p>
                            </div>
                            <ToggleSwitch checked={requireEmailVerification} onChange={(e) => setRequireEmailVerification(e.target.checked)} />
                        </div>
                        <div className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-bold text-gray-900">Allow Public Registration</p>
                                <p className="text-sm text-gray-500 font-medium">Let anyone create an account without an invitation</p>
                            </div>
                            <ToggleSwitch checked={allowPublicRegistration} onChange={(e) => setAllowPublicRegistration(e.target.checked)} />
                        </div>
                    </div>
                </InfoCard>
            </motion.div>

            {/* Data & Retention */}
            <motion.div variants={itemVariants}>
                <InfoCard>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight flex items-center">
                        <div className="bg-amber-50 p-2 rounded-xl mr-3 border border-amber-100">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        </div>
                        Data & Retention
                    </h2>
                    <p className="text-sm text-gray-500 font-medium mb-6 ml-12">Manage how long data is stored and set default export formats.</p>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Detection Data Retention</label>
                            <select
                                value={retentionPeriod}
                                onChange={(e) => setRetentionPeriod(e.target.value)}
                                className="w-full md:w-72 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all appearance-none cursor-pointer"
                            >
                                <option value="90">90 Days</option>
                                <option value="180">180 Days</option>
                                <option value="365">1 Year</option>
                                <option value="730">2 Years</option>
                                <option value="0">Indefinite</option>
                            </select>
                            <p className="text-xs text-gray-400 font-medium mt-2">How long raw detection records are preserved before archival.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Default Export Format</label>
                            <div className="flex gap-3">
                                {['csv', 'json', 'xlsx'].map(fmt => (
                                    <button
                                        key={fmt}
                                        onClick={() => setExportFormat(fmt)}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all ${exportFormat === fmt
                                            ? 'bg-green-50 border-green-200 text-green-700 shadow-sm'
                                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                            }`}
                                    >
                                        {fmt}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 font-medium mt-2">Applied globally to report downloads and data exports.</p>
                        </div>
                    </div>
                </InfoCard>
            </motion.div>

            {/* Danger Zone */}
            <motion.div variants={itemVariants}>
                <InfoCard>
                    <h2 className="text-xl font-bold text-red-600 mb-2 tracking-tight flex items-center">
                        <div className="bg-red-50 p-2 rounded-xl mr-3 border border-red-100">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        Danger Zone
                    </h2>
                    <p className="text-sm text-gray-500 font-medium mb-6 ml-12">Irreversible administrative actions. Handle with care.</p>
                    <div className="space-y-3">
                        <button className="w-full text-left px-6 py-4 border border-red-100 bg-red-50/30 rounded-2xl hover:border-red-400 hover:bg-red-50 hover:shadow-sm transition-all flex items-center justify-between group">
                            <div>
                                <span className="font-bold text-red-600 group-hover:text-red-700 block">Purge All Detection Records</span>
                                <span className="text-xs text-red-400 font-medium">Permanently delete every detection across all users</span>
                            </div>
                            <svg className="w-5 h-5 text-red-300 group-hover:text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        <button className="w-full text-left px-6 py-4 border border-red-100 bg-red-50/30 rounded-2xl hover:border-red-400 hover:bg-red-50 hover:shadow-sm transition-all flex items-center justify-between group">
                            <div>
                                <span className="font-bold text-red-600 group-hover:text-red-700 block">Reset All User Accounts</span>
                                <span className="text-xs text-red-400 font-medium">Deactivate all non-admin users and clear their data</span>
                            </div>
                            <svg className="w-5 h-5 text-red-300 group-hover:text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </InfoCard>
            </motion.div>

            {/* Save Button */}
            <motion.div variants={itemVariants}>
                <InfoCard>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-gray-900">Ready to apply changes?</p>
                            <p className="text-sm text-gray-500 font-medium">All configuration changes require explicit confirmation.</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-8 py-3.5 text-white font-extrabold rounded-2xl transition-all shadow-md hover:scale-[1.01] active:scale-[0.98] ${isSaving ? 'bg-green-400 cursor-not-allowed shadow-none' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'}`}
                        >
                            {isSaving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </InfoCard>
            </motion.div>

            {/* System Info */}
            <motion.div variants={itemVariants}>
                <InfoCard>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">System Information</h2>
                            <div className="flex flex-wrap gap-8 mt-3 text-sm text-gray-600 font-medium">
                                <p><span className="text-gray-400 uppercase tracking-[0.15em] text-[10px] font-bold block mb-1">Version</span> 2.1.0 Premium</p>
                                <p><span className="text-gray-400 uppercase tracking-[0.15em] text-[10px] font-bold block mb-1">Environment</span> Production</p>
                                <p><span className="text-gray-400 uppercase tracking-[0.15em] text-[10px] font-bold block mb-1">Last Deploy</span> February 2026</p>
                                <p><span className="text-gray-400 uppercase tracking-[0.15em] text-[10px] font-bold block mb-1">AI Model</span> OrganicNet v3.2</p>
                            </div>
                        </div>
                        <div className="mt-6 md:mt-0 flex flex-col items-end space-y-2">
                            <a href="/terms" className="text-sm font-bold text-gray-500 hover:text-green-600 transition-colors">Terms of Service</a>
                            <a href="/privacy" className="text-sm font-bold text-gray-500 hover:text-green-600 transition-colors">Privacy Policy</a>
                        </div>
                    </div>
                </InfoCard>
            </motion.div>
        </motion.div>
    );
};

export default AdminSettings;
