const User = require('../models/User');

/**
 * User Controller
 * Handles user-related operations
 */

/**
 * Sync user with Firebase Auth data
 * Creates a new user or updates existing user's lastLogin
 * 
 * Requires: Authentication middleware (req.user)
 * 
 * Process:
 * 1. Extract uid, email, name from Firebase decoded token
 * 2. Check if user exists in MongoDB
 * 3. If exists, update lastLogin timestamp
 * 4. If doesn't exist, create new user document
 */
const syncUser = async (req, res, next) => {
  try {
    const { uid, email, displayName, photoURL, emailVerified } = req.body;

    // Validate required fields
    if (!uid || !email) {
      return res.status(400).json({
        success: false,
        error: 'uid and email are required',
      });
    }

    // Perform upsert: update if exists, create if doesn't
    const user = await User.findByIdAndUpdate(
      uid,
      {
        _id: uid,
        email: email.toLowerCase().trim(),
        displayName: displayName || '',
        photoURL: photoURL || null,
        emailVerified: emailVerified || false,
        lastLogin: new Date(),
        isActive: true,
      },
      {
        upsert: true, // Create if doesn't exist
        new: true,    // Return updated document
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'User synced successfully',
      data: user,
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Email already in use',
      });
    }
    next(error);
  }
};

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
 * Update user profile
 * Requires: Authentication middleware (req.user.uid)
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { displayName, photoURL } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    const user = await User.findByIdAndUpdate(
      uid,
      updateData,
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

/**
 * Get user statistics (for dashboard/admin)
 * Requires: Authentication middleware
 */
const getUserStats = async (req, res, next) => {
  try {
    const { uid } = req.user;

    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const stats = {
      uid: user._id,
      email: user.email,
      displayName: user.displayName,
      accountCreated: user.createdAt,
      lastLogin: user.lastLogin,
      daysActive: Math.floor(
        (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
      ),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  syncUser,
  getCurrentUser,
  updateUserProfile,
  getUserStats,
};
