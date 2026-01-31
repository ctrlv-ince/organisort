import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import { useAuth } from './context/AuthContext';

/**
 * RoleBasedDashboard Component
 * Routes users to the correct dashboard based on their role
 */
const RoleBasedDashboard = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        if (!user) return;

        const idToken = await user.getIdToken();
        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserRole(data.data.role || 'user');
        } else {
          setUserRole('user');
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setUserRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return userRole === 'admin' ? <AdminDashboard /> : <UserDashboard />;
};

/**
 * App Component
 * Main application with routing
 * Routes:
 * - /login: Public login page
 * - /dashboard: Protected dashboard (requires auth)
 * - /: Redirects to /dashboard
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleBasedDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
