import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Landing.css'; // Import shared styles

/**
 * User Management Page
 * Displays a list of users and allows admin actions.
 * Styled to match the professional design of the landing page.
 */
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers(); // Refresh users after update
      } else {
        console.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          fetchUsers(); // Refresh users after delete
        } else {
          console.error('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <main>
        <section className="features" style={{ background: '#f9fafb', minHeight: 'calc(100vh - 150px)' }}>
          <div className="container-pro">
            <h2 className="section-title">User Management</h2>
            <div className="news-grid">
              {users.map((user) => (
                <div key={user._id} className="news-card">
                  <div className="news-content">
                    <p className="news-desc" style={{ fontSize: '0.8rem', color: '#6b7280' }}>ID: {user._id}</p>
                    <h3 className="news-title">{user.displayName || 'No Name'}</h3>
                    <p className="news-desc">{user.email}</p>
                    <p className="product-grade" style={{marginTop: '1rem'}}>
                      Role: {user.role}
                    </p>
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleUpdateRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                        className="btn-outline product-button"
                      >
                        {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="btn-primary product-button"
                        style={{ background: '#ef4444' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UsersPage;
