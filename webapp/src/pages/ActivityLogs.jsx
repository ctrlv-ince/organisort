import React, { useState, useEffect } from 'react';

/**
 * Activity Logs Page - Admin Panel
 * Displays comprehensive system activity logs including:
 * - Detection submissions
 * - Admin actions (user role changes, deletions)
 * - System events
 * - API errors/failures
 * - Database operations
 */
const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    eventType: 'all',
    severity: 'all',
    page: 1,
    limit: 50,
  });
  const [pagination, setPagination] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch activity logs
  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Build query string
      const params = new URLSearchParams({
        page: filter.page,
        limit: filter.limit,
      });

      if (filter.eventType !== 'all') {
        params.append('eventType', filter.eventType);
      }

      if (filter.severity !== 'all') {
        params.append('severity', filter.severity);
      }

      const response = await fetch(`${API_URL}/api/activity-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch activity logs');
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/activity-logs/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filter]);

  // Get icon and color for event type
  const getEventStyle = (eventType) => {
    const styles = {
      'auth.register': { icon: '👤', color: 'bg-blue-100 text-blue-800', border: 'border-blue-200' },
      'auth.login': { icon: '🔓', color: 'bg-green-100 text-green-800', border: 'border-green-200' },
      'auth.logout': { icon: '🔒', color: 'bg-gray-100 text-gray-800', border: 'border-gray-200' },
      'auth.login_failed': { icon: '❌', color: 'bg-red-100 text-red-800', border: 'border-red-200' },
      'detection.created': { icon: '📸', color: 'bg-green-100 text-green-800', border: 'border-green-200' },
      'detection.deleted': { icon: '🗑️', color: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
      'admin.user_role_changed': { icon: '⚙️', color: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
      'admin.user_deleted': { icon: '👤❌', color: 'bg-red-100 text-red-800', border: 'border-red-200' },
      'api.error': { icon: '⚠️', color: 'bg-red-100 text-red-800', border: 'border-red-200' },
      'api.unauthorized': { icon: '🚫', color: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200' },
      'api.forbidden': { icon: '🛑', color: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
      'system.error': { icon: '💥', color: 'bg-red-100 text-red-800', border: 'border-red-200' },
      'database.query_error': { icon: '🔍', color: 'bg-red-100 text-red-800', border: 'border-red-200' },
    };

    return styles[eventType] || { icon: '📋', color: 'bg-gray-100 text-gray-800', border: 'border-gray-200' };
  };

  // Get severity badge color
  const getSeverityColor = (severity) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      critical: 'bg-red-600 text-white',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Activity Logs</h1>
              <p className="text-gray-600 mt-1">System events, user actions, and errors</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Events</p>
            <p className="text-3xl font-bold text-purple-600">{pagination?.total || 0}</p>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-semibold uppercase">Info</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.bySeverity?.info || 0}</p>
                </div>
                <div className="text-3xl">ℹ️</div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-600 font-semibold uppercase">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-700">{stats.bySeverity?.warning || 0}</p>
                </div>
                <div className="text-3xl">⚠️</div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 font-semibold uppercase">Errors</p>
                  <p className="text-2xl font-bold text-red-700">{stats.bySeverity?.error || 0}</p>
                </div>
                <div className="text-3xl">🔴</div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 font-semibold uppercase">Total (30d)</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.totalLogs || 0}</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          {/* Event Type Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
            <select
              value={filter.eventType}
              onChange={(e) => setFilter({ ...filter, eventType: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Events</option>
              <optgroup label="Authentication">
                <option value="auth.register">Registration</option>
                <option value="auth.login">Login</option>
                <option value="auth.logout">Logout</option>
                <option value="auth.login_failed">Failed Login</option>
              </optgroup>
              <optgroup label="Detections">
                <option value="detection.created">Detection Created</option>
                <option value="detection.deleted">Detection Deleted</option>
              </optgroup>
              <optgroup label="Admin Actions">
                <option value="admin.user_role_changed">Role Changed</option>
                <option value="admin.user_deleted">User Deleted</option>
              </optgroup>
              <optgroup label="Errors">
                <option value="api.error">API Error</option>
                <option value="api.unauthorized">Unauthorized</option>
                <option value="api.forbidden">Forbidden</option>
                <option value="system.error">System Error</option>
              </optgroup>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <select
              value={filter.severity}
              onChange={(e) => setFilter({ ...filter, severity: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {logs.length} of {pagination?.total || 0} logs
          {pagination && ` (Page ${pagination.page} of ${pagination.pages})`}
        </div>
      </div>

      {/* Activity Logs List */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-600 text-lg">No activity logs found</p>
          <p className="text-gray-500 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => {
                  const eventStyle = getEventStyle(log.eventType);
                  return (
                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${eventStyle.color} border ${eventStyle.border}`}>
                          <span className="mr-2">{eventStyle.icon}</span>
                          {log.eventType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {log.user?.displayName || log.userEmail || 'System'}
                          </div>
                          {log.user?.email && (
                            <div className="text-gray-500 text-xs">{log.user.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{log.action}</div>
                        {log.targetUserEmail && (
                          <div className="text-xs text-gray-500">Target: {log.targetUserEmail}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs">{new Date(log.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        {log.metadata?.ip && (
                          <div className="text-xs text-gray-500">IP: {log.metadata.ip}</div>
                        )}
                        {log.metadata?.endpoint && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {log.metadata.method} {log.metadata.endpoint}
                          </div>
                        )}
                        {log.errorMessage && (
                          <div className="text-xs text-red-600 mt-1 truncate max-w-xs" title={log.errorMessage}>
                            Error: {log.errorMessage}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
                  disabled={filter.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
                  disabled={filter.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;