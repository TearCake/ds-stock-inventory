/**
 * Admin Dashboard Page
 * Main admin interface with sidebar navigation
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import SystemOverview from '../components/admin/SystemOverview';
import ProductTable from '../components/admin/ProductTable';
import OrderTable from '../components/admin/OrderTable';
import SystemLog from '../components/admin/SystemLog';

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<SystemOverview />} />
          <Route path="/products" element={<ProductTable />} />
          <Route path="/orders" element={<OrderTable />} />
          <Route path="/logs" element={<SystemLog />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
