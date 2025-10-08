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

import { emitLog, initLogEmitter, clearLogs } from '../utils/logEmitter.js';

let io = null;
let servers = null;
let bullyAlgorithm = null;
let replicationManager = null;
let loadBalancer = null;

// Track auto-restart timers for crashed servers
const autoRestartTimers = new Map();

/**
 * Initialize Socket.IO with server instance
 */
export function initializeSocket(socketIO, serverInstances, bully, replication, loadBal) {
  io = socketIO;
  servers = serverInstances;
  bullyAlgorithm = bully;
  replicationManager = replication;
  loadBalancer = loadBal;

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

    // Handle load balancer algorithm change
    socket.on('changeLoadBalancerAlgorithm', (algorithm) => {
      loadBalancer.setAlgorithm(algorithm);
      broadcastSystemState();
    });

    // Handle demo load generation
    socket.on('startDemoLoad', (config) => {
      console.log('📥 Received startDemoLoad event:', config);
      const { ordersPerSecond = 10, durationSeconds = 30 } = config;
      emitLog('INFO', `🎯 Demo Load Started: ${ordersPerSecond} orders/sec for ${durationSeconds}s`);
      loadBalancer.generateDemoLoad(ordersPerSecond, durationSeconds, { processDemoOrder });
    });

    // Handle clear logs request
    socket.on('clearLogs', () => {
      console.log('📥 Received clearLogs request');
      clearLogs();
      emitLog('INFO', '🧹 System logs cleared');
      io.emit('logCleared');
    });

    socket.on('disconnect', () => {
      console.log('✗ Client disconnected:', socket.id);
      emitLog('INFO', `Client disconnected: ${socket.id}`);
    });
  });

  emitLog('SUCCESS', 'Socket.IO initialized and ready');
  
  // Start health check interval for load balancer metrics
  setInterval(() => {
    if (loadBalancer) {
      loadBalancer.performHealthCheck();
      broadcastSystemState();
    }
  }, 5000); // Update every 5 seconds
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

  // Get load balancer stats
  const loadBalancerStats = loadBalancer.getStats();

  // Collect all orders from all servers (including distributed orders)
  const allOrders = [];
  servers.forEach(server => {
    if (server.orders) {
      server.orders.forEach(order => {
        // Avoid duplicates by checking if order already exists
        if (!allOrders.find(o => o.id === order.id)) {
          allOrders.push(order);
        }
      });
    }
  });

  // Sort orders by timestamp (newest first)
  allOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const state = {
    servers: servers.map(s => {
      const serverStats = loadBalancerStats.servers.find(ls => ls.id === s.id);
      return {
        id: s.id,
        status: s.status,
        isLeader: s.isLeader,
        productCount: s.products.length,
        orderCount: s.orders.length,
        loadBalancer: serverStats || null
      };
    }),
    products: getLeaderData('products'),
    orders: allOrders, // Send all orders from all servers
    leader: bullyAlgorithm.getLeader()?.id || null,
    loadBalancer: loadBalancerStats
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
async function handleOrderPlacement(orderData, socket) {
  try {
    // Use load balancer to process the order
    const result = await loadBalancer.processOrder(orderData);
    
    if (!result.success) {
      emitLog('ERROR', `Order processing failed: ${result.error}`);
      socket.emit('orderError', { message: result.error });
      return;
    }

    const order = result.order;

    emitLog('SUCCESS', `📦 Order ${order.id} placed via Load Balancer (Server ${result.server})`);

    // Replicate to all other servers using replication manager
    replicationManager.replicate('order', 'create', order, result.server);

    // Broadcast order confirmation
    io.emit('orderPlaced', order);
    
    // Broadcast updated state with load balancer stats
    broadcastSystemState();

    // Send confirmation to client
    socket.emit('orderConfirmed', order);
    
  } catch (error) {
    emitLog('ERROR', `Order placement error: ${error.message}`);
    socket.emit('orderError', { message: 'Internal server error' });
  }
}

/**
 * Process demo orders through full system pipeline
 */
async function processDemoOrder(orderData) {
  try {
    // Use load balancer to process the order
    const result = await loadBalancer.processOrder(orderData);
    
    if (!result.success) {
      emitLog('ERROR', `Demo order processing failed: ${result.error}`);
      return;
    }

    const order = result.order;

    emitLog('SUCCESS', `🎯 Demo Order ${order.id} (${order.productName} x${order.quantity}) → Server ${result.server}`);

    // Replicate to all other servers using replication manager
    replicationManager.replicate('order', 'create', order, result.server);

    // Broadcast order confirmation to all clients
    io.emit('orderPlaced', order);
    
    // Broadcast updated state with load balancer stats
    broadcastSystemState();
    
  } catch (error) {
    emitLog('ERROR', `Demo order error: ${error.message}`);
  }
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
