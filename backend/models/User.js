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
    lastLogin: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: false, // We're managing timestamps manually
    _id: false, // Don't auto-generate MongoDB ObjectId
  }
);

/**
 * Sync user with Firebase data (upsert operation)
 * Creates new user or updates existing user with lastLogin timestamp
 */
userSchema.statics.syncUser = async function (decodedToken) {
  try {
    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const displayName = decodedToken.name || '';
    const photoURL = decodedToken.picture || null;

    const user = await this.findByIdAndUpdate(
      uid,
      {
        _id: uid,
        email,
        displayName,
        photoURL,
        emailVerified: decodedToken.email_verified || false,
        lastLogin: new Date(),
        $setOnInsert: {
          createdAt: new Date(),
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
    return user;
  } catch (error) {
    throw new Error(`Failed to sync user: ${error.message}`);
  }
};

/**
 * Create a user from Firebase token data (legacy method)
 */
userSchema.statics.createFromFirebaseToken = async function (decodedToken) {
  try {
    const user = await this.findByIdAndUpdate(
      decodedToken.uid,
      {
        _id: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
        lastLogin: new Date(),
        $setOnInsert: {
          createdAt: new Date(),
        },
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
