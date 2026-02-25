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
            <div key={i} className="bg-white rounded-[2rem] shadow-sm p-8 space-y-4 border border-gray-100">
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
        <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-gray-100 p-8">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Participants</p>
          <p className="text-4xl font-extrabold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-gray-100 p-8">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Total Scans</p>
          <p className="text-4xl font-extrabold text-green-600">{totalScans}</p>
        </div>
        <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-gray-100 p-8">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Top Score</p>
          <p className="text-4xl font-extrabold text-blue-600">{users[0]?.detectionCount || 0}</p>
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
          <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all p-8 text-center border border-gray-100 relative mt-4 md:mt-12 md:order-1">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-6xl drop-shadow-md">🥈</div>
            <div className="mt-8">
              <p className="font-extrabold text-gray-900 text-xl truncate">{users[1]?.displayName || users[1]?.email}</p>
              <p className="text-3xl font-black text-slate-400 mt-2">{users[1]?.detectionCount || 0}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">scans</p>
            </div>
          </div>
          {/* 1st Place */}
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-[2rem] shadow-lg hover:shadow-xl transition-all p-8 text-center border-2 border-amber-200 relative z-10 md:order-2">
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-8xl drop-shadow-lg">🥇</div>
            <div className="mt-12">
              <p className="font-extrabold text-gray-900 text-2xl truncate">{users[0]?.displayName || users[0]?.email}</p>
              <p className="text-5xl font-black text-amber-500 mt-3">{users[0]?.detectionCount || 0}</p>
              <p className="text-xs font-bold text-amber-600/60 uppercase tracking-widest mt-1">scans</p>
            </div>
          </div>
          {/* 3rd Place */}
          <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all p-8 text-center border border-gray-100 relative mt-4 md:mt-16 md:order-3">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-6xl drop-shadow-md">🥉</div>
            <div className="mt-8">
              <p className="font-extrabold text-gray-900 text-xl truncate">{users[2]?.displayName || users[2]?.email}</p>
              <p className="text-3xl font-black text-orange-400 mt-2">{users[2]?.detectionCount || 0}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">scans</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Full Rankings */}
      <motion.div variants={itemVariants} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-slate-50/50 px-8 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">All Rankings</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {users.map((user, idx) => (
            <div key={user._id} className={`px-8 py-5 transition-all cursor-default ${user._id === userData?._id ? 'bg-green-50/50 relative' : 'hover:bg-slate-50/50'}`}>
              {user._id === userData?._id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500 rounded-r-md"></div>}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border ${idx < 3 ? 'bg-white shadow-sm border-amber-200 text-amber-500' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg flex items-center tracking-tight">
                      {user.displayName || user.email}
                      {user._id === userData?._id && (
                        <span className="ml-3 text-[10px] font-black tracking-wider uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full">You</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900">{user.detectionCount || 0}</p>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Total Scans</p>
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="px-8 py-16 text-center">
              <p className="text-gray-900 font-bold text-xl mb-1">No rankings available yet.</p>
              <p className="text-sm text-gray-500 font-medium">Start scanning waste to appear on the leaderboard.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Leaderboard;
