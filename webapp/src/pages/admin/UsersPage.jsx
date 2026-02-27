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
 * User Management Page
 * Admin dashboard page for managing users with search, filtering, role changes, and deletion.
 */
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }

      const response = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdateRole = async (userId, newRole) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivateUser = async (user) => {
    if (!user.isActive) return;

    const reason = window.prompt(`Please provide a reason for deactivating ${user.displayName || user.email}. This will be emailed to the user.`);
    if (reason === null) return; // User cancelled
    if (!reason.trim()) {
      alert('A reason is required to deactivate a user.');
      return;
    }

    if (!window.confirm(`Are you sure you want to deactivate ${user.displayName || user.email} with the reason: "${reason}"?\nThey will immediately lose access to the platform.`)) {
      return;
    }

    setActionLoading(user._id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/${user._id}/deactivate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deactivate user');
      }

      fetchUsers();
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert(`Error deactivating user: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Filtering
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;

  const getInitials = (name, email) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (email || '?')[0].toUpperCase();
  };

  const getTimeSince = (dateStr) => {
    if (!dateStr) return 'Never';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="skeleton-shimmer h-32 w-full rounded-[2rem]" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-[2rem] shadow-sm p-8 space-y-4" style={{ background: 'var(--theme-card, #fff)' }}>
              <div className="flex justify-between">
                <div className="skeleton-shimmer h-8 w-24 rounded-full" />
                <div className="skeleton-shimmer h-12 w-12 rounded-xl" />
              </div>
              <div className="skeleton-shimmer h-10 w-16" />
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] shadow-sm p-6 flex gap-4" style={{ background: 'var(--theme-card, #fff)' }}>
          <div className="skeleton-shimmer h-12 flex-1 rounded-xl" />
          <div className="skeleton-shimmer h-12 w-64 rounded-xl" />
        </div>

        <div className="rounded-[2rem] shadow-sm overflow-hidden p-6 space-y-4" style={{ background: 'var(--theme-card, #fff)' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--theme-border, #f0f0f0)' }}>
              <div className="flex items-center space-x-4">
                <div className="skeleton-shimmer h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <div className="skeleton-shimmer h-5 w-32 rounded" />
                  <div className="skeleton-shimmer h-4 w-48 rounded" />
                </div>
              </div>
              <div className="skeleton-shimmer h-10 w-32 rounded-lg" />
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
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeaderCard
          title="User Management"
          subtitle="Administer user accounts, manage permission roles, and monitor status."
          variant="primary"
          icon={(
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        />
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[2rem] shadow-sm hover:shadow-xl transition-all p-8 flex flex-col justify-between relative overflow-hidden group" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full transition-transform group-hover:scale-110" style={{ background: 'var(--theme-accent-surface)' }}></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'var(--theme-accent-surface)', border: '1px solid var(--theme-accent-surface-border)' }}>
              <svg className="w-7 h-7" fill="none" stroke="var(--theme-accent)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-extrabold tracking-tight" style={{ color: 'var(--theme-text)' }}>{users.length}</p>
            <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--theme-text-muted)' }}>Total Identities</p>
          </div>
        </div>

        <div className="rounded-[2rem] shadow-sm hover:shadow-xl transition-all p-8 flex flex-col justify-between relative overflow-hidden group" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full transition-transform group-hover:scale-110" style={{ background: 'var(--theme-accent-surface)' }}></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'var(--theme-accent-surface)', border: '1px solid var(--theme-accent-surface-border)' }}>
              <svg className="w-7 h-7" fill="none" stroke="var(--theme-accent)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-extrabold tracking-tight" style={{ color: 'var(--theme-text)' }}>{adminCount}</p>
            <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--theme-text-muted)' }}>Administrators</p>
          </div>
        </div>

        <div className="rounded-[2rem] shadow-sm hover:shadow-xl transition-all p-8 flex flex-col justify-between relative overflow-hidden group" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full transition-transform group-hover:scale-110" style={{ background: 'var(--theme-accent-surface)' }}></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'var(--theme-accent-surface)', border: '1px solid var(--theme-accent-surface-border)' }}>
              <svg className="w-7 h-7" fill="none" stroke="var(--theme-accent)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-4xl font-extrabold tracking-tight" style={{ color: 'var(--theme-text)' }}>{userCount}</p>
            <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--theme-text-muted)' }}>Reg. Users</p>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div variants={itemVariants} className="rounded-[2rem] shadow-sm p-6 flex flex-col sm:flex-row gap-4 items-center" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
        <div className="flex-1 relative w-full">
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" fill="none" stroke="var(--theme-text-muted)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by directory name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-4 border rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
            style={{ background: 'var(--theme-input-bg, #f8fafc)', borderColor: 'var(--theme-border, #e5e7eb)', color: 'var(--theme-text, #111827)' }}
          />
        </div>

        <div className="flex items-center p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto" style={{ background: 'var(--theme-bg-alt)', border: '1px solid var(--theme-border)' }}>
          {['all', 'admin', 'user'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${roleFilter === role
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                : ''
                }`}
              style={roleFilter !== role ? { color: 'var(--theme-text-secondary)' } : {}}
            >
              {role === 'all' ? `Global (${users.length})` : role === 'admin' ? `Admin (${adminCount})` : `User (${userCount})`}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={itemVariants} className="rounded-[2rem] shadow-sm overflow-hidden" style={{ background: 'var(--theme-card, #fff)', border: '1px solid var(--theme-card-border, #f0f0f0)' }}>
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full" style={{ borderColor: 'var(--theme-border)' }}>
              <thead style={{ background: 'var(--theme-bg-alt, #f8fafc)' }}>
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Identity</th>
                  <th className="px-8 py-5 text-left text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Clearance</th>
                  <th className="px-8 py-5 text-left text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Status</th>
                  <th className="px-8 py-5 text-left text-[10px] font-extrabold uppercase tracking-widest hidden md:table-cell" style={{ color: 'var(--theme-text-muted)' }}>Reg. Date</th>
                  <th className="px-8 py-5 text-left text-[10px] font-extrabold uppercase tracking-widest hidden lg:table-cell" style={{ color: 'var(--theme-text-muted)' }}>Activity</th>
                  <th className="px-8 py-5 text-right text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>Operations</th>
                </tr>
              </thead>
              <tbody style={{ background: 'var(--theme-card, #fff)' }}>
                <AnimatePresence>
                  {filteredUsers.map((user) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={user._id}
                      className="transition-colors group"
                      style={{ cursor: 'default' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--theme-card-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      {/* User Info */}
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-sm border border-white/20 ${user.role === 'admin' ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/20' : 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/20'}`}>
                            {getInitials(user.displayName, user.email)}
                          </div>
                          <div className="ml-5">
                            <div className="text-sm font-extrabold tracking-tight" style={{ color: 'var(--theme-text)' }}>{user.displayName || 'No Display Name'}</div>
                            <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
                          style={user.role === 'admin'
                            ? { background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)' }
                            : { background: 'rgba(34,197,94,0.12)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.25)' }
                          }>
                          {user.role === 'admin' && (
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          )}
                          {user.role}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
                          style={user.isActive
                            ? { background: 'var(--theme-bg-alt)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }
                            : { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }
                          }>
                          {user.isActive ? (
                            <><div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></div> Active</>
                          ) : (
                            <><div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></div> Voided</>
                          )}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-8 py-5 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm font-bold" style={{ color: 'var(--theme-text-secondary)' }}>
                          {user.createdAt ? getTimeSince(user.createdAt) : 'Unknown'}
                        </div>
                      </td>

                      {/* Last Active */}
                      <td className="px-8 py-5 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-sm font-bold" style={{ color: 'var(--theme-text-secondary)' }}>{getTimeSince(user.lastLogin || user.updatedAt)}</div>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleUpdateRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                            disabled={actionLoading === user._id}
                            className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 active:scale-95"
                            style={user.role === 'admin'
                              ? { background: 'var(--theme-bg-alt)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }
                              : { background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)' }
                            }
                            title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                          >
                            {actionLoading === user._id ? (
                              <span className="flex items-center">
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                              </span>
                            ) : user.role === 'admin' ? (
                              <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                Demote
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                                Escalate
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeactivateUser(user)}
                            disabled={actionLoading === user._id || !user.isActive}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${user.isActive
                              ? 'border-2 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50'
                              : ''
                              }`}
                            title={user.isActive ? "Deactivate User Base Access" : "User record voided"}
                            style={!user.isActive ? { background: 'var(--theme-bg-alt)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)' } : { background: 'transparent' }}
                          >
                            <span className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              {user.isActive ? 'Suspend' : 'Suspended'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center" style={{ background: 'var(--theme-bg-alt, #f8fafc)' }}>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] mb-6 shadow-sm" style={{ background: 'var(--theme-card)', border: '1px solid var(--theme-border)' }}>
              <svg className="w-10 h-10" fill="none" stroke="var(--theme-text-muted)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="font-bold text-2xl tracking-tight mb-2" style={{ color: 'var(--theme-text)' }}>Directory empty</p>
            <p className="font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
              {search || roleFilter !== 'all' ? 'Try adjusting your search query or filters' : 'No users registered yet'}
            </p>
          </div>
        )}

        {/* Footer with count */}
        {filteredUsers.length > 0 && (
          <div className="px-8 py-5 flex items-center justify-between" style={{ background: 'var(--theme-bg-alt, #f8fafc)', borderTop: '1px solid var(--theme-border, #f0f0f0)' }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-secondary)' }}>
              Retrieving <span style={{ color: 'var(--theme-text)' }}>{filteredUsers.length}</span> of <span style={{ color: 'var(--theme-text)' }}>{users.length}</span> nodes
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default UsersPage;
