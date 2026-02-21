import React, { useState, useEffect } from 'react';
import InfoCard from '../../components/InfoCard';
import PageHeaderCard from '../../components/PageHeaderCard';
import PrimaryButton from '../../components/PrimaryButton';

/**
 * UserHome Page
 * Dashboard home page with stats, quick actions, and recent activity
 */
const UserHome = ({ userData }) => {
  const [detections, setDetections] = useState([]);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, thisWeek: 0 });
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <PageHeaderCard
        title={`Welcome back, ${userData?.displayName || userData?.email?.split('@')[0] || 'User'}!`}
        subtitle="Ready to make a difference today? Let's sort some waste!"
        variant="primary"
        icon={
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        }
      />

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-green-700 mb-2">{stats.total}</div>
          <p className="text-gray-700 font-semibold">Total Scans</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-blue-700 mb-2">{stats.thisMonth}</div>
          <p className="text-gray-700 font-semibold">This Month</p>
          <p className="text-sm text-gray-500 mt-1">Keep it up!</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-purple-700 mb-2">{stats.thisWeek}</div>
          <p className="text-gray-700 font-semibold">This Week</p>
          <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
        </div>
      </div>

      {/* Quick Actions */}
      <InfoCard>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <PrimaryButton className="py-4 px-6 shadow-md hover:shadow-lg w-full group">
            <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            <span>Start New Scan</span>
          </PrimaryButton>

          <PrimaryButton variant="info" className="py-4 px-6 shadow-md hover:shadow-lg w-full group">
            <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span>View Achievements</span>
          </PrimaryButton>
        </div>
      </InfoCard>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Activity
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="skeleton-shimmer h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <div className="skeleton-shimmer h-4 w-32" />
                    <div className="skeleton-shimmer h-3 w-40" />
                  </div>
                </div>
                <div className="skeleton-shimmer h-4 w-24" />
              </div>
            ))}
          </div>
        ) : detections.length > 0 ? (
          <div className="space-y-4">
            {detections.slice(0, 5).map((detection, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {detection.detections?.length || 0} items detected
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(detection.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {detection.summary?.average_confidence
                    ? `${(detection.summary.average_confidence * 100).toFixed(1)}% confidence`
                    : 'Completed'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">No activity yet</p>
            <p className="text-gray-400 text-sm">Start scanning waste to see your activity here</p>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-lg p-6">
        <div className="flex items-start">
          <div className="bg-green-600 p-3 rounded-full mr-4 flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Pro Tips
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-1">✓</span>
                <p className="text-green-800 text-sm">Take clear, well-lit photos for better detection accuracy</p>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-1">✓</span>
                <p className="text-green-800 text-sm">Scan multiple items at once to save time</p>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-1">✓</span>
                <p className="text-green-800 text-sm">Check your achievements page for rewards and milestones</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
