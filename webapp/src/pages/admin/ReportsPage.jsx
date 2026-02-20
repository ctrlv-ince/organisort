import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4 print:hidden">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
              <p className="text-gray-600 mt-1">Generate and download comprehensive waste management reports</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 print:hidden flex-wrap">
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

            <button
              onClick={exportAsPDF}
              disabled={generatingPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {generatingPDF ? 'Generating...' : 'Download PDF'}
            </button>

            <button
              onClick={exportAsCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>

            <button
              onClick={printReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Badge */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-2 print:hidden">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm text-gray-600">Showing data for: <strong className="text-gray-800">{getDateRangeLabel()}</strong></span>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'summary', label: 'Summary', color: 'blue', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { id: 'trends', label: 'Trends', color: 'green', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
            { id: 'users', label: 'User Activity', color: 'purple', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { id: 'waste', label: 'Waste Composition', color: 'amber', icon: null, emoji: '♻️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`p-4 rounded-lg border-2 transition-all ${reportType === tab.id
                  ? `border-${tab.color}-600 bg-${tab.color}-50 text-${tab.color}-700`
                  : `border-gray-200 hover:border-${tab.color}-300`
                }`}
            >
              <div className="flex items-center">
                {tab.icon ? (
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                ) : (
                  <span className="text-2xl mr-2">{tab.emoji}</span>
                )}
                <span className="font-semibold">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* Summary Report */}
      {/* ════════════════════════════════════════════ */}
      {reportType === 'summary' && (() => {
        const data = generateSummaryReport();
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-6 print:bg-white print:text-black print:border-2 print:border-blue-600">
              <h2 className="text-2xl font-bold mb-2">Executive Summary Report</h2>
              <p className="text-blue-100 print:text-gray-600">Period: {data.period} ({data.dateRangeLabel})</p>
              <p className="text-blue-100 text-sm print:text-gray-500">Generated: {data.dateGenerated}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                <p className="text-sm text-gray-600 mb-1">Total Scans</p>
                <p className="text-4xl font-bold text-blue-700">{data.totalScans}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                <p className="text-sm text-gray-600 mb-1">Total Items Detected</p>
                <p className="text-4xl font-bold text-green-700">{data.totalItems}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
                <p className="text-sm text-gray-600 mb-1">Unique Waste Types</p>
                <p className="text-4xl font-bold text-purple-700">{data.uniqueTypes}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Metrics</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { label: 'Avg Items per Scan', value: data.avgItemsPerScan, color: 'blue' },
                  { label: 'Avg Confidence', value: data.avgConfidence, color: 'green' },
                  { label: 'Active Users', value: data.activeUsers, color: 'purple' },
                  { label: 'Scans per User', value: data.activeUsers > 0 ? (data.totalScans / data.activeUsers).toFixed(2) : 0, color: 'amber' },
                ].map((metric, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">{metric.label}</span>
                    <span className={`text-2xl font-bold text-${metric.color}-700`}>{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ════════════════════════════════════════════ */}
      {/* Trends Report */}
      {/* ════════════════════════════════════════════ */}
      {reportType === 'trends' && (() => {
        const data = generateTrendsReport();
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg p-6 print:bg-white print:text-black print:border-2 print:border-green-600">
              <h2 className="text-2xl font-bold mb-2">Activity Trends Report</h2>
              <p className="text-green-100 print:text-gray-600">{data.dateRangeLabel}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Trend</p>
                <div className="flex items-center gap-2">
                  {data.trend === 'increasing' ? (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  ) : data.trend === 'decreasing' ? (
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>
                  ) : (
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>
                  )}
                  <span className="text-3xl font-bold capitalize">{data.trend}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Growth: {data.growth}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Average Daily Scans</p>
                <p className="text-4xl font-bold text-blue-700">{data.averageDaily}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Peak Activity Day</p>
                <p className="text-2xl font-bold text-purple-700">{data.peakDay?.date || 'N/A'}</p>
                <p className="text-sm text-gray-500 mt-1">{data.peakDay?.scans || 0} scans</p>
              </div>
            </div>

            {/* Trend mini-chart */}
            {data.dailyTrends.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Activity Trend Chart</h3>
                <div className="overflow-x-auto">
                  <div className="min-w-full inline-flex gap-1 items-end h-40">
                    {data.dailyTrends.map((day, idx) => {
                      const max = Math.max(...data.dailyTrends.map(d => d.scans), 1);
                      const height = (day.scans / max) * 100;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center group min-w-[8px]">
                          <div className="relative w-full">
                            <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {day.date}: {day.scans} scans
                            </div>
                            <div
                              className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t hover:from-green-700 hover:to-green-500 cursor-pointer transition-all"
                              style={{ height: `${height}%`, minHeight: day.scans > 0 ? '4px' : '2px' }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Activity Breakdown</h3>
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Scans</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Items</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Unique Types</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailyTrends.map((day, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{day.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">{day.scans}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{day.items}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{day.uniqueTypes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* ════════════════════════════════════════════ */}
      {/* User Activity Report */}
      {/* ════════════════════════════════════════════ */}
      {reportType === 'users' && (() => {
        const data = generateUserReport();
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow-lg p-6 print:bg-white print:text-black print:border-2 print:border-purple-600">
              <h2 className="text-2xl font-bold mb-2">User Activity Report</h2>
              <p className="text-purple-100 print:text-gray-600">{data.dateRangeLabel}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-4xl font-bold text-purple-700">{data.totalUsers}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Active Users</p>
                <p className="text-4xl font-bold text-green-700">{data.activeUsers}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Inactive Users</p>
                <p className="text-4xl font-bold text-gray-500">{data.inactiveUsers}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Avg Scans/User</p>
                <p className="text-4xl font-bold text-blue-700">{data.avgScansPerUser}</p>
              </div>
            </div>

            {/* User engagement bar chart */}
            {data.topUsers.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">User Engagement Chart</h3>
                <div className="space-y-3">
                  {data.topUsers.slice(0, 10).map((user, idx) => {
                    const max = data.topUsers[0]?.scans || 1;
                    const pct = (user.scans / max) * 100;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-6 text-right text-xs font-bold text-purple-600">#{idx + 1}</span>
                        <span className="w-32 text-sm text-gray-700 truncate">{user.email.split('@')[0]}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="w-12 text-right text-sm font-bold text-gray-800">{user.scans}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Top 10 Active Users</h3>
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Display Name</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Scans</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Items</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Types</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topUsers.map((user, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-700 font-bold text-sm">#{idx + 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.displayName}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">{user.scans}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{user.items}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{user.uniqueTypes}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* ════════════════════════════════════════════ */}
      {/* Waste Composition Report */}
      {/* ════════════════════════════════════════════ */}
      {reportType === 'waste' && (() => {
        const data = generateWasteReport();
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg shadow-lg p-6 print:bg-white print:text-black print:border-2 print:border-amber-600">
              <h2 className="text-2xl font-bold mb-2">Waste Composition Report</h2>
              <p className="text-amber-100 print:text-gray-600">{data.dateRangeLabel}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Total Items</p>
                <p className="text-4xl font-bold text-amber-700">{data.totalItems}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Unique Types</p>
                <p className="text-4xl font-bold text-blue-700">{data.uniqueTypes}</p>
                <p className="text-xs text-gray-500 mt-1">of 45 total</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Most Common</p>
                <p className="text-xl font-bold text-green-700">{data.mostCommon?.type || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">{data.mostCommon?.count || 0} items</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Least Common</p>
                <p className="text-xl font-bold text-purple-700">{data.leastCommon?.type || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">{data.leastCommon?.count || 0} items</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Breakdown by Category</h3>
              <div className="space-y-4">
                {data.categoryBreakdown.map((cat, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-medium">{cat.category}</span>
                      <div className="text-right">
                        <span className="text-gray-800 font-bold mr-2">{cat.count}</span>
                        <span className="text-gray-500 text-sm">({cat.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full" style={{ width: `${cat.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Top 20 Detected Waste Types</h3>
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Waste Type</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Count</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topWaste.map((item, idx) => {
                    const percentage = data.totalItems > 0 ? ((item.count / data.totalItems) * 100).toFixed(1) : '0';
                    return (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">#{idx + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-800 text-right font-semibold">{item.count}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-600 w-12 text-right">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ReportsPage;