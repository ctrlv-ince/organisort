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
      <div className="space-y-8">
        <div className="skeleton-shimmer h-32 rounded-[2rem] w-full" />
        <div className="rounded-[2rem] shadow-sm border p-6" style={{ background: 'var(--theme-card, #fff)', borderColor: 'var(--theme-border, #f0f0f0)' }}>
          <div className="flex gap-4">
            <div className="skeleton-shimmer h-12 flex-1 rounded-xl" />
            <div className="skeleton-shimmer h-12 w-64 rounded-xl" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="rounded-[2rem] shadow-sm border overflow-hidden" style={{ background: 'var(--theme-card, #fff)', borderColor: 'var(--theme-border, #f0f0f0)' }}>
              <div className="skeleton-shimmer h-48 w-full rounded-none" />
              <div className="p-6 space-y-4">
                <div className="skeleton-shimmer h-6 w-3/4 rounded-md" />
                <div className="skeleton-shimmer h-4 w-1/2 rounded-md" />
                <div className="flex gap-2">
                  <div className="skeleton-shimmer h-6 w-16 rounded-full" />
                  <div className="skeleton-shimmer h-6 w-20 rounded-full" />
                </div>
                <div className="pt-4 space-y-2 mt-2" style={{ borderTop: '1px solid var(--theme-border, #f0f0f0)' }}>
                  <div className="skeleton-shimmer h-3 w-full" />
                  <div className="skeleton-shimmer h-3 w-full" />
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
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <PageHeaderCard
          title="Detections Monitoring"
          subtitle="View and analyze all organic waste detection records submitted by users."
          variant="info"
          icon={(
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
          sideContent={(
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Total Detections</p>
              <p className="text-4xl font-extrabold text-white mt-1">{detections.length}</p>
            </div>
          )}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-[2rem] shadow-sm p-6 flex flex-col sm:flex-row gap-4" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
        {/* Search Bar */}
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by waste type, ID, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-5 py-4 border rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            style={{ background: 'var(--theme-input-bg, #f8fafc)', borderColor: 'var(--theme-border, #e5e7eb)', color: 'var(--theme-text, #111827)' }}
          />
        </div>

        {/* Waste Type Filter Dropdown */}
        <div className="w-full sm:w-64">
          <select
            value={selectedWasteType}
            onChange={(e) => setSelectedWasteType(e.target.value)}
            className="w-full px-5 py-4 border rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
            style={{ background: 'var(--theme-input-bg, #f8fafc)', borderColor: 'var(--theme-border, #e5e7eb)', color: 'var(--theme-text-secondary, #374151)' }}
          >
            <option value="all">All Ecosystem Classes</option>
            {wasteTypes.map(type => (
              <option key={type} value={type} className="capitalize">{type.replace(/-/g, ' ')}</option>
            ))}
          </select>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="px-2">
        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>
          Showing {filteredDetections.length} of {detections.length} total logs
          {selectedWasteType && selectedWasteType !== 'all' && (
            <span className="ml-2 text-blue-500"> • FILTER ACTIVE</span>
          )}
        </p>
      </motion.div>

      {/* Detections Grid */}
      {filteredDetections.length === 0 ? (
        <motion.div variants={itemVariants} className="rounded-[2rem] shadow-sm p-16 text-center" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-50 border border-slate-100 rounded-[2rem] mb-6 shadow-sm">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--theme-text)' }}>No detections found</p>
          <p className="font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
            {searchTerm || selectedWasteType !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Raw inference logs will populate here globally.'}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredDetections.map((detection) => {
              const itemCount = detection.detections?.length || 0;
              const uniqueTypes = detection.detectedWasteTypes?.length || 0;

              return (
                <motion.div
                  layout
                  key={detection._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-[2rem] shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col hover:border-blue-200"
                  style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}
                >
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    <img
                      src={detection.annotated_image || detection.imageUrl || detection.image}
                      alt="Detection"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const p = document.createElement('div');
                        p.className = 'w-full h-full bg-slate-100 flex items-center justify-center';
                        p.innerHTML = '<svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
                        e.target.parentNode.insertBefore(p, e.target);
                      }}
                    />
                    <div className="absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest shadow-lg flex items-center gap-2" style={{ background: 'var(--theme-card, rgba(255,255,255,0.9))', border: '1px solid var(--theme-card-border)', color: 'var(--theme-text)' }}>
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      {itemCount} Entities
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-5 flex-1">
                      <h3 className="text-xl font-extrabold capitalize tracking-tight leading-tight mb-2" style={{ color: 'var(--theme-text)' }}>
                        {detection.primaryWasteType ? detection.primaryWasteType.replace(/-/g, ' ') : 'Unknown'}
                      </h3>

                      {detection.detectedWasteTypes && detection.detectedWasteTypes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {detection.detectedWasteTypes.slice(0, 3).map((type, idx) => (
                            <span
                              key={idx}
                              className="inline-block font-bold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg"
                              style={{ background: 'var(--theme-bg-alt)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-secondary)' }}
                            >
                              {type.replace(/-/g, ' ')}
                            </span>
                          ))}
                          {detection.detectedWasteTypes.length > 3 && (
                            <span className="inline-block font-bold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg" style={{ background: 'var(--theme-card)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)' }}>
                              +{detection.detectedWasteTypes.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-4 -mx-6 px-6 -mb-6 pb-6 h-[170px] flex flex-col justify-end" style={{ borderTop: '1px solid var(--theme-border, #f0f0f0)', background: 'var(--theme-bg-alt)' }}>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-400 font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Inference ID</span>
                        <span className="font-mono px-2 py-0.5 rounded shadow-sm" style={{ color: 'var(--theme-text)', background: 'var(--theme-card)', border: '1px solid var(--theme-border)' }}>{detection._id.substring(0, 8)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>User ID</span>
                        <span className="font-mono px-2 py-0.5 rounded shadow-sm" style={{ color: 'var(--theme-text)', background: 'var(--theme-card)', border: '1px solid var(--theme-border)' }}>{detection.user.substring(0, 8)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Timestamp</span>
                        <span className="font-bold" style={{ color: 'var(--theme-text-secondary)' }}>
                          {new Date(detection.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {detection.summary?.highest_confidence && (
                        <div className="mt-2 pt-3 border-t border-gray-200/60">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Max Confidence</span>
                            </div>
                            <span className="text-xs font-extrabold" style={{ color: 'var(--theme-accent)' }}>
                              {(detection.summary.highest_confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full rounded-full h-1.5 overflow-hidden shadow-inner" style={{ background: 'var(--theme-bg-alt)', border: '1px solid var(--theme-border)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${detection.summary.highest_confidence * 100}%`, background: 'var(--theme-accent)' }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DetectionsPage;