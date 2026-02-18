const express = require("express");
const { protect } = require("../middleware/auth-middleware");
const {
  registerUser,
  loginUser,
  verifyEmailOtp,
  resendEmailOtp,
  forgotPassword,
  resetPassword,
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
 * POST /api/auth/verify-email-otp
 * Verify email OTP and issue auth token
 * Public route (no authentication required)
 */
router.post("/verify-email-otp", verifyEmailOtp);

/**
 * POST /api/auth/resend-email-otp
 * Resend email OTP for active 2FA challenge
 * Public route (no authentication required)
 */
router.post("/resend-email-otp", resendEmailOtp);

/**
 * POST /api/auth/forgot-password
 * Send password reset instructions
 */
router.post("/forgot-password", forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset user password with a valid reset token
 */
router.post("/reset-password", resetPassword);

/**
 * POST /api/auth/logout
 * Logout user (clear token)
 * Requires: Bearer token (either Firebase or custom JWT)
 */
router.post('/logout', protect, async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
