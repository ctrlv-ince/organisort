const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Import bcryptjs

/**
 * User Schema
 * _id can be a Firebase UID or a MongoDB generated ObjectId.
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, 
    },
    displayName: {
      type: String,
      default: "",
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
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    twoFactorChallenge: {
      otpHash: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      attempts: {
        type: Number,
        default: 0,
      },
      challengeId: {
        type: String,
        default: null,
      },
      resendAvailableAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: false, // We're managing timestamps manually
    // For email/password users, MongoDB will auto-generate _id
    // For Firebase users, we'll set _id to the Firebase UID manually
  }
);

// Hash password before saving if it exists and is modified
userSchema.pre("save", async function (next) {
  // Only hash the password if it's being modified (or is new) and actually exists
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (hashError) {
    console.error('[auth.password-hash] failed', hashError);
    next(hashError);
  }
});

// Method to compare entered password with hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  // If the user doesn't have a password field (e.g., Google user), it won't match
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
