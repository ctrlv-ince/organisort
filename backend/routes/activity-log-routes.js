const express = require('express');
const router = express.Router();
const { unifiedAuth, admin } = require('../middleware/auth-middleware');
const {
  getAllLogs,
  getLogStats,
  getUserLogs,
  cleanupOldLogs,
  getLogById,
} = require('../controllers/activity-log-controller');

/**
 * @route   GET /api/activity-logs
 * @desc    Get all activity logs with pagination and filtering
 * @access  Private/Admin
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 50)
 * @query   eventType - Filter by event type
 * @query   severity - Filter by severity (info, warning, error, critical)
 * @query   userId - Filter by user ID
 * @query   startDate - Filter by start date
 * @query   endDate - Filter by end date
 */
router.get('/', unifiedAuth, admin, getAllLogs);

/**
 * @route   GET /api/activity-logs/stats
 * @desc    Get activity log statistics and analytics
 * @access  Private/Admin
 */
router.get('/stats', unifiedAuth, admin, getLogStats);

/**
 * @route   GET /api/activity-logs/user/:userId
 * @desc    Get all activity logs for a specific user
 * @access  Private/Admin
 */
router.get('/user/:userId', unifiedAuth, admin, getUserLogs);

/**
 * @route   DELETE /api/activity-logs/cleanup
 * @desc    Delete old activity logs (keeps errors)
 * @access  Private/Admin
 * @query   days - Number of days to keep (default: 90)
 */
router.delete('/cleanup', unifiedAuth, admin, cleanupOldLogs);

/**
 * @route   GET /api/activity-logs/:id
 * @desc    Get a single activity log by ID
 * @access  Private/Admin
 */
router.get('/:id', unifiedAuth, admin, getLogById);

module.exports = router;