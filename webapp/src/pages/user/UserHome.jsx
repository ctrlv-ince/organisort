import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InfoCard from '../../components/InfoCard';
import PageHeaderCard from '../../components/PageHeaderCard';
import PrimaryButton from '../../components/PrimaryButton';
import ReviewModal from '../../components/ReviewModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

/**
 * UserHome Page
 * Dashboard home page with stats, quick actions, and recent activity
 */
const UserHome = ({ userData, setActiveTab }) => {
  const [detections, setDetections] = useState([]);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, thisWeek: 0 });
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_URL}/api/detections/history`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const detectionsList = data.detections || data;
          setDetections(detectionsList);

          // Calculate stats
          const now = new Date();
          const thisMonth = detectionsList.filter(d => {
            const date = new Date(d.createdAt);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          }).length;

          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const thisWeek = detectionsList.filter(d => new Date(d.createdAt) >= oneWeekAgo).length;

          setStats({
            total: detectionsList.length,
            thisMonth,
            thisWeek,
          });
        }
      } catch (err) {
        console.error('Error fetching detections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetections();
  }, []);

  // Stat card icons with their accent overrides (these stay colored for visual distinction)
  const statCards = [
    { value: stats.total, label: 'Total Scans', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    { value: stats.thisMonth, label: 'This Month', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { value: stats.thisWeek, label: 'This Week', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  ];

  return (
    <motion.div
      className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants}>
        <PageHeaderCard
          title={`Welcome back, ${userData?.displayName || userData?.email?.split('@')[0] || 'User'}!`}
          subtitle="Ready to make a difference today? Let's sort some waste."
          variant="primary"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        />
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="shadow-sm hover:shadow-xl rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group transition-all duration-300"
            style={{
              background: 'var(--theme-card, #ffffff)',
              border: '1px solid var(--theme-card-border, #f0f0f0)',
            }}
          >
            <div className="relative z-10">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm"
                style={{
                  background: 'var(--theme-accent-surface, #f0fdf4)',
                  border: '1px solid var(--theme-accent-surface-border, #bbf7d0)',
                }}
              >
                <svg className="w-8 h-8" fill="none" stroke="var(--theme-accent, #15803d)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <div className="text-6xl font-black mb-2 tracking-tighter" style={{ color: 'var(--theme-text, #111827)' }}>{stat.value}</div>
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <InfoCard>
          <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: 'var(--theme-text, #111827)' }}>
            <div className="p-2.5 rounded-xl mr-4" style={{ background: 'var(--theme-accent-surface, #f0fdf4)', border: '1px solid var(--theme-accent-surface-border, #bbf7d0)' }}>
              <svg className="w-6 h-6" fill="none" stroke="var(--theme-accent, #15803d)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <PrimaryButton onClick={() => setActiveTab('scan')} className="py-4 px-6 w-full group">
              <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              <span>Start New Scan</span>
            </PrimaryButton>

            <PrimaryButton onClick={() => setActiveTab('achievements')} variant="info" className="py-4 px-6 w-full group">
              <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span>View Achievements</span>
            </PrimaryButton>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="py-4 px-6 w-full group rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center transition-all shadow-sm hover:shadow-md col-span-1 md:col-span-2"
              style={{
                background: 'var(--theme-accent-surface, #f0fdf4)',
                color: 'var(--theme-accent, #15803d)',
                border: '1px solid var(--theme-accent-surface-border, #bbf7d0)'
              }}
            >
              <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Leave a Review</span>
            </button>
          </div>
        </InfoCard>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <InfoCard>
          <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: 'var(--theme-text, #111827)' }}>
            <div className="p-2.5 rounded-xl mr-4" style={{ background: 'var(--theme-accent-surface, #f0fdf4)', border: '1px solid var(--theme-accent-surface-border, #bbf7d0)' }}>
              <svg className="w-6 h-6" fill="none" stroke="var(--theme-accent, #15803d)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Recent Activity
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center justify-between p-5 rounded-2xl" style={{ background: 'var(--theme-input-bg, #f9fafb)', border: '1px solid var(--theme-border, #f0f0f0)' }}>
                  <div className="flex items-center space-x-4">
                    <div className="skeleton-shimmer h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                      <div className="skeleton-shimmer h-4 w-32" />
                      <div className="skeleton-shimmer h-3 w-40" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : detections.length > 0 ? (
            <div className="space-y-3">
              {detections.slice(0, 5).map((detection, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-5 rounded-2xl transition-all cursor-default"
                  style={{
                    background: 'var(--theme-input-bg, #f9fafb)',
                    border: '1px solid var(--theme-border, #f0f0f0)',
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="p-3 rounded-xl shadow-sm"
                      style={{
                        background: 'var(--theme-card, #ffffff)',
                        border: '1px solid var(--theme-border, #f0f0f0)',
                      }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="var(--theme-text-secondary, #6b7280)" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-lg tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>
                        {detection.detections?.length || 0} items detected
                      </p>
                      <p className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>
                        {new Date(detection.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div
                    className="px-4 py-1.5 rounded-full text-sm font-bold tracking-wide"
                    style={{
                      background: 'var(--theme-accent-surface, #f0fdf4)',
                      color: 'var(--theme-accent, #15803d)',
                    }}
                  >
                    {detection.summary?.average_confidence
                      ? `${(detection.summary.average_confidence * 100).toFixed(1)}%`
                      : 'Done'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-16 rounded-3xl border-dashed"
              style={{
                background: 'var(--theme-input-bg, #f9fafb)',
                border: '2px dashed var(--theme-border, #f0f0f0)',
              }}
            >
              <div
                className="inline-flex items-center justify-center w-20 h-20 shadow-sm rounded-2xl mb-4"
                style={{
                  background: 'var(--theme-card, #ffffff)',
                  border: '1px solid var(--theme-border, #f0f0f0)',
                }}
              >
                <svg className="w-10 h-10" fill="none" stroke="var(--theme-text-muted, #9ca3af)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-xl font-bold mb-1" style={{ color: 'var(--theme-text, #111827)' }}>No Activity Yet</p>
              <p className="font-medium" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>Start scanning waste to see your timeline build.</p>
            </div>
          )}
        </InfoCard>
      </motion.div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />

    </motion.div>
  );
};

export default UserHome;
