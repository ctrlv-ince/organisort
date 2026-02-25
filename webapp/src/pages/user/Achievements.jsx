import React, { useState, useEffect } from 'react';
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
 * Achievements Page
 * View badges, milestones, and achievements
 */
const Achievements = ({ userData }) => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDetections();
  }, []);

  const fetchDetections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/detections/history`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDetections(data.detections || data);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalScans = detections.length;
  const totalItems = detections.reduce((sum, d) => sum + (d.detections?.length || 0), 0);

  const achievementIcons = {
    star: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    seedling: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bolt: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    crown: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l3.057 7.643L12 8l3.943 2.643L19 3M5 3v18h14V3" />
      </svg>
    ),
    search: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    trophy: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  };

  const achievements = [
    { id: 1, name: 'First Scan', description: 'Complete your first detection', icon: 'star', unlocked: totalScans >= 1, requirement: '1 scan' },
    { id: 2, name: 'Getting Started', description: 'Complete 5 detections', icon: 'seedling', unlocked: totalScans >= 5, requirement: '5 scans' },
    { id: 3, name: 'Eco Warrior', description: 'Complete 25 detections', icon: 'bolt', unlocked: totalScans >= 25, requirement: '25 scans' },
    { id: 4, name: 'Master Sorter', description: 'Complete 100 detections', icon: 'crown', unlocked: totalScans >= 100, requirement: '100 scans' },
    { id: 5, name: 'Item Hunter', description: 'Detect 50 total items', icon: 'search', unlocked: totalItems >= 50, requirement: '50 items' },
    { id: 6, name: 'Super Detector', description: 'Detect 200 total items', icon: 'trophy', unlocked: totalItems >= 200, requirement: '200 items' },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progress = (unlockedCount / achievements.length) * 100;

  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="skeleton-shimmer h-32 rounded-[2rem]" />
        {/* Stats skeleton */}
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-[2rem] shadow-sm p-8 space-y-4 border border-gray-100">
              <div className="skeleton-shimmer h-14 w-14 rounded-2xl" />
              <div className="skeleton-shimmer h-8 w-16" />
              <div className="skeleton-shimmer h-4 w-24" />
            </div>
          ))}
        </div>
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
          title="Achievements"
          subtitle="Track your progress and earn rewards safely."
          variant="warn"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
        />
      </motion.div>

      {/* Progress Overview */}
      <motion.div variants={itemVariants} className="bg-white rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Overall Progress</h2>
          <span className="text-3xl font-extrabold text-amber-500">{unlockedCount}/{achievements.length}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
          <div className="bg-amber-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-sm text-gray-500 font-medium">{progress.toFixed(0)}% Complete</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-gray-100 p-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded-2xl mb-4 border border-green-100">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">{totalScans}</p>
          <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs">Total Scans</p>
        </div>
        <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-gray-100 p-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-4 border border-blue-100">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">{totalItems}</p>
          <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs">Items Detected</p>
        </div>
        <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-lg transition-all border border-gray-100 p-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 rounded-2xl mb-4 border border-amber-100">
            <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">{unlockedCount}</p>
          <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs">Badges Earned</p>
        </div>
      </motion.div>

      {/* Achievements Grid */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">All Achievements</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {achievements.map((achievement) => (
            <div key={achievement.id} className={`rounded-[2rem] shadow-sm p-6 hover:shadow-lg transition-all duration-300 ${achievement.unlocked ? 'bg-gradient-to-br from-white to-amber-50/30 border border-amber-200 ring-1 ring-amber-100/50' : 'bg-white border border-gray-100 opacity-60'}`}>
              <div className="flex items-start space-x-5">
                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm ${achievement.unlocked ? 'bg-amber-100 text-amber-500 border-amber-200' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                  {achievementIcons[achievement.icon] || achievementIcons.star}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-bold text-gray-900">{achievement.name}</h3>
                    {achievement.unlocked && (
                      <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3 font-medium">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${achievement.unlocked ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {achievement.unlocked ? 'Unlocked' : 'Locked'}
                    </span>
                    <span className="text-xs text-slate-400 font-bold tracking-wide uppercase">{achievement.requirement}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Achievements;