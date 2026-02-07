import React, { useState, useEffect } from 'react';

/**
 * Detections Page - Admin Panel
 * Displays all user detections for admin monitoring
 */
const DetectionsPage = () => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, organic, recyclable, non-recyclable
  const [searchTerm, setSearchTerm] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchDetections = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/detections/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDetections(data.detections || []);
      } else {
        console.error('Failed to fetch detections');
      }
    } catch (error) {
      console.error('Error fetching detections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
  }, []);

  // Filter detections based on category and search term
  const filteredDetections = detections.filter((detection) => {
    const matchesFilter = filter === 'all' || detection.summary?.category === filter;
    const matchesSearch = 
      detection.summary?.wasteType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detection._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detection.user.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading detections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Detections</h1>
              <p className="text-gray-600 mt-1">View all waste detection records</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Detections</p>
            <p className="text-3xl font-bold text-green-600">{detections.length}</p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by waste type, ID, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('organic')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'organic'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Organic
            </button>
            <button
              onClick={() => setFilter('recyclable')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'recyclable'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Recyclable
            </button>
            <button
              onClick={() => setFilter('non-recyclable')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'non-recyclable'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Non-Recyclable
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredDetections.length} of {detections.length} detections
        </div>
      </div>

      {/* Detections Grid */}
      {filteredDetections.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 text-lg">No detections found</p>
          <p className="text-gray-500 mt-2">
            {searchTerm || filter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Detections will appear here once users start analyzing waste'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDetections.map((detection) => {
            const category = detection.summary?.category || 'unknown';
            const categoryColors = {
              organic: 'bg-green-100 text-green-800 border-green-200',
              recyclable: 'bg-blue-100 text-blue-800 border-blue-200',
              'non-recyclable': 'bg-red-100 text-red-800 border-red-200',
              unknown: 'bg-gray-100 text-gray-800 border-gray-200',
            };

            return (
              <div
                key={detection._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Detection Image */}
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={detection.annotated_image}
                    alt="Detection"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${categoryColors[category]}`}
                    >
                      {category}
                    </span>
                  </div>
                </div>

                {/* Detection Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800 truncate">
                      {detection.summary?.wasteType || 'Unknown Waste'}
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-600 min-w-[80px]">Detection ID:</span>
                      <span className="text-gray-700 font-mono text-xs truncate">
                        {detection._id.substring(0, 12)}...
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-600 min-w-[80px]">User ID:</span>
                      <span className="text-gray-700 font-mono text-xs truncate">
                        {detection.user.substring(0, 12)}...
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-600 min-w-[80px]">Date:</span>
                      <span className="text-gray-700">
                        {new Date(detection.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-600 min-w-[80px]">Time:</span>
                      <span className="text-gray-700">
                        {new Date(detection.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {detection.summary?.confidence && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Confidence</span>
                        <span className="text-xs font-bold text-green-600">
                          {(detection.summary.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${detection.summary.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DetectionsPage;