import React, { useState, useEffect } from 'react';
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

const ToggleSwitch = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div
            className="w-12 h-7 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border after:rounded-full after:h-[22px] after:w-[22px] after:transition-all transition-colors"
            style={{
                backgroundColor: checked
                    ? 'var(--theme-toggle-active, #15803d)'
                    : 'var(--theme-toggle-bg, #e5e7eb)',
                borderColor: checked
                    ? 'var(--theme-toggle-active, #15803d)'
                    : 'var(--theme-toggle-bg, #e5e7eb)',
            }}
        ></div>
    </label>
);

/**
 * AdminSettings Page
 * System-level configuration for administrators
 */
const AdminSettings = ({ userData }) => {
    const { theme, setTheme, presets } = useTheme();
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

    /* ---- shared inline-style helpers ---- */
    const textPrimary = { color: 'var(--theme-text, #111827)' };
    const textSecondary = { color: 'var(--theme-text-secondary, #6b7280)' };
    const textMuted = { color: 'var(--theme-text-muted, #9ca3af)' };
    const borderTheme = { borderColor: 'var(--theme-border, #f0f0f0)' };
    const inputBg = {
        backgroundColor: 'var(--theme-input-bg, #f9fafb)',
        borderColor: 'var(--theme-border, #e5e7eb)',
        color: 'var(--theme-text, #111827)',
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
                <motion.div variants={itemVariants} className="p-6 rounded-[2rem] shadow-sm font-bold"
                    style={message.includes('success')
                        ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#16a34a' }
                        : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }
                    }>
                    {message}
                </motion.div>
            )}

            {/* Dashboard Theme */}
            <motion.div variants={itemVariants}>
                <InfoCard>
                    <h2 className="text-xl font-bold mb-2 tracking-tight flex items-center" style={textPrimary}>
                        <div className="p-2 rounded-xl mr-3" style={{ background: 'var(--theme-accent-surface, #f0fdf4)', border: '1px solid var(--theme-accent-surface-border, #bbf7d0)' }}>
                            <svg className="w-5 h-5" fill="none" stroke="var(--theme-accent, #15803d)" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        </div>
                        Dashboard Theme
                    </h2>
                    <p className="text-sm font-medium mb-6 ml-12" style={textSecondary}>Choose a visual preset to personalize the admin dashboard experience.</p>

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
                                    {isActive && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'var(--theme-accent, #15803d)' }}>
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}

                                    <div className="flex gap-1.5 mb-3">
                                        <div className="w-8 h-8 rounded-lg" style={{ background: preset.preview.bg, border: '1px solid var(--theme-border, #f0f0f0)' }} title="Background" />
                                        <div className="w-8 h-8 rounded-lg" style={{ background: preset.preview.sidebar, border: '1px solid var(--theme-border, #f0f0f0)' }} title="Sidebar" />
                                        <div className="w-8 h-8 rounded-lg" style={{ background: preset.preview.accent, border: '1px solid var(--theme-border, #f0f0f0)' }} title="Accent" />
                                        <div className="w-8 h-8 rounded-lg" style={{ background: preset.preview.card, border: '1px solid var(--theme-border, #f0f0f0)' }} title="Card" />
                                    </div>

                                    <p className="font-bold text-sm tracking-tight" style={textPrimary}>{preset.name}</p>
                                    <p className="text-xs font-medium mt-0.5" style={textMuted}>{preset.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </InfoCard>
            </motion.div>

            {/* Admin Notifications */}
            <motion.div variants={itemVariants}>
                <InfoCard>
                    <h2 className="text-xl font-bold mb-2 tracking-tight flex items-center" style={textPrimary}>
                        <div className="p-2 rounded-xl mr-3" style={{ background: 'var(--theme-accent-surface)', border: '1px solid var(--theme-accent-surface-border)' }}>
                            <svg className="w-5 h-5" fill="none" stroke="var(--theme-accent)" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        Admin Notifications
                    </h2>
                    <p className="text-sm font-medium mb-6 ml-12" style={textSecondary}>Configure which platform events you want to be alerted about.</p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between py-4 border-b" style={borderTheme}>
                            <div>
                                <p className="font-bold" style={textPrimary}>New User Registrations</p>
                                <p className="text-sm font-medium" style={textSecondary}>Get notified when a new user signs up on the platform</p>
                            </div>
                            <ToggleSwitch checked={newUserAlerts} onChange={(e) => setNewUserAlerts(e.target.checked)} />
                        </div>
                        <div className="flex items-center justify-between py-4 border-b" style={borderTheme}>
                            <div>
                                <p className="font-bold" style={textPrimary}>System Error Alerts</p>
                                <p className="text-sm font-medium" style={textSecondary}>Receive critical alerts when backend services encounter failures</p>
                            </div>
                            <ToggleSwitch checked={systemErrorAlerts} onChange={(e) => setSystemErrorAlerts(e.target.checked)} />
                        </div>
                        <div className="flex items-center justify-between py-4 border-b" style={borderTheme}>
                            <div>
                                <p className="font-bold" style={textPrimary}>Weekly Admin Digest</p>
                                <p className="text-sm font-medium" style={textSecondary}>Condensed email report of key platform metrics every Monday</p>
                            </div>
                            <ToggleSwitch checked={weeklyDigest} onChange={(e) => setWeeklyDigest(e.target.checked)} />
                        </div>
                        <div className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-bold" style={textPrimary}>Detection Anomalies</p>
                                <p className="text-sm font-medium" style={textSecondary}>Flag unusual detection patterns or confidence drops across users</p>
                            </div>
                            <ToggleSwitch checked={detectionAnomalies} onChange={(e) => setDetectionAnomalies(e.target.checked)} />
                        </div>
                    </div>
                </InfoCard>
            </motion.div>

            {/* Platform Policies */}
            <motion.div variants={itemVariants}>
                <InfoCard>
                    <h2 className="text-xl font-bold mb-2 tracking-tight flex items-center" style={textPrimary}>
                        <div className="bg-purple-50 p-2 rounded-xl mr-3 border border-purple-100">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        Platform Policies
                    </h2>
                    <p className="text-sm font-medium mb-6 ml-12" style={textSecondary}>Control how users interact with the registration and onboarding flow.</p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between py-4 border-b" style={borderTheme}>
                            <div>
                                <p className="font-bold" style={textPrimary}>Auto-Approve New Users</p>
                                <p className="text-sm font-medium" style={textSecondary}>Automatically activate accounts upon registration</p>
                            </div>
                            <ToggleSwitch checked={autoApproveUsers} onChange={(e) => setAutoApproveUsers(e.target.checked)} />
                        </div>
                        <div className="flex items-center justify-between py-4 border-b" style={borderTheme}>
                            <div>
                                <p className="font-bold" style={textPrimary}>Require Email Verification</p>
                                <p className="text-sm font-medium" style={textSecondary}>Users must verify their email before accessing the dashboard</p>
                            </div>
                            <ToggleSwitch checked={requireEmailVerification} onChange={(e) => setRequireEmailVerification(e.target.checked)} />
                        </div>
                        <div className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-bold" style={textPrimary}>Allow Public Registration</p>
                                <p className="text-sm font-medium" style={textSecondary}>Let anyone create an account without an invitation</p>
                            </div>
                            <ToggleSwitch checked={allowPublicRegistration} onChange={(e) => setAllowPublicRegistration(e.target.checked)} />
                        </div>
                    </div>
                </InfoCard>
            </motion.div>

            {/* Data & Retention */}
            <motion.div variants={itemVariants}>
                <InfoCard>
                    <h2 className="text-xl font-bold mb-2 tracking-tight flex items-center" style={textPrimary}>
                        <div className="bg-amber-50 p-2 rounded-xl mr-3 border border-amber-100">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        </div>
                        Data & Retention
                    </h2>
                    <p className="text-sm font-medium mb-6 ml-12" style={textSecondary}>Manage how long data is stored and set default export formats.</p>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold mb-2" style={textPrimary}>Detection Data Retention</label>
                            <select
                                value={retentionPeriod}
                                onChange={(e) => setRetentionPeriod(e.target.value)}
                                className="w-full md:w-72 px-4 py-3 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all appearance-none cursor-pointer"
                                style={inputBg}
                            >
                                <option value="90">90 Days</option>
                                <option value="180">180 Days</option>
                                <option value="365">1 Year</option>
                                <option value="730">2 Years</option>
                                <option value="0">Indefinite</option>
                            </select>
                            <p className="text-xs font-medium mt-2" style={textMuted}>How long raw detection records are preserved before archival.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2" style={textPrimary}>Default Export Format</label>
                            <div className="flex gap-3">
                                {['csv', 'json', 'xlsx'].map(fmt => (
                                    <button
                                        key={fmt}
                                        onClick={() => setExportFormat(fmt)}
                                        className="px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all"
                                        style={exportFormat === fmt
                                            ? {
                                                background: 'var(--theme-accent-surface, #f0fdf4)',
                                                borderColor: 'var(--theme-accent-surface-border, #bbf7d0)',
                                                color: 'var(--theme-accent, #15803d)',
                                            }
                                            : {
                                                background: 'var(--theme-input-bg, #f9fafb)',
                                                borderColor: 'var(--theme-border, #e5e7eb)',
                                                color: 'var(--theme-text-secondary, #6b7280)',
                                            }
                                        }
                                    >
                                        {fmt}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs font-medium mt-2" style={textMuted}>Applied globally to report downloads and data exports.</p>
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
                    <p className="text-sm font-medium mb-6 ml-12" style={textSecondary}>Irreversible administrative actions. Handle with care.</p>
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
                        <button className="w-full text-left px-6 py-4 rounded-2xl hover:shadow-sm transition-all flex items-center justify-between group" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
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
                            <p className="font-bold" style={textPrimary}>Ready to apply changes?</p>
                            <p className="text-sm font-medium" style={textSecondary}>All configuration changes require explicit confirmation.</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 py-3.5 text-white font-extrabold rounded-2xl transition-all shadow-md hover:scale-[1.01] active:scale-[0.98]"
                            style={{
                                backgroundColor: isSaving
                                    ? 'var(--theme-accent-light, #22c55e)'
                                    : 'var(--theme-accent, #15803d)',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                opacity: isSaving ? 0.7 : 1,
                            }}
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
                            <h2 className="text-xl font-bold tracking-tight" style={textPrimary}>System Information</h2>
                            <div className="flex flex-wrap gap-8 mt-3 text-sm font-medium" style={textSecondary}>
                                <p><span className="uppercase tracking-[0.15em] text-[10px] font-bold block mb-1" style={textMuted}>Version</span>1.0.0</p>
                                <p><span className="uppercase tracking-[0.15em] text-[10px] font-bold block mb-1" style={textMuted}>Environment</span> Production</p>
                                <p><span className="uppercase tracking-[0.15em] text-[10px] font-bold block mb-1" style={textMuted}>Last Deploy</span> March 2026</p>
                                <p><span className="uppercase tracking-[0.15em] text-[10px] font-bold block mb-1" style={textMuted}>AI Model</span> OrganiSort 1.0</p>
                            </div>
                        </div>
                        <div className="mt-6 md:mt-0 flex flex-col items-end space-y-2">
                            <a href="/terms" className="text-sm font-bold transition-colors" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>Terms of Service</a>
                            <a href="/privacy" className="text-sm font-bold transition-colors" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>Privacy Policy</a>
                        </div>
                    </div>
                </InfoCard>
            </motion.div>
        </motion.div>
    );
};

export default AdminSettings;
