/**
 * Server Context Provider
 * 
 * Manages distributed system state:
 * - Server instances and their status
 * - Products and orders
 * - System logs
 * - Leader information
 * 
 * Listens to Socket.IO events and updates state accordingly
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';

const ServerContext = createContext(null);

export const useServer = () => {
  const context = useContext(ServerContext);
  if (!context) {
    throw new Error('useServer must be used within ServerProvider');
  }
  return context;
};

export const ServerProvider = ({ children }) => {
  const { socket, connected } = useSocket();
  
  // State management
  const [servers, setServers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [leader, setLeader] = useState(null);
  const [loading, setLoading] = useState(true);

  // Request initial system state when connected
  useEffect(() => {
    if (socket && connected) {
      socket.emit('getSystemState');
    }
  }, [socket, connected]);

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket) return;

    // System state update (initial and periodic)
    socket.on('systemState', (state) => {
      setServers(state.servers || []);
      setProducts(state.products || []);
      setOrders(state.orders || []);
      setLeader(state.leader);
      setLoading(false);
    });

    // Server status update
    socket.on('serverStatusUpdate', (update) => {
      setServers(prev => prev.map(s => 
        s.id === update.serverId 
          ? { ...s, status: update.status, isLeader: update.isLeader }
          : s
      ));
    });

    // Leader elected event
    socket.on('leaderElected', (data) => {
      setLeader(data.leaderId);
      setServers(prev => prev.map(s => ({
        ...s,
        isLeader: s.id === data.leaderId
      })));
    });

    // Log update
    socket.on('logUpdate', (logEntry) => {
      setLogs(prev => [logEntry, ...prev].slice(0, 500)); // Keep last 500 logs
    });

    // Log cleared
    socket.on('logCleared', () => {
      setLogs([]);
    });

    // Order placed
    socket.on('orderPlaced', (order) => {
      setOrders(prev => [order, ...prev]);
    });

    // Order confirmed (for client UI)
    socket.on('orderConfirmed', (order) => {
      console.log('Order confirmed:', order);
    });

    // Order error
    socket.on('orderError', (error) => {
      console.error('Order error:', error);
    });

    // Replication event
    socket.on('replicationEvent', (event) => {
      console.log('Replication event:', event);
    });

    // Cleanup listeners
    return () => {
      socket.off('systemState');
      socket.off('serverStatusUpdate');
      socket.off('leaderElected');
      socket.off('logUpdate');
      socket.off('logCleared');
      socket.off('orderPlaced');
      socket.off('orderConfirmed');
      socket.off('orderError');
      socket.off('replicationEvent');
    };
  }, [socket]);

  // Actions
  const crashServer = (serverId) => {
    if (socket) {
      socket.emit('crashServer', serverId);
    }
  };

  const restartServer = (serverId) => {
    if (socket) {
      socket.emit('restartServer', serverId);
    }
  };

  const triggerElection = (initiatorId) => {
    if (socket) {
      socket.emit('triggerElection', initiatorId);
    }
  };

  const placeOrder = (orderData) => {
    if (socket) {
      socket.emit('placeOrder', orderData);
    }
  };

  const refreshSystemState = () => {
    if (socket) {
      socket.emit('getSystemState');
    }
  };

  const value = {
    servers,
    products,
    orders,
    logs,
    leader,
    loading,
    crashServer,
    restartServer,
    triggerElection,
    placeOrder,
    refreshSystemState
  };

  return (
    <ServerContext.Provider value={value}>
      {children}
    </ServerContext.Provider>
  );
};
