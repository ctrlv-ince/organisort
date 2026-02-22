const express = require('express');
const multer = require("multer");
const { unifiedAuth, admin } = require('../middleware/auth-middleware');
const {
  getCurrentUser,
  updateUserProfile,
  updateUserPreferences,
  getUserStats,
  getAllUsers,
  getAllUsersWithDetectionCount,
  updateUserRole,
  deactivateUser,
} = require('../controllers/user-controller');

const router = express.Router();

// Configure multer for in-memory profile image storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for avatars
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = 'Only image files are allowed!';
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

router.get('/', unifiedAuth, admin, getAllUsers);
router.get(
  '/stats/detections',
  unifiedAuth,
  getAllUsersWithDetectionCount
);

router.put('/:id/role', unifiedAuth, admin, updateUserRole);
router.put('/:id/deactivate', unifiedAuth, admin, deactivateUser);

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
 * Accepts multipart/form-data for avatar upload
 */
router.put('/profile', unifiedAuth, upload.single('avatar'), updateUserProfile);

/**
 * PUT /api/users/me/preferences
 * Update current user preferences (pushNotifications, etc)
 * 
 * Requires: Bearer token in Authorization header
 * Body: { pushNotifications?, emailUpdates?, showTutorial?, autoSaveDetections? }
 */
router.put('/me/preferences', unifiedAuth, updateUserPreferences);

/**
 * GET /api/users/stats
 * Get current user statistics and account information
 * 
 * Requires: Bearer token in Authorization header
 */
router.get('/stats', unifiedAuth, getUserStats);

module.exports = router;
