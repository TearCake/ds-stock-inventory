/**
 * Sidebar Component
 * Navigation for Admin Dashboard
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'System Overview', icon: '🖥️' },
    { path: '/admin/products', label: 'Products', icon: '📦' },
    { path: '/admin/orders', label: 'Orders', icon: '🛒' },
    { path: '/admin/logs', label: 'System Logs', icon: '📋' }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Stock Inventory</h1>
        <p className="text-sm text-gray-400">Distributed System Simulation</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <Link
          to="/client"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <span className="text-xl">🛍️</span>
          <span className="font-medium">Client View</span>
        </Link>
      </div>

      <div className="mt-auto pt-8">
        <div className="text-xs text-gray-500">
          <p>Educational Demo</p>
          <p>Distributed Systems Course</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
