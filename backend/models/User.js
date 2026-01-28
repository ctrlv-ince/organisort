const mongoose = require('mongoose');

/**
 * User Schema
 * _id is explicitly set to String to store Firebase UID
 * No password field - authentication handled via Firebase
 */
const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      description: 'Firebase UID',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      default: '',
    },
    photoURL: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    _id: false, // Don't auto-generate MongoDB ObjectId
  }
);

/**
 * Create a user from Firebase token data
 */
userSchema.statics.createFromFirebaseToken = async function (decodedToken) {
  try {
    const user = await this.findByIdAndUpdate(
      decodedToken.uid,
      {
        _id: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
      },
      { upsert: true, new: true }
    );
    return user;
  } catch (error) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
