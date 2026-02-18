import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const isResetMode = Boolean(token);

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setMessage(response.data.message || 'If your account exists, reset instructions were sent.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        password,
      });
      setMessage(response.data.message || 'Password reset successful.');
      setPassword('');
      setConfirmPassword('');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to reset password. Please request a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isResetMode ? 'Reset your password' : 'Forgot your password?'}
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          {isResetMode
            ? 'Enter a new password for your account.'
            : 'Enter your email and we will send you a password reset link.'}
        </p>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>}
        {message && <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 border border-green-200">{message}</div>}

        {!isResetMode && (
          <form className="space-y-4" onSubmit={handleForgotPassword}>
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
              <input
                id="forgot-email"
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg"
            >
              {loading ? 'Sending reset link...' : 'Send reset link'}
            </button>
          </form>
        )}

        {isResetMode && (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">New password</label>
              <input
                id="new-password"
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">Confirm new password</label>
              <input
                id="confirm-password"
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg"
            >
              {loading ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        )}

        <p className="text-sm text-center text-gray-600 mt-6">
          Remembered your password?{' '}
          <Link to="/login" className="text-green-700 hover:underline font-medium">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
