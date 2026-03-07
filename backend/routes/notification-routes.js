const express = require('express');
const { unifiedAuth } = require('../middleware/auth-middleware');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} = require('../controllers/notification-controller');

const router = express.Router();

router.get('/', unifiedAuth, getNotifications);
router.get('/unread-count', unifiedAuth, getUnreadCount);
router.put('/read-all', unifiedAuth, markAllAsRead);
router.put('/:id/read', unifiedAuth, markAsRead);

module.exports = router;
