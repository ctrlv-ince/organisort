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
      required: true,
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
    console.log('Password not modified or empty, skipping hash');
    return next();
  }
  try {
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
    next();
  } catch (hashError) {
    console.error('Password hashing failed:', hashError);
    next(hashError);
  }
});

// Pre-save hook to ensure _id is set for Firebase users
userSchema.pre("save", function (next) {
  // If this is a Firebase user (no password provided) and _id is not set,
  // set _id to the email or generate one
  if (!this.password && !this._id) {
    console.log('Setting Firebase user _id:', this.email || 'generated');
    this._id = this.email || new mongoose.Types.ObjectId();
  }
  next();
});

// Method to compare entered password with hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  // If the user doesn't have a password field (e.g., Google user), it won't match
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Sync user with Firebase data (upsert operation)
 * Creates new user or updates existing user with lastLogin timestamp
 */
userSchema.statics.syncUser = async function (decodedToken) {
  try {
    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const displayName = decodedToken.name || "";
    const photoURL = decodedToken.picture || null;

    const user = await this.findByIdAndUpdate(
      uid,
      {
        _id: uid, // Use Firebase UID as _id
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

const User = mongoose.model("User", userSchema);

module.exports = User;
