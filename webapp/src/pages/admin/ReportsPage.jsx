import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageHeaderCard from '../../components/PageHeaderCard';
import { generateReportPDF } from '../../utils/pdfReportGenerator';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

/**
 * Reports Page - Admin Dashboard
 * Generate comprehensive reports with timeframe filtering and PDF downloads
 */
const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [detections, setDetections] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('30');
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
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

      const usersResponse = await fetch(`${API_URL}/api/users/stats/detections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data || []);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Data Helpers ───
  const getFilteredDetections = () => {
    if (!detections.length) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(dateRange));
    return detections.filter(d => new Date(d.createdAt) >= cutoff);
  };

  const getDateRangeLabel = () => {
    const days = parseInt(dateRange);
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const generateSummaryReport = () => {
    const filtered = getFilteredDetections();
    return {
      period: `Last ${dateRange} Days`,
      dateRangeLabel: getDateRangeLabel(),
      totalScans: filtered.length,
      totalItems: filtered.reduce((sum, d) => sum + (d.detections?.length || 0), 0),
      uniqueTypes: new Set(filtered.flatMap(d => d.detectedWasteTypes || [])).size,
      avgItemsPerScan: filtered.length > 0
        ? (filtered.reduce((sum, d) => sum + (d.detections?.length || 0), 0) / filtered.length).toFixed(2)
        : 0,
      avgConfidence: filtered.length > 0
        ? (filtered.reduce((sum, d) => sum + (d.summary?.average_confidence || 0), 0) / filtered.length * 100).toFixed(1) + '%'
        : 'N/A',
      activeUsers: new Set(filtered.map(d => d.user)).size,
      dateGenerated: new Date().toLocaleString(),
    };
  };

  const generateTrendsReport = () => {
    const filtered = getFilteredDetections();
    const dailyData = {};
    filtered.forEach(d => {
      const date = new Date(d.createdAt).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = { scans: 0, items: 0, types: new Set() };
      }
      dailyData[date].scans++;
      dailyData[date].items += d.detections?.length || 0;
      d.detectedWasteTypes?.forEach(type => dailyData[date].types.add(type));
    });

    const trends = Object.entries(dailyData).map(([date, data]) => ({
      date,
      scans: data.scans,
      items: data.items,
      uniqueTypes: data.types.size,
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    const oldHalf = trends.slice(0, Math.floor(trends.length / 2));
    const newHalf = trends.slice(Math.floor(trends.length / 2));
    const oldAvg = oldHalf.length > 0 ? oldHalf.reduce((s, d) => s + d.scans, 0) / oldHalf.length : 0;
    const newAvg = newHalf.length > 0 ? newHalf.reduce((s, d) => s + d.scans, 0) / newHalf.length : 0;
    const growth = oldAvg > 0 ? (((newAvg - oldAvg) / oldAvg) * 100).toFixed(1) : 0;

    return {
      dailyTrends: trends,
      peakDay: trends.length > 0 ? trends.reduce((max, d) => d.scans > max.scans ? d : max, trends[0]) : null,
      averageDaily: trends.length > 0 ? (filtered.length / trends.length).toFixed(2) : 0,
      growth: growth + '%',
      trend: parseFloat(growth) > 0 ? 'increasing' : parseFloat(growth) < 0 ? 'decreasing' : 'stable',
      dateRangeLabel: getDateRangeLabel(),
    };
  };

  const generateUserReport = () => {
    const filtered = getFilteredDetections();
    const userActivity = {};
    filtered.forEach(d => {
      if (!userActivity[d.user]) {
        userActivity[d.user] = { scans: 0, items: 0, types: new Set(), lastActive: d.createdAt };
      }
      userActivity[d.user].scans++;
      userActivity[d.user].items += d.detections?.length || 0;
      d.detectedWasteTypes?.forEach(type => userActivity[d.user].types.add(type));
      if (new Date(d.createdAt) > new Date(userActivity[d.user].lastActive)) {
        userActivity[d.user].lastActive = d.createdAt;
      }
    });

    const userStats = Object.entries(userActivity).map(([userId, data]) => {
      const user = users.find(u => u._id === userId);
      return {
        userId,
        email: user?.email || 'Unknown',
        displayName: user?.displayName || 'Unknown',
        scans: data.scans,
        items: data.items,
        uniqueTypes: data.types.size,
        lastActive: new Date(data.lastActive).toLocaleDateString(),
      };
    }).sort((a, b) => b.scans - a.scans);

    return {
      totalUsers: users.length,
      activeUsers: userStats.length,
      topUsers: userStats.slice(0, 10),
      inactiveUsers: users.length - userStats.length,
      avgScansPerUser: userStats.length > 0 ? (filtered.length / userStats.length).toFixed(2) : 0,
      dateRangeLabel: getDateRangeLabel(),
    };
  };

  const generateWasteReport = () => {
    const filtered = getFilteredDetections();
    const categories = {
      'Fruits': ['apple', 'apple-core', 'apple-peel', 'avocado', 'banana-peel', 'bitten-apple', 'calamansi', 'mango', 'orange', 'orange-peel', 'pear', 'pear-core', 'pear-peel', 'pineapple'],
      'Vegetables': ['broccoli', 'cabbage', 'cabbage-core', 'carrot-peel', 'cucumber', 'garlic', 'garlic-skin', 'kangkong', 'mushroom', 'onion', 'onion-skin', 'pechay', 'potato', 'seed', 'tomato'],
      'Proteins': ['bone', 'bone-fish', 'chicken-bone', 'chicken-skin', 'fish', 'meat', 'mussel-shell', 'shrimp', 'shrimp-shell'],
      'Eggs': ['egg-scramble', 'egg-shell', 'egg-yolk'],
      'Grains': ['bread', 'bun', 'noodle', 'pasta', 'rice'],
      'Other': ['congee', 'malunggay', 'pancake', 'tofu'],
      'Non-Organics': ['paper-tissue', 'plastic-waste'],
    };

    const wasteComposition = {};
    filtered.forEach(d => {
      d.detections?.forEach(item => {
        wasteComposition[item.class] = (wasteComposition[item.class] || 0) + 1;
      });
    });

    const topWaste = Object.entries(wasteComposition)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const categoryBreakdown = {};
    Object.entries(categories).forEach(([category, types]) => {
      categoryBreakdown[category] = 0;
      types.forEach(type => { categoryBreakdown[category] += wasteComposition[type] || 0; });
    });

    const totalItems = Object.values(wasteComposition).reduce((sum, count) => sum + count, 0);

    return {
      topWaste: topWaste.slice(0, 20),
      categoryBreakdown: Object.entries(categoryBreakdown)
        .map(([category, count]) => ({ category, count, percentage: totalItems > 0 ? ((count / totalItems) * 100).toFixed(1) : '0' }))
        .sort((a, b) => b.count - a.count),
      totalItems,
      uniqueTypes: Object.keys(wasteComposition).length,
      mostCommon: topWaste[0],
      leastCommon: topWaste[topWaste.length - 1],
      dateRangeLabel: getDateRangeLabel(),
    };
  };

  // ─── CSV Export ───
  const exportAsCSV = () => {
    let csvContent = '';
    if (reportType === 'summary') {
      const data = generateSummaryReport();
      csvContent = `Summary Report\n\nPeriod,${data.period}\nDate Range,${data.dateRangeLabel}\nDate Generated,${data.dateGenerated}\n\nTotal Scans,${data.totalScans}\nTotal Items,${data.totalItems}\nUnique Types,${data.uniqueTypes}\nAvg Items/Scan,${data.avgItemsPerScan}\nAvg Confidence,${data.avgConfidence}\nActive Users,${data.activeUsers}\n`;
    } else if (reportType === 'trends') {
      const data = generateTrendsReport();
      csvContent = `Activity Trends Report\nDate Range,${data.dateRangeLabel}\n\nDate,Scans,Items,Unique Types\n`;
      data.dailyTrends.forEach(d => { csvContent += `${d.date},${d.scans},${d.items},${d.uniqueTypes}\n`; });
    } else if (reportType === 'users') {
      const data = generateUserReport();
      csvContent = `User Activity Report\nDate Range,${data.dateRangeLabel}\n\nEmail,Display Name,Scans,Items,Unique Types,Last Active\n`;
      data.topUsers.forEach(u => { csvContent += `${u.email},${u.displayName},${u.scans},${u.items},${u.uniqueTypes},${u.lastActive}\n`; });
    } else if (reportType === 'waste') {
      const data = generateWasteReport();
      csvContent = `Waste Composition Report\nDate Range,${data.dateRangeLabel}\n\nWaste Type,Count\n`;
      data.topWaste.forEach(item => { csvContent += `${item.type},${item.count}\n`; });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ─── PDF Export ───
  const exportAsPDF = () => {
    setGeneratingPDF(true);
    try {
      generateReportPDF({
        reportType,
        dateRange,
        dateRangeLabel: getDateRangeLabel(),
        summaryData: reportType === 'summary' ? generateSummaryReport() : null,
        trendsData: reportType === 'trends' ? generateTrendsReport() : null,
        userData: reportType === 'users' ? generateUserReport() : null,
        wasteData: reportType === 'waste' ? generateWasteReport() : null,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Print
  const printReport = () => { window.print(); };

  if (loading) {
    return (
      <div className="space-y-8 print:space-y-4">
        <div className="skeleton-shimmer h-32 w-full rounded-[2rem]" />

        <div className="rounded-[2rem] shadow-sm p-6 border flex gap-4" style={{ background: 'var(--theme-card, #fff)', borderColor: 'var(--theme-border, #f0f0f0)' }}>
          <div className="skeleton-shimmer h-12 w-48 rounded-xl" />
          <div className="skeleton-shimmer h-12 w-64 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-[2rem] shadow-sm p-8 space-y-4 border" style={{ background: 'var(--theme-card, #fff)', borderColor: 'var(--theme-border, #f0f0f0)' }}>
              <div className="skeleton-shimmer h-5 w-24 rounded" />
              <div className="skeleton-shimmer h-10 w-16" />
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] shadow-sm p-8 border space-y-6" style={{ background: 'var(--theme-card, #fff)', borderColor: 'var(--theme-border, #f0f0f0)' }}>
          <div className="skeleton-shimmer h-8 w-64 rounded-lg" />
          <div className="skeleton-shimmer h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8 print:space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="print:hidden">
        <PageHeaderCard
          title="Reports & Analytics"
          subtitle="Generate and download comprehensive waste management intelligence and taxonomical datasets."
          variant="primary"
          icon={(
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        />
      </motion.div>

      {/* Controls */}
      <motion.div variants={itemVariants} className="rounded-[2rem] shadow-sm p-6 print:hidden flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
        <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            style={{ background: 'var(--theme-input-bg, #fff)', borderColor: 'var(--theme-border, #d1d5db)', color: 'var(--theme-text)' }}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>

          <div className="hidden md:flex items-center px-4 py-2 rounded-xl text-sm whitespace-nowrap" style={{ background: 'var(--theme-bg-alt)', border: '1px solid var(--theme-border)' }}>
            <span className="font-bold mr-2 uppercase tracking-widest text-xs" style={{ color: 'var(--theme-text-muted)' }}>Period:</span>
            <strong className="font-extrabold" style={{ color: 'var(--theme-text)' }}>{getDateRangeLabel()}</strong>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          <button
            onClick={exportAsPDF}
            disabled={generatingPDF}
            className="px-5 py-3 font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {generatingPDF ? 'Generating...' : 'PDF Doc'}
          </button>

          <button
            onClick={exportAsCSV}
            className="px-5 py-3 bg-green-50 text-green-600 font-bold border border-green-100 rounded-xl hover:bg-green-100 hover:border-green-200 flex items-center gap-2 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV Data
          </button>

          <button
            onClick={printReport}
            className="px-5 py-3 bg-blue-50 text-blue-600 font-bold border border-blue-100 rounded-xl hover:bg-blue-100 hover:border-blue-200 flex items-center gap-2 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </motion.div>

      {/* Report Type Selector */}
      <motion.div variants={itemVariants} className="rounded-[2rem] shadow-sm p-6 print:hidden" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'summary', label: 'Summary', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { id: 'trends', label: 'Trends', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
            { id: 'users', label: 'User Activity', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { id: 'waste', label: 'Waste Composition', icon: null, emoji: '♻️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className="p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 relative overflow-hidden group"
              style={reportType === tab.id
                ? {
                  borderColor: 'var(--theme-accent)',
                  background: 'var(--theme-accent)',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                }
                : {
                  borderColor: 'var(--theme-border)',
                  background: 'var(--theme-card)',
                  color: 'var(--theme-text-secondary)'
                }}
            >
              {reportType === tab.id && (
                <motion.div layoutId="activeTabIndicator" className="absolute inset-0 z-0" style={{ background: 'var(--theme-accent)' }} />
              )}
              <div className="relative z-10 p-3 rounded-full transition-colors" style={reportType === tab.id
                ? { background: 'rgba(255,255,255,0.18)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.32)' }
                : { background: 'var(--theme-bg-alt)', color: 'var(--theme-text-muted)' }}>
                {tab.icon ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={tab.icon} />
                  </svg>
                ) : (
                  <span className="text-2xl leading-none">{tab.emoji}</span>
                )}
              </div>
              <span className="relative z-10 font-extrabold tracking-tight text-sm uppercase">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════ */}
      {/* Summary Report */}
      {/* ════════════════════════════════════════════ */}
      {reportType === 'summary' && (() => {
        const data = generateSummaryReport();
        return (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2rem] shadow-lg shadow-blue-500/20 p-8 print:bg-white print:text-black print:border-2 print:border-blue-600 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
                <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg>
              </div>
              <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Executive Summary Report</h2>
              <p className="text-blue-100 font-medium print:text-gray-600">Period: {data.period} ({data.dateRangeLabel})</p>
              <div className="mt-6 inline-block bg-white/20 backdrop-blur border border-white/20 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-blue-50 print:text-gray-500">
                Generated: {data.dateGenerated}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-[2rem] shadow-sm p-8 hover:shadow-lg transition-shadow relative overflow-hidden group" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <div className="absolute right-0 bottom-0 bg-blue-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Total Platform Scans</p>
                  <p className="text-5xl font-black tracking-tight" style={{ color: 'var(--theme-text)' }}>{data.totalScans}</p>
                </div>
              </div>
              <div className="rounded-[2rem] shadow-sm p-8 hover:shadow-lg transition-shadow relative overflow-hidden group" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <div className="absolute right-0 bottom-0 bg-green-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Organic Items Formally Detected</p>
                  <p className="text-5xl font-black tracking-tight" style={{ color: 'var(--theme-text)' }}>{data.totalItems}</p>
                </div>
              </div>
              <div className="rounded-[2rem] shadow-sm p-8 hover:shadow-lg transition-shadow relative overflow-hidden group" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <div className="absolute right-0 bottom-0 bg-purple-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Unique Classes Classified</p>
                  <p className="text-5xl font-black tracking-tight" style={{ color: 'var(--theme-text)' }}>{data.uniqueTypes}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] shadow-sm p-8" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
              <h3 className="text-2xl font-extrabold mb-6 tracking-tight" style={{ color: 'var(--theme-text)' }}>Performance Metrics Benchmark</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'Avg Items per Scan', value: data.avgItemsPerScan, color: 'blue' },
                  { label: 'Avg Confidence Model Output', value: data.avgConfidence, color: 'green' },
                  { label: 'Active User Contributions', value: data.activeUsers, color: 'purple' },
                  { label: 'Scans Generated per User', value: data.activeUsers > 0 ? (data.totalScans / data.activeUsers).toFixed(2) : 0, color: 'amber' },
                ].map((metric, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-colors">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">{metric.label}</span>
                    <span className={`text-2xl font-black text-${metric.color}-600 tracking-tight`}>{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* ════════════════════════════════════════════ */}
      {/* Trends Report */}
      {/* ════════════════════════════════════════════ */}
      {reportType === 'trends' && (() => {
        const data = generateTrendsReport();
        return (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-[2rem] shadow-lg shadow-green-500/20 p-8 print:bg-white print:text-black print:border-2 print:border-green-600 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
                <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" /></svg>
              </div>
              <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Activity Trends Report</h2>
              <p className="text-green-100 font-medium print:text-gray-600">{data.dateRangeLabel}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-[2rem] shadow-sm p-8 relative overflow-hidden group hover:shadow-lg transition-shadow" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--theme-text-muted)' }}>Trend Status</p>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${data.trend === 'increasing' ? 'bg-green-100 text-green-600' : data.trend === 'decreasing' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    {data.trend === 'increasing' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    ) : data.trend === 'decreasing' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" /></svg>
                    )}
                  </div>
                  <span className="text-4xl font-black capitalize tracking-tight" style={{ color: 'var(--theme-text)' }}>{data.trend}</span>
                </div>
                <div className="mt-4 inline-block px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-gray-500">
                  Growth Variable: <span className={data.trend === 'increasing' ? 'text-green-600' : data.trend === 'decreasing' ? 'text-red-600' : ''}>{data.growth}</span>
                </div>
              </div>
              <div className="rounded-[2rem] shadow-sm p-8 relative overflow-hidden group hover:shadow-lg transition-shadow" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Mean Daily Usage</p>
                <p className="text-5xl font-black tracking-tight" style={{ color: 'var(--theme-text)' }}>{data.averageDaily}</p>
              </div>
              <div className="rounded-[2rem] shadow-sm p-8 relative overflow-hidden group hover:shadow-lg transition-shadow" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Peak Processing Frame</p>
                <p className="text-3xl font-black tracking-tight" style={{ color: 'var(--theme-text)' }}>{data.peakDay?.date || 'N/A'}</p>
                <p className="text-sm font-bold text-purple-600 mt-2 bg-purple-50 inline-block px-3 py-1 rounded-lg border border-purple-100">{data.peakDay?.scans || 0} Events Registered</p>
              </div>
            </div>

            {/* Trend mini-chart */}
            {data.dailyTrends.length > 0 && (
              <div className="rounded-[2rem] shadow-sm p-8" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <h3 className="text-2xl font-extrabold mb-6 tracking-tight" style={{ color: 'var(--theme-text)' }}>Timeline Heatmap</h3>
                <div className="overflow-x-auto">
                  <div className="min-w-full inline-flex gap-1 items-end h-40">
                    {data.dailyTrends.map((day, idx) => {
                      const max = Math.max(...data.dailyTrends.map(d => d.scans), 1);
                      const height = (day.scans / max) * 100;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center group min-w-[8px]">
                          <div className="relative w-full h-full flex items-end">
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-bold rounded-lg py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl pointer-events-none">
                              {day.date}: {day.scans} Events
                            </div>
                            <div
                              className="w-full rounded-t-lg cursor-pointer transition-all duration-300 group-hover:-translate-y-1"
                              style={{
                                height: `${height}%`,
                                minHeight: day.scans > 0 ? '6px' : '4px',
                                background: 'linear-gradient(to top, var(--theme-accent), var(--theme-accent-light))'
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[2rem] shadow-sm overflow-hidden" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--theme-text)' }}>Timeline Ledger</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead style={{ background: 'var(--theme-bg-alt)' }}>
                    <tr>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Chronology</th>
                      <th className="px-8 py-5 text-right text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Inferences</th>
                      <th className="px-8 py-5 text-right text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Bound Boxes</th>
                      <th className="px-8 py-5 text-right text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Distinct Classes</th>
                    </tr>
                  </thead>
                  <tbody style={{ background: 'var(--theme-card)' }} className="divide-y" >
                    {data.dailyTrends.map((day, idx) => (
                      <tr key={idx} className="transition-colors" onMouseEnter={e => e.currentTarget.style.background = 'var(--theme-card-hover)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td className="px-8 py-4 text-sm font-bold" style={{ color: 'var(--theme-text-secondary)' }}>{day.date}</td>
                        <td className="px-8 py-4 text-sm font-black text-right" style={{ color: 'var(--theme-text)' }}>{day.scans}</td>
                        <td className="px-8 py-4 text-sm font-semibold text-right" style={{ color: 'var(--theme-text-secondary)' }}>{day.items}</td>
                        <td className="px-8 py-4 text-sm font-semibold text-right" style={{ color: 'var(--theme-text-secondary)' }}>{day.uniqueTypes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* ════════════════════════════════════════════ */}
      {/* User Activity Report */}
      {/* ════════════════════════════════════════════ */}
      {reportType === 'users' && (() => {
        const data = generateUserReport();
        return (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-[2rem] shadow-lg shadow-purple-500/20 p-8 print:bg-white print:text-black print:border-2 print:border-purple-600 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
                <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
              </div>
              <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Identity Utilization Report</h2>
              <p className="text-purple-100 font-medium print:text-gray-600">{data.dateRangeLabel}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="rounded-[2rem] shadow-sm p-8 hover:shadow-lg transition-shadow relative overflow-hidden group" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <div className="absolute right-0 bottom-0 bg-purple-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Global User Nodes</p>
                  <p className="text-4xl font-black tracking-tight" style={{ color: 'var(--theme-text)' }}>{data.totalUsers}</p>
                </div>
              </div>
              <div className="rounded-[2rem] shadow-sm p-8 hover:shadow-lg transition-shadow relative overflow-hidden group" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <div className="absolute right-0 bottom-0 bg-green-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Active Identities</p>
                  <p className="text-4xl font-black tracking-tight" style={{ color: 'var(--theme-text)' }}>{data.activeUsers}</p>
                </div>
              </div>
              <div className="rounded-[2rem] shadow-sm p-8 hover:shadow-lg transition-shadow relative overflow-hidden group" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <div className="absolute right-0 bottom-0 bg-gray-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Dormant Identities</p>
                  <p className="text-4xl font-black tracking-tight" style={{ color: 'var(--theme-text-muted)' }}>{data.inactiveUsers}</p>
                </div>
              </div>
              <div className="rounded-[2rem] shadow-sm p-8 hover:shadow-lg transition-shadow relative overflow-hidden group" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <div className="absolute right-0 bottom-0 bg-blue-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Events Per Node</p>
                  <p className="text-4xl font-black tracking-tight" style={{ color: 'var(--theme-text)' }}>{data.avgScansPerUser}</p>
                </div>
              </div>
            </div>

            {/* User engagement bar chart */}
            {data.topUsers.length > 0 && (
              <div className="rounded-[2rem] shadow-sm p-8" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <h3 className="text-2xl font-extrabold mb-6 tracking-tight" style={{ color: 'var(--theme-text)' }}>Identity Engagement Ranking</h3>
                <div className="space-y-4">
                  {data.topUsers.slice(0, 10).map((user, idx) => {
                    const max = data.topUsers[0]?.scans || 1;
                    const pct = (user.scans / max) * 100;
                    return (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-xl transition-colors" style={{ background: 'var(--theme-bg-alt)', border: '1px solid var(--theme-border)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--theme-card-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--theme-bg-alt)'}>
                        <div className="w-8 h-8 rounded-lg shadow-sm flex items-center justify-center flex-shrink-0" style={{ background: 'var(--theme-card)', border: '1px solid var(--theme-border)' }}>
                          <span className="text-xs font-black" style={{ color: 'var(--theme-accent)' }}>{idx + 1}</span>
                        </div>
                        <span className="w-40 text-sm font-bold truncate" style={{ color: 'var(--theme-text)' }}>{user.email.split('@')[0]}</span>
                        <div className="flex-1 rounded-full h-3 shadow-inner overflow-hidden" style={{ background: 'var(--theme-bg-alt)', border: '1px solid var(--theme-border)' }}>
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(to right, var(--theme-accent), var(--theme-accent-light))' }}></div>
                        </div>
                        <span className="w-16 text-right text-sm font-black" style={{ color: 'var(--theme-text)' }}>{user.scans}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-[2rem] shadow-sm border overflow-hidden" style={{ background: 'var(--theme-card, #fff)', borderColor: 'var(--theme-border, #f0f0f0)' }}>
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--theme-text)' }}>Active Directory Rankings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead style={{ background: 'var(--theme-bg-alt)' }}>
                    <tr>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>ID</th>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Address</th>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Display Key</th>
                      <th className="px-8 py-5 text-right text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Operations</th>
                      <th className="px-8 py-5 text-right text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Sub-Items</th>
                      <th className="px-8 py-5 text-right text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Classes</th>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Ping</th>
                    </tr>
                  </thead>
                  <tbody style={{ background: 'var(--theme-card)' }} className="divide-y" >
                    {data.topUsers.map((user, idx) => (
                      <tr key={idx} className="transition-colors" onMouseEnter={e => e.currentTarget.style.background = 'var(--theme-card-hover)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td className="px-8 py-4">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--theme-accent-surface)', border: '1px solid var(--theme-accent-surface-border)' }}>
                            <span className="font-black text-xs" style={{ color: 'var(--theme-accent)' }}>{idx + 1}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-sm font-bold" style={{ color: 'var(--theme-text)' }}>{user.email}</td>
                        <td className="px-8 py-4 text-sm font-semibold" style={{ color: 'var(--theme-text-muted)' }}>{user.displayName}</td>
                        <td className="px-8 py-4 text-sm font-black text-right" style={{ color: 'var(--theme-text)' }}>{user.scans}</td>
                        <td className="px-8 py-4 text-sm font-semibold text-right" style={{ color: 'var(--theme-text-muted)' }}>{user.items}</td>
                        <td className="px-8 py-4 text-sm font-semibold text-right" style={{ color: 'var(--theme-text-muted)' }}>{user.uniqueTypes}</td>
                        <td className="px-8 py-4 text-sm font-medium" style={{ color: 'var(--theme-text-muted)' }}>{user.lastActive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* ════════════════════════════════════════════ */}
      {/* Waste Composition Report */}
      {/* ════════════════════════════════════════════ */}
      {reportType === 'waste' && (() => {
        const data = generateWasteReport();
        return (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-[2rem] shadow-lg shadow-amber-500/20 p-8 print:bg-white print:text-black print:border-2 print:border-amber-600 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
                <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10h3v7H4zM10.5 10h3v7h-3zM2 19h20v3H2zM17 10h3v7h-3zM12 1L2 6v2h20V6L12 1zm0 3.5L16.21 6H7.79L12 4.5z" /></svg>
              </div>
              <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Environmental Composition Profile</h2>
              <p className="text-amber-100 font-medium print:text-gray-600">{data.dateRangeLabel}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="rounded-[2rem] shadow-sm p-8 hover:shadow-lg transition-shadow relative overflow-hidden group" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <div className="absolute right-0 bottom-0 bg-amber-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Cataloged Objects</p>
                  <p className="text-4xl font-black tracking-tight" style={{ color: 'var(--theme-text)' }}>{data.totalItems}</p>
                </div>
              </div>
              <div className="rounded-[2rem] shadow-sm p-8 hover:shadow-lg transition-shadow relative overflow-hidden group" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <div className="absolute right-0 bottom-0 bg-blue-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Discrete Categories</p>
                  <p className="text-4xl font-black tracking-tight" style={{ color: 'var(--theme-text)' }}>{data.uniqueTypes}</p>
                  <p className="text-xs font-bold text-blue-600 mt-2 bg-blue-50 inline-block px-3 py-1 rounded-lg border border-blue-100">Out of 45 Available</p>
                </div>
              </div>
              <div className="rounded-[2rem] shadow-sm p-8 hover:shadow-lg transition-shadow relative overflow-hidden group" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <div className="absolute right-0 bottom-0 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110" style={{ background: 'var(--theme-accent-surface)' }}></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Highest Frequency</p>
                  <p className="text-2xl font-black tracking-tight truncate" style={{ color: 'var(--theme-text)' }}>{data.mostCommon?.type || 'N/A'}</p>
                  <p className="text-sm font-bold mt-2 inline-block px-3 py-1 rounded-lg" style={{ color: 'var(--theme-accent)', background: 'var(--theme-accent-surface)', border: '1px solid var(--theme-accent-surface-border)' }}>{data.mostCommon?.count || 0} Registered</p>
                </div>
              </div>
              <div className="rounded-[2rem] shadow-sm p-8 hover:shadow-lg transition-shadow relative overflow-hidden group" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
                <div className="absolute right-0 bottom-0 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110" style={{ background: 'var(--theme-accent-surface)' }}></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--theme-text-muted)' }}>Lowest Frequency</p>
                  <p className="text-2xl font-black tracking-tight truncate" style={{ color: 'var(--theme-text)' }}>{data.leastCommon?.type || 'N/A'}</p>
                  <p className="text-sm font-bold mt-2 inline-block px-3 py-1 rounded-lg" style={{ color: 'var(--theme-accent)', background: 'var(--theme-accent-surface)', border: '1px solid var(--theme-accent-surface-border)' }}>{data.leastCommon?.count || 0} Registered</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] shadow-sm overflow-hidden p-8" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
              <h3 className="text-2xl font-extrabold mb-6 tracking-tight" style={{ color: 'var(--theme-text)' }}>Macro-Categorical Dispersion</h3>
              <div className="space-y-6">
                {data.categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold tracking-tight text-lg" style={{ color: 'var(--theme-text)' }}>{cat.category}</span>
                      <div className="text-right flex items-baseline gap-2">
                        <span className="font-black text-lg" style={{ color: 'var(--theme-text)' }}>{cat.count}</span>
                        <span className="font-bold text-xs uppercase px-2 py-1 rounded-lg" style={{ color: 'var(--theme-text-muted)', background: 'var(--theme-bg-alt)' }}>{cat.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full rounded-full h-4 shadow-inner overflow-hidden" style={{ background: 'var(--theme-bg-alt)', border: '1px solid var(--theme-border)' }}>
                      <div className="h-full rounded-full transition-all duration-1000 group-hover:opacity-80" style={{ width: `${cat.percentage}%`, background: 'linear-gradient(to right, var(--theme-accent-light), var(--theme-accent))' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] shadow-sm border overflow-hidden" style={{ background: 'var(--theme-card, #fff)', borderColor: 'var(--theme-border, #f0f0f0)' }}>
              <div className="p-8" style={{ borderBottom: '1px solid var(--theme-border)' }}>
                <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--theme-text)' }}>Prevalent Taxonomies (Top 20)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead style={{ background: 'var(--theme-bg-alt)' }}>
                    <tr>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Index</th>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Morphology</th>
                      <th className="px-8 py-5 text-right text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Freq</th>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Share</th>
                    </tr>
                  </thead>
                  <tbody style={{ background: 'var(--theme-card)' }} className="divide-y" >
                    {data.topWaste.map((item, idx) => {
                      const percentage = data.totalItems > 0 ? ((item.count / data.totalItems) * 100).toFixed(1) : '0';
                      return (
                        <tr key={idx} className="transition-colors" onMouseEnter={e => e.currentTarget.style.background = 'var(--theme-card-hover)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td className="px-8 py-4">
                            <span className="text-xs font-black" style={{ color: 'var(--theme-text-muted)' }}>#{idx + 1}</span>
                          </td>
                          <td className="px-8 py-4 text-sm font-bold" style={{ color: 'var(--theme-text)' }}>{item.type}</td>
                          <td className="px-8 py-4 text-sm font-black text-right" style={{ color: 'var(--theme-text)' }}>{item.count}</td>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 rounded-full h-2.5 overflow-hidden" style={{ background: 'var(--theme-bg-alt)' }}>
                                <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: 'var(--theme-accent)' }}></div>
                              </div>
                              <span className="text-xs font-bold w-12 text-right" style={{ color: 'var(--theme-text-muted)' }}>{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        );
      })()}
    </motion.div>
  );
};

export default ReportsPage;