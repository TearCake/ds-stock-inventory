/**
 * Main Application Entry Point
 * 
 * Stock Inventory Management - Distributed System Simulation
 * 
 * This application simulates a distributed system with:
 * - 6 backend servers (in-memory simulation)
 * - Leader election using Bully Algorithm
 * - Data replication across all servers
 * - Fault tolerance and crash recovery
 * - Real-time event propagation via WebSockets
 * 
 * Educational purpose: Demonstrate distributed systems concepts
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import BullyAlgorithm from './utils/bullyAlgorithm.js';
import ReplicationManager from './utils/replicationManager.js';
import LoadBalancer from './utils/loadBalancer.js';
import { emitLog } from './utils/logEmitter.js';
import { initializeSocket } from './socket/socketManager.js';
import productRoutes, { initProductRoutes } from './routes/products.js';
import orderRoutes, { initOrderRoutes } from './routes/orders.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// INITIAL SAMPLE DATA
// ============================================

const initialProducts = [
  { id: 'PRD-1', name: 'Laptop Pro 15"', price: 1299.99, stock: 50, category: 'Electronics' },
  { id: 'PRD-2', name: 'Wireless Mouse', price: 29.99, stock: 200, category: 'Accessories' },
  { id: 'PRD-3', name: 'Mechanical Keyboard', price: 89.99, stock: 75, category: 'Accessories' },
  { id: 'PRD-4', name: '27" Monitor 4K', price: 449.99, stock: 30, category: 'Electronics' },
  { id: 'PRD-5', name: 'USB-C Hub', price: 49.99, stock: 150, category: 'Accessories' },
  { id: 'PRD-6', name: 'Webcam HD', price: 79.99, stock: 100, category: 'Electronics' },
  { id: 'PRD-7', name: 'Headphones Noise-Canceling', price: 199.99, stock: 60, category: 'Audio' },
  { id: 'PRD-8', name: 'External SSD 1TB', price: 129.99, stock: 80, category: 'Storage' }
];

// ============================================
// SERVER INSTANCES (Distributed System Simulation)
// ============================================

/**
 * Each server instance represents a node in the distributed system
 * Each maintains its own copy of products and orders
 */
const servers = [
  {
    id: 1,
    name: 'Server-1',
    status: 'active',
    isLeader: false,
    products: JSON.parse(JSON.stringify(initialProducts)),
    orders: []
  },
  {
    id: 2,
    name: 'Server-2',
    status: 'active',
    isLeader: false,
    products: JSON.parse(JSON.stringify(initialProducts)),
    orders: []
  },
  {
    id: 3,
    name: 'Server-3',
    status: 'active',
    isLeader: false,
    products: JSON.parse(JSON.stringify(initialProducts)),
    orders: []
  },
  {
    id: 4,
    name: 'Server-4',
    status: 'active',
    isLeader: false,
    products: JSON.parse(JSON.stringify(initialProducts)),
    orders: []
  },
  {
    id: 5,
    name: 'Server-5',
    status: 'active',
    isLeader: false,
    products: JSON.parse(JSON.stringify(initialProducts)),
    orders: []
  },
  {
    id: 6,
    name: 'Server-6',
    status: 'active',
    isLeader: false,
    products: JSON.parse(JSON.stringify(initialProducts)),
    orders: []
  }
];

// ============================================
// INITIALIZE DISTRIBUTED SYSTEM COMPONENTS
// ============================================

// Initialize Bully Algorithm for leader election
const bullyAlgorithm = new BullyAlgorithm(servers);

// Initialize Replication Manager
const replicationManager = new ReplicationManager(servers);

// Initialize Load Balancer
const loadBalancer = new LoadBalancer(servers);

// Elect initial leader (highest ID that is active)
console.log('\n🚀 Initializing Distributed System...\n');
bullyAlgorithm.initializeLeader();

// Initialize routes with server instances
initProductRoutes(servers, bullyAlgorithm, replicationManager);
initOrderRoutes(servers, bullyAlgorithm, replicationManager);

// Initialize Socket.IO
initializeSocket(io, servers, bullyAlgorithm, replicationManager, loadBalancer);

// ============================================
// REST API ROUTES
// ============================================

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Get all servers status
app.get('/api/servers', (req, res) => {
  const serverStatus = servers.map(s => ({
    id: s.id,
    name: s.name,
    status: s.status,
    isLeader: s.isLeader,
    productCount: s.products.length,
    orderCount: s.orders.length
  }));

  res.json({
    servers: serverStatus,
    leader: bullyAlgorithm.getLeader()?.id || null,
    loadBalancer: loadBalancer.getStats()
  });
});

// Load Balancer API Routes
app.get('/api/loadbalancer/stats', (req, res) => {
  res.json(loadBalancer.getStats());
});

app.post('/api/loadbalancer/algorithm', (req, res) => {
  const { algorithm } = req.body;
  const success = loadBalancer.setAlgorithm(algorithm);
  res.json({ success, currentAlgorithm: loadBalancer.algorithm });
});

app.post('/api/loadbalancer/weight', (req, res) => {
  const { serverId, weight } = req.body;
  loadBalancer.setServerWeight(serverId, weight);
  res.json({ success: true, serverId, weight });
});

app.post('/api/loadbalancer/demo-load', (req, res) => {
  const { ordersPerSecond = 10, durationSeconds = 30 } = req.body;
  const result = loadBalancer.generateDemoLoad(ordersPerSecond, durationSeconds);
  res.json({ success: true, ...result });
});

// Get specific server details
app.get('/api/servers/:id', (req, res) => {
  const serverId = parseInt(req.params.id);
  const server = servers.find(s => s.id === serverId);

  if (!server) {
    return res.status(404).json({ error: 'Server not found' });
  }

  res.json({
    id: server.id,
    name: server.name,
    status: server.status,
    isLeader: server.isLeader,
    products: server.products,
    orders: server.orders
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const activeServers = servers.filter(s => s.status === 'active').length;
  const leader = bullyAlgorithm.getLeader();

  res.json({
    status: 'running',
    activeServers,
    totalServers: servers.length,
    leader: leader?.id || null,
    timestamp: new Date().toISOString()
  });
});

// System statistics
app.get('/api/stats', (req, res) => {
  const leader = bullyAlgorithm.getLeader();
  
  if (!leader) {
    return res.status(503).json({ error: 'No leader available' });
  }

  const stats = {
    totalProducts: leader.products.length,
    totalOrders: leader.orders.length,
    totalRevenue: leader.orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
    activeServers: servers.filter(s => s.status === 'active').length,
    crashedServers: servers.filter(s => s.status === 'crashed').length,
    currentLeader: leader.id
  };

  res.json(stats);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Stock Inventory Management - Distributed System Simulation',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      orders: '/api/orders',
      servers: '/api/servers',
      health: '/api/health',
      stats: '/api/stats'
    },
    websocket: 'Connect to Socket.IO for real-time updates'
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 DISTRIBUTED SYSTEM SIMULATION - STOCK INVENTORY');
  console.log('='.repeat(60));
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ WebSocket server initialized`);
  console.log(`✓ ${servers.length} server instances created`);
  console.log(`✓ Current Leader: Server ${bullyAlgorithm.getLeader()?.id}`);
  console.log('='.repeat(60));
  console.log('\n📊 System Status:');
  servers.forEach(s => {
    const icon = s.isLeader ? '👑' : '⚡';
    console.log(`  ${icon} ${s.name}: ${s.status.toUpperCase()}`);
  });
  console.log('\n✨ Ready to accept connections!\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  emitLog('WARNING', 'System shutting down');
  httpServer.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});
