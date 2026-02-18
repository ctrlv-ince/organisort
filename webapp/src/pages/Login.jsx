import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useAuthFormValidation from '../hooks/useAuthFormValidation';
import { validateLoginFields } from '../utils/authValidation';

const Login = () => {
  const getInputStateClasses = (hasError) => (
    hasError
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/40 text-red-900 placeholder-red-300'
      : 'border-gray-300 focus:ring-green-600 focus:border-green-600'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [challengeToken, setChallengeToken] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  const { login, verifyEmailOtp, resendEmailOtp, googleLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const values = useMemo(() => ({ email, password }), [email, password]);
  const {
    touched,
    fieldErrors,
    hasErrors,
    touchField,
    validateOnSubmit,
  } = useAuthFormValidation({
    values,
    validators: validateLoginFields,
    fields: ['email', 'password'],
    debounceMs: 250,
  });

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const emailError = touched.email ? fieldErrors.email : '';
  const passwordError = touched.password ? fieldErrors.password : '';
  const isSubmitDisabled = loading || hasErrors;

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validateOnSubmit();
    const hasSubmitErrors = Object.values(errors).some(Boolean);

    if (hasSubmitErrors) {
      return;
    }

    setLoading(true);

    try {
      const loginResult = await login(email, password);
      if (loginResult?.requires2FA) {
        setChallengeToken(loginResult.challengeToken);
        setOtpMessage(loginResult.message || 'Enter the OTP sent to your email.');
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError('Please enter the OTP sent to your email.');
      return;
    }

    setOtpSubmitting(true);
    try {
      await verifyEmailOtp(challengeToken, otp.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'OTP verification failed');
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setOtpSubmitting(true);

    try {
      const response = await resendEmailOtp(challengeToken);
      setChallengeToken(response.challengeToken || challengeToken);
      setOtpMessage(response.message || 'A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not resend OTP');
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleEmailChange = (value) => {
    const nextValues = { email: value, password };
    setEmail(value);

    if (touched.email || value) {
      touchField('email', nextValues);
    }
  };

  const handlePasswordChange = (value) => {
    const nextValues = { email, password: value };
    setPassword(value);

    if (touched.password || value) {
      touchField('password', nextValues);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await googleLogin();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-amber-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-amber-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-green-800 rounded-full shadow-lg mb-4">
            <span className="text-4xl">♻️</span>
          </div>
          <h1 className="text-4xl font-bold text-green-800 mb-2">OrganiSort</h1>
          <p className="text-gray-600 text-lg">Organic Waste Detection System</p>
          <p className="text-green-700 text-sm mt-1 font-medium">Smart. Sustainable. Simple.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-xl border-t-4 border-green-700 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue managing waste detection</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {!challengeToken && (
          <form onSubmit={handleEmailLogin} className="space-y-5 mb-6" noValidate>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => touchField('email')}
                  placeholder="you@example.com"
                  aria-invalid={Boolean(emailError)}
                  aria-errormessage={emailError ? 'login-email-error' : undefined}
                  aria-describedby={emailError ? 'login-email-error' : undefined}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 outline-none transition ${getInputStateClasses(Boolean(emailError))}`}
                  required
                />
              </div>
              {emailError && (
                <p
                  id="login-email-error"
                  role="alert"
                  aria-live="polite"
                  className="mt-2 text-sm text-red-700 font-medium"
                >
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => touchField('password')}
                  placeholder="••••••••"
                  aria-invalid={Boolean(passwordError)}
                  aria-errormessage={passwordError ? 'login-password-error' : undefined}
                  aria-describedby={passwordError ? 'login-password-error' : undefined}
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:ring-2 outline-none transition ${getInputStateClasses(Boolean(passwordError))}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 rounded-r-lg"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {passwordError && (
                <p
                  id="login-password-error"
                  role="alert"
                  aria-live="polite"
                  className="mt-2 text-sm text-red-700 font-medium"
                >
                  {passwordError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-green-700 hover:text-green-800 font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in with Email'
              )}
            </button>
          </form>
          )}

          {challengeToken && (
            <form onSubmit={handleOtpVerification} className="space-y-5 mb-6" noValidate>
              <div className="p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-sm">
                {otpMessage || 'Enter the OTP sent to your email to complete sign in.'}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="login-otp">
                  One-Time Password
                </label>
                <input
                  id="login-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 outline-none transition border-gray-300 focus:ring-green-600 focus:border-green-600"
                />
              </div>
              <button
                type="submit"
                disabled={otpSubmitting}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg"
              >
                {otpSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={otpSubmitting}
                className="w-full border-2 border-green-600 text-green-700 hover:bg-green-50 disabled:border-gray-300 disabled:text-gray-400 font-semibold py-3 rounded-lg"
              >
                Resend OTP
              </button>
            </form>
          )}

          {!challengeToken && (
          <>
          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border-2 border-gray-300 hover:border-green-600 hover:bg-green-50 disabled:bg-gray-100 disabled:border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>
          </>
          )}

          {/* Registration Link */}
          {!challengeToken && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              First time using OrganiSort?{' '}
              <a
                href="/register"
                className="text-green-700 hover:text-green-800 font-semibold hover:underline"
              >
                Create an account
              </a>
            </p>
          </div>
          )}

          {/* Info Text */}
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-center text-xs text-green-700 flex items-center justify-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              New users will have an account created automatically with Google sign-in
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            © 2026 OrganiSort. All rights reserved.
          </p>
          <div className="mt-2 flex items-center justify-center space-x-4 text-xs text-gray-500">
            <a href="/privacy" className="hover:text-green-700 transition">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-green-700 transition">Terms of Service</a>
            <span>•</span>
            <a href="/help" className="hover:text-green-700 transition">Help</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
