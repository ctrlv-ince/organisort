const ActivityLog = require('../models/ActivityLog');

/**
 * Activity Log Controller
 * Handles retrieval and management of activity logs
 */

/**
 * Get all activity logs (admin only)
 * @route   GET /api/activity-logs
 * @access  Private/Admin
 */
const getAllLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};

    // Filter by event type
    if (req.query.eventType) {
      filter.eventType = req.query.eventType;
    }

    // Filter by severity
    if (req.query.severity) {
      filter.severity = req.query.severity;
    }

    // Filter by user
    if (req.query.userId) {
      filter.user = req.query.userId;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Fetch logs with pagination
    const logs = await ActivityLog.find(filter)
      .populate('user', 'email displayName')
      .populate('targetUser', 'email displayName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-__v');

    // Get total count
    const total = await ActivityLog.countDocuments(filter);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get activity log statistics
 * @route   GET /api/activity-logs/stats
 * @access  Private/Admin
 */
const getLogStats = async (req, res, next) => {
  try {
    // Get date range (default: last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Total logs count
    const totalLogs = await ActivityLog.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Count by event type
    const byEventType = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Count by severity
    const bySeverity = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent errors
    const recentErrors = await ActivityLog.find({
      severity: { $in: ['error', 'critical'] },
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate('user', 'email displayName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Active users (users with most logs)
    const activeUsers = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          user: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
          lastActivity: { $max: '$createdAt' },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          email: '$userDetails.email',
          displayName: '$userDetails.displayName',
          activityCount: '$count',
          lastActivity: 1,
        },
      },
    ]);

    // Activity over time (daily counts for last 30 days)
    const activityTimeline = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalLogs,
        byEventType: byEventType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        bySeverity: bySeverity.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentErrors,
        activeUsers,
        activityTimeline,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get activity logs for a specific user
 * @route   GET /api/activity-logs/user/:userId
 * @access  Private/Admin
 */
const getUserLogs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await ActivityLog.countDocuments({ user: userId });

    res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete old logs (cleanup)
 * @route   DELETE /api/activity-logs/cleanup
 * @access  Private/Admin
 */
const cleanupOldLogs = async (req, res, next) => {
  try {
    // Delete logs older than specified days (default: 90 days)
    const daysToKeep = parseInt(req.query.days) || 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await ActivityLog.deleteMany({
      createdAt: { $lt: cutoffDate },
      severity: { $nin: ['error', 'critical'] }, // Keep errors
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} old activity logs`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single activity log by ID
 * @route   GET /api/activity-logs/:id
 * @access  Private/Admin
 */
const getLogById = async (req, res, next) => {
  try {
    const log = await ActivityLog.findById(req.params.id)
      .populate('user', 'email displayName photoURL')
      .populate('targetUser', 'email displayName photoURL');

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Activity log not found',
      });
    }

    res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLogs,
  getLogStats,
  getUserLogs,
  cleanupOldLogs,
  getLogById,
};