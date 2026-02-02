import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Sidebar Component
 * Navigation menu for admin dashboard
 */
const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'logs', label: 'Waste Logs', icon: '📋' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg z-40"
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative w-64 h-screen bg-gray-900 text-white flex flex-col justify-between transform transition-transform duration-300 z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold">Dashboard</h2>
          </div>

          {/* Navigation Items */}
          <nav className="py-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-6 py-3 transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary text-white border-l-4 border-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-6 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full text-left px-6 py-3 transition-colors text-red-400 hover:bg-red-900"
          >
            <span className="text-xl mr-3">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
