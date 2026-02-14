const User = require('../models/User');
const generateToken = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = Number(process.env.EMAIL_OTP_TTL_MINUTES || 10);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.EMAIL_OTP_RESEND_COOLDOWN_SECONDS || 60);
const OTP_MAX_ATTEMPTS = Number(process.env.EMAIL_OTP_MAX_ATTEMPTS || 5);

const generateOtpCode = () => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = (10 ** OTP_LENGTH) - 1;
  return `${Math.floor(Math.random() * (max - min + 1)) + min}`;
};

const generateChallengeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

const buildChallengeToken = (userId, challengeId) => jwt.sign(
  { sub: userId, type: '2fa_challenge', challengeId },
  process.env.JWT_SECRET,
  { expiresIn: `${OTP_TTL_MINUTES}m` }
);

const sendOtpEmail = async (email, otpCode) => {
  // TODO: replace with actual email provider integration when available.
  console.info('[auth.2fa] email-otp-sent', { email, otpCode });
};

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

    const otpCode = generateOtpCode();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const challengeId = generateChallengeId();
    const challengeExpiresAt = new Date(Date.now() + (OTP_TTL_MINUTES * 60 * 1000));
    const resendAvailableAt = new Date(Date.now() + (OTP_RESEND_COOLDOWN_SECONDS * 1000));

    user.twoFactorChallenge = {
      otpHash,
      expiresAt: challengeExpiresAt,
      attempts: 0,
      challengeId,
      resendAvailableAt,
    };
    await user.save({ validateBeforeSave: false });

    await sendOtpEmail(user.email, otpCode);

    const challengeToken = buildChallengeToken(user._id.toString(), challengeId);

    console.info('[auth.login] 2fa-challenge-issued');

    res.json({
      success: true,
      requires2FA: true,
      challengeToken,
      message: 'Email OTP sent. Verify to complete login.',
    });
  } catch (error) {
    console.error('[auth.login] failed', error);
    next(error);
  }
};

/**
 * Verify email OTP for login and issue session token on success
 */
const verifyEmailOtp = async (req, res, next) => {
  try {
    const { challengeToken, otp } = req.body;

    if (!challengeToken || !otp) {
      return res.status(400).json({ success: false, error: 'challengeToken and otp are required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(challengeToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Invalid or expired challenge token' });
    }

    if (decoded.type !== '2fa_challenge' || !decoded.sub || !decoded.challengeId) {
      return res.status(401).json({ success: false, error: 'Invalid challenge token payload' });
    }

    const user = await User.findById(decoded.sub).select('+password');
    if (!user || !user.twoFactorChallenge?.otpHash) {
      return res.status(401).json({ success: false, error: 'Challenge not found' });
    }

    const challenge = user.twoFactorChallenge;

    if (challenge.challengeId !== decoded.challengeId) {
      return res.status(401).json({ success: false, error: 'Challenge mismatch' });
    }

    if (!challenge.expiresAt || challenge.expiresAt < new Date()) {
      user.twoFactorChallenge = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ success: false, error: 'Challenge expired. Please log in again.' });
    }

    if ((challenge.attempts || 0) >= OTP_MAX_ATTEMPTS) {
      user.twoFactorChallenge = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(429).json({ success: false, error: 'Maximum OTP attempts exceeded. Please log in again.' });
    }

    const isOtpValid = await bcrypt.compare(otp, challenge.otpHash);
    if (!isOtpValid) {
      user.twoFactorChallenge.attempts = (challenge.attempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ success: false, error: 'Invalid OTP' });
    }

    user.twoFactorChallenge = undefined;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      token,
      data: { _id: user._id, email: user.email, displayName: user.displayName, role: user.role },
    });
  } catch (error) {
    console.error('[auth.verify-email-otp] failed', error);
    next(error);
  }
};

/**
 * Resend email OTP for an active 2FA challenge
 */
const resendEmailOtp = async (req, res, next) => {
  try {
    const { challengeToken } = req.body;

    if (!challengeToken) {
      return res.status(400).json({ success: false, error: 'challengeToken is required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(challengeToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Invalid or expired challenge token' });
    }

    if (decoded.type !== '2fa_challenge' || !decoded.sub || !decoded.challengeId) {
      return res.status(401).json({ success: false, error: 'Invalid challenge token payload' });
    }

    const user = await User.findById(decoded.sub);
    if (!user || !user.twoFactorChallenge?.challengeId) {
      return res.status(401).json({ success: false, error: 'Challenge not found' });
    }

    const currentChallenge = user.twoFactorChallenge;
    if (currentChallenge.challengeId !== decoded.challengeId) {
      return res.status(401).json({ success: false, error: 'Challenge mismatch' });
    }

    if (currentChallenge.resendAvailableAt && currentChallenge.resendAvailableAt > new Date()) {
      const retryAfterSeconds = Math.ceil((currentChallenge.resendAvailableAt.getTime() - Date.now()) / 1000);
      return res.status(429).json({ success: false, error: `Please wait ${retryAfterSeconds}s before requesting another OTP` });
    }

    const otpCode = generateOtpCode();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const challengeId = generateChallengeId();
    const challengeExpiresAt = new Date(Date.now() + (OTP_TTL_MINUTES * 60 * 1000));
    const resendAvailableAt = new Date(Date.now() + (OTP_RESEND_COOLDOWN_SECONDS * 1000));

    user.twoFactorChallenge = {
      otpHash,
      expiresAt: challengeExpiresAt,
      attempts: 0,
      challengeId,
      resendAvailableAt,
    };
    await user.save({ validateBeforeSave: false });

    await sendOtpEmail(user.email, otpCode);

    const nextChallengeToken = buildChallengeToken(user._id.toString(), challengeId);

    res.json({
      success: true,
      requires2FA: true,
      challengeToken: nextChallengeToken,
      message: 'A new OTP has been sent to your email',
    });
  } catch (error) {
    console.error('[auth.resend-email-otp] failed', error);
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmailOtp,
  resendEmailOtp,
};
