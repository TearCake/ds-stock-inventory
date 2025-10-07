/**
 * Main App Component
 * Root component with routing and context providers
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { ServerProvider } from './context/ServerContext';
import AdminDashboard from './pages/AdminDashboard';
import ClientShop from './pages/ClientShop';

function App() {
  return (
    <Router>
      <SocketProvider>
        <ServerProvider>
          <Routes>
            {/* Default route - redirect to admin */}
            <Route path="/" element={<Navigate to="/admin" replace />} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/admin/*" element={<AdminDashboard />} />
            
            {/* Client Shop Route */}
            <Route path="/client" element={<ClientShop />} />
            
            {/* Catch all - redirect to admin */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </ServerProvider>
      </SocketProvider>
    </Router>
  );
}

export default App;
