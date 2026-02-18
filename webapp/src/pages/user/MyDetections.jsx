// webapp/src/pages/user/MyDetections.jsx - Updated with disposal location finder
import React, { useState, useEffect } from 'react';

const MyDetections = () => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [disposalLocations, setDisposalLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showDisposalModal, setShowDisposalModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDetections();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const fetchDetections = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/detections/history`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDetections(data.detections || data);
      }
    } catch (err) {
      console.error('Error fetching detections:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisposalLocations = async (detection) => {
    if (!userLocation) {
      alert('Please enable location services to find nearby disposal locations');
      return;
    }

    try {
      setLoadingLocations(true);
      const token = localStorage.getItem('token');

      const wasteTypes = detection.detectedWasteTypes || 
                        detection.detections?.map(d => d.class) || 
                        [];

      const response = await fetch(
        `${API_URL}/api/disposal-locations/recommended?` +
        `latitude=${userLocation.latitude}&` +
        `longitude=${userLocation.longitude}&` +
        `wasteTypes=${wasteTypes.join(',')}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDisposalLocations(data.data || []);
        setShowDisposalModal(true);
      }
    } catch (error) {
      console.error('Error fetching disposal locations:', error);
      alert('Failed to fetch disposal locations');
    } finally {
      setLoadingLocations(false);
    }
  };

  const getSortedDetections = () => {
    let sorted = [...detections];

    if (searchTerm) {
      sorted = sorted.filter(d => 
        d.detectedWasteTypes?.some(type => 
          type.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortBy === 'recent') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'items') {
      sorted.sort((a, b) => (b.detections?.length || 0) - (a.detections?.length || 0));
    }

    return sorted;
  };

  const sortedDetections = getSortedDetections();

  const getDetectionImageUrl = (detection) => {
    return detection.annotated_image || detection.imageUrl || detection.image || null;
  };

  const getWasteGuideEntries = (detection) => Object.entries(detection?.waste_guides || {});

  const getWasteDisposalGuideEntries = (detection) => Object.entries(detection?.waste_disposal_guides || {});

  const openDetails = (detection) => {
    setSelectedDetection(detection);
  };

  const closeDetails = () => {
    setSelectedDetection(null);
  };

  const handleFindDisposal = (detection) => {
    setSelectedDetection(detection);
    fetchDisposalLocations(detection);
  };

  const handleOpenMap = (location) => {
    if (userLocation) {
      // OpenStreetMap directions URL
      const url = `https://www.openstreetmap.org/directions?from=${userLocation.latitude},${userLocation.longitude}&to=${location.location.coordinates[1]},${location.location.coordinates[0]}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          My Detections
        </h1>
        <p className="text-blue-100">View your complete waste detection history and find disposal locations</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by waste type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="items">Most Items</option>
          </select>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Showing {sortedDetections.length} detection{sortedDetections.length !== 1 ? 's' : ''}
        </p>
      </div>

      {sortedDetections.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {sortedDetections.map((detection, idx) => (
            <div key={detection._id || idx} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {getDetectionImageUrl(detection) && (
                <img
                  src={getDetectionImageUrl(detection)}
                  alt={`Detection from ${new Date(detection.createdAt).toLocaleString()}`}
                  className="w-full h-48 object-cover bg-gray-100"
                  loading="lazy"
                />
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {detection.detections?.length || 0} Items
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(detection.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {detection.summary?.average_confidence 
                        ? `${(detection.summary.average_confidence * 100).toFixed(1)}%`
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">confidence</p>
                  </div>
                </div>

                {detection.detectedWasteTypes && detection.detectedWasteTypes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Detected Types:</p>
                    <div className="flex flex-wrap gap-2">
                      {detection.detectedWasteTypes.slice(0, 3).map((type, i) => (
                        <span key={i} className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          {type}
                        </span>
                      ))}
                      {detection.detectedWasteTypes.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          +{detection.detectedWasteTypes.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {detection.summary?.unique_classes || 0}
                    </p>
                    <p className="text-xs text-gray-500">Unique</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">
                      {detection.summary?.total_detections || 0}
                    </p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-600">
                      {detection.summary?.highest_confidence 
                        ? `${(detection.summary.highest_confidence * 100).toFixed(0)}%`
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">Highest</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openDetails(detection)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleFindDisposal(detection)}
                    disabled={loadingLocations}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {loadingLocations && selectedDetection?._id === detection._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Find Disposal
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg font-medium mb-2">No detections found</p>
          <p className="text-gray-400 text-sm">
            {searchTerm ? 'Try a different search term' : 'Start scanning waste to see your history'}
          </p>
        </div>
      )}
      
      {selectedDetection && !showDisposalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={closeDetails}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Detection Details</h2>
              <button
                onClick={closeDetails}
                className="text-sm font-semibold px-3 py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-5">
              {getDetectionImageUrl(selectedDetection) && (
                <img
                  src={getDetectionImageUrl(selectedDetection)}
                  alt="Detection detail"
                  className="w-full max-h-[420px] object-contain rounded-lg bg-gray-100"
                />
              )}

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Detected Items</p>
                  <p className="text-lg font-bold text-blue-700">{selectedDetection.summary?.total_detections || selectedDetection.detections?.length || 0}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Avg Confidence</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {selectedDetection.summary?.average_confidence
                      ? `${(selectedDetection.summary.average_confidence * 100).toFixed(1)}%`
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Scanned At</p>
                  <p className="text-sm font-semibold text-amber-700">{new Date(selectedDetection.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Detected Objects</h3>
                {selectedDetection.detections?.length ? (
                  <div className="space-y-2">
                    {selectedDetection.detections.map((item, index) => (
                      <div key={index} className="bg-gray-50 border-l-4 border-green-500 rounded-md p-3">
                        <p className="font-semibold text-gray-800">{item.class || item.name || 'Unknown item'}</p>
                        <p className="text-sm text-gray-600">
                          Confidence: {item.confidence ? `${(item.confidence * 100).toFixed(1)}%` : 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No item-level details available for this detection.</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Waste Guides</h3>
                {getWasteGuideEntries(selectedDetection).length ? (
                  <div className="space-y-2">
                    {getWasteGuideEntries(selectedDetection).map(([className, guide]) => (
                      <div key={className} className="bg-blue-50 border border-blue-100 rounded-md p-3">
                        <p className="font-semibold text-blue-900">{className}</p>
                        <p className="text-sm text-blue-800">{guide.description || 'No description available.'}</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Category: {guide.category || 'Unknown'} • Compostable: {guide.compostable === null ? 'Unknown' : guide.compostable ? 'Yes' : 'No'}
                          {guide.avgDecompositionDays ? ` • Decomposition: ${guide.avgDecompositionDays} days` : ''}
                          {guide.count ? ` • Count: ${guide.count}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No waste-guide metadata available for this detection.</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Waste Disposal Guides</h3>
                {getWasteDisposalGuideEntries(selectedDetection).length ? (
                  <div className="space-y-3">
                    {getWasteDisposalGuideEntries(selectedDetection).map(([className, guide]) => (
                      <div key={className} className="bg-emerald-50 border border-emerald-100 rounded-md p-3">
                        <p className="font-semibold text-emerald-900">{className}</p>
                        <p className="text-sm text-emerald-800">Bin: {(guide.bin || 'residual').toUpperCase()}</p>
                        {Array.isArray(guide.instructions) && guide.instructions.length > 0 && (
                          <ul className="list-disc list-inside text-sm text-emerald-800 mt-1 space-y-1">
                            {guide.instructions.map((instruction, index) => (
                              <li key={`${className}-instruction-${index}`}>{instruction}</li>
                            ))}
                          </ul>
                        )}
                        {guide.notes && (
                          <p className="text-xs text-emerald-700 mt-1">Note: {guide.notes}</p>
                        )}
                        {guide.count ? (
                          <p className="text-xs text-emerald-700 mt-1">Detected count: {guide.count}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No waste-disposal guide available for this detection.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDisposalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowDisposalModal(false)}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Nearby Disposal Locations</h2>
                <p className="text-green-100 text-sm">Found {disposalLocations.length} location{disposalLocations.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => setShowDisposalModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {disposalLocations.length > 0 ? (
                <div className="space-y-4">
                  {disposalLocations.map((location, index) => (
                    <div key={location._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            <h3 className="text-lg font-bold text-gray-800">{location.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{location.address}</p>
                          <p className="text-sm font-semibold text-green-600">{location.distanceText} away</p>
                        </div>
                      </div>

                      {location.acceptedWasteTypes && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-2">Accepts:</p>
                          <div className="flex flex-wrap gap-1">
                            {location.acceptedWasteTypes.slice(0, 5).map((type, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {type}
                              </span>
                            ))}
                            {location.acceptedWasteTypes.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                +{location.acceptedWasteTypes.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {location.recommendation && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3 rounded">
                          <p className="text-sm text-blue-800">{location.recommendation}</p>
                        </div>
                      )}

                      <button
                        onClick={() => handleOpenMap(location)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        View on OpenStreetMap
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium mb-2">No disposal locations found nearby</p>
                  <p className="text-gray-500 text-sm">Please check with your local waste management authority for proper disposal methods.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDetections;