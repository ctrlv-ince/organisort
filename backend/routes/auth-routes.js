const express = require("express");
const { protect } = require("../middleware/auth-middleware");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  syncFirebaseUser,
  updateUserProfile,
} = require("../controllers/auth-controller");

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user with email and password
 * Public route (no authentication required)
 */
router.post("/register", registerUser);

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 * Public route (no authentication required)
 */
router.post("/login", loginUser);

/**
 * POST /api/auth/sync
 * Sync Firebase user to MongoDB (for Google OAuth)
 * No authentication required (called after Firebase signup/login)
 */
router.post("/sync", syncFirebaseUser);

/**
 * GET /api/auth/me
 * Get current user profile
 * Requires: Bearer token (either Firebase or custom JWT)
 */
router.get("/me", protect, getCurrentUser);

/**
 * PUT /api/auth/profile
 * Update current user profile
 * Requires: Bearer token (either Firebase or custom JWT)
 */
router.put("/profile", protect, updateUserProfile);

/**
 * POST /api/auth/logout
 * Logout user (clear token)
 * Requires: Bearer token (either Firebase or custom JWT)
 */
router.post('/logout', protect, async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
