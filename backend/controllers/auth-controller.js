const User = require('../models/User');

/**
 * Auth Controller
 * Handles user profile and authentication-related operations
 */

/**
 * Get current user profile
 * Requires: Authentication middleware (req.user.uid)
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const { uid } = req.user;

    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync Firebase user to MongoDB
 * This endpoint is called after Firebase user creation
 */
const syncFirebaseUser = async (req, res, next) => {
  try {
    const { uid, email, displayName, photoURL, emailVerified } = req.body;

    if (!uid || !email) {
      return res.status(400).json({
        success: false,
        error: 'uid and email are required',
      });
    }

    const user = await User.findByIdAndUpdate(
      uid,
      {
        _id: uid,
        email,
        displayName: displayName || '',
        photoURL: photoURL || null,
        emailVerified: emailVerified || false,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'User synced successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * Requires: Authentication middleware
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { displayName, photoURL } = req.body;

    const user = await User.findByIdAndUpdate(
      uid,
      {
        displayName: displayName || undefined,
        photoURL: photoURL || undefined,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentUser,
  syncFirebaseUser,
  updateUserProfile,
};
