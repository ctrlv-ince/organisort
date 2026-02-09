import React, { useState, useEffect } from 'react';

/**
 * Waste Categories Page - Admin Dashboard
 * Comprehensive view of all 45 organic waste types
 * Shows categorization, detection statistics, and management tools
 */
const WasteCategoriesPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, count, alphabetical
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Define the 45 waste types with their metadata
  const wasteTypeDefinitions = {
    // FRUITS (14 types)
    'apple': { 
      category: 'Fruits', 
      description: 'Whole apple or apple pieces',
      compostable: true,
      avgDecompositionDays: '14-30',
      color: '#ef4444'
    },
    'apple-core': { 
      category: 'Fruits', 
      description: 'Apple core after eating',
      compostable: true,
      avgDecompositionDays: '14-21',
      color: '#ef4444'
    },
    'apple-peel': { 
      category: 'Fruits', 
      description: 'Peeled apple skin',
      compostable: true,
      avgDecompositionDays: '7-14',
      color: '#ef4444'
    },
    'avocado': { 
      category: 'Fruits', 
      description: 'Avocado flesh or whole fruit',
      compostable: true,
      avgDecompositionDays: '21-30',
      color: '#ef4444'
    },
    'banana-peel': { 
      category: 'Fruits', 
      description: 'Banana peels and skins',
      compostable: true,
      avgDecompositionDays: '14-21',
      color: '#ef4444'
    },
    'calamansi': { 
      category: 'Fruits', 
      description: 'Calamansi citrus fruit',
      compostable: true,
      avgDecompositionDays: '14-21',
      color: '#ef4444'
    },
    'orange': { 
      category: 'Fruits', 
      description: 'Whole orange or orange segments',
      compostable: true,
      avgDecompositionDays: '14-30',
      color: '#ef4444'
    },
    'orange-peel': { 
      category: 'Fruits', 
      description: 'Orange peels and rinds',
      compostable: true,
      avgDecompositionDays: '30-60',
      color: '#ef4444'
    },
    'papaya': { 
      category: 'Fruits', 
      description: 'Papaya flesh or whole fruit',
      compostable: true,
      avgDecompositionDays: '14-21',
      color: '#ef4444'
    },
    'pear': { 
      category: 'Fruits', 
      description: 'Whole pear or pear pieces',
      compostable: true,
      avgDecompositionDays: '14-30',
      color: '#ef4444'
    },
    'pear-core': { 
      category: 'Fruits', 
      description: 'Pear core after eating',
      compostable: true,
      avgDecompositionDays: '14-21',
      color: '#ef4444'
    },
    'pear-peel': { 
      category: 'Fruits', 
      description: 'Peeled pear skin',
      compostable: true,
      avgDecompositionDays: '7-14',
      color: '#ef4444'
    },
    'pineapple': { 
      category: 'Fruits', 
      description: 'Pineapple flesh and core',
      compostable: true,
      avgDecompositionDays: '30-60',
      color: '#ef4444'
    },
    'watermelon': { 
      category: 'Fruits', 
      description: 'Watermelon flesh and rind',
      compostable: true,
      avgDecompositionDays: '14-30',
      color: '#ef4444'
    },

    // VEGETABLES (8 types)
    'broccoli': { 
      category: 'Vegetables', 
      description: 'Broccoli florets and stems',
      compostable: true,
      avgDecompositionDays: '7-14',
      color: '#10b981'
    },
    'cucumber': { 
      category: 'Vegetables', 
      description: 'Cucumber pieces or whole',
      compostable: true,
      avgDecompositionDays: '7-14',
      color: '#10b981'
    },
    'garlic': { 
      category: 'Vegetables', 
      description: 'Garlic cloves and peels',
      compostable: true,
      avgDecompositionDays: '14-30',
      color: '#10b981'
    },
    'onion': { 
      category: 'Vegetables', 
      description: 'Onion pieces and peels',
      compostable: true,
      avgDecompositionDays: '14-30',
      color: '#10b981'
    },
    'potato': { 
      category: 'Vegetables', 
      description: 'Potato pieces and peels',
      compostable: true,
      avgDecompositionDays: '21-45',
      color: '#10b981'
    },
    'tomato': { 
      category: 'Vegetables', 
      description: 'Tomato pieces or whole',
      compostable: true,
      avgDecompositionDays: '7-14',
      color: '#10b981'
    },
    'mushroom': { 
      category: 'Vegetables', 
      description: 'Mushroom pieces and stems',
      compostable: true,
      avgDecompositionDays: '7-14',
      color: '#10b981'
    },
    'leaf': { 
      category: 'Vegetables', 
      description: 'Leafy vegetable scraps',
      compostable: true,
      avgDecompositionDays: '7-14',
      color: '#10b981'
    },

    // PROTEINS (9 types)
    'bone': { 
      category: 'Proteins', 
      description: 'Animal bones (chicken, pork, beef)',
      compostable: false,
      avgDecompositionDays: '365+',
      color: '#f59e0b'
    },
    'bone-fish': { 
      category: 'Proteins', 
      description: 'Fish bones and spines',
      compostable: true,
      avgDecompositionDays: '30-90',
      color: '#f59e0b'
    },
    'chicken-skin': { 
      category: 'Proteins', 
      description: 'Chicken skin and fat',
      compostable: true,
      avgDecompositionDays: '14-30',
      color: '#f59e0b'
    },
    'fish': { 
      category: 'Proteins', 
      description: 'Fish meat and scraps',
      compostable: true,
      avgDecompositionDays: '7-21',
      color: '#f59e0b'
    },
    'meat': { 
      category: 'Proteins', 
      description: 'Meat scraps and trimmings',
      compostable: true,
      avgDecompositionDays: '14-30',
      color: '#f59e0b'
    },
    'shrimp': { 
      category: 'Proteins', 
      description: 'Shrimp meat',
      compostable: true,
      avgDecompositionDays: '7-14',
      color: '#f59e0b'
    },
    'shrimp-shell': { 
      category: 'Proteins', 
      description: 'Shrimp shells and heads',
      compostable: true,
      avgDecompositionDays: '30-90',
      color: '#f59e0b'
    },
    'mussel': { 
      category: 'Proteins', 
      description: 'Mussel meat',
      compostable: true,
      avgDecompositionDays: '7-14',
      color: '#f59e0b'
    },
    'mussel-shell': { 
      category: 'Proteins', 
      description: 'Mussel shells',
      compostable: false,
      avgDecompositionDays: '365+',
      color: '#f59e0b'
    },

    // EGGS (3 types)
    'egg-scramble': { 
      category: 'Eggs', 
      description: 'Scrambled or cooked eggs',
      compostable: true,
      avgDecompositionDays: '7-14',
      color: '#eab308'
    },
    'egg-shell': { 
      category: 'Eggs', 
      description: 'Eggshells and membrane',
      compostable: true,
      avgDecompositionDays: '30-90',
      color: '#eab308'
    },
    'egg-yolk': { 
      category: 'Eggs', 
      description: 'Egg yolk only',
      compostable: true,
      avgDecompositionDays: '7-14',
      color: '#eab308'
    },

    // GRAINS (5 types)
    'bread': { 
      category: 'Grains', 
      description: 'Bread pieces and crusts',
      compostable: true,
      avgDecompositionDays: '14-30',
      color: '#8b5cf6'
    },
    'bun': { 
      category: 'Grains', 
      description: 'Buns and bread rolls',
      compostable: true,
      avgDecompositionDays: '14-30',
      color: '#8b5cf6'
    },
    'noodle': { 
      category: 'Grains', 
      description: 'Noodles and pasta-like items',
      compostable: true,
      avgDecompositionDays: '14-30',
      color: '#8b5cf6'
    },
    'pasta': { 
      category: 'Grains', 
      description: 'Pasta and spaghetti',
      compostable: true,
      avgDecompositionDays: '14-30',
      color: '#8b5cf6'
    },
    'rice': { 
      category: 'Grains', 
      description: 'Cooked or uncooked rice',
      compostable: true,
      avgDecompositionDays: '14-30',
      color: '#8b5cf6'
    },

    // OTHER (6 types)
    'congee': { 
      category: 'Other', 
      description: 'Rice porridge',
      compostable: true,
      avgDecompositionDays: '7-14',
      color: '#6b7280'
    },
    'malunggay': { 
      category: 'Other', 
      description: 'Moringa leaves and stems',
      compostable: true,
      avgDecompositionDays: '7-14',
      color: '#6b7280'
    },
    'pancake': { 
      category: 'Other', 
      description: 'Pancake pieces',
      compostable: true,
      avgDecompositionDays: '14-21',
      color: '#6b7280'
    },
    'tofu': { 
      category: 'Other', 
      description: 'Tofu and soy products',
      compostable: true,
      avgDecompositionDays: '7-14',
      color: '#6b7280'
    },
    'good': { 
      category: 'Other', 
      description: 'General edible organic matter',
      compostable: true,
      avgDecompositionDays: '7-30',
      color: '#6b7280'
    },
  };

  const categories = {
    'Fruits': { icon: '🍎', color: 'red', count: 14 },
    'Vegetables': { icon: '🥦', color: 'green', count: 8 },
    'Proteins': { icon: '🍖', color: 'amber', count: 9 },
    'Eggs': { icon: '🥚', color: 'yellow', count: 3 },
    'Grains': { icon: '🍚', color: 'purple', count: 5 },
    'Other': { icon: '🍽️', color: 'gray', count: 6 },
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/detections/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get waste types with detection counts
  const getWasteTypesWithStats = () => {
    const types = Object.entries(wasteTypeDefinitions).map(([name, def]) => ({
      name,
      ...def,
      detectionCount: stats?.byWasteType?.[name] || 0,
    }));

    // Filter by category
    let filtered = selectedCategory === 'all' 
      ? types 
      : types.filter(t => t.category === selectedCategory);

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
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

  // Calculate category stats
  const getCategoryStats = () => {
    return Object.entries(categories).map(([name, data]) => {
      const typesInCategory = Object.entries(wasteTypeDefinitions)
        .filter(([_, def]) => def.category === name);
      
      const totalDetections = typesInCategory.reduce((sum, [typeName]) => 
        sum + (stats?.byWasteType?.[typeName] || 0), 0
      );

      const detectedCount = typesInCategory.filter(([typeName]) => 
        stats?.byWasteType?.[typeName] > 0
      ).length;

      return {
        name,
        ...data,
        totalTypes: data.count,
        detectedTypes: detectedCount,
        totalDetections,
        coverage: ((detectedCount / data.count) * 100).toFixed(1),
      };
    });
  };

  const categoryStats = getCategoryStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading waste categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <span className="text-4xl">♻️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Waste Categories</h1>
              <p className="text-gray-600 mt-1">
                Managing 45 types of organic waste across 6 categories
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Categories</p>
            <p className="text-3xl font-bold text-green-600">6</p>
          </div>
        </div>
      </div>

      {/* Category Overview Cards */}
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
              
              {/* Coverage Bar */}
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

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
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

          {/* Sort By */}
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

          {/* Category Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="all">All Categories</option>
              {Object.keys(categories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {wasteTypes.length} of 45 waste types
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        </div>
      </div>

      {/* Waste Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wasteTypes.map((type, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all"
          >
            {/* Header with color bar */}
            <div
              className="h-2"
              style={{ backgroundColor: type.color }}
            ></div>

            <div className="p-5">
              {/* Name and Category */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {type.name}
                  </h3>
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                    {type.category}
                  </span>
                </div>
                
                {/* Detection count badge */}
                {type.detectionCount > 0 && (
                  <div className="ml-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                    {type.detectionCount}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">
                {type.description}
              </p>

              {/* Properties */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-gray-600 font-medium">Compostable:</span>
                  <span className={`px-2 py-1 rounded-full font-bold ${
                    type.compostable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {type.compostable ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-gray-600 font-medium">Decomposition:</span>
                  <span className="text-gray-800 font-semibold">
                    {type.avgDecompositionDays} days
                  </span>
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

      {/* Empty State */}
      {wasteTypes.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 text-lg">No waste types found</p>
          <p className="text-gray-500 mt-2">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <div className="flex items-start">
          <div className="bg-blue-600 p-3 rounded-full mr-4 flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              About Waste Categories
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>Compostable items</strong> can be added to compost bins and will naturally decompose.
              </p>
              <p>
                <strong>Decomposition time</strong> indicates how long it takes for the item to break down in a compost environment.
              </p>
              <p>
                <strong>Non-compostable items</strong> (like large bones and shells) should be disposed of separately or require industrial composting.
              </p>
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