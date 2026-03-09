// webapp/src/pages/user/MyDetections.jsx - Updated with disposal location finder
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeaderCard from '../../components/PageHeaderCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

// ---------------------------------------------------------------------------
// Client-side fallback guide data (mirrors backend constants).
// Used when the API response is missing waste_guides / waste_disposal_guides,
// which can happen with older DB records that pre-date the guide attachment.
// ---------------------------------------------------------------------------
const CATEGORY_MAP = {
  apple: 'Fruits', 'apple-core': 'Fruits', 'apple-peel': 'Fruits',
  avocado: 'Fruits', 'banana-peel': 'Fruits', 'bitten-apple': 'Fruits',
  calamansi: 'Fruits', mango: 'Fruits',
  orange: 'Fruits', 'orange-peel': 'Fruits',
  pear: 'Fruits', 'pear-core': 'Fruits', 'pear-peel': 'Fruits',
  pineapple: 'Fruits', papaya: 'Fruits', watermelon: 'Fruits',
  'watermelon-rotten': 'Fruits',
  broccoli: 'Vegetables', cabbage: 'Vegetables', 'cabbage-core': 'Vegetables',
  'carrot-peel': 'Vegetables', corn: 'Vegetables', cucumber: 'Vegetables', garlic: 'Vegetables',
  'garlic-skin': 'Vegetables', kangkong: 'Vegetables', mushroom: 'Vegetables',
  onion: 'Vegetables', 'onion-skin': 'Vegetables', pechay: 'Vegetables',
  potato: 'Vegetables', seed: 'Vegetables', tomato: 'Vegetables',
  bone: 'Proteins', 'bone-fish': 'Proteins', 'chicken-bone': 'Proteins',
  'chicken-skin': 'Proteins', fish: 'Proteins', meat: 'Proteins',
  'mussel-shell': 'Proteins', shrimp: 'Proteins', 'shrimp-shell': 'Proteins',
  'egg-scramble': 'Eggs', 'egg-shell': 'Eggs', eggshell: 'Eggs', 'egg-yolk': 'Eggs',
  bread: 'Grains', bun: 'Grains', noodle: 'Grains', pasta: 'Grains', rice: 'Grains',
  bread_fresh: 'Grains', bread_in_trash: 'Grains', bread_moldy: 'Grains',
  bread_rotten: 'Grains', bread_stale: 'Grains',
  congee: 'Other', malunggay: 'Other', pancake: 'Other', tofu: 'Other',
  'paper-tissue': 'Non-Organics', 'plastic-waste': 'Non-Organics',
};

const BIN_MAP = {
  apple: 'compost', 'apple-core': 'compost', 'apple-peel': 'compost',
  avocado: 'compost', 'banana-peel': 'compost', 'bitten-apple': 'compost',
  calamansi: 'compost', mango: 'compost',
  orange: 'compost', 'orange-peel': 'compost',
  pear: 'compost', 'pear-core': 'compost', 'pear-peel': 'compost',
  pineapple: 'compost', papaya: 'compost', watermelon: 'compost',
  'watermelon-rotten': 'compost',
  broccoli: 'compost', cabbage: 'compost', 'cabbage-core': 'compost',
  'carrot-peel': 'compost', corn: 'compost', cucumber: 'compost', garlic: 'compost',
  'garlic-skin': 'compost', kangkong: 'compost', mushroom: 'compost',
  onion: 'compost', 'onion-skin': 'compost', pechay: 'compost',
  potato: 'compost', seed: 'compost', tomato: 'compost',
  bone: 'residual', 'bone-fish': 'compost', 'chicken-bone': 'residual',
  'chicken-skin': 'compost', fish: 'compost', meat: 'compost',
  'mussel-shell': 'special handling', shrimp: 'compost', 'shrimp-shell': 'compost',
  'egg-scramble': 'compost', 'egg-shell': 'compost', eggshell: 'compost', 'egg-yolk': 'compost',
  bread: 'compost', bun: 'compost', noodle: 'compost', pasta: 'compost', rice: 'compost',
  bread_fresh: 'compost', bread_in_trash: 'compost', bread_moldy: 'compost',
  bread_rotten: 'compost', bread_stale: 'compost',
  congee: 'compost', malunggay: 'compost', pancake: 'compost', tofu: 'compost',
  'paper-tissue': 'compost', 'plastic-waste': 'residual',
  'plastic-bottle': 'recyclable', 'food-waste': 'compost',
};

/**
 * Build waste_guides and waste_disposal_guides from a raw detections array.
 * This mirrors attachDetectionGuides() on the backend and acts as a fallback.
 */
