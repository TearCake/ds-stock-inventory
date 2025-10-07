/**
 * Order Routes
 * 
 * RESTful API endpoints for order management
 * Orders are primarily created through Socket.IO but can also use REST API
 */

import express from 'express';
const router = express.Router();

let servers = null;
let bullyAlgorithm = null;
let replicationManager = null;

export function initOrderRoutes(serverInstances, bully, replication) {
  servers = serverInstances;
  bullyAlgorithm = bully;
  replicationManager = replication;
}

/**
 * GET /api/orders
 * Retrieve all orders from the leader
 */
router.get('/', (req, res) => {
  const leader = bullyAlgorithm.getLeader();
  
  if (!leader) {
    return res.status(503).json({ 
      error: 'No leader available',
      message: 'System is currently unavailable' 
    });
  }

  res.json({
    orders: leader.orders,
    source: `Server ${leader.id} (Leader)`
  });
});

/**
 * GET /api/orders/:id
 * Get a specific order
 */
router.get('/:id', (req, res) => {
  const leader = bullyAlgorithm.getLeader();
  
  if (!leader) {
    return res.status(503).json({ error: 'No leader available' });
  }

  const order = leader.orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(order);
});

/**
 * POST /api/orders
 * Create a new order (alternative to Socket.IO)
 */
router.post('/', (req, res) => {
  const leader = bullyAlgorithm.getLeader();
  
  if (!leader) {
    return res.status(503).json({ error: 'No leader available' });
  }

  const order = {
    id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    productId: req.body.productId,
    productName: req.body.productName,
    quantity: req.body.quantity,
    totalPrice: req.body.totalPrice,
    handledBy: leader.id,
    timestamp: new Date().toISOString(),
    status: 'completed'
  };

  // Add to leader
  leader.orders.push(order);

  // Update product stock
  const product = leader.products.find(p => p.id === req.body.productId);
  if (product) {
    if (product.stock < req.body.quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    product.stock -= req.body.quantity;
  }

  // Replicate to all servers
  replicationManager.replicate('order', 'create', order, leader.id);

  res.status(201).json(order);
});

/**
 * GET /api/orders/stats
 * Get order statistics
 */
router.get('/stats', (req, res) => {
  const leader = bullyAlgorithm.getLeader();
  
  if (!leader) {
    return res.status(503).json({ error: 'No leader available' });
  }

  const stats = {
    totalOrders: leader.orders.length,
    totalRevenue: leader.orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
    ordersByServer: {}
  };

  // Count orders by server
  leader.orders.forEach(order => {
    const serverId = order.handledBy;
    stats.ordersByServer[serverId] = (stats.ordersByServer[serverId] || 0) + 1;
  });

  res.json(stats);
});

export default router;
