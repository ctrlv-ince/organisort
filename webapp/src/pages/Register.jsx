import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useAuthFormValidation from '../hooks/useAuthFormValidation';
import {
  PASSWORD_POLICY_MESSAGE,
  validateRegisterFields,
} from '../utils/authValidation';

/**
 * Registration Page
 * Email/password sign up for users (role:user)
 * UCAP-themed version
 */
const Register = () => {
  const getInputStateClasses = (hasError) => (
    hasError
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/40 text-red-900 placeholder-red-300'
      : 'border-gray-300 focus:ring-green-600 focus:border-green-600'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const values = useMemo(
    () => ({ email, password, confirmPassword }),
    [email, password, confirmPassword]
  );
  const {
    touched,
    fieldErrors,
    hasErrors,
    touchField,
    validateFieldsNow,
    validateOnSubmit,
  } = useAuthFormValidation({
    values,
    validators: validateRegisterFields,
    fields: ['email', 'password', 'confirmPassword'],
    debounceMs: 250,
  });

  const emailError = touched.email ? fieldErrors.email : '';
  const passwordError = touched.password ? fieldErrors.password : '';
  const confirmPasswordError = touched.confirmPassword ? fieldErrors.confirmPassword : '';

  const isSubmitDisabled = loading || hasErrors;

  const handlePasswordChange = (value) => {
    const nextValues = {
      email,
      password: value,
      confirmPassword,
    };
    setPassword(value);

    if (touched.password || value) {
      touchField('password', nextValues);
    }

    if (confirmPassword) {
      validateFieldsNow(['password', 'confirmPassword'], nextValues);
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);

    const nextValues = {
      email,
      password,
      confirmPassword: value,
    };

    if (touched.confirmPassword || value) {
      touchField('confirmPassword', nextValues);
      validateFieldsNow(['confirmPassword'], nextValues);
    }
  };

  const handleEmailChange = (value) => {
    const nextValues = {
      email: value,
      password,
      confirmPassword,
    };

    setEmail(value);

    if (touched.email || value) {
      touchField('email', nextValues);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validateOnSubmit();
    const hasSubmitErrors = Object.values(errors).some(Boolean);

    if (hasSubmitErrors) {
      return;
    }

    setLoading(true);
    try {
      await register(email, password); // should create user in Firebase and backend
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
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
          <h1 className="text-4xl font-bold text-green-800 mb-2">Register</h1>
          <p className="text-gray-600 text-lg">Create your OrganiSort account</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-lg shadow-xl border-t-4 border-green-700 p-8">
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

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-5 mb-6" noValidate>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="register-email">
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => touchField('email')}
                placeholder="you@example.com"
                aria-invalid={Boolean(emailError)}
                aria-errormessage={emailError ? 'register-email-error' : undefined}
                aria-describedby={emailError ? 'register-email-error' : undefined}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 outline-none transition ${getInputStateClasses(Boolean(emailError))}`}
                required
              />
              {emailError && (
                <p
                  id="register-email-error"
                  role="alert"
                  aria-live="polite"
                  className="mt-2 text-sm text-red-700 font-medium"
                >
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="register-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => touchField('password')}
                  placeholder="••••••••"
                  aria-invalid={Boolean(passwordError)}
                  aria-errormessage={passwordError ? 'register-password-error' : undefined}
                  aria-describedby={passwordError ? 'register-password-help register-password-error' : 'register-password-help'}
                  className={`w-full px-4 pr-12 py-3 border-2 rounded-lg focus:ring-2 outline-none transition ${getInputStateClasses(Boolean(passwordError))}`}
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
              <p id="register-password-help" className="mt-2 text-xs text-gray-500">
                {PASSWORD_POLICY_MESSAGE}
              </p>
              {passwordError && (
                <p
                  id="register-password-error"
                  role="alert"
                  aria-live="polite"
                  className="mt-2 text-sm text-red-700 font-medium"
                >
                  {passwordError}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="register-confirm-password">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  onBlur={() => touchField('confirmPassword')}
                  placeholder="••••••••"
                  aria-invalid={Boolean(confirmPasswordError)}
                  aria-errormessage={confirmPasswordError ? 'register-confirm-password-error' : undefined}
                  aria-describedby={confirmPasswordError ? 'register-confirm-password-error' : undefined}
                  className={`w-full px-4 pr-12 py-3 border-2 rounded-lg focus:ring-2 outline-none transition ${getInputStateClasses(Boolean(confirmPasswordError))}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  aria-pressed={showConfirmPassword}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 rounded-r-lg"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {confirmPasswordError && (
                <p
                  id="register-confirm-password-error"
                  role="alert"
                  aria-live="polite"
                  className="mt-2 text-sm text-red-700 font-medium"
                >
                  {confirmPasswordError}
                </p>
              )}
            </div>

            {/* Submit Button */}
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
                  Registering...
                </span>
              ) : (
                'Register'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-green-700 hover:text-green-800 font-semibold hover:underline">
              Sign in
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            © 2026 OrganiSort. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
