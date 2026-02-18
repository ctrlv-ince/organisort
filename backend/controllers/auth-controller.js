const User = require('../models/User');
const generateToken = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { execFile } = require('child_process');
const { promisify } = require('util');

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = Number(process.env.EMAIL_OTP_TTL_MINUTES || 10);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.EMAIL_OTP_RESEND_COOLDOWN_SECONDS || 60);
const OTP_MAX_ATTEMPTS = Number(process.env.EMAIL_OTP_MAX_ATTEMPTS || 5);
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || SMTP_USER;
const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || 10000);
const execFileAsync = promisify(execFile);

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
  if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM_EMAIL) {
    throw new Error('SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL are required for email OTP delivery');
  }

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

  const smtpUrl = `${SMTP_SECURE ? 'smtps' : 'smtp'}://${SMTP_HOST}:${SMTP_PORT}`;
  const args = [
    '--silent',
    '--show-error',
    '--ssl-reqd',
    '--url',
    smtpUrl,
    '--user',
    `${SMTP_USER}:${SMTP_PASS}`,
    '--mail-from',
    SMTP_FROM_EMAIL,
    '--mail-rcpt',
    email,
    '--upload-file',
    '-',
  ];

  const payload = [
    `From: OrganiSort <${SMTP_FROM_EMAIL}>`,
    `To: ${email}`,
    'Subject: Your OrganiSort login verification code',
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
    '',
    `Plain-text fallback: ${text}`,
    '',
  ].join('\r\n');

  await execFileAsync('curl', args, {
    timeout: SMTP_TIMEOUT_MS,
    maxBuffer: 1024 * 1024,
    input: payload,
  });

  console.info('[auth.2fa] email-otp-sent', { email });
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

    const canSkipEmailOtp = user.emailVerified || user.role === 'admin';
    if (canSkipEmailOtp) {
      user.twoFactorChallenge = undefined;
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      const token = generateToken(user._id.toString());

      return res.json({
        success: true,
        token,
        data: { _id: user._id, email: user.email, displayName: user.displayName, role: user.role },
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
