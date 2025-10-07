/**
 * Socket Manager
 * 
 * Manages WebSocket connections and events between backend and frontend.
 * Handles real-time communication for:
 * - Server status updates
 * - Leader election events
 * - Order placement
 * - Replication events
 * - System logs
 * - Data synchronization
 */

import { emitLog, initLogEmitter } from '../utils/logEmitter.js';

let io = null;
let servers = null;
let bullyAlgorithm = null;
let replicationManager = null;

// Track auto-restart timers for crashed servers
const autoRestartTimers = new Map();

/**
 * Initialize Socket.IO with server instance
 */
export function initializeSocket(socketIO, serverInstances, bully, replication) {
  io = socketIO;
  servers = serverInstances;
  bullyAlgorithm = bully;
  replicationManager = replication;

  // Initialize log emitter with Socket.IO
  initLogEmitter(io);

  io.on('connection', (socket) => {
    console.log('✓ Client connected:', socket.id);
    emitLog('INFO', `Client connected: ${socket.id}`);

    // Send initial state to new client
    sendSystemState(socket);

    // Handle server crash simulation
    socket.on('crashServer', (serverId) => {
      handleServerCrash(serverId);
    });

    // Handle server restart
    socket.on('restartServer', (serverId) => {
      handleServerRestart(serverId);
    });

    // Handle order placement from client
    socket.on('placeOrder', (orderData) => {
      handleOrderPlacement(orderData, socket);
    });

    // Handle request for system state
    socket.on('getSystemState', () => {
      sendSystemState(socket);
    });

    // Handle manual leader election trigger
    socket.on('triggerElection', (initiatorId) => {
      emitLog('INFO', `Manual election triggered by admin for Server ${initiatorId}`);
      bullyAlgorithm.startElection(initiatorId);
      broadcastSystemState();
    });

    socket.on('disconnect', () => {
      console.log('✗ Client disconnected:', socket.id);
      emitLog('INFO', `Client disconnected: ${socket.id}`);
    });
  });

  emitLog('SUCCESS', 'Socket.IO initialized and ready');
}

/**
 * Send current system state to a specific socket
 */
function sendSystemState(socket) {
  const state = {
    servers: servers.map(s => ({
      id: s.id,
      status: s.status,
      isLeader: s.isLeader,
      productCount: s.products.length,
      orderCount: s.orders.length
    })),
    products: getLeaderData('products'),
    orders: getLeaderData('orders'),
    leader: bullyAlgorithm.getLeader()?.id || null
  };

  socket.emit('systemState', state);
}

/**
 * Broadcast system state to all connected clients
 */
function broadcastSystemState() {
  if (!io) return;

  const state = {
    servers: servers.map(s => ({
      id: s.id,
      status: s.status,
      isLeader: s.isLeader,
      productCount: s.products.length,
      orderCount: s.orders.length
    })),
    products: getLeaderData('products'),
    orders: getLeaderData('orders'),
    leader: bullyAlgorithm.getLeader()?.id || null
  };

  io.emit('systemState', state);
}

/**
 * Handle server crash
 */
function handleServerCrash(serverId) {
  const server = servers.find(s => s.id === serverId);
  
  if (!server) {
    emitLog('ERROR', `Server ${serverId} not found`);
    return;
  }

  if (server.status === 'crashed') {
    emitLog('WARNING', `Server ${serverId} is already crashed`);
    return;
  }

  const wasLeader = server.isLeader;
  
  // Mark server as crashed
  server.status = 'crashed';
  server.isLeader = false;

  emitLog('WARNING', `💥 Server ${serverId} has CRASHED!`);

  // Broadcast server status update
  io.emit('serverStatusUpdate', {
    serverId,
    status: 'crashed',
    isLeader: false
  });

  // If crashed server was leader, trigger election
  if (wasLeader) {
    // Update current leader to null first
    bullyAlgorithm.currentLeader = null;
    
    emitLog('WARNING', `⚠️ LEADER Server ${serverId} has CRASHED! Initiating leader election...`);
    
    // Find highest active server to become new leader
    const activeServers = servers.filter(s => s.status === 'active');
    
    if (activeServers.length > 0) {
      // Get the highest ID active server
      const initiator = activeServers.reduce((max, s) => s.id > max.id ? s : max);
      
      // Start election after a short delay
      setTimeout(() => {
        bullyAlgorithm.startElection(initiator.id);
        
        // Broadcast results after election completes
        setTimeout(() => {
          const newLeader = bullyAlgorithm.getLeader();
          if (newLeader) {
            io.emit('leaderElected', {
              leaderId: newLeader.id,
              timestamp: new Date().toISOString()
            });
          }
          broadcastSystemState();
        }, 800);
      }, 300);
    } else {
      emitLog('ERROR', 'No active servers available for leader election');
      broadcastSystemState();
    }
  } else {
    broadcastSystemState();
  }

  // Schedule automatic restart after 30 seconds if not manually restarted
  scheduleAutoRestart(serverId);
}

