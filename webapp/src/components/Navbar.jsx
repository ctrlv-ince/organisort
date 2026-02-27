import React from 'react';
import { useAuth } from '../context/AuthContext';
import LandingPageButton from './LandingPageButton';

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
    <nav style={{ background: 'var(--theme-card, #ffffff)', borderBottom: '1px solid var(--theme-border, #f0f0f0)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-base font-extrabold tracking-tight" style={{ color: 'var(--theme-text)' }}>OrganiSort</h1>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                {/* User Profile */}
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-9 h-9 rounded-xl object-cover"
                      style={{ border: '1px solid var(--theme-border, #e5e7eb)' }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--theme-accent-surface)', border: '1px solid var(--theme-accent-surface-border)' }}>
                      <svg className="w-5 h-5" fill="none" stroke="var(--theme-accent, #15803d)" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold" style={{ color: 'var(--theme-text)' }}>
                      {user.displayName || user.email}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{user.email}</p>
                  </div>
                </div>

                <LandingPageButton variant="navbar" />

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm rounded-xl transition-all duration-200"
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
