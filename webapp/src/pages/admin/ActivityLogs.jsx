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
      'auth.register': { icon: '👤', bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
      'auth.login': { icon: '🔓', bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.25)' },
      'auth.logout': { icon: '🔒', bg: 'rgba(107,114,128,0.12)', color: '#9ca3af', border: 'rgba(107,114,128,0.25)' },
      'auth.login_failed': { icon: '❌', bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
      'detection.created': { icon: '📸', bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.25)' },
      'detection.deleted': { icon: '🗑️', bg: 'rgba(249,115,22,0.12)', color: '#f97316', border: 'rgba(249,115,22,0.25)' },
      'admin.user_role_changed': { icon: '⚙️', bg: 'rgba(168,85,247,0.12)', color: '#a855f7', border: 'rgba(168,85,247,0.25)' },
      'admin.user_deleted': { icon: '👤❌', bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
      'api.error': { icon: '⚠️', bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
      'api.unauthorized': { icon: '🚫', bg: 'rgba(234,179,8,0.12)', color: '#eab308', border: 'rgba(234,179,8,0.25)' },
      'api.forbidden': { icon: '🛑', bg: 'rgba(249,115,22,0.12)', color: '#f97316', border: 'rgba(249,115,22,0.25)' },
      'system.error': { icon: '💥', bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
      'database.query_error': { icon: '🔍', bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
    };

    return styles[eventType] || { icon: '📋', bg: 'rgba(107,114,128,0.12)', color: '#9ca3af', border: 'rgba(107,114,128,0.25)' };
  };

  // Get severity badge color
  const getSeverityStyle = (severity) => {
    const styles = {
      info: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
      warning: { bg: 'rgba(234,179,8,0.12)', color: '#eab308' },
      error: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
      critical: { bg: '#ef4444', color: '#ffffff' },
    };
    return styles[severity] || { bg: 'rgba(107,114,128,0.12)', color: '#9ca3af' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="rounded-lg shadow-md p-6" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="skeleton-shimmer h-12 w-12 rounded-lg mr-4" />
              <div className="space-y-2">
                <div className="skeleton-shimmer h-8 w-40" />
                <div className="skeleton-shimmer h-4 w-56" />
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="skeleton-shimmer h-10 flex-1" />
            <div className="skeleton-shimmer h-10 w-32" />
          </div>
        </div>
        {/* Log entries skeleton */}
        <div className="rounded-lg shadow-md overflow-hidden" style={{ background: 'var(--theme-card)', border: '1px solid var(--theme-card-border)' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--theme-border)' }}>
              <div className="flex items-center space-x-4">
                <div className="skeleton-shimmer h-8 w-8 rounded" />
                <div className="space-y-2">
                  <div className="skeleton-shimmer h-4 w-48" />
                  <div className="skeleton-shimmer h-3 w-32" />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="skeleton-shimmer h-6 w-16 rounded-full" />
                <div className="skeleton-shimmer h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="rounded-lg shadow-md p-6" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-3 rounded-lg mr-4" style={{ background: 'var(--theme-accent-surface)', border: '1px solid var(--theme-accent-surface-border)' }}>
              <svg className="w-8 h-8" fill="none" stroke="var(--theme-accent)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--theme-text)' }}>Activity Logs</h1>
              <p className="mt-1" style={{ color: 'var(--theme-text-secondary)' }}>System events, user actions, and errors</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Total Events</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--theme-accent)' }}>{pagination?.total || 0}</p>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="rounded-lg p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase" style={{ color: '#3b82f6' }}>Info</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{stats.bySeverity?.info || 0}</p>
                </div>
                <div className="text-3xl">ℹ️</div>
              </div>
            </div>
            <div className="rounded-lg p-4" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase" style={{ color: '#eab308' }}>Warnings</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{stats.bySeverity?.warning || 0}</p>
                </div>
                <div className="text-3xl">⚠️</div>
              </div>
            </div>
            <div className="rounded-lg p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase" style={{ color: '#ef4444' }}>Errors</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{stats.bySeverity?.error || 0}</p>
                </div>
                <div className="text-3xl">🔴</div>
              </div>
            </div>
            <div className="rounded-lg p-4" style={{ background: 'var(--theme-accent-surface)', border: '1px solid var(--theme-accent-surface-border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase" style={{ color: 'var(--theme-accent)' }}>Total (30d)</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{stats.totalLogs || 0}</p>
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
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>Event Type</label>
            <select
              value={filter.eventType}
              onChange={(e) => setFilter({ ...filter, eventType: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ background: 'var(--theme-input-bg, #fff)', borderColor: 'var(--theme-border, #d1d5db)', color: 'var(--theme-text)' }}
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
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>Severity</label>
            <select
              value={filter.severity}
              onChange={(e) => setFilter({ ...filter, severity: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ background: 'var(--theme-input-bg, #fff)', borderColor: 'var(--theme-border, #d1d5db)', color: 'var(--theme-text)' }}
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
        <div className="mt-4 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
          Showing {logs.length} of {pagination?.total || 0} logs
          {pagination && ` (Page ${pagination.page} of ${pagination.pages})`}
        </div>
      </div>

      {/* Activity Logs List */}
      {logs.length === 0 ? (
        <div className="rounded-lg shadow-md p-12 text-center" style={{ background: 'var(--theme-card, #fff)' }}>
          <div className="text-6xl mb-4">📋</div>
          <p className="text-lg" style={{ color: 'var(--theme-text-secondary)' }}>No activity logs found</p>
          <p className="mt-2" style={{ color: 'var(--theme-text-muted)' }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="rounded-lg shadow-md overflow-hidden" style={{ background: 'var(--theme-card, #fff)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'var(--theme-bg-alt, #f9fafb)', borderBottom: '1px solid var(--theme-border, #e5e7eb)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                    Details
                  </th>
                </tr>
              </thead>
              <tbody style={{ background: 'var(--theme-card, #fff)' }}>
                {logs.map((log) => {
                  const eventStyle = getEventStyle(log.eventType);
                  return (
                    <tr key={log._id} className="transition-colors" style={{ '--tw-bg-opacity': 1 }} onMouseEnter={e => e.currentTarget.style.background = 'var(--theme-card-hover)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ background: eventStyle.bg, color: eventStyle.color, border: `1px solid ${eventStyle.border}` }}>
                          <span className="mr-2">{eventStyle.icon}</span>
                          {log.eventType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium" style={{ color: 'var(--theme-text)' }}>
                            {log.user?.displayName || log.userEmail || 'System'}
                          </div>
                          {log.user?.email && (
                            <div className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{log.user.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm" style={{ color: 'var(--theme-text)' }}>{log.action}</div>
                        {log.targetUserEmail && (
                          <div className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>Target: {log.targetUserEmail}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const sStyle = getSeverityStyle(log.severity); return (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: sStyle.bg, color: sStyle.color }}>
                              {log.severity}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                        <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs">{new Date(log.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        {log.metadata?.ip && (
                          <div className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>IP: {log.metadata.ip}</div>
                        )}
                        {log.metadata?.endpoint && (
                          <div className="text-xs truncate max-w-xs" style={{ color: 'var(--theme-text-muted)' }}>
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
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'var(--theme-bg-alt, #f9fafb)', borderTop: '1px solid var(--theme-border, #e5e7eb)' }}>
              <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
                  disabled={filter.page === 1}
                  className="px-4 py-2 border rounded-lg text-sm font-medium hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: 'var(--theme-border, #d1d5db)', color: 'var(--theme-text-secondary)' }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
                  disabled={filter.page === pagination.pages}
                  className="px-4 py-2 border rounded-lg text-sm font-medium hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: 'var(--theme-border, #d1d5db)', color: 'var(--theme-text-secondary)' }}
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