/**
 * Schedule automatic restart for a crashed server
 */
function scheduleAutoRestart(serverId) {
  // Clear any existing timer for this server
  if (autoRestartTimers.has(serverId)) {
    clearTimeout(autoRestartTimers.get(serverId));
  }

  emitLog('INFO', `⏱️ Auto-restart scheduled for Server ${serverId} in 30 seconds...`);

  // Set timer for 30 seconds
  const timerId = setTimeout(() => {
    const server = servers.find(s => s.id === serverId);
    
    if (server && server.status === 'crashed') {
      emitLog('WARNING', `⚡ Auto-restart triggered for Server ${serverId} (30s timeout reached)`);
      handleServerRestart(serverId);
    }
    
    // Remove timer from map
    autoRestartTimers.delete(serverId);
  }, 30000); // 30 seconds

  autoRestartTimers.set(serverId, timerId);
}

/**
 * Handle server restart/recovery
 */
function handleServerRestart(serverId) {
  const server = servers.find(s => s.id === serverId);

  if (!server) {
    emitLog('ERROR', `Server ${serverId} not found`);
    return;
  }

  if (server.status !== 'crashed') {
    emitLog('WARNING', `Server ${serverId} is not crashed, cannot restart`);
    return;
  }

  // Cancel auto-restart timer if manual restart happens
  if (autoRestartTimers.has(serverId)) {
    clearTimeout(autoRestartTimers.get(serverId));
    autoRestartTimers.delete(serverId);
    emitLog('INFO', `⏹️ Auto-restart cancelled for Server ${serverId} (manual restart initiated)`);
  }

  // Reactivate server
  server.status = 'active';

  emitLog('SUCCESS', `♻️ Server ${serverId} has RESTARTED and is now ACTIVE`);

  // Sync with current leader
  const leader = bullyAlgorithm.getLeader();
  if (leader) {
    replicationManager.syncWithLeader(serverId, leader.id);
  }

  // Broadcast server status update
  io.emit('serverStatusUpdate', {
    serverId,
    status: 'active',
    isLeader: false
  });

  // Trigger Bully Algorithm election when any server restarts
  // The restarted server might have higher ID than current leader
  emitLog('INFO', `🗳️ Server ${serverId} restarted - initiating Bully Algorithm election...`);
  
  setTimeout(() => {
    // Use the restarted server as initiator (it knows it just came back)
    const newLeader = bullyAlgorithm.startElection(serverId);
    
    // Broadcast election results after short delay
    setTimeout(() => {
      const currentLeader = bullyAlgorithm.getLeader();
      if (currentLeader) {
        io.emit('leaderElected', {
          leaderId: currentLeader.id,
          timestamp: new Date().toISOString()
        });
        
        if (currentLeader.id === serverId) {
          emitLog('SUCCESS', `👑 Server ${serverId} became NEW LEADER after restart!`);
        } else {
          emitLog('INFO', `👑 Server ${currentLeader.id} remains leader (higher ID than restarted Server ${serverId})`);
        }
      }
      broadcastSystemState();
    }, 500);
  }, 300);

  broadcastSystemState();
}

/**
 * Handle order placement from client UI
 */
function handleOrderPlacement(orderData, socket) {
  const leader = bullyAlgorithm.getLeader();
  
  if (!leader) {
    emitLog('ERROR', 'No leader available to process order');
    socket.emit('orderError', { message: 'System unavailable - no leader' });
    return;
  }

  // Create order object
  const order = {
    id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    productId: orderData.productId,
    productName: orderData.productName,
    quantity: orderData.quantity,
    totalPrice: orderData.totalPrice,
    handledBy: leader.id,
    timestamp: new Date().toISOString(),
    status: 'completed'
  };

  // Add order to leader
  leader.orders.push(order);

  // Update product stock on leader
  const product = leader.products.find(p => p.id === orderData.productId);
  if (product) {
    product.stock -= orderData.quantity;
  }

  emitLog('SUCCESS', `📦 Order ${order.id} placed successfully (handled by Server ${leader.id})`);

  // Replicate to all other servers
  replicationManager.replicate('order', 'create', order, leader.id);

  // Broadcast order confirmation
  io.emit('orderPlaced', order);
  
  // Broadcast updated state
  broadcastSystemState();

  // Send confirmation to client
  socket.emit('orderConfirmed', order);
}

/**
 * Get data from leader server
 */
function getLeaderData(dataType) {
  const leader = bullyAlgorithm.getLeader();
  if (!leader) {
    return [];
  }
  return leader[dataType] || [];
}

/**
 * Broadcast replication event
 */
export function broadcastReplication(dataType, operation, data, sourceServerId) {
  if (!io) return;

  io.emit('replicationEvent', {
    dataType,
    operation,
    data,
    sourceServerId,
    timestamp: new Date().toISOString()
  });
}

/**
 * Export for use in routes
 */
export function getIO() {
  return io;
}

export function broadcastDataSync() {
  broadcastSystemState();
}
