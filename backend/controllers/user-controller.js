const User = require('../models/User');

/**
 * User Controller
 * Handles user-related operations
 */

/**
 * Get current user profile and sync Firebase users.
 * 
 * This function handles both Firebase and non-Firebase users.
 * If the user is authenticated via Firebase, it performs an "upsert" operation:
 *  - If the user exists, it updates their `lastLogin` time.
 *  - If the user does not exist, it creates a new user document in MongoDB.
 * 
 * If the user is authenticated via custom JWT, it retrieves the user's
 * profile from the database.
 * 
 * Requires: `unifiedAuth` middleware (attaches `req.user`).
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const { isFirebase, ...userData } = req.user;

    let user;
    if (isFirebase) {
      // For Firebase users, perform an upsert
      user = await User.findOneAndUpdate(
        { _id: userData.uid },
        {
          $set: {
            email: userData.email,
            displayName: userData.displayName || '',
            photoURL: userData.photoURL || null,
            emailVerified: userData.emailVerified || false,
            lastLogin: new Date(),
          },
          $setOnInsert: {
            _id: userData.uid,
            createdAt: new Date(),
          },
        },
        { upsert: true, new: true, runValidators: true }
      );
    } else {
      // For non-Firebase users, just find the user
      user = await User.findById(userData._id);
    }

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
 * Requires: Authentication middleware (req.user)
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const { isFirebase, ...userData } = req.user;
    const { displayName, photoURL } = req.body;

    const userId = isFirebase ? userData.uid : userData._id;

    // Build update object with only provided fields
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    const user = await User.findByIdAndUpdate(
      userId,
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
    const { isFirebase, ...userData } = req.user;
    const userId = isFirebase ? userData.uid : userData._id;

    const user = await User.findById(userId);

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
  getCurrentUser,
  updateUserProfile,
  getUserStats,
};
