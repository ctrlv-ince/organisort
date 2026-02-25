import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion } from 'framer-motion';
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
      'Fruits': ['apple', 'apple-core', 'apple-peel', 'avocado', 'banana-peel', 'calamansi', 'orange', 'orange-peel', 'papaya', 'pear', 'pear-core', 'pear-peel', 'pineapple', 'watermelon'],
      'Vegetables': ['broccoli', 'cucumber', 'garlic', 'onion', 'potato', 'tomato', 'mushroom', 'leaf'],
      'Proteins': ['bone', 'bone-fish', 'chicken-skin', 'fish', 'meat', 'shrimp', 'shrimp-shell', 'mussel', 'mussel-shell'],
      'Eggs': ['egg-scramble', 'egg-shell', 'egg-yolk'],
      'Grains': ['bread', 'bun', 'noodle', 'pasta', 'rice'],
      'Other': ['congee', 'malunggay', 'pancake', 'tofu', 'good'],
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
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(22, 163, 74); // green-600
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('OrganiSort Report', 14, 16);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      const reportTitles = {
        summary: 'Executive Summary Report',
        trends: 'Activity Trends Report',
        users: 'User Activity Report',
        waste: 'Waste Composition Report',
      };
      doc.text(reportTitles[reportType] || 'Report', 14, 26);
      doc.setTextColor(200, 230, 200);
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 26, { align: 'right' });

      // Reset styles
      doc.setTextColor(0, 0, 0);
      let yPos = 45;

      if (reportType === 'summary') {
        const data = generateSummaryReport();

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Period: ${data.period}  |  ${data.dateRangeLabel}`, 14, yPos);
        yPos += 10;

        // Key metrics table
        autoTable(doc, {
          startY: yPos,
          head: [['Metric', 'Value']],
          body: [
            ['Total Scans', String(data.totalScans)],
            ['Total Items Detected', String(data.totalItems)],
            ['Unique Waste Types', String(data.uniqueTypes)],
            ['Avg Items per Scan', String(data.avgItemsPerScan)],
            ['Avg Confidence', data.avgConfidence],
            ['Active Users', String(data.activeUsers)],
            ['Scans per User', data.activeUsers > 0 ? (data.totalScans / data.activeUsers).toFixed(2) : '0'],
          ],
          theme: 'striped',
          headStyles: { fillColor: [22, 163, 74] },
          styles: { fontSize: 10 },
        });

      } else if (reportType === 'trends') {
        const data = generateTrendsReport();

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Period: Last ${dateRange} days  |  ${data.dateRangeLabel}`, 14, yPos);
        yPos += 8;
        doc.text(`Trend: ${data.trend}  |  Growth: ${data.growth}  |  Avg Daily: ${data.averageDaily}`, 14, yPos);
        if (data.peakDay) {
          yPos += 6;
          doc.text(`Peak Day: ${data.peakDay.date} (${data.peakDay.scans} scans)`, 14, yPos);
        }
        yPos += 10;

        autoTable(doc, {
          startY: yPos,
          head: [['Date', 'Scans', 'Items', 'Unique Types']],
          body: data.dailyTrends.map(d => [d.date, String(d.scans), String(d.items), String(d.uniqueTypes)]),
          theme: 'striped',
          headStyles: { fillColor: [22, 163, 74] },
          styles: { fontSize: 9 },
        });

      } else if (reportType === 'users') {
        const data = generateUserReport();

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Period: ${data.dateRangeLabel}`, 14, yPos);
        yPos += 8;

        // User summary metrics
        autoTable(doc, {
          startY: yPos,
          head: [['Metric', 'Value']],
          body: [
            ['Total Users', String(data.totalUsers)],
            ['Active Users (in period)', String(data.activeUsers)],
            ['Inactive Users', String(data.inactiveUsers)],
            ['Avg Scans per User', String(data.avgScansPerUser)],
          ],
          theme: 'striped',
          headStyles: { fillColor: [22, 163, 74] },
          styles: { fontSize: 10 },
          margin: { bottom: 10 },
        });

        // Top users table
        const userTableY = doc.lastAutoTable?.finalY + 10 || yPos + 50;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Top Active Users', 14, userTableY);
        doc.setFont('helvetica', 'normal');

        autoTable(doc, {
          startY: userTableY + 6,
          head: [['#', 'Email', 'Name', 'Scans', 'Items', 'Types', 'Last Active']],
          body: data.topUsers.map((u, i) => [
            String(i + 1), u.email, u.displayName, String(u.scans), String(u.items), String(u.uniqueTypes), u.lastActive
          ]),
          theme: 'striped',
          headStyles: { fillColor: [22, 163, 74] },
          styles: { fontSize: 8 },
          columnStyles: { 0: { cellWidth: 10 } },
        });

      } else if (reportType === 'waste') {
        const data = generateWasteReport();

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Period: ${data.dateRangeLabel}  |  Total Items: ${data.totalItems}  |  Unique Types: ${data.uniqueTypes}`, 14, yPos);
        yPos += 10;

        // Category breakdown
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Category Breakdown', 14, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 6;

        autoTable(doc, {
          startY: yPos,
          head: [['Category', 'Count', 'Percentage']],
          body: data.categoryBreakdown.map(c => [c.category, String(c.count), `${c.percentage}%`]),
          theme: 'striped',
          headStyles: { fillColor: [22, 163, 74] },
          styles: { fontSize: 10 },
        });

        // Top waste types
        const wasteTableY = doc.lastAutoTable?.finalY + 10 || yPos + 60;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Top 20 Detected Waste Types', 14, wasteTableY);
        doc.setFont('helvetica', 'normal');

        autoTable(doc, {
          startY: wasteTableY + 6,
          head: [['#', 'Waste Type', 'Count', 'Percentage']],
          body: data.topWaste.map((item, i) => [
            String(i + 1),
            item.type,
            String(item.count),
            data.totalItems > 0 ? `${((item.count / data.totalItems) * 100).toFixed(1)}%` : '0%'
          ]),
          theme: 'striped',
          headStyles: { fillColor: [22, 163, 74] },
          styles: { fontSize: 9 },
          columnStyles: { 0: { cellWidth: 10 } },
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`OrganiSort Analytics  •  Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
      }

      doc.save(`organisort_${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
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

        <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-gray-100 flex gap-4">
          <div className="skeleton-shimmer h-12 w-48 rounded-xl" />
          <div className="skeleton-shimmer h-12 w-64 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-[2rem] shadow-sm p-8 space-y-4 border border-gray-100">
              <div className="skeleton-shimmer h-5 w-24 rounded" />
              <div className="skeleton-shimmer h-10 w-16" />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 space-y-6">
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
      <motion.div variants={itemVariants} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 print:hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>

          <div className="hidden md:flex items-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm whitespace-nowrap">
            <span className="text-slate-500 font-bold mr-2 uppercase tracking-widest text-xs">Period:</span>
            <strong className="text-slate-800 font-extrabold">{getDateRangeLabel()}</strong>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          <button
            onClick={exportAsPDF}
            disabled={generatingPDF}
            className="px-5 py-3 bg-red-50 text-red-600 font-bold border border-red-100 rounded-xl hover:bg-red-100 hover:border-red-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
      <motion.div variants={itemVariants} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'summary', label: 'Summary', color: 'blue', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { id: 'trends', label: 'Trends', color: 'green', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
            { id: 'users', label: 'User Activity', color: 'purple', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { id: 'waste', label: 'Waste Composition', color: 'amber', icon: null, emoji: '♻️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 relative overflow-hidden group ${reportType === tab.id
                ? `border-${tab.color}-500 bg-${tab.color}-50 text-${tab.color}-700 shadow-md shadow-${tab.color}-500/10`
                : `border-gray-100 hover:border-${tab.color}-200 bg-white text-gray-600 hover:bg-slate-50`
                }`}
            >
              {reportType === tab.id && (
                <motion.div layoutId="activeTabIndicator" className={`absolute inset-0 bg-${tab.color}-500/5`} />
              )}
              <div className={`p-3 rounded-full transition-colors ${reportType === tab.id ? `bg-${tab.color}-100 text-${tab.color}-600` : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                {tab.icon ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={tab.icon} />
                  </svg>
                ) : (
                  <span className="text-2xl leading-none">{tab.emoji}</span>
                )}
              </div>
              <span className="font-extrabold tracking-tight text-sm uppercase">{tab.label}</span>
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
              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 bg-blue-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Platform Scans</p>
                  <p className="text-5xl font-black text-gray-900 tracking-tight">{data.totalScans}</p>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 bg-green-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Organic Items Formally Detected</p>
                  <p className="text-5xl font-black text-gray-900 tracking-tight">{data.totalItems}</p>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 bg-purple-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Unique Classes Classified</p>
                  <p className="text-5xl font-black text-gray-900 tracking-tight">{data.uniqueTypes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100">
              <h3 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Performance Metrics Benchmark</h3>
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
              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-shadow">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Trend Status</p>
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
                  <span className="text-4xl font-black capitalize tracking-tight text-gray-900">{data.trend}</span>
                </div>
                <div className="mt-4 inline-block px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-gray-500">
                  Growth Variable: <span className={data.trend === 'increasing' ? 'text-green-600' : data.trend === 'decreasing' ? 'text-red-600' : ''}>{data.growth}</span>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-shadow">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mean Daily Usage</p>
                <p className="text-5xl font-black text-gray-900 tracking-tight">{data.averageDaily}</p>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-shadow">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Peak Processing Frame</p>
                <p className="text-3xl font-black text-gray-900 tracking-tight">{data.peakDay?.date || 'N/A'}</p>
                <p className="text-sm font-bold text-purple-600 mt-2 bg-purple-50 inline-block px-3 py-1 rounded-lg border border-purple-100">{data.peakDay?.scans || 0} Events Registered</p>
              </div>
            </div>

            {/* Trend mini-chart */}
            {data.dailyTrends.length > 0 && (
              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Timeline Heatmap</h3>
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
                              className="w-full bg-gradient-to-t from-emerald-500 to-green-400 rounded-t-lg hover:from-emerald-600 hover:to-green-500 cursor-pointer transition-all duration-300 group-hover:-translate-y-1"
                              style={{ height: `${height}%`, minHeight: day.scans > 0 ? '6px' : '4px' }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Timeline Ledger</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Chronology</th>
                      <th className="px-8 py-5 text-right text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Inferences</th>
                      <th className="px-8 py-5 text-right text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Bound Boxes</th>
                      <th className="px-8 py-5 text-right text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Distinct Classes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100/50">
                    {data.dailyTrends.map((day, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4 text-sm font-bold text-gray-700">{day.date}</td>
                        <td className="px-8 py-4 text-sm font-black text-gray-900 text-right">{day.scans}</td>
                        <td className="px-8 py-4 text-sm font-semibold text-gray-600 text-right">{day.items}</td>
                        <td className="px-8 py-4 text-sm font-semibold text-gray-600 text-right">{day.uniqueTypes}</td>
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
              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 bg-purple-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Global User Nodes</p>
                  <p className="text-4xl font-black text-gray-900 tracking-tight">{data.totalUsers}</p>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 bg-green-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Identities</p>
                  <p className="text-4xl font-black text-gray-900 tracking-tight">{data.activeUsers}</p>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 bg-gray-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Dormant Identities</p>
                  <p className="text-4xl font-black text-gray-400 tracking-tight">{data.inactiveUsers}</p>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 bg-blue-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Events Per Node</p>
                  <p className="text-4xl font-black text-gray-900 tracking-tight">{data.avgScansPerUser}</p>
                </div>
              </div>
            </div>

            {/* User engagement bar chart */}
            {data.topUsers.length > 0 && (
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Identity Engagement Ranking</h3>
                <div className="space-y-4">
                  {data.topUsers.slice(0, 10).map((user, idx) => {
                    const max = data.topUsers[0]?.scans || 1;
                    const pct = (user.scans / max) * 100;
                    return (
                      <div key={idx} className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-xl hover:bg-slate-100 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-black text-purple-600">{idx + 1}</span>
                        </div>
                        <span className="w-40 text-sm font-bold text-gray-800 truncate">{user.email.split('@')[0]}</span>
                        <div className="flex-1 bg-white rounded-full h-3 shadow-inner border border-gray-100 overflow-hidden">
                          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="w-16 text-right text-sm font-black text-gray-900">{user.scans}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Active Directory Rankings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">ID</th>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Address</th>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Display Key</th>
                      <th className="px-8 py-5 text-right text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Operations</th>
                      <th className="px-8 py-5 text-right text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Sub-Items</th>
                      <th className="px-8 py-5 text-right text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Classes</th>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Ping</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100/50">
                    {data.topUsers.map((user, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="w-8 h-8 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-center">
                            <span className="text-purple-700 font-black text-xs">{idx + 1}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-sm font-bold text-gray-800">{user.email}</td>
                        <td className="px-8 py-4 text-sm font-semibold text-gray-500">{user.displayName}</td>
                        <td className="px-8 py-4 text-sm font-black text-gray-900 text-right">{user.scans}</td>
                        <td className="px-8 py-4 text-sm font-semibold text-gray-500 text-right">{user.items}</td>
                        <td className="px-8 py-4 text-sm font-semibold text-gray-500 text-right">{user.uniqueTypes}</td>
                        <td className="px-8 py-4 text-sm font-semibold text-gray-400">{user.lastActive}</td>
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
              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 bg-amber-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Cataloged Objects</p>
                  <p className="text-4xl font-black text-gray-900 tracking-tight">{data.totalItems}</p>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 bg-blue-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Discrete Categories</p>
                  <p className="text-4xl font-black text-gray-900 tracking-tight">{data.uniqueTypes}</p>
                  <p className="text-xs font-bold text-blue-600 mt-2 bg-blue-50 inline-block px-3 py-1 rounded-lg border border-blue-100">Out of 45 Available</p>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 bg-green-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Highest Frequency</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight truncate">{data.mostCommon?.type || 'N/A'}</p>
                  <p className="text-sm font-bold text-green-600 mt-2 bg-green-50 inline-block px-3 py-1 rounded-lg border border-green-100">{data.mostCommon?.count || 0} Registered</p>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 bg-purple-50 w-24 h-24 rounded-tl-full -mr-4 -mb-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Lowest Frequency</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight truncate">{data.leastCommon?.type || 'N/A'}</p>
                  <p className="text-sm font-bold text-purple-600 mt-2 bg-purple-50 inline-block px-3 py-1 rounded-lg border border-purple-100">{data.leastCommon?.count || 0} Registered</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden p-8">
              <h3 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Macro-Categorical Dispersion</h3>
              <div className="space-y-6">
                {data.categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-900 font-bold tracking-tight text-lg">{cat.category}</span>
                      <div className="text-right flex items-baseline gap-2">
                        <span className="text-gray-900 font-black text-lg">{cat.count}</span>
                        <span className="text-gray-400 font-bold text-xs uppercase bg-gray-100 px-2 py-1 rounded-lg">{cat.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4 shadow-inner overflow-hidden border border-slate-200">
                      <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full transition-all duration-1000 group-hover:opacity-80" style={{ width: `${cat.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Prevalent Taxonomies (Top 20)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Index</th>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Morphology</th>
                      <th className="px-8 py-5 text-right text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Freq</th>
                      <th className="px-8 py-5 text-left text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Share</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100/50">
                    {data.topWaste.map((item, idx) => {
                      const percentage = data.totalItems > 0 ? ((item.count / data.totalItems) * 100).toFixed(1) : '0';
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-4">
                            <span className="text-xs font-black text-gray-400">#{idx + 1}</span>
                          </td>
                          <td className="px-8 py-4 text-sm font-bold text-gray-900">{item.type}</td>
                          <td className="px-8 py-4 text-sm font-black text-gray-900 text-right">{item.count}</td>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-gray-500 w-12 text-right">{percentage}%</span>
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