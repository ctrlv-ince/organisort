const User = require('../models/User');
const generateToken = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');
const { uploadImageToCloudinary } = require('../utils/cloudinary');

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = Number(process.env.EMAIL_OTP_TTL_MINUTES || 10);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.EMAIL_OTP_RESEND_COOLDOWN_SECONDS || 60);
const OTP_MAX_ATTEMPTS = Number(process.env.EMAIL_OTP_MAX_ATTEMPTS || 5);
const PASSWORD_RESET_TTL_MINUTES = Number(process.env.PASSWORD_RESET_TTL_MINUTES || 30);
const WEBAPP_URL = process.env.WEBAPP_URL || 'http://localhost:5173';

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
  const text = `${otpCode} is your OrganiSort login verification code. It expires in ${OTP_TTL_MINUTES} minutes.`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.4;color:#0f172a;max-width:480px;margin:0 auto;">
      <h2 style="margin-bottom:8px;">Your OrganiSort verification code</h2>
      <p style="margin:0 0 16px;">Use the following code to complete your sign in:</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:6px;padding:12px 16px;background:#f1f5f9;border-radius:8px;display:inline-block;">
        ${otpCode}
      </div>
      <p style="margin:16px 0 0;color:#334155;">This code expires in ${OTP_TTL_MINUTES} minutes.</p>
      <p style="margin:8px 0 0;color:#64748b;font-size:12px;">If you didn't request this code, you can safely ignore this email.</p>
    </div>
  `;

  await sendEmail({
    recipientEmail: email,
    subject: 'Your OrganiSort login verification code',
    html,
    textFallback: text,
  });

  console.info('[auth.2fa] email-otp-sent', { email });
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${WEBAPP_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.4;color:#0f172a;max-width:480px;margin:0 auto;">
      <h2 style="margin-bottom:8px;">Reset your OrganiSort password</h2>
      <p style="margin:0 0 16px;">We received a request to reset your password. Click the button below to continue:</p>
      <a href="${resetLink}" style="display:inline-block;background:#15803d;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;">Reset Password</a>
      <p style="margin:16px 0 0;color:#334155;word-break:break-all;">If the button does not work, copy and paste this link into your browser:<br/>${resetLink}</p>
      <p style="margin:8px 0 0;color:#64748b;font-size:12px;">This link expires in ${PASSWORD_RESET_TTL_MINUTES} minutes.</p>
    </div>
  `;

  await sendEmail({
    recipientEmail: email,
    subject: 'Reset your OrganiSort password',
    html,
  });
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

    // Handle optional avatar upload
    let photoURL = null;
    if (req.file) {
      try {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const imageResult = await uploadImageToCloudinary({
          imageData: dataURI,
          folderName: 'organisort/avatars',
        });
        if (imageResult?.secureUrl) {
          photoURL = imageResult.secureUrl;
        }
      } catch (uploadError) {
        console.warn('[auth.register] avatar-upload-failed', uploadError.message);
        // Continue registration even if avatar upload fails
      }
    }

    // Create new user (password will be hashed by pre-save hook in User model)
    // Let MongoDB generate the _id automatically for email/password users
    try {
      user = await User.create({
        email,
        password,
        displayName: displayName || '',
        photoURL,
      });
      console.info('[auth.register] success');
    } catch (createError) {
      console.error('[auth.register] create-failed', createError);
      throw createError;
    }

    // The _id is already generated and assigned by MongoDB, just convert to string
    user._id = user._id.toString();

    // Issue a 2FA email challenge (same flow as login for unverified users)
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

    const challengeToken = buildChallengeToken(user._id, challengeId);

    console.info('[auth.register] 2fa-challenge-issued');

    res.status(201).json({
      success: true,
      requires2FA: true,
      challengeToken,
      message: 'Account created. Email OTP sent — verify to complete registration.',
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

    if (!user.isActive) {
      console.warn('[auth.login] deactivated-user-attempted-login');
      return res.status(403).json({ success: false, error: 'Your account has been deactivated. Please contact support.' });
    }

    const canSkipEmailOtp = user.emailVerified || user.role === 'admin';
    if (canSkipEmailOtp) {
      user.twoFactorChallenge = undefined;
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      const token = generateToken(user._id.toString());

      return res.json({
        success: true,
        token,
        data: { _id: user._id, email: user.email, displayName: user.displayName, photoURL: user.photoURL, role: user.role },
      });
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
    user.emailVerified = true;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      token,
      data: { _id: user._id, email: user.email, displayName: user.displayName, photoURL: user.photoURL, role: user.role },
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

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (user && user.password) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.passwordReset = {
        tokenHash,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000),
      };
      await user.save({ validateBeforeSave: false });

      await sendPasswordResetEmail(user.email, resetToken);
    }

    return res.json({
      success: true,
      message: 'If an account with that email exists, we sent password reset instructions.',
    });
  } catch (error) {
    console.error('[auth.forgot-password] failed', error);
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      'passwordReset.tokenHash': tokenHash,
      'passwordReset.expiresAt': { $gt: new Date() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    const isSamePassword = await user.matchPassword(password);
    if (isSamePassword) {
      return res.status(400).json({ success: false, error: 'New password must be different from your current password' });
    }

    user.password = password;
    user.passwordReset = undefined;
    user.twoFactorChallenge = undefined;
    await user.save();

    return res.json({ success: true, message: 'Password reset successful. You can now sign in.' });
  } catch (error) {
    console.error('[auth.reset-password] failed', error);
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmailOtp,
  resendEmailOtp,
  forgotPassword,
  resetPassword,
};