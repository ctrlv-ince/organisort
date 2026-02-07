const mongoose = require('mongoose');

/**
 * Activity Log Schema
 * Tracks all important system events and user actions
 */
const ActivityLogSchema = new mongoose.Schema(
  {
    // Event type categorization
    eventType: {
      type: String,
      required: true,
      enum: [
        // Authentication events
        'auth.register',
        'auth.login',
        'auth.logout',
        'auth.login_failed',
        
        // Detection events
        'detection.created',
        'detection.deleted',
        'detection.viewed',
        
        // Admin actions
        'admin.user_role_changed',
        'admin.user_deleted',
        'admin.user_created',
        
        // System events
        'system.error',
        'system.startup',
        'system.shutdown',
        
        // Database operations
        'database.connection_error',
        'database.query_error',
        
        // API errors
        'api.error',
        'api.unauthorized',
        'api.forbidden',
      ],
    },

    // User who performed the action (null for system events)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // User email for easier querying
    userEmail: {
      type: String,
      default: null,
    },

    // Target user (for admin actions on other users)
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    targetUserEmail: {
      type: String,
      default: null,
    },

    // Related resource ID (e.g., detection ID, user ID)
    resourceId: {
      type: String,
      default: null,
    },

    // Resource type
    resourceType: {
      type: String,
      enum: ['user', 'detection', 'system', null],
      default: null,
    },

    // Action description
    action: {
      type: String,
      required: true,
    },

    // Additional details (flexible JSON object)
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Request metadata
    metadata: {
      ip: { type: String },
      userAgent: { type: String },
      method: { type: String },
      endpoint: { type: String },
      statusCode: { type: Number },
    },

    // Severity level
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'critical'],
      default: 'info',
    },

    // Success/failure status
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },

    // Error message (if applicable)
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster queries
ActivityLogSchema.index({ eventType: 1, createdAt: -1 });
ActivityLogSchema.index({ user: 1, createdAt: -1 });
ActivityLogSchema.index({ severity: 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 });

// Static method to create a log entry
ActivityLogSchema.statics.createLog = async function(logData) {
  try {
    const log = await this.create(logData);
    return log;
  } catch (error) {
    console.error('Failed to create activity log:', error);
    // Don't throw - we don't want logging to break the application
    return null;
  }
};

// Helper method to log authentication events
ActivityLogSchema.statics.logAuth = async function(eventType, user, metadata = {}, details = {}) {
  return this.createLog({
    eventType,
    user: user?._id || null,
    userEmail: user?.email || null,
    action: eventType.replace('auth.', '').replace('_', ' '),
    metadata,
    details,
    severity: eventType.includes('failed') ? 'warning' : 'info',
    status: eventType.includes('failed') ? 'failure' : 'success',
  });
};

// Helper method to log detection events
ActivityLogSchema.statics.logDetection = async function(eventType, user, detectionId, metadata = {}, details = {}) {
  return this.createLog({
    eventType,
    user: user?._id || null,
    userEmail: user?.email || null,
    resourceId: detectionId,
    resourceType: 'detection',
    action: `Detection ${eventType.replace('detection.', '')}`,
    metadata,
    details,
    severity: 'info',
    status: 'success',
  });
};

// Helper method to log admin actions
ActivityLogSchema.statics.logAdminAction = async function(eventType, admin, targetUser, metadata = {}, details = {}) {
  return this.createLog({
    eventType,
    user: admin?._id || null,
    userEmail: admin?.email || null,
    targetUser: targetUser?._id || null,
    targetUserEmail: targetUser?.email || null,
    resourceId: targetUser?._id?.toString() || null,
    resourceType: 'user',
    action: eventType.replace('admin.', '').replace('_', ' '),
    metadata,
    details,
    severity: eventType.includes('deleted') ? 'warning' : 'info',
    status: 'success',
  });
};

// Helper method to log errors
ActivityLogSchema.statics.logError = async function(eventType, error, user = null, metadata = {}) {
  return this.createLog({
    eventType,
    user: user?._id || null,
    userEmail: user?.email || null,
    action: 'Error occurred',
    errorMessage: error.message || error,
    metadata,
    details: {
      stack: error.stack,
      name: error.name,
    },
    severity: 'error',
    status: 'failure',
  });
};

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);