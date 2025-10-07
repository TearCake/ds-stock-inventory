/**
 * Product Routes
 * 
 * RESTful API endpoints for product management
 * All write operations go through the leader and are replicated
 */

import express from 'express';
const router = express.Router();

let servers = null;
let bullyAlgorithm = null;
let replicationManager = null;

export function initProductRoutes(serverInstances, bully, replication) {
  servers = serverInstances;
  bullyAlgorithm = bully;
  replicationManager = replication;
}

/**
 * GET /api/products
 * Retrieve all products from the leader
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
    products: leader.products,
    source: `Server ${leader.id} (Leader)`
  });
});

/**
 * GET /api/products/:id
 * Get a specific product
 */
router.get('/:id', (req, res) => {
  const leader = bullyAlgorithm.getLeader();
  
  if (!leader) {
    return res.status(503).json({ error: 'No leader available' });
  }

  const product = leader.products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

/**
 * POST /api/products
 * Create a new product (leader only)
 */
router.post('/', (req, res) => {
  const leader = bullyAlgorithm.getLeader();
  
  if (!leader) {
    return res.status(503).json({ error: 'No leader available' });
  }

  const product = {
    id: `PRD-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };

  leader.products.push(product);

  // Replicate to all servers
  replicationManager.replicate('product', 'create', product, leader.id);

  res.status(201).json(product);
});

/**
 * PUT /api/products/:id
 * Update a product
 */
router.put('/:id', (req, res) => {
  const leader = bullyAlgorithm.getLeader();
  
  if (!leader) {
    return res.status(503).json({ error: 'No leader available' });
  }

  const index = leader.products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updatedProduct = {
    ...leader.products[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  leader.products[index] = updatedProduct;

  // Replicate to all servers
  replicationManager.replicate('product', 'update', updatedProduct, leader.id);

  res.json(updatedProduct);
});

/**
 * DELETE /api/products/:id
 * Delete a product
 */
router.delete('/:id', (req, res) => {
  const leader = bullyAlgorithm.getLeader();
  
  if (!leader) {
    return res.status(503).json({ error: 'No leader available' });
  }

  const product = leader.products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  leader.products = leader.products.filter(p => p.id !== req.params.id);

  // Replicate to all servers
  replicationManager.replicate('product', 'delete', product, leader.id);

  res.json({ message: 'Product deleted', product });
});

export default router;
