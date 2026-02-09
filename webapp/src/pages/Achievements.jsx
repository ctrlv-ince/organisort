import React, { useState, useEffect } from 'react';

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

  const achievements = [
    { id: 1, name: 'First Scan', description: 'Complete your first detection', icon: '🎯', unlocked: totalScans >= 1, requirement: '1 scan' },
    { id: 2, name: 'Getting Started', description: 'Complete 5 detections', icon: '🌱', unlocked: totalScans >= 5, requirement: '5 scans' },
    { id: 3, name: 'Eco Warrior', description: 'Complete 25 detections', icon: '⚡', unlocked: totalScans >= 25, requirement: '25 scans' },
    { id: 4, name: 'Master Sorter', description: 'Complete 100 detections', icon: '👑', unlocked: totalScans >= 100, requirement: '100 scans' },
    { id: 5, name: 'Item Hunter', description: 'Detect 50 total items', icon: '🔍', unlocked: totalItems >= 50, requirement: '50 items' },
    { id: 6, name: 'Super Detector', description: 'Detect 200 total items', icon: '🏆', unlocked: totalItems >= 200, requirement: '200 items' },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progress = (unlockedCount / achievements.length) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg shadow-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          Achievements
        </h1>
        <p className="text-amber-100">Track your progress and earn rewards</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Overall Progress</h2>
          <span className="text-2xl font-bold text-amber-600">{unlockedCount}/{achievements.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-sm text-gray-600">{progress.toFixed(0)}% Complete</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-3xl font-bold text-green-700">{totalScans}</p>
          <p className="text-gray-600 font-medium">Total Scans</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-4xl mb-2">📦</div>
          <p className="text-3xl font-bold text-blue-700">{totalItems}</p>
          <p className="text-gray-600 font-medium">Items Detected</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-3xl font-bold text-amber-700">{unlockedCount}</p>
          <p className="text-gray-600 font-medium">Badges Earned</p>
        </div>
      </div>

      {/* Achievements Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">All Achievements</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {achievements.map((achievement) => (
            <div key={achievement.id} className={`rounded-lg shadow-md p-6 transition-all ${achievement.unlocked ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300' : 'bg-white border-2 border-gray-200 opacity-60'}`}>
              <div className="flex items-start space-x-4">
                <div className={`text-5xl ${achievement.unlocked ? 'filter-none' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{achievement.name}</h3>
                    {achievement.unlocked && (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${achievement.unlocked ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                      {achievement.unlocked ? 'Unlocked' : 'Locked'}
                    </span>
                    <span className="text-xs text-gray-500">{achievement.requirement}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;