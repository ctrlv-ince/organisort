const User = require('../models/User');
const generateToken = require('../utils/jwt');

/**
 * Auth Controller
 * Handles user profile and authentication-related operations
 */

/**
 * Register a new user with email and password
 */
const registerUser = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Log request body for debugging
    console.log('Registration request body:', req.body);
    console.log('Email validation passed:', email);
    console.log('Password length:', password?.length);

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'User with that email already exists' });
    }

    // Create new user (password will be hashed by pre-save hook in User model)
    // Let MongoDB generate the _id automatically for email/password users
    try {
      user = await User.create({
        email,
        password,
        displayName: displayName || '',
      });
      console.log('User created successfully:', user._id);
    } catch (createError) {
      console.error('User creation error:', createError);
      throw createError;
    }

    // The _id is already generated and assigned by MongoDB, just convert to string
    user._id = user._id.toString();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: { _id: user._id, email: user.email, displayName: user.displayName, role: user.role },
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

/**
 * Login user with email and password
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Find user by email and select password field
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Update last login time - handled by schema pre-save hook
    await user.save({ validateBeforeSave: false }); // Don't re-hash password on login

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      data: { _id: user._id, email: user.email, displayName: user.displayName, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * Requires: Authentication middleware (req.user._id)
 */
const getCurrentUser = async (req, res, next) => {
  try {
    // For both Firebase and direct email/password users, req.user._id will be the identifier
    const _id = req.user._id;

    const user = await User.findById(_id);

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
 * This endpoint is called after Firebase user creation or sign-in (e.g., Google OAuth)
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

    // Check if a user with this email already exists but has no Firebase UID (_id)
    // This could happen if they registered with email/password and then try Google sign-in.
    let user = await User.findOne({ email, _id: { $exists: false } });

    if (user) {
      // If an email/password user exists, link their Firebase UID to their existing account
      user._id = uid;
      user.displayName = displayName || user.displayName;
      user.photoURL = photoURL || user.photoURL;
      user.emailVerified = emailVerified || user.emailVerified;
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    } else {
      // Otherwise, find or create the user based on Firebase UID
      user = await User.findByIdAndUpdate(
        uid,
        {
          _id: uid,
          email,
          displayName: displayName || '',
          photoURL: photoURL || null,
          emailVerified: emailVerified || false,
          lastLogin: new Date(),
          $setOnInsert: {
            createdAt: new Date(),
            isActive: true,
          },
        },
        { upsert: true, new: true }
      );
    }

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
    const _id = req.user._id;
    const { displayName, photoURL } = req.body;

    const user = await User.findByIdAndUpdate(
      _id,
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
  registerUser,
  loginUser,
  getCurrentUser,
  syncFirebaseUser,
  updateUserProfile,
};
