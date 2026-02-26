import React, { useMemo, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    if (password.length < 6) { setError('Password must be at least 6 characters long.'); setLoading(false); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); setLoading(false); return; }
    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, { token, password });
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
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'inherit' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex" style={{ width: '45%', background: '#0f1a0f', position: 'relative', overflow: 'hidden', flexDirection: 'column', justifyContent: 'space-between', padding: '3rem' }}>
        <img
          src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=900&q=80"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,26,15,0.95) 0%, rgba(15,26,15,0.7) 100%)' }} />
        {/* Glow */}
        <div style={{ position: 'absolute', top: '30%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 10 }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="#4ade80" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span style={{ color: '#fff', fontSize: '16px', fontWeight: 900, letterSpacing: '-0.04em' }}>OrganiSort</span>
          </button>
        </div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-block', background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '999px', padding: '6px 14px', marginBottom: '24px' }}>
            <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {isResetMode ? 'Reset Password' : 'Account Recovery'}
            </span>
          </div>
          <h2 style={{ color: '#fff', fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '16px' }}>
            {isResetMode ? 'Set a new\nsecure password' : 'Recover your\nOrganiSort account'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', fontWeight: 500, lineHeight: 1.6, maxWidth: '300px' }}>
            {isResetMode
              ? 'Choose a strong password to keep your detection history and data secure.'
              : 'Enter your email address and we\'ll send you a secure link to reset your password.'}
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>© {new Date().getFullYear()} OrganiSort</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8', padding: '2rem' }}>
        <motion.div
          style={{ width: '100%', maxWidth: '420px' }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mobile logo */}
          <button onClick={() => navigate('/')} className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '2rem', padding: 0 }}>
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="#16a34a" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#111', letterSpacing: '-0.04em' }}>OrganiSort</span>
          </button>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#111', letterSpacing: '-0.04em', marginBottom: '8px' }}>
              {isResetMode ? 'Reset your password' : 'Forgot your password?'}
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
              {isResetMode
                ? 'Enter a new password for your account.'
                : 'Enter your email and we\'ll send you a reset link.'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '13px', fontWeight: 500 }}
            >{error}</motion.div>
          )}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '13px', fontWeight: 500 }}
            >{message}</motion.div>
          )}

          {!isResetMode && (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="forgot-email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Email address</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#16a34a'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '13px', background: loading ? '#9ca3af' : '#16a34a', color: '#fff', fontWeight: 700, fontSize: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', letterSpacing: '-0.01em' }}
                onMouseEnter={e => !loading && (e.target.style.background = '#15803d')}
                onMouseLeave={e => !loading && (e.target.style.background = '#16a34a')}
              >
                {loading ? 'Sending reset link…' : 'Send reset link'}
              </button>
            </form>
          )}

          {isResetMode && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 'new-password', label: 'New password', value: password, setter: setPassword },
                { id: 'confirm-password', label: 'Confirm new password', value: confirmPassword, setter: setConfirmPassword },
              ].map(({ id, label, value, setter }) => (
                <div key={id}>
                  <label htmlFor={id} style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>{label}</label>
                  <input
                    id={id}
                    type="password"
                    value={value}
                    onChange={e => setter(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#16a34a'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '13px', background: loading ? '#9ca3af' : '#16a34a', color: '#fff', fontWeight: 700, fontSize: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', letterSpacing: '-0.01em' }}
                onMouseEnter={e => !loading && (e.target.style.background = '#15803d')}
                onMouseLeave={e => !loading && (e.target.style.background = '#16a34a')}
              >
                {loading ? 'Updating password…' : 'Update password'}
              </button>
            </form>
          )}

          <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', marginTop: '24px' }}>
            Remembered your password?{' '}
            <Link to="/login" style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}>
              Back to sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;