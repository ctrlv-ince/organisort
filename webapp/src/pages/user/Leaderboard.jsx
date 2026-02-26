import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import PageHeaderCard from '../../components/PageHeaderCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

/**
 * Leaderboard Page
 * View rankings and compete with other users
 */
const Leaderboard = ({ userData }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/detections/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load leaderboard data');
      }

      const payload = await response.json();
      const leaderboardUsers = (payload.data || [])
        .map((user) => ({
          ...user,
          detectionCount: user.detectionCount || 0,
        }))
        .sort((a, b) => b.detectionCount - a.detectionCount);

      setUsers(leaderboardUsers);
    } catch (err) {
      setError(err.message || 'Something went wrong while loading leaderboard data.');
    } finally {
      setLoading(false);
    }
  };

  const currentUserRank = users.findIndex((u) => u._id === userData?._id) + 1;

  const totalScans = useMemo(
    () => users.reduce((sum, user) => sum + (user.detectionCount || 0), 0),
    [users]
  );

  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        <div className="skeleton-shimmer h-32 rounded-[2rem]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-[2rem] shadow-sm p-8 space-y-4" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
              <div className="skeleton-shimmer h-4 w-24" />
              <div className="skeleton-shimmer h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="skeleton-shimmer h-32 rounded-[2rem]" />
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 md:p-10 max-w-6xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeaderCard
          title="Leaderboard"
          subtitle="See how you rank against other eco-warriors!"
          variant="info"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </motion.div>

      {/* Stats summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[2rem] shadow-sm hover:shadow-lg transition-all p-8" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <p className="text-sm font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Participants</p>
          <p className="text-4xl font-extrabold" style={{ color: 'var(--theme-text, #111827)' }}>{users.length}</p>
        </div>
        <div className="rounded-[2rem] shadow-sm hover:shadow-lg transition-all p-8" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <p className="text-sm font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Total Scans</p>
          <p className="text-4xl font-extrabold" style={{ color: 'var(--theme-accent, #15803d)' }}>{totalScans}</p>
        </div>
        <div className="rounded-[2rem] shadow-sm hover:shadow-lg transition-all p-8" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <p className="text-sm font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Top Score</p>
          <p className="text-4xl font-extrabold" style={{ color: 'var(--theme-accent, #15803d)' }}>{users[0]?.detectionCount || 0}</p>
        </div>
      </motion.div>

      {/* Error state */}
      {error && (
        <motion.div variants={itemVariants} className="bg-red-50 border border-red-100 text-red-700 rounded-[2rem] p-6 shadow-sm">
          <p className="font-bold">Could not load leaderboard right now.</p>
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {/* Your Rank Card */}
      {currentUserRank > 0 && (
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2rem] shadow-lg p-8 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-9xl opacity-20 transform rotate-12">
            {currentUserRank === 1 ? '🥇' : currentUserRank === 2 ? '🥈' : currentUserRank === 3 ? '🥉' : '🏅'}
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-emerald-100 font-bold uppercase tracking-widest mb-1">Your Rank</p>
              <p className="text-6xl font-extrabold">#{currentUserRank}</p>
            </div>
            <div className="text-6xl hidden sm:block">
              {currentUserRank === 1 ? '🥇' : currentUserRank === 2 ? '🥈' : currentUserRank === 3 ? '🥉' : '🏅'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {users.length >= 3 && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* 2nd Place */}
          <div className="rounded-[2rem] shadow-sm hover:shadow-xl transition-all p-8 text-center relative mt-4 md:mt-12 md:order-1" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-6xl drop-shadow-md">🥈</div>
            <div className="mt-8">
              <p className="font-extrabold text-xl truncate" style={{ color: 'var(--theme-text, #111827)' }}>{users[1]?.displayName || users[1]?.email}</p>
              <p className="text-3xl font-black mt-2" style={{ color: 'var(--theme-text-muted, #94a3b8)' }}>{users[1]?.detectionCount || 0}</p>
              <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>scans</p>
            </div>
          </div>
          {/* 1st Place */}
          <div className="rounded-[2rem] shadow-lg hover:shadow-xl transition-all p-8 text-center relative z-10 md:order-2" style={{ background: 'var(--theme-card, #ffffff)', border: '2px solid var(--theme-accent, #15803d)' }}>
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-8xl drop-shadow-lg">🥇</div>
            <div className="mt-12">
              <p className="font-extrabold text-2xl truncate" style={{ color: 'var(--theme-text, #111827)' }}>{users[0]?.displayName || users[0]?.email}</p>
              <p className="text-5xl font-black mt-3" style={{ color: 'var(--theme-accent, #15803d)' }}>{users[0]?.detectionCount || 0}</p>
              <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>scans</p>
            </div>
          </div>
          {/* 3rd Place */}
          <div className="rounded-[2rem] shadow-sm hover:shadow-xl transition-all p-8 text-center relative mt-4 md:mt-16 md:order-3" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-6xl drop-shadow-md">🥉</div>
            <div className="mt-8">
              <p className="font-extrabold text-xl truncate" style={{ color: 'var(--theme-text, #111827)' }}>{users[2]?.displayName || users[2]?.email}</p>
              <p className="text-3xl font-black mt-2" style={{ color: 'var(--theme-accent, #15803d)' }}>{users[2]?.detectionCount || 0}</p>
              <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>scans</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Full Rankings */}
      <motion.div variants={itemVariants} className="rounded-[2rem] shadow-sm overflow-hidden" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
        <div className="px-8 py-6" style={{ background: 'var(--theme-input-bg, #f8fafc)', borderBottom: '1px solid var(--theme-border, #f0f0f0)' }}>
          <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>All Rankings</h2>
        </div>
        <div style={{ borderColor: 'var(--theme-border, #f0f0f0)' }}>
          {users.map((user, idx) => (
            <div key={user._id} className="px-8 py-5 transition-all cursor-default" style={{ borderBottom: '1px solid var(--theme-border, #f0f0f0)', background: user._id === userData?._id ? 'var(--theme-accent-surface, #f0fdf4)' : 'transparent', position: 'relative' }}>
              {user._id === userData?._id && <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-md" style={{ background: 'var(--theme-accent, #15803d)' }}></div>}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg`} style={idx < 3 ? { background: 'var(--theme-accent-surface, #f0fdf4)', border: '1px solid var(--theme-accent-surface-border, #bbf7d0)', color: 'var(--theme-accent, #15803d)' } : { background: 'var(--theme-input-bg, #f1f5f9)', border: '1px solid var(--theme-border, #f0f0f0)', color: 'var(--theme-text-muted, #94a3b8)' }}>
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-lg flex items-center tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>
                      {user.displayName || user.email}
                      {user._id === userData?._id && (
                        <span className="ml-3 text-[10px] font-black tracking-wider uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full">You</span>
                      )}
                    </p>
                    <p className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black" style={{ color: 'var(--theme-text, #111827)' }}>{user.detectionCount || 0}</p>
                  <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Total Scans</p>
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="px-8 py-16 text-center">
              <p className="font-bold text-xl mb-1" style={{ color: 'var(--theme-text, #111827)' }}>No rankings available yet.</p>
              <p className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>Start scanning waste to appear on the leaderboard.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Leaderboard;
