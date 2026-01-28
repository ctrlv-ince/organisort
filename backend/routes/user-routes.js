const express = require('express');
const { verifyFirebaseToken } = require('../middleware/auth-middleware');
const {
  syncUser,
  getCurrentUser,
  updateUserProfile,
  getUserStats,
} = require('../controllers/user-controller');

const router = express.Router();

/**
 * POST /api/users/sync
 * Sync Firebase user to MongoDB (upsert operation)
 * 
 * Called immediately after Firebase login on client
 * Updates lastLogin timestamp if user exists
 * Creates new document if user doesn't exist
 * 
 * Requires: Bearer token in Authorization header
 */
router.post('/sync', verifyFirebaseToken, syncUser);

/**
 * GET /api/users/me
 * Get current authenticated user profile
 * 
 * Requires: Bearer token in Authorization header
 */
router.get('/me', verifyFirebaseToken, getCurrentUser);

/**
 * PUT /api/users/profile
 * Update current user profile (displayName, photoURL)
 * 
 * Requires: Bearer token in Authorization header
 * Body: { displayName?, photoURL? }
 */
router.put('/profile', verifyFirebaseToken, updateUserProfile);

/**
 * GET /api/users/stats
 * Get current user statistics and account information
 * 
 * Requires: Bearer token in Authorization header
 */
router.get('/stats', verifyFirebaseToken, getUserStats);

module.exports = router;
