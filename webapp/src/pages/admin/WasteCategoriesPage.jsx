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
 * Waste Categories Page - Admin Dashboard
 * Uses centralized metadata from backend so admin/mobile stay in sync
 */
const WasteCategoriesPage = () => {
  const [stats, setStats] = useState(null);
  const [wasteTypeDefinitions, setWasteTypeDefinitions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const categoryDisplayMap = {
    Fruits: { icon: '🍎', color: 'red' },
    Vegetables: { icon: '🥦', color: 'green' },
    Proteins: { icon: '🍖', color: 'amber' },
    Eggs: { icon: '🥚', color: 'yellow' },
    Grains: { icon: '🍚', color: 'purple' },
    Other: { icon: '🍽️', color: 'gray' },
    Unknown: { icon: '❓', color: 'gray' },
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const [statsResponse, guidesResponse] = await Promise.all([
        fetch(`${API_URL}/api/detections/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/detections/waste-guides`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (guidesResponse.ok) {
        const guidesData = await guidesResponse.json();
        setWasteTypeDefinitions(guidesData.wasteGuides || {});
      }
    } catch (error) {
      console.error('Error fetching waste categories page data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWasteTypesWithStats = () => {
    const types = Object.entries(wasteTypeDefinitions).map(([name, def]) => ({
      name,
      ...def,
      detectionCount: stats?.byWasteType?.[name] || 0,
    }));

    let filtered = selectedCategory === 'all'
      ? types
      : types.filter((t) => t.category === selectedCategory);

    if (searchTerm) {
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
        || t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'count') {
      filtered.sort((a, b) => b.detectionCount - a.detectionCount);
    } else if (sortBy === 'category') {
      filtered.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    }

    return filtered;
  };

  const wasteTypes = getWasteTypesWithStats();

  const categories = Object.entries(wasteTypeDefinitions).reduce((acc, [, def]) => {
    const categoryName = def.category || 'Unknown';
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {});

  const getCategoryStats = () => {
    return Object.entries(categories)
      .map(([name, count]) => {
        const typesInCategory = Object.entries(wasteTypeDefinitions)
          .filter(([, def]) => (def.category || 'Unknown') === name);

        const totalDetections = typesInCategory.reduce((sum, [typeName]) => (
          sum + (stats?.byWasteType?.[typeName] || 0)
        ), 0);

        const detectedCount = typesInCategory.filter(([typeName]) => (
          stats?.byWasteType?.[typeName] > 0
        )).length;

        return {
          name,
          icon: categoryDisplayMap[name]?.icon || '♻️',
          color: categoryDisplayMap[name]?.color || 'gray',
          totalTypes: count,
          detectedTypes: detectedCount,
          totalDetections,
          coverage: count > 0 ? ((detectedCount / count) * 100).toFixed(1) : '0.0',
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const categoryStats = getCategoryStats();
  const totalTypeCount = Object.keys(wasteTypeDefinitions).length;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="skeleton-shimmer h-32 w-full rounded-[2rem]" />

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-[2rem] shadow-sm p-8 space-y-4" style={{ background: 'var(--theme-card, #fff)' }}>
              <div className="flex justify-between">
                <div className="skeleton-shimmer h-12 w-12 rounded-xl" />
                <div className="skeleton-shimmer h-8 w-20 rounded-full" />
              </div>
              <div className="skeleton-shimmer h-6 w-32" />
              <div className="space-y-2 pt-2">
                <div className="skeleton-shimmer h-4 w-full" />
                <div className="skeleton-shimmer h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] shadow-sm border p-6" style={{ background: 'var(--theme-card, #fff)', borderColor: 'var(--theme-border, #f0f0f0)' }}>
          <div className="flex gap-4">
            <div className="skeleton-shimmer h-12 flex-1 rounded-xl" />
            <div className="skeleton-shimmer h-12 w-48 rounded-xl" />
          </div>
        </div>

        {/* Category cards skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-[2rem] shadow-sm border overflow-hidden space-y-4" style={{ background: 'var(--theme-card, #fff)', borderColor: 'var(--theme-border, #f0f0f0)' }}>
              <div className="skeleton-shimmer h-2 w-full" />
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="skeleton-shimmer h-6 w-32" />
                  <div className="skeleton-shimmer h-6 w-16 rounded-full" />
                </div>
                <div className="skeleton-shimmer h-12 w-full" />
                <div className="space-y-2 pt-2">
                  <div className="skeleton-shimmer h-8 w-full rounded-xl" />
                  <div className="skeleton-shimmer h-8 w-full rounded-xl" />
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
          title="Waste Categories"
          subtitle={`Managing ${totalTypeCount} types of organic waste across ${Object.keys(categories).length} super-categories.`}
          variant="success"
          icon={(
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          )}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryStats.map((cat, idx) => {
          const colorClasses = {
            red: 'from-rose-500 to-red-600 shadow-red-500/20',
            green: 'from-emerald-500 to-green-600 shadow-green-500/20',
            amber: 'from-amber-400 to-orange-500 shadow-amber-500/20',
            yellow: 'from-yellow-400 to-yellow-500 shadow-yellow-500/20',
            purple: 'from-purple-500 to-indigo-600 shadow-purple-500/20',
            gray: 'from-slate-500 to-slate-600 shadow-slate-500/20',
          };

          return (
            <motion.div
              layoutId={`category-card-${cat.name}`}
              key={idx}
              className={`bg-gradient-to-br ${colorClasses[cat.color]} text-white rounded-[2rem] shadow-xl p-8 cursor-pointer relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? 'all' : cat.name)}
            >
              <div className="absolute -right-6 -bottom-6 opacity-10 text-[8rem] transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 pointer-events-none">
                {cat.icon}
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-white/20">
                    {cat.icon}
                  </div>
                  <div className={`px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-xs font-bold uppercase tracking-widest border border-white/20 ${selectedCategory === cat.name ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : ''}`}>
                    {cat.totalTypes} Types
                  </div>
                </div>

                <h3 className="text-3xl font-extrabold mb-4 tracking-tight drop-shadow-sm">{cat.name}</h3>

                <div className="space-y-3 text-sm font-medium bg-black/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Detected Entities</span>
                    <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-lg">{cat.detectedTypes} / {cat.totalTypes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Coverage Volume</span>
                    <span className="font-bold">{cat.coverage}%</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-white/90 font-bold">Total Discovered:</span>
                    <span className="font-extrabold text-base">{cat.totalDetections}</span>
                  </div>
                </div>

                <div className="mt-5 w-full bg-black/20 rounded-full h-2 overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.coverage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-white h-2 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-[2rem] shadow-sm p-6 flex flex-col sm:flex-row gap-4" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" fill="none" stroke="var(--theme-text-muted)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search isolated waste classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-5 py-4 border rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
            style={{ background: 'var(--theme-input-bg, #f8fafc)', borderColor: 'var(--theme-border, #e5e7eb)', color: 'var(--theme-text, #111827)' }}
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-5 py-4 border rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all font-bold w-full sm:w-56"
          style={{ background: 'var(--theme-input-bg, #f8fafc)', borderColor: 'var(--theme-border, #e5e7eb)', color: 'var(--theme-text-secondary, #374151)' }}
        >
          <option value="name">Sort by Class ID</option>
          <option value="count">Sort by Frequency</option>
          <option value="category">Sort by Super-Category</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-5 py-4 border rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all font-bold w-full sm:w-56"
          style={{ background: 'var(--theme-input-bg, #f8fafc)', borderColor: 'var(--theme-border, #e5e7eb)', color: 'var(--theme-text-secondary, #374151)' }}
        >
          <option value="all">All Ecosystems</option>
          {Object.keys(categories).sort().map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </motion.div>

      <motion.div variants={itemVariants} className="px-2">
        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>
          Displaying {wasteTypes.length} of {totalTypeCount} isolated sub-classes
          {selectedCategory !== 'all' && <span style={{ color: 'var(--theme-accent)' }}> • {selectedCategory} filter active</span>}
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {wasteTypes.map((type, idx) => (
            <motion.div
              layout
              key={type.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="rounded-[2rem] shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
              style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}
            >
              <div className="h-2 w-full" style={{ backgroundColor: categoryDisplayMap[type.category]?.color === 'gray' ? '#94a3b8' : type.color || '#10b981' }}></div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-2">
                    <h3 className="text-xl font-extrabold mb-2 capitalize tracking-tight leading-tight" style={{ color: 'var(--theme-text)' }}>{type.name.replace(/-/g, ' ')}</h3>
                    <span className="inline-block px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-lg" style={{ background: 'var(--theme-bg-alt)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }}>
                      {type.category}
                    </span>
                  </div>

                  {type.detectionCount > 0 && (
                    <div className="px-3 py-1.5 rounded-xl text-sm font-black shadow-sm shrink-0" style={{ background: 'var(--theme-accent-surface)', color: 'var(--theme-accent)', border: '1px solid var(--theme-accent-surface-border)' }}>
                      {type.detectionCount}
                    </div>
                  )}
                </div>

                <p className="text-sm font-medium mb-6 leading-relaxed flex-1" style={{ color: 'var(--theme-text-secondary)' }}>{type.description}</p>

                <div className="space-y-3 text-sm mt-auto p-4 rounded-2xl" style={{ background: 'var(--theme-bg-alt)', border: '1px solid var(--theme-border)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Organic Context</span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-widest"
                      style={type.compostable
                        ? { background: 'rgba(34,197,94,0.12)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.25)' }
                        : { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }
                      }>
                      {type.compostable ? 'Compostable' : 'Residual'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Decomposition</span>
                    <span className="font-extrabold px-2 py-0.5 rounded" style={{ color: 'var(--theme-text)', background: 'var(--theme-card)', border: '1px solid var(--theme-border)' }}>{type.avgDecompositionDays || 'N/A'} days</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>DB Occurrences</span>
                    <span className="font-extrabold" style={{ color: type.detectionCount > 0 ? 'var(--theme-accent)' : 'var(--theme-text-muted)' }}>
                      {type.detectionCount > 0 ? type.detectionCount : '0 discovered'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {wasteTypes.length === 0 && (
        <motion.div variants={itemVariants} className="rounded-[2rem] shadow-sm p-16 text-center" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] mb-6 shadow-sm" style={{ background: 'var(--theme-bg-alt)', border: '1px solid var(--theme-border)' }}>
            <svg className="w-10 h-10" fill="none" stroke="var(--theme-text-muted)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--theme-text)' }}>No subclasses found</p>
          <p className="font-medium" style={{ color: 'var(--theme-text-secondary)' }}>Clear your search filters or adjust parameters to view taxonomy data.</p>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="rounded-[2rem] p-8 shadow-sm" style={{ background: 'var(--theme-accent-surface)', border: '1px solid var(--theme-accent-surface-border)' }}>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="p-4 rounded-2xl shadow-lg flex-shrink-0" style={{ background: 'var(--theme-accent)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15)' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-extrabold mb-3 tracking-tight" style={{ color: 'var(--theme-text)' }}>System Knowledge Base</h3>
            <div className="space-y-2.5 font-medium leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
              <p><strong>Compostable items</strong> represent the core taxonomy that the AI identifies for natural decomposition pathways.</p>
              <p><strong>Decomposition metrics</strong> act as standard benchmarks utilized by the sustainability scoring engine.</p>
              <p>Non-compostable nodes represent items that must be segregated away from the primary biological waste streams.</p>
              <div className="mt-4 pt-4 inline-flex" style={{ borderTop: '1px solid var(--theme-border)' }}>
                <p className="text-xs px-4 py-2 rounded-xl font-bold" style={{ background: 'var(--theme-card)', color: 'var(--theme-text)', border: '1px solid var(--theme-border)' }}>
                  ⚡ Auto-syncs directly with the ML backend class maps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WasteCategoriesPage;