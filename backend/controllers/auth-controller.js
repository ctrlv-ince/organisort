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

    if (!email || !password) {
      console.warn('[auth.register] missing-required-fields');
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.warn('[auth.register] user-already-exists');
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
      console.info('[auth.register] success');
    } catch (createError) {
      console.error('[auth.register] create-failed', createError);
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
    console.error('[auth.register] failed', error);
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
      console.warn('[auth.login] missing-required-fields');
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Find user by email and select password field
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      console.warn('[auth.login] invalid-credentials');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Update last login time - handled by schema pre-save hook
    await user.save({ validateBeforeSave: false }); // Don't re-hash password on login

    const token = generateToken(user._id.toString());

    console.info('[auth.login] success');

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      data: { _id: user._id, email: user.email, displayName: user.displayName, role: user.role },
    });
  } catch (error) {
    console.error('[auth.login] failed', error);
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
