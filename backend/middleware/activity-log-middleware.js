const ActivityLog = require('../models/ActivityLog');

/**
 * Activity Logging Middleware
 * Automatically logs activities based on routes and actions
 */

/**
 * Extract IP address from request
 */
const getIpAddress = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         req.connection.remoteAddress || 
         'unknown';
};

/**
 * Extract metadata from request
 */
const extractMetadata = (req, statusCode = null) => {
  return {
    ip: getIpAddress(req),
    userAgent: req.headers['user-agent'] || 'unknown',
    method: req.method,
    endpoint: req.originalUrl || req.url,
    statusCode: statusCode,
  };
};

/**
 * Middleware to log successful responses
 * This should be added early in the middleware chain
 */
const logActivity = (req, res, next) => {
  // Store original send function
  const originalSend = res.send;
  const originalJson = res.json;

  // Override res.send
  res.send = function(data) {
    res.send = originalSend;
    
    // Log the activity after response
    logActivityFromResponse(req, res, data);
    
    return originalSend.call(this, data);
  };

  // Override res.json
  res.json = function(data) {
    res.json = originalJson;
    
    // Log the activity after response
    logActivityFromResponse(req, res, data);
    
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Log activity based on the response
 */
const logActivityFromResponse = async (req, res, data) => {
  try {
    const statusCode = res.statusCode;
    const metadata = extractMetadata(req, statusCode);
    const user = req.user || null;

    // Determine what to log based on the route
    const path = req.route?.path || req.originalUrl;
    const method = req.method;

    // Skip logging for certain routes (like health checks, static assets)
    if (path.includes('/health') || path.includes('/static')) {
      return;
    }

    // Authentication events
    if (path.includes('/auth/register') && method === 'POST' && statusCode === 201) {
      await ActivityLog.logAuth('auth.register', { email: req.body?.email }, metadata, {
        displayName: req.body?.displayName,
      });
    }

    if (path.includes('/auth/login') && method === 'POST') {
      if (statusCode === 200) {
        await ActivityLog.logAuth('auth.login', { email: req.body?.email }, metadata);
      } else if (statusCode === 401) {
        await ActivityLog.logAuth('auth.login_failed', { email: req.body?.email }, metadata);
      }
    }

    if (path.includes('/auth/logout') && method === 'POST' && statusCode === 200) {
      await ActivityLog.logAuth('auth.logout', user, metadata);
    }

    // Detection events
    if (path.includes('/detections/analyze') && method === 'POST' && statusCode === 200) {
      const detectionId = data?.detection?._id || data?._id || 'unknown';
      await ActivityLog.logDetection('detection.created', user, detectionId, metadata, {
        wasteType: data?.summary?.wasteType,
        category: data?.summary?.category,
      });
    }

    if (path.includes('/detections/') && method === 'DELETE' && statusCode === 200) {
      const detectionId = req.params?.id;
      await ActivityLog.logDetection('detection.deleted', user, detectionId, metadata);
    }

    // Admin actions
    if (path.includes('/users/') && path.includes('/role') && method === 'PUT' && statusCode === 200) {
      const targetUserId = req.params?.id;
      const newRole = req.body?.role;
      await ActivityLog.logAdminAction(
        'admin.user_role_changed',
        user,
        { _id: targetUserId },
        metadata,
        { newRole }
      );
    }

    if (path.includes('/users/') && method === 'DELETE' && statusCode === 200) {
      const targetUserId = req.params?.id;
      await ActivityLog.logAdminAction(
        'admin.user_deleted',
        user,
        { _id: targetUserId },
        metadata
      );
    }

    // Unauthorized/Forbidden access attempts
    if (statusCode === 401) {
      await ActivityLog.createLog({
        eventType: 'api.unauthorized',
        user: user?._id || null,
        userEmail: user?.email || null,
        action: 'Unauthorized access attempt',
        metadata,
        severity: 'warning',
        status: 'failure',
      });
    }

    if (statusCode === 403) {
      await ActivityLog.createLog({
        eventType: 'api.forbidden',
        user: user?._id || null,
        userEmail: user?.email || null,
        action: 'Forbidden access attempt',
        metadata,
        severity: 'warning',
        status: 'failure',
      });
    }

  } catch (error) {
    // Don't let logging errors break the application
    console.error('Activity logging failed:', error);
  }
};

/**
 * Middleware to log errors
 * This should be added to the error handling middleware chain
 */
const logErrorActivity = async (err, req, res, next) => {
  try {
    const metadata = extractMetadata(req, res.statusCode || 500);
    const user = req.user || null;

    // Determine error type
    let eventType = 'api.error';
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      eventType = 'database.query_error';
    }

    await ActivityLog.logError(eventType, err, user, metadata);
  } catch (logError) {
    console.error('Failed to log error activity:', logError);
  }

  // Pass error to next error handler
  next(err);
};

/**
 * Manual logging helper functions
 * Use these in controllers for more specific logging
 */
const manualLog = {
  /**
   * Log a detection event
   */
  detection: async (eventType, user, detectionId, details = {}) => {
    await ActivityLog.logDetection(eventType, user, detectionId, {}, details);
  },

  /**
   * Log an admin action
   */
  adminAction: async (eventType, admin, targetUser, details = {}) => {
    await ActivityLog.logAdminAction(eventType, admin, targetUser, {}, details);
  },

  /**
   * Log an authentication event
   */
  auth: async (eventType, user, details = {}) => {
    await ActivityLog.logAuth(eventType, user, {}, details);
  },

  /**
   * Log a system event
   */
  system: async (action, details = {}, severity = 'info') => {
    await ActivityLog.createLog({
      eventType: 'system.error',
      action,
      details,
      severity,
      status: 'success',
    });
  },

  /**
   * Log an error
   */
  error: async (error, user = null, details = {}) => {
    await ActivityLog.logError('api.error', error, user, {});
  },
};

module.exports = {
  logActivity,
  logErrorActivity,
  manualLog,
};