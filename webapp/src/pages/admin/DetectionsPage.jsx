import React, { useState, useEffect } from 'react';

/**
 * Detections Page - Admin Panel
 * Displays all user detections for admin monitoring
 * UPDATED FOR MULTI-CLASS ORGANIC WASTE DETECTION (45 classes)
 */
const DetectionsPage = () => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [selectedWasteType, setSelectedWasteType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchDetections = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedWasteType && selectedWasteType !== 'all') {
        params.append('wasteType', selectedWasteType);
      }

      const response = await fetch(`${API_URL}/api/detections/history?${params}`, {
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

  const fetchWasteTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/detections/waste-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWasteTypes(data.wasteTypes || []);
      }
    } catch (error) {
      console.error('Error fetching waste types:', error);
    }
  };

  useEffect(() => {
    fetchWasteTypes();
  }, []);

  useEffect(() => {
    fetchDetections();
  }, [selectedWasteType]);

  // Filter detections based on search term
  const filteredDetections = detections.filter((detection) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const matchesId = detection._id.toLowerCase().includes(searchLower);
    const matchesUser = detection.user?.toLowerCase().includes(searchLower);
    const matchesPrimaryType = detection.primaryWasteType?.toLowerCase().includes(searchLower);
    const matchesAnyType = detection.detectedWasteTypes?.some(type =>
      type.toLowerCase().includes(searchLower)
    );

    return matchesId || matchesUser || matchesPrimaryType || matchesAnyType;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <div className="skeleton-shimmer h-8 w-48" />
              <div className="skeleton-shimmer h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="skeleton-shimmer h-10 flex-1" />
            <div className="skeleton-shimmer h-10 w-32" />
          </div>
        </div>
        {/* Detection cards skeleton */}
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="skeleton-shimmer h-48 w-full rounded-none" />
              <div className="p-6 space-y-3">
                <div className="skeleton-shimmer h-5 w-40" />
                <div className="skeleton-shimmer h-4 w-60" />
                <div className="flex gap-2">
                  <div className="skeleton-shimmer h-6 w-16 rounded-full" />
                  <div className="skeleton-shimmer h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
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
              <p className="text-gray-600 mt-1">View all organic waste detection records</p>
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

          {/* Waste Type Filter Dropdown */}
          <div className="w-full sm:w-64">
            <select
              value={selectedWasteType}
              onChange={(e) => setSelectedWasteType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="all">All Waste Types</option>
              {wasteTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredDetections.length} of {detections.length} detections
          {selectedWasteType && selectedWasteType !== 'all' && (
            <span className="ml-2 text-green-600 font-medium">
              (filtered by: {selectedWasteType})
            </span>
          )}
        </div>
      </div>

      {/* Detections Grid */}
      {filteredDetections.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 text-lg">No detections found</p>
          <p className="text-gray-500 mt-2">
            {searchTerm || selectedWasteType !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Detections will appear here once users start analyzing waste'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDetections.map((detection) => {
            const itemCount = detection.detections?.length || 0;
            const uniqueTypes = detection.detectedWasteTypes?.length || 0;

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
                  {/* Badge showing number of items detected */}
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </div>
                </div>

                {/* Detection Info */}
                <div className="p-4">
                  {/* Primary Waste Type */}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-800">
                      {detection.primaryWasteType || 'Unknown'}
                    </h3>
                    {uniqueTypes > 1 && (
                      <p className="text-xs text-gray-500">
                        +{uniqueTypes - 1} other type{uniqueTypes - 1 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* All Detected Types */}
                  {detection.detectedWasteTypes && detection.detectedWasteTypes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 font-semibold mb-1">Detected:</p>
                      <div className="flex flex-wrap gap-1">
                        {detection.detectedWasteTypes.slice(0, 3).map((type, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                          >
                            {type}
                          </span>
                        ))}
                        {detection.detectedWasteTypes.length > 3 && (
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            +{detection.detectedWasteTypes.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Meta Information */}
                  <div className="space-y-2 text-sm border-t border-gray-200 pt-3">
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-600 min-w-[70px]">ID:</span>
                      <span className="text-gray-700 font-mono text-xs truncate">
                        {detection._id.substring(0, 12)}...
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-600 min-w-[70px]">User:</span>
                      <span className="text-gray-700 font-mono text-xs truncate">
                        {detection.user.substring(0, 12)}...
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-600 min-w-[70px]">Date:</span>
                      <span className="text-gray-700">
                        {new Date(detection.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-600 min-w-[70px]">Time:</span>
                      <span className="text-gray-700">
                        {new Date(detection.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  {detection.summary?.highest_confidence && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Highest Confidence</span>
                        <span className="text-xs font-bold text-green-600">
                          {(detection.summary.highest_confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${detection.summary.highest_confidence * 100}%` }}
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