import React, { useState, useEffect } from 'react';

const hexToHsl = (hex) => {
  const normalized = hex.replace('#', '').trim();
  if (![3, 6].includes(normalized.length)) return null;
  const fullHex = normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized;

  const r = parseInt(fullHex.slice(0, 2), 16) / 255;
  const g = parseInt(fullHex.slice(2, 4), 16) / 255;
  const b = parseInt(fullHex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return { h: 0, s: 0, l: Math.round(l * 100) };

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
    case g: h = (b - r) / d + 2; break;
    default: h = (r - g) / d + 4;
  }

  return { h: Math.round(h * 60), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hexToRgb = (hex) => {
  const normalized = hex.replace('#', '').trim();
  if (![3, 6].includes(normalized.length)) return null;
  const fullHex = normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized;
  return {
    r: parseInt(fullHex.slice(0, 2), 16),
    g: parseInt(fullHex.slice(2, 4), 16),
    b: parseInt(fullHex.slice(4, 6), 16)
  };
};

const getThemeChartColors = (count = 10) => {
  if (typeof window === 'undefined') return Array.from({ length: count }, () => '#15803d');
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--theme-accent').trim() || '#15803d';
  const base = hexToHsl(accent) || { h: 135, s: 70, l: 40 };

  return Array.from({ length: count }, (_, index) => {
    const hue = (base.h + index * 36) % 360;
    const sat = Math.min(88, Math.max(56, base.s));
    const light = Math.min(62, Math.max(38, base.l + (index % 3) * 4 - 4));
    return `hsl(${hue} ${sat}% ${light}%)`;
  });
};

const getThemeHeatmapColor = (intensity) => {
  if (typeof window === 'undefined') return intensity === 0 ? '#f3f4f6' : `rgba(34, 197, 94, ${0.15 + intensity * 0.85})`;
  const css = getComputedStyle(document.documentElement);
  const accent = css.getPropertyValue('--theme-accent').trim() || '#15803d';
  const accentRgb = hexToRgb(accent) || { r: 21, g: 128, b: 61 };

  if (intensity === 0) {
    return css.getPropertyValue('--theme-bg-alt').trim() || 'rgba(148, 163, 184, 0.14)';
  }

  return `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${0.18 + intensity * 0.72})`;
};

/**
 * Analytics Page - Admin Dashboard
 * 10 comprehensive chart/graph visualizations for organic waste detection
 */
const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
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

      const statsResponse = await fetch(`${API_URL}/api/detections/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

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

  // ─── Helpers ───
  const formatDayKey = (dateValue) => {
    const date = new Date(dateValue);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getFilteredDetections = () => {
    const days = parseInt(timeRange, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return detections.filter(d => new Date(d.createdAt) >= cutoff);
  };

  const categories = {
    'Fruits': ['apple', 'apple-core', 'apple-peel', 'avocado', 'banana-peel', 'bitten-apple', 'calamansi', 'mango', 'orange', 'orange-peel', 'pear', 'pear-core', 'pear-peel', 'pineapple'],
    'Vegetables': ['broccoli', 'cabbage', 'cabbage-core', 'carrot-peel', 'corn', 'cucumber', 'garlic', 'garlic-skin', 'kangkong', 'mushroom', 'onion', 'onion-skin', 'pechay', 'potato', 'seed', 'tomato'],
    'Proteins': ['bone', 'bone-fish', 'chicken-bone', 'chicken-skin', 'fish', 'meat', 'mussel-shell', 'shrimp', 'shrimp-shell'],
    'Eggs': ['egg-scramble', 'egg-shell', 'egg-yolk'],
    'Grains': ['bread', 'bun', 'noodle', 'pasta', 'rice'],
    'Other': ['congee', 'malunggay', 'pancake', 'tofu'],
    'Non-Organics': ['paper-tissue', 'plastic-waste'],
  };

  const getCategoryForType = (type) => {
    for (const [cat, types] of Object.entries(categories)) {
      if (types.includes(type)) return cat;
    }
    return 'Other';
  };

  // ─── Chart 1: Detection Activity Trend (Bar Chart) ───
  const getTrendData = () => {
    const days = parseInt(timeRange, 10);
    if (!Number.isFinite(days) || days <= 0) return [];
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const daily = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = formatDayKey(d);
      daily[key] = { date: key, scans: 0, items: 0 };
    }

    const filtered = getFilteredDetections();
    filtered.forEach(det => {
      const key = formatDayKey(det.createdAt);
      if (daily[key]) {
        daily[key].scans++;
        daily[key].items += det.detections?.length || 0;
      }
    });
    return Object.values(daily);
  };

  // ─── Chart 3: Category Breakdown ───
  const getCategoryBreakdown = () => {
    if (!stats?.byWasteType) return [];
    const breakdown = {};
    Object.keys(categories).forEach(c => { breakdown[c] = 0; });
    Object.entries(stats.byWasteType).forEach(([type, count]) => {
      const cat = getCategoryForType(type);
      breakdown[cat] = (breakdown[cat] || 0) + count;
    });
    return Object.entries(breakdown)
      .map(([category, count]) => ({ category, count }))
      .filter(i => i.count > 0)
      .sort((a, b) => b.count - a.count);
  };

  // ─── Chart 5: Confidence Distribution ───
  const getConfidenceDistribution = () => {
    const filtered = getFilteredDetections();
    const buckets = Array.from({ length: 10 }, (_, i) => ({
      label: `${i * 10}-${(i + 1) * 10}%`,
      min: i * 0.1,
      max: (i + 1) * 0.1,
      count: 0
    }));
    filtered.forEach(det => {
      det.detections?.forEach(item => {
        const conf = item.confidence || 0;
        const idx = Math.min(Math.floor(conf * 10), 9);
        buckets[idx].count++;
      });
    });
    return buckets;
  };

  // ─── Chart 6: Weekly Usage Heatmap ───
  const getWeeklyHeatmap = () => {
    const filtered = getFilteredDetections();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const grid = Array.from({ length: 7 }, () => Array(24).fill(0));

    filtered.forEach(det => {
      const d = new Date(det.createdAt);
      grid[d.getDay()][d.getHours()]++;
    });

    let maxVal = 0;
    grid.forEach(row => row.forEach(v => { if (v > maxVal) maxVal = v; }));
    return { grid, dayNames, maxVal };
  };

  // ─── Chart 7: Items Per Scan Distribution ───
  const getItemsPerScanDistribution = () => {
    const filtered = getFilteredDetections();
    const counts = {};
    filtered.forEach(det => {
      const n = det.detections?.length || 0;
      const bucket = n >= 10 ? '10+' : String(n);
      counts[bucket] = (counts[bucket] || 0) + 1;
    });
    const keys = Object.keys(counts).sort((a, b) => {
      if (a === '10+') return 1;
      if (b === '10+') return -1;
      return parseInt(a) - parseInt(b);
    });
    return keys.map(k => ({ items: k, count: counts[k] }));
  };

  // ─── Chart 8: Waste Type Growth Over Time ───
  const getWasteGrowth = () => {
    const filtered = getFilteredDetections();
    const top5 = stats?.topWasteTypes?.slice(0, 5).map(t => t.type) || [];
    if (top5.length === 0) return { weeks: [], types: [] };

    const weekMap = {};
    filtered.forEach(det => {
      const d = new Date(det.createdAt);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const weekKey = formatDayKey(weekStart);
      if (!weekMap[weekKey]) {
        weekMap[weekKey] = {};
        top5.forEach(t => { weekMap[weekKey][t] = 0; });
      }
      det.detections?.forEach(item => {
        if (top5.includes(item.class)) {
          weekMap[weekKey][item.class] = (weekMap[weekKey][item.class] || 0) + 1;
        }
      });
    });

    const weeks = Object.keys(weekMap).sort();
    return { weeks, types: top5, data: weekMap };
  };

  // ─── Chart 9: Category Radar ───
  const getCategoryRadarData = () => {
    const breakdown = getCategoryBreakdown();
    const maxVal = Math.max(...breakdown.map(b => b.count), 1);
    return breakdown.map(b => ({
      ...b,
      normalized: b.count / maxVal
    }));
  };

  // ─── Chart 10: Daily Sparklines ───
  const getTypeDailySparklines = () => {
    const top6 = stats?.topWasteTypes?.slice(0, 6) || [];
    if (top6.length === 0) return [];
    const days = Math.min(parseInt(timeRange, 10), 14);
    const today = new Date();
    const filtered = getFilteredDetections();

    return top6.map(wasteType => {
      const dailyCounts = [];
      for (let i = days - 1; i >= 0; i--) {
        const target = new Date(today);
        target.setDate(today.getDate() - i);
        const key = formatDayKey(target);
        let count = 0;
        filtered.forEach(det => {
          if (formatDayKey(det.createdAt) === key) {
            det.detections?.forEach(item => {
              if (item.class === wasteType.type) count++;
            });
          }
        });
        dailyCounts.push(count);
      }
      return { type: wasteType.type, total: wasteType.count, dailyCounts };
    });
  };

  // ─── Render ───
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="rounded-lg shadow-md p-6" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <div className="space-y-2">
            <div className="skeleton-shimmer h-8 w-48" />
            <div className="skeleton-shimmer h-4 w-64" />
          </div>
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-lg shadow-md p-5 space-y-2" style={{ background: 'var(--theme-card, #fff)' }}>
              <div className="skeleton-shimmer h-4 w-20" />
              <div className="skeleton-shimmer h-8 w-16" />
            </div>
          ))}
        </div>
        {/* Chart placeholders */}
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-lg shadow-md p-6 space-y-4" style={{ background: 'var(--theme-card, #fff)' }}>
              <div className="skeleton-shimmer h-6 w-40" />
              <div className="skeleton-shimmer h-48 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const trendData = getTrendData();
  const trendMax = Math.max(...trendData.map(d => d.scans), 1);
  const itemsMax = Math.max(...trendData.map(d => d.items), 1);
  const categoryBreakdown = getCategoryBreakdown();
  const confidenceDist = getConfidenceDistribution();
  const confMax = Math.max(...confidenceDist.map(b => b.count), 1);
  const heatmap = getWeeklyHeatmap();
  const itemsPerScan = getItemsPerScanDistribution();
  const ipsMax = Math.max(...itemsPerScan.map(d => d.count), 1);
  const wasteGrowth = getWasteGrowth();
  const radarData = getCategoryRadarData();
  const sparklines = getTypeDailySparklines();
  const chartColors = getThemeChartColors();

  const categoryTotal = categoryBreakdown.reduce((s, c) => s + c.count, 0);

  // SVG helpers for Chart 2 (line chart)
  const chartW = 900;
  const chartH = 220;
  const makeLinePoints = (data, key, max) =>
    data.map((d, i) => {
      const x = data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2;
      const y = chartH - (d[key] / max) * chartH;
      return `${x},${y}`;
    }).join(' ');

  const scanLine = makeLinePoints(trendData, 'scans', trendMax);
  const itemsLine = makeLinePoints(trendData, 'items', itemsMax);

  // Donut segments for Chart 3
  const donutSegments = categoryBreakdown.map((item, idx) => {
    const pct = categoryTotal ? item.count / categoryTotal : 0;
    const offset = categoryBreakdown.slice(0, idx).reduce((s, c) => s + ((categoryTotal ? c.count / categoryTotal : 0) * 100), 0);
    return {
      ...item,
      color: chartColors[idx % chartColors.length],
      dasharray: `${pct * 100} ${100 - pct * 100}`,
      dashoffset: -offset
    };
  });

  // Radar polygon for Chart 9
  const radarSize = 120;
  const radarCenter = 130;
  const radarPoints = radarData.map((d, i) => {
    const angle = (Math.PI * 2 * i) / radarData.length - Math.PI / 2;
    const r = d.normalized * radarSize;
    return `${radarCenter + r * Math.cos(angle)},${radarCenter + r * Math.sin(angle)}`;
  }).join(' ');

  // Waste growth max for Chart 8
  let growthMax = 1;
  if (wasteGrowth.weeks.length > 0 && wasteGrowth.data) {
    wasteGrowth.weeks.forEach(w => {
      let total = 0;
      wasteGrowth.types.forEach(t => { total += wasteGrowth.data[w]?.[t] || 0; });
      if (total > growthMax) growthMax = total;
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg shadow-md p-6" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 rounded-lg mr-4" style={{ background: 'var(--theme-accent-surface)', border: '1px solid var(--theme-accent-surface-border)' }}>
              <svg className="w-8 h-8" fill="none" stroke="var(--theme-accent)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--theme-text)' }}>Waste Analytics</h1>
              <p className="mt-1" style={{ color: 'var(--theme-text-secondary)' }}>10 comprehensive visualizations for organic waste detection insights</p>
            </div>
          </div>
          <div>
            <label className="text-sm mr-2" style={{ color: 'var(--theme-text-secondary)' }}>Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ background: 'var(--theme-input-bg, #fff)', borderColor: 'var(--theme-border, #d1d5db)', color: 'var(--theme-text)' }}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100 text-sm font-medium">Total Scans</span>
            <svg className="w-6 h-6 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
          </div>
          <p className="text-4xl font-bold">{stats?.totalDetections || 0}</p>
          <p className="text-green-100 text-xs mt-2">Detection sessions</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">Total Items</span>
            <svg className="w-6 h-6 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <p className="text-4xl font-bold">{stats?.totalItems || 0}</p>
          <p className="text-blue-100 text-xs mt-2">Individual waste items</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100 text-sm font-medium">Avg Items/Scan</span>
            <svg className="w-6 h-6 text-purple-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <p className="text-4xl font-bold">{stats?.averageItemsPerScan || 0}</p>
          <p className="text-purple-100 text-xs mt-2">Items per detection</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-100 text-sm font-medium">Avg Confidence</span>
            <svg className="w-6 h-6 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
          </div>
          <p className="text-4xl font-bold">{(parseFloat(stats?.averageConfidence || 0) * 100).toFixed(1)}%</p>
          <p className="text-amber-100 text-xs mt-2">Model accuracy</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* GRAPH 1: Detection Activity Trend (Bar Chart) */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="rounded-lg shadow-md p-6" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
        <h2 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--theme-text)' }}>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded mr-3">1</span>
          <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Detection Activity Trend
        </h2>
        {trendData.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="min-w-full inline-flex gap-1 items-end h-56 pb-8">
              {trendData.map((day, idx) => {
                const height = (day.scans / trendMax) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group min-w-[12px]">
                    <div className="relative w-full">
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        <div className="font-semibold">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div>Scans: {day.scans}</div>
                        <div>Items: {day.items}</div>
                      </div>
                      <div
                        className="w-full rounded-t transition-all cursor-pointer"
                        style={{
                          height: `${height}%`,
                          minHeight: height > 0 ? '6px' : '2px',
                          background: `linear-gradient(to top, ${chartColors[0]}, ${chartColors[3]})`
                        }}
                      ></div>
                    </div>
                    {(trendData.length <= 31 || idx % Math.ceil(trendData.length / 15) === 0) && (
                      <span className="text-[10px] text-gray-500 mt-1">{new Date(day.date).getDate()}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">No trend data available</div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* GRAPH 2: Scans vs Items Line Chart */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="rounded-lg shadow-md p-6" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
        <h2 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--theme-text)' }}>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded mr-3">2</span>
          <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Scans vs Items Trend
        </h2>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="min-w-[600px] w-full h-56">
            {[0, 0.25, 0.5, 0.75, 1].map(r => (
              <line key={r} x1="0" x2={chartW} y1={chartH - r * chartH} y2={chartH - r * chartH} stroke="var(--theme-border)" strokeWidth="1" />
            ))}
            <polyline fill="none" stroke={chartColors[0]} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={scanLine} />
            <polyline fill="none" stroke={chartColors[1]} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={itemsLine} />
          </svg>
        </div>
        <div className="flex items-center justify-center gap-6 text-sm mt-2">
          <div className="flex items-center"><span className="w-4 h-1 rounded mr-2" style={{ background: chartColors[0] }}></span><span style={{ color: 'var(--theme-text-secondary)' }}>Scans</span></div>
          <div className="flex items-center"><span className="w-4 h-1 rounded mr-2" style={{ background: chartColors[1] }}></span><span style={{ color: 'var(--theme-text-secondary)' }}>Items Detected</span></div>
        </div>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══════════════════════════════════════════════════ */}
        {/* GRAPH 3: Waste Category Donut Chart */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="rounded-lg shadow-md p-6" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--theme-text)' }}>
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded mr-3">3</span>
            <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
            Waste Category Distribution
          </h2>
          {categoryBreakdown.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-center pb-2">
                <svg viewBox="0 0 42 42" className="w-44 h-44 -rotate-90">
                  <circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--theme-border)" strokeWidth="7"></circle>
                  {donutSegments.map(seg => (
                    <circle key={seg.category} cx="21" cy="21" r="15.9155" fill="none" stroke={seg.color} strokeWidth="7" strokeDasharray={seg.dasharray} strokeDashoffset={seg.dashoffset}></circle>
                  ))}
                </svg>
              </div>
              {categoryBreakdown.map((item, idx) => {
                const pct = ((item.count / categoryTotal) * 100).toFixed(1);
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: chartColors[idx % chartColors.length] }}></div>
                        <span className="text-gray-700 font-medium text-sm">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-800 font-bold text-sm">{item.count}</span>
                        <span className="text-gray-500 text-xs ml-1">({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ backgroundColor: chartColors[idx % chartColors.length], width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No category data available</div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/* GRAPH 4: Top 10 Waste Types Horizontal Bar */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="rounded-lg shadow-md p-6" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--theme-text)' }}>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded mr-3">4</span>
            <svg className="w-6 h-6 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Top 10 Most Detected Items
          </h2>
          {stats?.topWasteTypes?.length > 0 ? (
            <div className="space-y-3">
              {stats.topWasteTypes.map((item, idx) => {
                const maxCount = stats.topWasteTypes[0]?.count || 1;
                const pct = (item.count / maxCount) * 100;
                return (
                  <div key={idx} className="flex items-center">
                    <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-amber-700 font-bold text-xs">#{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 truncate">{item.type}</span>
                        <span className="text-sm font-bold text-amber-600 ml-2">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </div>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══════════════════════════════════════════════════ */}
        {/* GRAPH 5: Confidence Distribution Histogram */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="rounded-lg shadow-md p-6" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--theme-text)' }}>
            <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded mr-3">5</span>
            <svg className="w-6 h-6 text-teal-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Confidence Score Distribution
          </h2>
          <div className="flex gap-2 h-48">
            {confidenceDist.map((bucket, idx) => {
              const height = (bucket.count / confMax) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group h-full">
                  <div className="relative w-full h-full flex items-end">
                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {bucket.count} items
                    </div>
                    <div
                      className="w-full rounded-t transition-all cursor-pointer"
                      style={{
                        height: `${height}%`,
                        minHeight: bucket.count > 0 ? '4px' : '2px',
                        backgroundColor: chartColors[idx % chartColors.length]
                      }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 text-center leading-tight">{bucket.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/* GRAPH 6: Weekly Usage Heatmap */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="rounded-lg shadow-md p-6" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--theme-text)' }}>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded mr-3">6</span>
            <svg className="w-6 h-6 text-rose-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Weekly Usage Heatmap
          </h2>
          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              {/* Hour labels */}
              <div className="flex ml-10 mb-1">
                {[0, 3, 6, 9, 12, 15, 18, 21].map(h => (
                  <div key={h} className="text-[9px] text-gray-400" style={{ width: `${(3 / 24) * 100}%`, minWidth: '0' }}>
                    {h === 0 ? '12a' : h === 12 ? '12p' : h < 12 ? `${h}a` : `${h - 12}p`}
                  </div>
                ))}
              </div>
              {/* Grid */}
              {heatmap.dayNames.map((day, dayIdx) => (
                <div key={dayIdx} className="flex items-center mb-[2px]">
                  <span className="text-[10px] text-gray-500 w-10 text-right mr-1 flex-shrink-0">{day}</span>
                  <div className="flex flex-1 gap-[1px]">
                    {heatmap.grid[dayIdx].map((val, hourIdx) => {
                      const intensity = heatmap.maxVal > 0 ? val / heatmap.maxVal : 0;
                      return (
                        <div
                          key={hourIdx}
                          className="flex-1 h-5 rounded-sm transition-colors group relative cursor-pointer"
                          style={{ backgroundColor: getThemeHeatmapColor(intensity) }}
                        >
                          <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {day} {hourIdx}:00 — {val} scans
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {/* Legend */}
              <div className="flex items-center justify-end gap-1 mt-2">
                <span className="text-[10px] text-gray-400">Less</span>
                {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getThemeHeatmapColor(v) }}></div>
                ))}
                <span className="text-[10px] text-gray-400">More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══════════════════════════════════════════════════ */}
        {/* GRAPH 7: Items Per Scan Distribution */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="rounded-lg shadow-md p-6" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--theme-text)' }}>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded mr-3">7</span>
            <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
            </svg>
            Items Per Scan Distribution
          </h2>
          {itemsPerScan.length > 0 ? (
            <div className="flex gap-3 h-48">
              {itemsPerScan.map((d, idx) => {
                const height = (d.count / ipsMax) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group h-full">
                    <div className="relative w-full h-full flex items-end">
                      <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {d.count} scans
                      </div>
                      <div
                        className="w-full rounded-t cursor-pointer transition-all"
                        style={{
                          height: `${height}%`,
                          minHeight: d.count > 0 ? '4px' : '2px',
                          background: `linear-gradient(to top, ${chartColors[2]}, ${chartColors[5]})`
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 mt-2 font-medium">{d.items}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
          <p className="text-xs text-gray-400 text-center mt-2">Number of waste items detected per scan</p>
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/* GRAPH 8: Waste Type Growth Over Time (Stacked) */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="rounded-lg shadow-md p-6" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--theme-text)' }}>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded mr-3">8</span>
            <svg className="w-6 h-6 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Top 5 Waste Types Over Time
          </h2>
          {wasteGrowth.weeks.length > 0 ? (
            <div>
              <div className="flex gap-2 h-48 mt-4">
                {wasteGrowth.weeks.map((week, wIdx) => {
                  let cumHeight = 0;
                  return (
                    <div key={wIdx} className="flex-1 flex flex-col-reverse group relative h-full justify-start">
                      {wasteGrowth.types.map((type, tIdx) => {
                        const val = wasteGrowth.data[week]?.[type] || 0;
                        const ht = (val / growthMax) * 100;
                        cumHeight += ht;
                        return (
                          <div
                            key={tIdx}
                            className="w-full transition-all"
                            style={{
                              height: `${ht}%`,
                              backgroundColor: chartColors[tIdx % chartColors.length],
                              minHeight: val > 0 ? '2px' : '0',
                              borderRadius: tIdx === wasteGrowth.types.length - 1 ? '4px 4px 0 0' : '0'
                            }}
                          ></div>
                        );
                      })}
                      <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        Week of {new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-gray-100 px-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <span>{new Date(wasteGrowth.weeks[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                {wasteGrowth.weeks.length > 2 && (
                   <span>{new Date(wasteGrowth.weeks[Math.floor(wasteGrowth.weeks.length / 2)]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                )}
                <span>{new Date(wasteGrowth.weeks[wasteGrowth.weeks.length - 1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {wasteGrowth.types.map((t, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: chartColors[i % chartColors.length] }}></div>
                    <span className="text-xs text-gray-600">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No growth data available</div>
          )}
        </div>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══════════════════════════════════════════════════ */}
        {/* GRAPH 9: Category Comparison Radar */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="rounded-lg shadow-md p-6" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--theme-text)' }}>
            <span className="bg-cyan-100 text-cyan-700 text-xs font-bold px-2 py-1 rounded mr-3">9</span>
            <svg className="w-6 h-6 text-cyan-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
            Category Comparison Radar
          </h2>
          {radarData.length > 0 ? (
            <div className="flex justify-center">
              <svg viewBox="0 0 260 260" className="w-64 h-64">
                {/* Grid circles */}
                {[0.25, 0.5, 0.75, 1].map(r => (
                  <circle key={r} cx={radarCenter} cy={radarCenter} r={r * radarSize} fill="none" stroke="var(--theme-border)" strokeWidth="1" />
                ))}
                {/* Axis lines */}
                {radarData.map((_, i) => {
                  const angle = (Math.PI * 2 * i) / radarData.length - Math.PI / 2;
                  return (
                    <line key={i} x1={radarCenter} y1={radarCenter} x2={radarCenter + radarSize * Math.cos(angle)} y2={radarCenter + radarSize * Math.sin(angle)} stroke="var(--theme-border)" strokeWidth="1" />
                  );
                })}
                {/* Data polygon */}
                <polygon points={radarPoints} fill="var(--theme-accent-surface)" stroke={chartColors[0]} strokeWidth="2" />
                {/* Data points + labels */}
                {radarData.map((d, i) => {
                  const angle = (Math.PI * 2 * i) / radarData.length - Math.PI / 2;
                  const r = d.normalized * radarSize;
                  const labelR = radarSize + 18;
                  return (
                    <g key={i}>
                      <circle cx={radarCenter + r * Math.cos(angle)} cy={radarCenter + r * Math.sin(angle)} r="4" fill="var(--theme-accent)" />
                      <text
                        x={radarCenter + labelR * Math.cos(angle)}
                        y={radarCenter + labelR * Math.sin(angle)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-[10px] fill-gray-600"
                      >
                        {d.category}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/* GRAPH 10: Daily Scan Volume Sparkline Grid */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="rounded-lg shadow-md p-6" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--theme-text)' }}>
            <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-1 rounded mr-3">10</span>
            <svg className="w-6 h-6 text-pink-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
            </svg>
            Per-Type Daily Sparklines
          </h2>
          {sparklines.length > 0 ? (
            <div className="space-y-4">
              {sparklines.map((sp, idx) => {
                const spMax = Math.max(...sp.dailyCounts, 1);
                const spW = 160;
                const spH = 30;
                const pts = sp.dailyCounts.map((v, i) => {
                  const x = sp.dailyCounts.length > 1 ? (i / (sp.dailyCounts.length - 1)) * spW : spW / 2;
                  const y = spH - (v / spMax) * spH;
                  return `${x},${y}`;
                }).join(' ');
                return (
                  <div key={idx} className="flex items-center">
                    <div className="w-28 flex-shrink-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--theme-text-secondary)' }}>{sp.type}</p>
                      <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{sp.total} total</p>
                    </div>
                    <div className="flex-1 ml-3">
                      <svg viewBox={`0 0 ${spW} ${spH}`} className="w-full h-8">
                        <polyline fill="none" stroke={chartColors[idx % chartColors.length]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={pts} />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No sparkline data available</div>
          )}
          {sparklines.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between px-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-[124px]">
              <span>{Math.min(parseInt(timeRange, 10), 14)} Days Ago</span>
              <span>Today</span>
            </div>
          )}
        </div>
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
                <p className="text-sm text-gray-600 mb-1">Total Unique Types</p>
                <p className="text-lg font-bold text-blue-700">{Object.keys(stats?.byWasteType || {}).length}</p>
                <p className="text-xs text-gray-500 mt-1">Out of 45 possible types</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Detection Quality</p>
                <p className="text-lg font-bold text-purple-700">
                  {stats?.averageConfidence
                    ? (parseFloat(stats.averageConfidence) > 0.8 ? 'Excellent' : parseFloat(stats.averageConfidence) > 0.6 ? 'Good' : 'Fair')
                    : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">{(parseFloat(stats?.averageConfidence || 0) * 100).toFixed(1)}% confidence</p>
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
