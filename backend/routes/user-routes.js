const express = require('express');
const { unifiedAuth, admin } = require('../middleware/auth-middleware');
const {
  getCurrentUser,
  updateUserProfile,
  getUserStats,
  getAllUsers,
  getAllUsersWithDetectionCount,
} = require('../controllers/user-controller');

const router = express.Router();

router.get('/', unifiedAuth, admin, getAllUsers);
router.get(
  '/stats/detections',
  unifiedAuth,
  admin,
  getAllUsersWithDetectionCount
);

/**
 * GET /api/users/me
 * Get current authenticated user profile
 * 
 * Requires: Bearer token in Authorization header
 */
router.get('/me', unifiedAuth, getCurrentUser);

/**
 * PUT /api/users/profile
 * Update current user profile (displayName, photoURL)
 * 
 * Requires: Bearer token in Authorization header
 * Body: { displayName?, photoURL? }
 */
router.put('/profile', unifiedAuth, updateUserProfile);

/**
 * GET /api/users/stats
 * Get current user statistics and account information
 * 
 * Requires: Bearer token in Authorization header
 */
router.get('/stats', unifiedAuth, getUserStats);

module.exports = router;
