import React, { useState, useEffect } from 'react';

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
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="skeleton-shimmer h-14 w-14 rounded-lg mr-4" />
              <div className="space-y-2">
                <div className="skeleton-shimmer h-8 w-56" />
                <div className="skeleton-shimmer h-4 w-72" />
              </div>
            </div>
            <div className="skeleton-shimmer h-10 w-10 rounded-full" />
          </div>
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-5 space-y-2">
              <div className="skeleton-shimmer h-4 w-24" />
              <div className="skeleton-shimmer h-8 w-12" />
            </div>
          ))}
        </div>
        {/* Category cards skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="skeleton-shimmer h-10 w-10 rounded-lg" />
                <div className="skeleton-shimmer h-6 w-32" />
              </div>
              <div className="skeleton-shimmer h-4 w-full" />
              <div className="flex gap-2">
                <div className="skeleton-shimmer h-6 w-16 rounded-full" />
                <div className="skeleton-shimmer h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <span className="text-4xl">♻️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Waste Categories</h1>
              <p className="text-gray-600 mt-1">
                Managing {totalTypeCount} types of organic waste across {Object.keys(categories).length} categories
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">Total Categories</p>
            <p className="text-3xl font-bold text-green-600">{Object.keys(categories).length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryStats.map((cat, idx) => {
          const colorClasses = {
            red: 'from-red-500 to-red-600',
            green: 'from-green-500 to-green-600',
            amber: 'from-amber-500 to-amber-600',
            yellow: 'from-yellow-500 to-yellow-600',
            purple: 'from-purple-500 to-purple-600',
            gray: 'from-gray-500 to-gray-600',
          };

          return (
            <div
              key={idx}
              className={`bg-gradient-to-br ${colorClasses[cat.color]} text-white rounded-lg shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all`}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? 'all' : cat.name)}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-5xl">{cat.icon}</span>
                <div className={`px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-bold ${selectedCategory === cat.name ? 'ring-2 ring-white' : ''}`}>
                  {cat.totalTypes} types
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="opacity-90">Detected:</span>
                  <span className="font-bold">{cat.detectedTypes} / {cat.totalTypes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-90">Coverage:</span>
                  <span className="font-bold">{cat.coverage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-90">Total Items:</span>
                  <span className="font-bold">{cat.totalDetections}</span>
                </div>
              </div>

              <div className="mt-4 w-full bg-white bg-opacity-20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all"
                  style={{ width: `${cat.coverage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search waste types..."
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

          <div className="w-full sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="name">Sort by Name</option>
              <option value="count">Sort by Count</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>

          <div className="w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="all">All Categories</option>
              {Object.keys(categories).sort().map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {wasteTypes.length} of {totalTypeCount} waste types
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wasteTypes.map((type, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all"
          >
            <div className="h-2" style={{ backgroundColor: type.color }}></div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{type.name}</h3>
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                    {type.category}
                  </span>
                </div>

                {type.detectionCount > 0 && (
                  <div className="ml-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                    {type.detectionCount}
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4">{type.description}</p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-gray-600 font-medium">Compostable:</span>
                  <span className={`px-2 py-1 rounded-full font-bold ${type.compostable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {type.compostable ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-gray-600 font-medium">Decomposition:</span>
                  <span className="text-gray-800 font-semibold">{type.avgDecompositionDays} days</span>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-gray-600 font-medium">Detections:</span>
                  <span className="text-gray-800 font-semibold">
                    {type.detectionCount > 0 ? type.detectionCount : 'Not yet detected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {wasteTypes.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 text-lg">No waste types found</p>
          <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
        </div>
      )}

      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <div className="flex items-start">
          <div className="bg-blue-600 p-3 rounded-full mr-4 flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">About Waste Categories</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Compostable items</strong> can be added to compost bins and will naturally decompose.</p>
              <p><strong>Decomposition time</strong> indicates how long it takes for the item to break down in a compost environment.</p>
              <p><strong>Non-compostable items</strong> (like large bones and shells) should be disposed of separately or require industrial composting.</p>
              <p className="mt-3 pt-3 border-t border-blue-200">
                <strong>Tip:</strong> Items like citrus peels take longer to decompose but are still compostable. Break them into smaller pieces to speed up the process!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteCategoriesPage;
