import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar Component
 * Displays user info and logout button
 */
const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800">Waste Detection</h1>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                {/* User Profile */}
                <div className="flex items-center gap-3">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-10 h-10 rounded-full border-2 border-gray-200"
                    />
                  )}
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-800">
                      {user.displayName || user.email}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm rounded-lg transition duration-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
