import React, { useState, useEffect } from 'react';

/**
 * Analytics Page - Admin Dashboard
 * Comprehensive analytics and insights for organic waste detection
 * Shows trends, patterns, and detailed breakdowns across 45 waste types
 */
const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [detections, setDetections] = useState([]);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch detection stats
      const statsResponse = await fetch(`${API_URL}/api/detections/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch detection history for trend analysis
      const historyResponse = await fetch(`${API_URL}/api/detections/history?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setDetections(historyData.detections || []);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate trend data
  const getTrendData = () => {
    if (!stats?.recentActivity) return [];
    
    // Group by date and calculate totals
    const dailyData = {};
    stats.recentActivity.forEach(activity => {
      if (!dailyData[activity.date]) {
        dailyData[activity.date] = {
          date: activity.date,
          scans: 0,
          items: 0,
          types: 0
        };
      }
      dailyData[activity.date].scans += activity.scans;
      dailyData[activity.date].items += activity.items;
      dailyData[activity.date].types += activity.uniqueWasteTypes;
    });

    return Object.values(dailyData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  };

  // Calculate waste type distribution
  const getWasteTypeDistribution = () => {
    if (!stats?.byWasteType) return [];
    
    const total = Object.values(stats.byWasteType).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(stats.byWasteType)
      .map(([type, count]) => ({
        type,
        count,
        percentage: ((count / total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Get waste categories breakdown
  const getCategoryBreakdown = () => {
    const distribution = getWasteTypeDistribution();
    
    const categories = {
      'Fruits': ['apple', 'apple-core', 'apple-peel', 'avocado', 'banana-peel', 'orange', 
                 'orange-peel', 'papaya', 'pear', 'pear-core', 'pear-peel', 'pineapple', 
                 'watermelon', 'calamansi'],
      'Vegetables': ['broccoli', 'cucumber', 'garlic', 'onion', 'tomato', 'potato', 'mushroom'],
      'Proteins': ['bone', 'bone-fish', 'chicken-skin', 'fish', 'meat', 'shrimp', 'shrimp-shell', 'mussel', 'mussel-shell'],
      'Eggs': ['egg-scramble', 'egg-shell', 'egg-yolk'],
      'Grains': ['bread', 'bun', 'noodle', 'pasta', 'rice'],
      'Other': ['congee', 'leaf', 'malunggay', 'pancake', 'tofu', 'good']
    };

    const breakdown = {};
    Object.keys(categories).forEach(category => {
      breakdown[category] = 0;
    });

    distribution.forEach(item => {
      let found = false;
      Object.entries(categories).forEach(([category, types]) => {
        if (types.includes(item.type)) {
          breakdown[category] += item.count;
          found = true;
        }
      });
      if (!found) {
        breakdown['Other'] += item.count;
      }
    });

    return Object.entries(breakdown)
      .map(([category, count]) => ({ category, count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const trendData = getTrendData();
  const wasteDistribution = getWasteTypeDistribution();
  const categoryBreakdown = getCategoryBreakdown();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Waste Analytics</h1>
              <p className="text-gray-600 mt-1">Insights and trends for organic waste detection</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div>
            <label className="text-sm text-gray-600 mr-2">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100 text-sm font-medium">Total Scans</span>
            <svg className="w-6 h-6 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <p className="text-4xl font-bold">{stats?.totalDetections || 0}</p>
          <p className="text-green-100 text-xs mt-2">Detection sessions</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">Total Items</span>
            <svg className="w-6 h-6 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-4xl font-bold">{stats?.totalItems || 0}</p>
          <p className="text-blue-100 text-xs mt-2">Individual waste items</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100 text-sm font-medium">Avg Items/Scan</span>
            <svg className="w-6 h-6 text-purple-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-4xl font-bold">{stats?.averageItemsPerScan || 0}</p>
          <p className="text-purple-100 text-xs mt-2">Items per detection</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-100 text-sm font-medium">Avg Confidence</span>
            <svg className="w-6 h-6 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="text-4xl font-bold">{(parseFloat(stats?.averageConfidence || 0) * 100).toFixed(1)}%</p>
          <p className="text-amber-100 text-xs mt-2">Model accuracy</p>
        </div>
      </div>

      {/* Activity Trend Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Detection Activity Trend
        </h2>
        
        {trendData && trendData.length > 0 ? (
          <div className="space-y-4">
            {/* Simple bar chart */}
            <div className="overflow-x-auto">
              <div className="min-w-full inline-flex gap-2 items-end h-64 pb-8">
                {trendData.map((day, idx) => {
                  const maxScans = Math.max(...trendData.map(d => d.scans));
                  const height = (day.scans / maxScans) * 100;
                  
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group">
                      <div className="relative w-full">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          <div className="font-semibold">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          <div>Scans: {day.scans}</div>
                          <div>Items: {day.items}</div>
                          <div>Types: {day.types}</div>
                        </div>
                        
                        {/* Bar */}
                        <div 
                          className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all hover:from-green-700 hover:to-green-500"
                          style={{ height: `${height}%`, minHeight: height > 0 ? '8px' : '0' }}
                        ></div>
                      </div>
                      
                      {/* Date label */}
                      <span className="text-xs text-gray-600 mt-2 rotate-45 origin-left">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
                <span className="text-gray-600">Detection Scans</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No trend data available
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Waste Category Breakdown
          </h2>
          
          {categoryBreakdown && categoryBreakdown.length > 0 ? (
            <div className="space-y-4">
              {categoryBreakdown.map((item, idx) => {
                const total = categoryBreakdown.reduce((sum, cat) => sum + cat.count, 0);
                const percentage = ((item.count / total) * 100).toFixed(1);
                const colors = [
                  'bg-red-500',
                  'bg-orange-500',
                  'bg-amber-500',
                  'bg-yellow-500',
                  'bg-green-500',
                  'bg-blue-500',
                  'bg-purple-500'
                ];
                
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 ${colors[idx % colors.length]} rounded mr-3`}></div>
                        <span className="text-gray-700 font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-800 font-bold">{item.count}</span>
                        <span className="text-gray-500 text-sm ml-2">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${colors[idx % colors.length]} h-3 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No category data available
            </div>
          )}
        </div>

        {/* Top Waste Types */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Top 10 Most Detected Items
          </h2>
          
          {stats?.topWasteTypes && stats.topWasteTypes.length > 0 ? (
            <div className="space-y-3">
              {stats.topWasteTypes.map((item, idx) => {
                const maxCount = stats.topWasteTypes[0]?.count || 1;
                const percentage = (item.count / maxCount) * 100;
                
                return (
                  <div key={idx} className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-green-700 font-bold text-sm">#{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 truncate">{item.type}</span>
                        <span className="text-sm font-bold text-green-600 ml-2">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No waste type data available
            </div>
          )}
        </div>
      </div>

      {/* All Waste Types Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Complete Waste Type Distribution
        </h2>
        
        {wasteDistribution && wasteDistribution.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Waste Type</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Count</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Percentage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {wasteDistribution.slice(0, 20).map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">#{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">{item.count}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.percentage}%</td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {wasteDistribution.length > 20 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing top 20 of {wasteDistribution.length} waste types
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No waste distribution data available
          </div>
        )}
      </div>

      {/* Insights Panel */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
        <div className="flex items-start">
          <div className="bg-green-600 p-3 rounded-full mr-4 flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-green-900 mb-3">💡 Key Insights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {stats?.topWasteTypes?.[0] && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Most Common Waste</p>
                  <p className="text-lg font-bold text-green-700">{stats.topWasteTypes[0].type}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.topWasteTypes[0].count} detections</p>
                </div>
              )}
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Total Unique Types Detected</p>
                <p className="text-lg font-bold text-blue-700">{Object.keys(stats?.byWasteType || {}).length}</p>
                <p className="text-xs text-gray-500 mt-1">Out of 45 possible types</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Average Detection Quality</p>
                <p className="text-lg font-bold text-purple-700">
                  {stats?.averageConfidence ? 
                    (parseFloat(stats.averageConfidence) > 0.8 ? 'Excellent' :
                     parseFloat(stats.averageConfidence) > 0.6 ? 'Good' : 'Fair') 
                    : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(parseFloat(stats?.averageConfidence || 0) * 100).toFixed(1)}% confidence
                </p>
              </div>
              
              {categoryBreakdown[0] && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Dominant Category</p>
                  <p className="text-lg font-bold text-amber-700">{categoryBreakdown[0].category}</p>
                  <p className="text-xs text-gray-500 mt-1">{categoryBreakdown[0].count} items</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;