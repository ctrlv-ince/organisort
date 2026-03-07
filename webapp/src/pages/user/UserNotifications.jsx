import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import PageHeaderCard from '../../components/PageHeaderCard';
import { useTheme } from '../../context/ThemeContext';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

const UserNotifications = () => {
    const { colors } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchNotifications = useCallback(async (pageNum = 1) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/notifications?page=${pageNum}&limit=20`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                if (pageNum === 1) {
                    setNotifications(data.data);
                } else {
                    setNotifications(prev => [...prev, ...data.data]);
                }
                setHasMore(data.data.length === 20);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/notifications/read-all`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const typeIcons = {
        digest: '📊',
        account: '👤',
        tip: '💡',
        system: '🔔',
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diff = (now - d) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            <PageHeaderCard
                icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                }
                title="Notifications"
                description={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            />

            {/* Actions */}
            {unreadCount > 0 && (
                <motion.div variants={itemVariants} initial="hidden" animate="show" className="mb-6">
                    <button
                        onClick={markAllRead}
                        className="text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                        style={{
                            background: 'var(--theme-accent-surface)',
                            color: 'var(--theme-accent)',
                            border: '1px solid var(--theme-accent-surface-border)',
                        }}
                    >
                        Mark all as read
                    </button>
                </motion.div>
            )}

            {/* Notification List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 rounded-2xl skeleton-shimmer" style={{ background: 'var(--theme-card)' }} />
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    className="text-center py-16 rounded-3xl"
                    style={{ background: 'var(--theme-card)', border: '1px solid var(--theme-card-border)' }}
                >
                    <span className="text-5xl mb-4 block">🔕</span>
                    <p className="font-semibold text-lg" style={{ color: 'var(--theme-text)' }}>No notifications yet</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                        You'll see updates about your account and activity here
                    </p>
                </motion.div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-2">
                    {notifications.map((notification) => (
                        <motion.div
                            key={notification._id}
                            variants={itemVariants}
                            className="flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
                            style={{
                                background: notification.read ? 'var(--theme-card)' : 'var(--theme-accent-surface)',
                                border: `1px solid ${notification.read ? 'var(--theme-card-border)' : 'var(--theme-accent-surface-border)'}`,
                            }}
                            onClick={() => !notification.read && markAsRead(notification._id)}
                        >
                            <span className="text-2xl mt-0.5">{typeIcons[notification.type] || '🔔'}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h3
                                        className="text-sm font-bold truncate"
                                        style={{ color: 'var(--theme-text)' }}
                                    >
                                        {notification.title}
                                        {!notification.read && (
                                            <span
                                                className="inline-block w-2 h-2 rounded-full ml-2"
                                                style={{ background: 'var(--theme-accent)', verticalAlign: 'middle' }}
                                            />
                                        )}
                                    </h3>
                                    <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--theme-text-muted)' }}>
                                        {formatTime(notification.createdAt)}
                                    </span>
                                </div>
                                <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                                    {notification.body}
                                </p>
                            </div>
                        </motion.div>
                    ))}

                    {hasMore && (
                        <button
                            onClick={() => {
                                const next = page + 1;
                                setPage(next);
                                fetchNotifications(next);
                            }}
                            className="w-full py-3 text-sm font-semibold rounded-2xl transition-all"
                            style={{
                                color: 'var(--theme-accent)',
                                background: 'var(--theme-card)',
                                border: '1px solid var(--theme-card-border)',
                            }}
                        >
                            Load more
                        </button>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default UserNotifications;