const buildGuidesFromDetections = (detections = []) => {
  const wasteGuides = {};
  const wasteDisposalGuides = {};

  detections.forEach((item) => {
    const cls = item?.class;
    if (!cls) return;

    if (!wasteGuides[cls]) {
      const category = CATEGORY_MAP[cls] || 'Unknown';
      const isOrganic = (BIN_MAP[cls] || 'residual') === 'compost';
      wasteGuides[cls] = {
        category,
        description: `${cls.replace(/-/g, ' ')} — ${category.toLowerCase()} waste`,
        compostable: isOrganic,
        avgDecompositionDays: isOrganic ? '7-90' : null,
        color: '#9ca3af',
        count: 0,
      };
    }
    wasteGuides[cls].count += 1;

    if (!wasteDisposalGuides[cls]) {
      const bin = BIN_MAP[cls] || 'residual';
      wasteDisposalGuides[cls] = {
        bin,
        instructions: [
          `Place ${cls.replace(/-/g, ' ')} in the ${bin} bin.`,
          'Check your local waste segregation rules for additional guidance.',
        ],
        notes: null,
        count: 0,
      };
    }
    wasteDisposalGuides[cls].count += 1;
  });

  return { wasteGuides, wasteDisposalGuides };
};

/**
 * Ensure a detection object always has populated guide fields.
 * If the API already returned them, use those; otherwise build from detections[].
 */
