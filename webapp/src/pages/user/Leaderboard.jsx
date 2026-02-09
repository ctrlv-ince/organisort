import React, { useState, useEffect } from 'react';

/**
 * Leaderboard Page
 * View rankings and compete with other users
 */
const Leaderboard = ({ userData }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/stats/detections`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentUserRank = users.findIndex(u => u._id === userData?._id) + 1;

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
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Leaderboard
        </h1>
        <p className="text-indigo-100">See how you rank against other eco-warriors!</p>
      </div>

      {/* Your Rank Card */}
      {currentUserRank > 0 && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 mb-1">Your Rank</p>
              <p className="text-4xl font-bold">#{currentUserRank}</p>
            </div>
            <div className="text-6xl">
              {currentUserRank === 1 ? '🥇' : currentUserRank === 2 ? '🥈' : currentUserRank === 3 ? '🥉' : '🏅'}
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {users.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd Place */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-gray-400">
            <div className="text-5xl mb-2">🥈</div>
            <p className="font-bold text-gray-800 truncate">{users[1]?.displayName || users[1]?.email}</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{users[1]?.detectionCount || 0}</p>
            <p className="text-sm text-gray-500">scans</p>
          </div>
          {/* 1st Place */}
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg shadow-lg p-6 text-center border-t-4 border-amber-500 transform scale-105">
            <div className="text-6xl mb-2">🥇</div>
            <p className="font-bold text-gray-800 truncate">{users[0]?.displayName || users[0]?.email}</p>
            <p className="text-3xl font-bold text-amber-700 mt-2">{users[0]?.detectionCount || 0}</p>
            <p className="text-sm text-gray-500">scans</p>
          </div>
          {/* 3rd Place */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-orange-400">
            <div className="text-5xl mb-2">🥉</div>
            <p className="font-bold text-gray-800 truncate">{users[2]?.displayName || users[2]?.email}</p>
            <p className="text-2xl font-bold text-orange-600 mt-2">{users[2]?.detectionCount || 0}</p>
            <p className="text-sm text-gray-500">scans</p>
          </div>
        </div>
      )}

      {/* Full Rankings */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">All Rankings</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {users.map((user, idx) => (
            <div key={user._id} className={`px-6 py-4 hover:bg-gray-50 transition ${user._id === userData?._id ? 'bg-green-50 border-l-4 border-green-600' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${idx < 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 flex items-center">
                      {user.displayName || user.email}
                      {user._id === userData?._id && (
                        <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">You</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{user.detectionCount || 0}</p>
                  <p className="text-xs text-gray-500">total scans</p>
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              No rankings available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;