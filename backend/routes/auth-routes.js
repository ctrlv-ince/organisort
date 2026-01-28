const express = require('express');
const { verifyFirebaseToken } = require('../middleware/auth-middleware');
const {
  getCurrentUser,
  syncFirebaseUser,
  updateUserProfile,
} = require('../controllers/auth-controller');

const router = express.Router();

/**
 * POST /api/auth/sync
 * Sync Firebase user to MongoDB
 * No authentication required (called after Firebase signup)
 */
router.post('/sync', syncFirebaseUser);

/**
 * GET /api/auth/me
 * Get current user profile
 * Requires: Bearer token
 */
router.get('/me', verifyFirebaseToken, getCurrentUser);

/**
 * PUT /api/auth/profile
 * Update current user profile
 * Requires: Bearer token
 */
router.put('/profile', verifyFirebaseToken, updateUserProfile);

module.exports = router;
