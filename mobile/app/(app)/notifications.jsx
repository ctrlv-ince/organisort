import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import apiClient from '@/src/utils/apiClient';

const ICON_MAP = {
    account: { name: 'person-circle', color: '#3b82f6' },
    digest: { name: 'bar-chart', color: '#10b981' },
    tip: { name: 'sparkles', color: '#8b5cf6' },
    system: { name: 'information-circle', color: '#f59e0b' },
};

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
        try {
            const response = await apiClient.get('/api/notifications', {
                params: { page: pageNum, limit: 20 },
            });
            if (response.data.success) {
                const data = response.data.data || [];
                setNotifications(prev => append ? [...prev, ...data] : data);
                setHasMore(pageNum < response.data.pagination.pages);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchNotifications(1, false);
    };

    const loadMore = () => {
        if (hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchNotifications(nextPage, true);
        }
    };

    const markAsRead = async (id) => {
        try {
            await apiClient.put(`/api/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiClient.put('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getTimeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days}d ago`;
        return new Date(dateStr).toLocaleDateString();
    };

    const renderItem = ({ item }) => {
        const icon = ICON_MAP[item.type] || ICON_MAP.system;
        return (
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    { backgroundColor: item.read ? colors.bg : (colors.cardHover || '#f0f9ff') },
                    { borderBottomColor: colors.border || '#f4f4f5' },
                ]}
                onPress={() => !item.read && markAsRead(item._id)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
                    <Ionicons name={icon.name} size={24} color={icon.color} />
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        {!item.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.body}
                    </Text>
                    <Text style={[styles.time, { color: colors.textSecondary }]}>
                        {getTimeAgo(item.createdAt)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
                <ActivityIndicator size="large" color={colors.text} style={{ marginTop: 40 }} />
            </SafeAreaView>
        );
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
                        <Text style={styles.markAllText}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                contentContainerStyle={notifications.length === 0 && styles.emptyContainer}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications yet</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                            You'll see updates here when something important happens.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        paddingTop: 20,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    markAllButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#ede9fe',
    },
    markAllText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#7c3aed',
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 20,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        gap: 14,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    textContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '800',
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#7c3aed',
    },
    body: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
        marginBottom: 6,
    },
    time: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
});
