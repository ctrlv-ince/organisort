const User = require('../models/User');
const Detection = require('../models/Detection');
const { uploadImageToCloudinary, deleteCloudinaryImage } = require('../utils/cloudinary');

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

    // Allow updating photoURL directly (useful for clearing it or from external providers)
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    // Handle optional avatar file upload
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const { secureUrl } = await uploadImageToCloudinary({
        imageData: dataURI,
        folderName: 'organisort/avatars',
      });
      updateData.photoURL = secureUrl;

      // Delete old avatar from Cloudinary if it exists
      const oldPhotoURL = isFirebase ? userData.photoURL : (await User.findById(userId))?.photoURL;
      if (oldPhotoURL && oldPhotoURL.includes('res.cloudinary.com')) {
        try {
          // Extract public ID from Cloudinary URL
          const urlParts = oldPhotoURL.split('/');
          const filename = urlParts[urlParts.length - 1];
          const publicId = `organisort/avatars/${filename.split('.')[0]}`;
          await deleteCloudinaryImage(publicId);
        } catch (deleteError) {
          console.error('Failed to delete old avatar:', deleteError);
          // Don't throw, we still want to save the new profile
        }
      }
    }

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
 * Update user preferences
 * Requires: Authentication middleware (req.user)
 */
const updateUserPreferences = async (req, res, next) => {
  try {
    const { isFirebase, ...userData } = req.user;
    const { pushNotifications, emailUpdates, showTutorial, autoSaveDetections, dashboardTheme } = req.body;

    const userId = isFirebase ? userData.uid : userData._id;

    // Use dot notation to update specific preference fields without overwriting everything
    const updateData = {};
    if (pushNotifications !== undefined) updateData['preferences.pushNotifications'] = Boolean(pushNotifications);
    if (emailUpdates !== undefined) updateData['preferences.emailUpdates'] = Boolean(emailUpdates);
    if (showTutorial !== undefined) updateData['preferences.showTutorial'] = Boolean(showTutorial);
    if (autoSaveDetections !== undefined) updateData['preferences.autoSaveDetections'] = Boolean(autoSaveDetections);
    if (dashboardTheme !== undefined) updateData['preferences.dashboardTheme'] = String(dashboardTheme);

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
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
      message: 'Preferences updated successfully',
      data: user.preferences,
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

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsersWithDetectionCount = async (req, res, next) => {
  try {
    const usersWithDetectionCount = await User.aggregate([
      {
        $lookup: {
          from: 'detections',
          localField: '_id',
          foreignField: 'user',
          as: 'detections',
        },
      },
      {
        $addFields: {
          detectionCount: { $size: '$detections' },
        },
      },
      {
        $project: {
          detections: 0,
        },
      },
    ]);

    res.json({
      success: true,
      data: usersWithDetectionCount,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { role },
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
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const { sendEmail } = require('../utils/email');
const { createNotification } = require('./notification-controller');

const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason?.trim()) {
      return res.status(400).json({ success: false, error: 'Deactivation reason is required' });
    }

    // Find and update the user to inactive
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(400).json({ success: false, error: 'User is already deactivated' });
    }

    // Don't allow deactivating another admin like this to prevent lockout
    if (user.role === 'admin' && req.user._id.toString() !== user._id.toString()) {
      // You could allow it, but usually good to demote first. Let's just allow it for now but maybe warn.
    }

    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    await createNotification(user._id, {
      title: 'Account Deactivated',
      body: `Your account has been deactivated. Reason: ${reason}`,
      type: 'account',
    });

    // Send deactivation email
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.4;color:#0f172a;max-width:480px;margin:0 auto;">
        <h2 style="margin-bottom:8px;color:#dc2626;">Account Deactivated</h2>
        <p style="margin:0 0 16px;">Hello ${user.displayName || 'User'},</p>
        <p style="margin:0 0 16px;">Your account on OrganiSort has been deactivated by an administrator for the following reason:</p>
        <div style="padding:12px 16px;background:#fee2e2;border-left:4px solid #ef4444;border-radius:4px;margin-bottom:16px;">
          <strong>${reason}</strong>
        </div>
        <p style="margin:16px 0 0;color:#334155;">If you believe this was a mistake, please contact support.</p>
      </div>
    `;

    try {
      await sendEmail({
        recipientEmail: user.email,
        subject: 'Account Deactivated - OrganiSort',
        html,
        textFallback: `Your account has been deactivated. Reason: ${reason}`,
      });
    } catch (emailError) {
      console.error('[user.deactivate] email-failed', emailError);
      // We still return success since the account WAS deactivated, but mention the email failed
      return res.json({
        success: true,
        message: 'User deactivated successfully, but failed to send notification email.',
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully and notification sent.',
    });
  } catch (error) {
    next(error);
  }
};

const reactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.isActive) {
      return res.status(400).json({ success: false, error: 'User is already active' });
    }

    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    await createNotification(user._id, {
      title: 'Account Reactivated',
      body: 'Your account has been reactivated. Welcome back!',
      type: 'account',
    });

    // Send reactivation email
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.4;color:#0f172a;max-width:480px;margin:0 auto;">
        <h2 style="margin-bottom:8px;color:#15803d;">Account Reactivated</h2>
        <p style="margin:0 0 16px;">Hello ${user.displayName || 'User'},</p>
        <p style="margin:0 0 16px;">Great news! Your OrganiSort account has been reactivated by an administrator. You can now log in and use the app as usual.</p>
        <div style="padding:12px 16px;background:#dcfce7;border-left:4px solid #22c55e;border-radius:4px;margin-bottom:16px;">
          <strong>Your account is now active.</strong>
        </div>
        <p style="margin:16px 0 0;color:#334155;">Welcome back!</p>
      </div>
    `;

    try {
      await sendEmail({
        recipientEmail: user.email,
        subject: 'Account Reactivated - OrganiSort',
        html,
        textFallback: 'Your OrganiSort account has been reactivated. You can now log in and use the app as usual.',
      });
    } catch (emailError) {
      console.error('[user.reactivate] email-failed', emailError);
      return res.json({
        success: true,
        message: 'User reactivated successfully, but failed to send notification email.',
      });
    }

    res.json({
      success: true,
      message: 'User reactivated successfully and notification sent.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentUser,
  updateUserProfile,
  updateUserPreferences,
  getUserStats,
  getAllUsers,
  getAllUsersWithDetectionCount,
  updateUserRole,
  deactivateUser,
  reactivateUser,
};