const ensureGuides = (detection) => {
  const hasWasteGuides = detection.waste_guides && Object.keys(detection.waste_guides).length > 0;
  const hasDisposalGuides = detection.waste_disposal_guides && Object.keys(detection.waste_disposal_guides).length > 0;

  if (hasWasteGuides && hasDisposalGuides) return detection;

  const { wasteGuides, wasteDisposalGuides } = buildGuidesFromDetections(detection.detections || []);
  return {
    ...detection,
    waste_guides: hasWasteGuides ? detection.waste_guides : wasteGuides,
    waste_disposal_guides: hasDisposalGuides ? detection.waste_disposal_guides : wasteDisposalGuides,
  };
};

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
        const raw = data.detections || data;
        setDetections(Array.isArray(raw) ? raw.map(ensureGuides) : []);
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

  const getUserLocationMapEmbedUrl = () => {
    if (!userLocation) return null;

    const radius = 0.01;
    const left = userLocation.longitude - radius;
    const right = userLocation.longitude + radius;
    const top = userLocation.latitude + radius;
    const bottom = userLocation.latitude - radius;

    return `https://www.openstreetmap.org/export/embed.html?bbox=${left},${bottom},${right},${top}&layer=mapnik&marker=${userLocation.latitude},${userLocation.longitude}`;
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        <div className="skeleton-shimmer h-32 rounded-[2rem]" />
        <div className="rounded-[2rem] shadow-sm p-6" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="skeleton-shimmer h-12 rounded-xl flex-1" />
            <div className="skeleton-shimmer h-12 rounded-xl w-40" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-[2rem] shadow-sm overflow-hidden" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
              <div className="skeleton-shimmer h-48 w-full rounded-none" />
              <div className="p-8 space-y-4">
                <div className="skeleton-shimmer h-12 w-12 rounded-2xl" />
                <div className="space-y-2">
                  <div className="skeleton-shimmer h-4 w-32" />
                  <div className="skeleton-shimmer h-3 w-40" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <PageHeaderCard
          title="My Detections"
          subtitle="View your complete waste detection history and find disposal locations."
          variant="info"
          icon={(
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-[2rem] shadow-sm p-6" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" fill="none" stroke="var(--theme-text-muted, #9ca3af)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by waste type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-2xl transition-all font-medium"
              style={{ background: 'var(--theme-input-bg, #f9fafb)', border: '1px solid var(--theme-border, #f0f0f0)', color: 'var(--theme-text, #111827)' }}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-5 py-4 rounded-2xl transition-all font-bold min-w-[200px]"
            style={{ background: 'var(--theme-input-bg, #f9fafb)', border: '1px solid var(--theme-border, #f0f0f0)', color: 'var(--theme-text, #111827)' }}
          >
            <option value="recent">Most Recent First</option>
            <option value="oldest">Oldest First</option>
            <option value="items">Items Discovered (High to Low)</option>
          </select>
        </div>
        <p className="text-sm font-bold mt-4 uppercase tracking-widest ml-2" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>
          Displaying {sortedDetections.length} Activity {sortedDetections.length !== 1 ? 'Logs' : 'Log'}
        </p>
      </motion.div>

      {sortedDetections.length > 0 ? (
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {sortedDetections.map((detection, idx) => (
              <motion.div
                key={detection._id || idx}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="rounded-[2rem] shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col"
                style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}
              >
                <div className="relative overflow-hidden w-full h-56" style={{ background: 'var(--theme-input-bg, #f1f5f9)' }}>
                  {getDetectionImageUrl(detection) ? (
                    <img
                      src={getDetectionImageUrl(detection)}
                      alt={`Detection on ${new Date(detection.createdAt).toLocaleString()}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-full bg-slate-100 flex items-center justify-center';
                        placeholder.innerHTML = '<svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>';
                        e.target.parentNode.insertBefore(placeholder, e.target);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {detection.summary?.highest_confidence && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-xs font-bold text-gray-900 tracking-wider">{(detection.summary.highest_confidence * 100).toFixed(0)}% CONF</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center space-x-4 mb-5">
                    <div className="p-3.5 rounded-2xl flex-shrink-0" style={{ background: 'var(--theme-accent-surface, #f0fdf4)', border: '1px solid var(--theme-accent-surface-border, #bbf7d0)' }}>
                      <svg className="w-6 h-6" fill="none" stroke="var(--theme-accent, #15803d)" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>
                        {new Date(detection.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="font-extrabold text-xl tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>
                        {detection.detections?.length || 0} Items Found
                      </p>
                    </div>
                  </div>

                  {detection.detectedWasteTypes && detection.detectedWasteTypes.length > 0 && (
                    <div className="mb-6 flex-1">
                      <div className="flex flex-wrap gap-2">
                        {detection.detectedWasteTypes.slice(0, 3).map((type, i) => (
                          <span key={i} className="px-3 py-1.5 text-xs font-bold rounded-lg capitalize tracking-wide" style={{ background: 'var(--theme-input-bg, #f1f5f9)', border: '1px solid var(--theme-border, #f0f0f0)', color: 'var(--theme-text-secondary, #475569)' }}>
                            {type.replace(/-/g, ' ')}
                          </span>
                        ))}
                        {detection.detectedWasteTypes.length > 3 && (
                          <span className="px-3 py-1.5 text-xs font-bold rounded-lg" style={{ background: 'var(--theme-input-bg, #f1f5f9)', border: '1px solid var(--theme-border, #f0f0f0)', color: 'var(--theme-text-muted, #9ca3af)' }}>
                            +{detection.detectedWasteTypes.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button
                      onClick={() => openDetails(detection)}
                      className="w-full text-sm font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all active:scale-95"
                      style={{ background: 'var(--theme-input-bg, #f1f5f9)', border: '1px solid var(--theme-border, #e2e8f0)', color: 'var(--theme-text, #0f172a)' }}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleFindDisposal(detection)}
                      disabled={loadingLocations || (!detection.detections?.length && !detection.summary?.total_detections)}
                      className={`w-full text-white text-sm font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 ${(!detection.detections?.length && !detection.summary?.total_detections) ? 'opacity-50 cursor-not-allowed shadow-none' : 'disabled:opacity-50'}`}
                      style={{ background: 'var(--theme-accent, #15803d)' }}
                    >
                      {loadingLocations && selectedDetection?._id === detection._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white"></div>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Disposal
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="rounded-[2rem] shadow-sm p-16 text-center" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] mb-6 shadow-sm" style={{ background: 'var(--theme-input-bg, #f8fafc)', border: '1px solid var(--theme-border, #f0f0f0)' }}>
            <svg className="w-10 h-10" fill="none" stroke="var(--theme-text-muted, #cbd5e1)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--theme-text, #111827)' }}>No detections found</p>
          <p className="font-medium" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>
            {searchTerm ? 'Try a different search term or clear the filter.' : 'Launch the mobile app and start scanning waste to see your history here.'}
          </p>
        </motion.div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedDetection && !showDisposalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={closeDetails}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              style={{ background: 'var(--theme-card, #ffffff)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-8 py-5 flex items-center justify-between z-10" style={{ background: 'var(--theme-card, #ffffff)', borderBottom: '1px solid var(--theme-border, #f0f0f0)' }}>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>Detection Report</h2>
                <button
                  onClick={closeDetails}
                  className="w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95"
                  style={{ background: 'var(--theme-input-bg, #f1f5f9)', color: 'var(--theme-text-muted, #9ca3af)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8" style={{ background: 'var(--theme-bg, #ffffff)' }}>
                {getDetectionImageUrl(selectedDetection) && (
                  <div className="w-full rounded-2xl overflow-hidden shadow-inner h-[400px]" style={{ background: 'var(--theme-input-bg, #f1f5f9)', border: '1px solid var(--theme-border, #f0f0f0)' }}>
                    <img
                      src={getDetectionImageUrl(selectedDetection)}
                      alt="Detection detail"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl p-6" style={{ background: 'var(--theme-accent-surface, #f0fdf4)', border: '1px solid var(--theme-accent-surface-border, #bbf7d0)' }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-accent, #15803d)' }}>Items Found</p>
                    <p className="text-4xl font-extrabold" style={{ color: 'var(--theme-text, #111827)' }}>{selectedDetection.summary?.total_detections || selectedDetection.detections?.length || 0}</p>
                  </div>
                  <div className="rounded-2xl p-6" style={{ background: 'var(--theme-accent-surface, #f0fdf4)', border: '1px solid var(--theme-accent-surface-border, #bbf7d0)' }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-accent, #15803d)' }}>Avg Confidence</p>
                    <p className="text-4xl font-extrabold" style={{ color: 'var(--theme-text, #111827)' }}>
                      {selectedDetection.summary?.average_confidence
                        ? `${(selectedDetection.summary.average_confidence * 100).toFixed(1)}%`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-2xl p-6" style={{ background: 'var(--theme-accent-surface, #f0fdf4)', border: '1px solid var(--theme-accent-surface-border, #bbf7d0)' }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-accent, #15803d)' }}>Scanned Date</p>
                    <p className="text-xl font-bold mt-2 tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>{new Date(selectedDetection.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>{new Date(selectedDetection.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4 tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>Classification Details</h3>
                    {selectedDetection.detections?.length ? (
                      <div className="space-y-3">
                        {selectedDetection.detections.map((item, index) => (
                          <div key={index} className="rounded-xl p-4 flex items-center justify-between group transition-colors" style={{ background: 'var(--theme-input-bg, #f9fafb)', border: '1px solid var(--theme-border, #f0f0f0)' }}>
                            <p className="font-bold capitalize tracking-wide" style={{ color: 'var(--theme-text, #111827)' }}>{item.class ? item.class.replace(/-/g, ' ') : item.name || 'Unknown item'}</p>
                            <span className="font-bold px-3 py-1 rounded-lg text-sm shadow-sm" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-border, #f0f0f0)', color: 'var(--theme-accent, #15803d)' }}>
                              {item.confidence ? `${(item.confidence * 100).toFixed(1)}%` : 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl text-center" style={{ background: 'var(--theme-input-bg, #f9fafb)', border: '1px solid var(--theme-border, #f0f0f0)' }}>
                        <p className="text-sm font-semibold" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>No specific items isolated in this image.</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {selectedDetection.ai_tips && selectedDetection.ai_tips.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>AI Smart Tips</h3>
                        </div>
                        <div className="space-y-3">
                          {selectedDetection.ai_tips.map((tip, index) => (
                            <div key={index} className="rounded-xl p-4 flex items-start gap-4" style={{ background: 'var(--theme-accent-surface, #f0fdf4)', border: '1px solid var(--theme-accent-surface-border, #bbf7d0)' }}>
                              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--theme-accent, #15803d)', color: 'white' }}>
                                <span className="text-xs font-bold">{index + 1}</span>
                              </div>
                              <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--theme-text-secondary, #475569)' }}>{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-bold mb-4 tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>Recycling Path</h3>
                        {getWasteDisposalGuideEntries(selectedDetection).length ? (
                          <div className="space-y-4">
                            {getWasteDisposalGuideEntries(selectedDetection).map(([className, guide]) => (
                              <div key={className} className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'var(--theme-accent-surface, #f0fdf4)', border: '1px solid var(--theme-accent-surface-border, #bbf7d0)' }}>
                                <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl" style={{ background: 'var(--theme-accent, #15803d)' }}></div>
                                <p className="font-bold capitalize text-lg tracking-tight mb-2" style={{ color: 'var(--theme-text, #111827)' }}>{className.replace(/-/g, ' ')}</p>
                                <div className="inline-block font-extrabold uppercase tracking-widest text-[10px] px-3 py-1.5 rounded-lg shadow-sm mb-3" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-accent-surface-border, #bbf7d0)', color: 'var(--theme-accent, #15803d)' }}>
                                  {guide.bin || 'residual'}
                                </div>
                                {Array.isArray(guide.instructions) && guide.instructions.length > 0 && (
                                  <ul className="list-disc list-inside text-sm space-y-1.5 font-medium ml-1" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>
                                    {guide.instructions.map((instruction, index) => (
                                      <li key={`${className}-instruction-${index}`}>{instruction}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>No waste disposal data connected.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disposal Mapping Modal */}
      <AnimatePresence>
        {showDisposalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setShowDisposalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
              style={{ background: 'var(--theme-card, #ffffff)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-6 flex items-center justify-between shadow-sm z-10 shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Nearby Drop-off Points</h2>
                  <p className="text-emerald-100 font-medium mt-1">Found {disposalLocations.length} authenticated location{disposalLocations.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => setShowDisposalModal(false)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-8 overflow-y-auto w-full grid md:grid-cols-2 gap-8" style={{ background: 'var(--theme-bg, #f8fafc)' }}>
                {/* Left side: map */}
                <div className="w-full">
                  {userLocation && (
                    <div className="rounded-[2rem] overflow-hidden shadow-md" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-border, #f0f0f0)' }}>
                      <iframe
                        title="Current location map"
                        src={getUserLocationMapEmbedUrl()}
                        className="w-full h-[400px] md:h-[500px]"
                        loading="lazy"
                      />
                      <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'var(--theme-card, #ffffff)', borderTop: '1px solid var(--theme-border, #f0f0f0)' }}>
                        <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(59,130,246,0.3)] animate-pulse"></div>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>
                          Your Position
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side: Locations List */}
                <div className="w-full overflow-y-auto max-h-[500px] pr-2 space-y-4">
                  {disposalLocations.length > 0 ? (
                    disposalLocations.map((location, index) => (
                      <div key={location._id} className="rounded-2xl p-6 shadow-sm hover:shadow-md transition-all" style={{ background: 'var(--theme-card, #ffffff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1.5">
                              <span className="flex items-center justify-center text-sm font-extrabold w-8 h-8 rounded-lg shadow-sm" style={{ background: 'var(--theme-accent-surface, #f0fdf4)', color: 'var(--theme-accent, #15803d)' }}>
                                {index + 1}
                              </span>
                              <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--theme-text, #111827)' }}>{location.name}</h3>
                            </div>
                            <p className="text-sm font-medium mb-2.5 ml-11" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>{location.address}</p>
                            <div className="ml-11 inline-block px-3 py-1 rounded-lg" style={{ background: 'var(--theme-input-bg, #f1f5f9)', border: '1px solid var(--theme-border, #f0f0f0)' }}>
                              <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>{location.distanceText} drive</p>
                            </div>
                          </div>
                        </div>

                        {location.acceptedWasteTypes && (
                          <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--theme-border, #f0f0f0)' }}>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Facility Accepts</p>
                            <div className="flex flex-wrap gap-2">
                              {location.acceptedWasteTypes.slice(0, 4).map((type, i) => (
                                <span key={i} className="px-3 py-1.5 text-xs font-bold rounded-lg lowercase tracking-wide" style={{ background: 'var(--theme-accent-surface, #f0fdf4)', border: '1px solid var(--theme-accent-surface-border, #bbf7d0)', color: 'var(--theme-accent, #15803d)' }}>
                                  {type}
                                </span>
                              ))}
                              {location.acceptedWasteTypes.length > 4 && (
                                <span className="px-3 py-1.5 text-xs font-bold rounded-lg" style={{ background: 'var(--theme-input-bg, #f1f5f9)', border: '1px solid var(--theme-border, #f0f0f0)', color: 'var(--theme-text-muted, #9ca3af)' }}>
                                  +{location.acceptedWasteTypes.length - 4} items
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleOpenMap(location)}
                          className="w-full mt-6 text-white font-bold tracking-wide uppercase text-xs py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                          style={{ background: 'var(--theme-accent, #15803d)' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          Get Directions
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-16 px-6 text-center rounded-3xl" style={{ background: 'var(--theme-card, #ffffff)', border: '2px dashed var(--theme-border, #e5e7eb)' }}>
                      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-sm" style={{ background: 'var(--theme-input-bg, #f8fafc)', border: '1px solid var(--theme-border, #f0f0f0)' }}>
                        <svg className="w-10 h-10" fill="none" stroke="var(--theme-text-muted, #cbd5e1)" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="font-bold text-xl tracking-tight mb-2" style={{ color: 'var(--theme-text, #111827)' }}>No facilities located nearby</p>
                      <p className="font-medium text-sm leading-relaxed max-w-sm" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>We couldn't lock onto any affiliated disposal drop-offs in your specific region. Please check with local sorting authorities.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MyDetections;