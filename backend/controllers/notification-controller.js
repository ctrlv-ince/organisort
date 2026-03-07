const Notification = require('../models/Notification');

/**
 * Create a notification for a user (internal helper)
 */
const createNotification = async (userId, { title, body, type = 'system' }) => {
    try {
        return await Notification.create({ user: userId, title, body, type });
    } catch (error) {
        console.error('[notification] create-failed:', error.message);
        return null;
    }
};

/**
 * GET /api/notifications
 * Get paginated notifications for the logged-in user
 */
const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            Notification.find({ user: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Notification.countDocuments({ user: userId }),
        ]);

        res.json({
            success: true,
            data: notifications,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const count = await Notification.countDocuments({ user: userId, read: false });
        res.json({ success: true, count });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: userId },
            { read: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }
        res.json({ success: true, data: notification });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        await Notification.updateMany({ user: userId, read: false }, { read: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
};
