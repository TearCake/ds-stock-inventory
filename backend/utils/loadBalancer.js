/**
 * Load Balancer
 * 
 * Distributes incoming orders across multiple active servers using different algorithms:
 * - Round Robin: Cycles through servers sequentially
 * - Least Connections: Routes to server with fewest active connections
 * - Weighted: Routes based on server capacity/weight
 * - Least Response Time: Routes to fastest responding server
 * 
 * Features:
 * - Health checking and automatic failover
 * - Real-time performance metrics
 * - Dynamic server weights
 * - Connection pooling simulation
 */

import { emitLog } from './logEmitter.js';

class LoadBalancer {
  constructor(servers) {
    this.servers = servers;
    this.algorithm = 'round-robin'; // 'round-robin', 'least-connections', 'weighted', 'least-response-time'
    this.currentIndex = 0;
    this.serverMetrics = new Map();
    this.requestQueue = [];
    
    // Initialize server metrics
    this.servers.forEach(server => {
      this.serverMetrics.set(server.id, {
        activeConnections: 0,
        totalRequests: 0,
        avgResponseTime: 100, // milliseconds
        weight: 1,
        healthScore: 100,
        cpuUsage: 0,
        memoryUsage: 0,
        queueDepth: 0,
        lastHealthCheck: Date.now()
      });
    });

    emitLog('INFO', '⚖️ Load Balancer initialized with Round Robin algorithm');
  }

  /**
   * Select the best server based on current algorithm
   */
  selectServer() {
    const activeServers = this.servers.filter(s => s.status === 'active');
    
    if (activeServers.length === 0) {
      emitLog('ERROR', '⚖️ No active servers available for load balancing');
      return null;
    }

    let selectedServer;
    
    switch (this.algorithm) {
      case 'round-robin':
        selectedServer = this.roundRobinSelection(activeServers);
        break;
      case 'least-connections':
        selectedServer = this.leastConnectionsSelection(activeServers);
        break;
      case 'weighted':
        selectedServer = this.weightedSelection(activeServers);
        break;
      case 'least-response-time':
        selectedServer = this.leastResponseTimeSelection(activeServers);
        break;
      default:
        selectedServer = this.roundRobinSelection(activeServers);
    }

    if (selectedServer) {
      this.updateMetrics(selectedServer.id, 'request');
      emitLog('INFO', `⚖️ Load Balancer: Selected Server ${selectedServer.id} (${this.algorithm})`);
    }

    return selectedServer;
  }

  /**
   * Round Robin algorithm
   */
  roundRobinSelection(activeServers) {
    if (activeServers.length === 0) return null;
    
    const server = activeServers[this.currentIndex % activeServers.length];
    this.currentIndex = (this.currentIndex + 1) % activeServers.length;
    
    return server;
  }

  /**
   * Least Connections algorithm
   */
  leastConnectionsSelection(activeServers) {
    return activeServers.reduce((minServer, server) => {
      const currentMetrics = this.serverMetrics.get(server.id);
      const minMetrics = this.serverMetrics.get(minServer.id);
      
      return currentMetrics.activeConnections < minMetrics.activeConnections 
        ? server : minServer;
    });
  }

  /**
   * Weighted algorithm
   */
  weightedSelection(activeServers) {
    // Calculate total weight
    const totalWeight = activeServers.reduce((sum, server) => {
      return sum + this.serverMetrics.get(server.id).weight;
    }, 0);

    // Random selection based on weights
    let random = Math.random() * totalWeight;
    
    for (const server of activeServers) {
      const weight = this.serverMetrics.get(server.id).weight;
      random -= weight;
      if (random <= 0) {
        return server;
      }
    }
    
    return activeServers[0]; // fallback
  }

  /**
   * Least Response Time algorithm
   */
  leastResponseTimeSelection(activeServers) {
    return activeServers.reduce((fastestServer, server) => {
      const currentMetrics = this.serverMetrics.get(server.id);
      const fastestMetrics = this.serverMetrics.get(fastestServer.id);
      
      // Consider both response time and active connections
      const currentScore = currentMetrics.avgResponseTime * (1 + currentMetrics.activeConnections * 0.1);
      const fastestScore = fastestMetrics.avgResponseTime * (1 + fastestMetrics.activeConnections * 0.1);
      
      return currentScore < fastestScore ? server : fastestServer;
    });
  }

  /**
   * Update server metrics
   */
  updateMetrics(serverId, action, responseTime = null) {
    const metrics = this.serverMetrics.get(serverId);
    if (!metrics) return;

    switch (action) {
      case 'request':
        metrics.totalRequests++;
        metrics.activeConnections++;
        metrics.queueDepth++;
        break;
      
      case 'response':
        metrics.activeConnections = Math.max(0, metrics.activeConnections - 1);
        metrics.queueDepth = Math.max(0, metrics.queueDepth - 1);
        
        if (responseTime !== null) {
          // Exponential moving average for response time
          metrics.avgResponseTime = (metrics.avgResponseTime * 0.8) + (responseTime * 0.2);
        }
        break;
      
      case 'health-check':
        metrics.lastHealthCheck = Date.now();
        // Simulate CPU and memory usage based on active connections
        metrics.cpuUsage = Math.min(100, metrics.activeConnections * 10 + Math.random() * 20);
        metrics.memoryUsage = Math.min(100, metrics.activeConnections * 5 + Math.random() * 30);
        metrics.healthScore = Math.max(0, 100 - (metrics.cpuUsage + metrics.memoryUsage) / 2);
        break;
    }

    this.serverMetrics.set(serverId, metrics);
  }

  /**
   * Process order through load balancer
   */
  async processOrder(orderData) {
    const startTime = Date.now();
    const selectedServer = this.selectServer();
    
    if (!selectedServer) {
      emitLog('ERROR', '⚖️ Load Balancer: No available servers to process order');
      return { success: false, error: 'No available servers' };
    }

    try {
      emitLog('INFO', `⚖️ Processing order ${orderData.id || 'new'} on Server ${selectedServer.id}`);
      
      // Simulate order processing (this will be integrated with Ricart-Agrawala)
      const order = {
        id: orderData.id || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...orderData,
        handledBy: selectedServer.id,
        timestamp: new Date().toISOString(),
        loadBalancerAlgorithm: this.algorithm,
        processingTime: Date.now() - startTime
      };

      // Add to server's queue (simulate processing delay)
      selectedServer.orders = selectedServer.orders || [];
      selectedServer.orders.push(order);

      // Update product stock
      if (orderData.productId) {
        const product = selectedServer.products.find(p => p.id === orderData.productId);
        if (product && product.stock >= orderData.quantity) {
          product.stock -= orderData.quantity;
        }
      }

      // Simulate processing time based on server load
      const metrics = this.serverMetrics.get(selectedServer.id);
      const processingTime = 50 + (metrics.activeConnections * 10) + Math.random() * 100;
      
      setTimeout(() => {
        this.updateMetrics(selectedServer.id, 'response', processingTime);
        emitLog('SUCCESS', `⚖️ Order ${order.id} completed on Server ${selectedServer.id} (${Math.round(processingTime)}ms)`);
      }, processingTime);

      return { success: true, order, server: selectedServer.id, processingTime };
      
    } catch (error) {
      this.updateMetrics(selectedServer.id, 'response');
      emitLog('ERROR', `⚖️ Order processing failed on Server ${selectedServer.id}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Set load balancing algorithm
   */
  setAlgorithm(algorithm) {
    const validAlgorithms = ['round-robin', 'least-connections', 'weighted', 'least-response-time'];
    
    if (validAlgorithms.includes(algorithm)) {
      this.algorithm = algorithm;
      emitLog('INFO', `⚖️ Load Balancer algorithm changed to: ${algorithm}`);
      return true;
    }
    
    emitLog('WARNING', `⚖️ Invalid load balancing algorithm: ${algorithm}`);
    return false;
  }

  /**
   * Set server weight
   */
  setServerWeight(serverId, weight) {
    const metrics = this.serverMetrics.get(serverId);
    if (metrics) {
      metrics.weight = Math.max(0.1, Math.min(10, weight));
      emitLog('INFO', `⚖️ Server ${serverId} weight set to ${metrics.weight}`);
    }
  }

  /**
   * Get load balancer statistics
   */
  getStats() {
    const activeServers = this.servers.filter(s => s.status === 'active');
    const stats = {
      algorithm: this.algorithm,
      activeServers: activeServers.length,
      totalRequests: 0,
      servers: []
    };

    this.servers.forEach(server => {
      const metrics = this.serverMetrics.get(server.id);
      stats.totalRequests += metrics.totalRequests;
      
      stats.servers.push({
        id: server.id,
        status: server.status,
        ...metrics,
        loadPercentage: Math.min(100, (metrics.activeConnections / 10) * 100)
      });
    });

    return stats;
  }

  /**
   * Health check for all servers
   */
  performHealthCheck() {
    this.servers.forEach(server => {
      if (server.status === 'active') {
        this.updateMetrics(server.id, 'health-check');
      }
    });
  }

  /**
   * Generate demo load (for load testing)
   */
  async generateDemoLoad(ordersPerSecond = 10, durationSeconds = 30, socketManager = null) {
    console.log('🎯 generateDemoLoad called with:', { ordersPerSecond, durationSeconds, hasSocketManager: !!socketManager });
    emitLog('INFO', `⚖️ Starting demo load: ${ordersPerSecond} orders/sec for ${durationSeconds}s`);
    
    const interval = 1000 / ordersPerSecond;
    let orderCount = 0;
    const totalOrders = ordersPerSecond * durationSeconds;

    const loadInterval = setInterval(async () => {
      if (orderCount >= totalOrders) {
        clearInterval(loadInterval);
        emitLog('SUCCESS', `⚖️ Demo load completed: ${totalOrders} orders processed`);
        console.log('✅ Demo load completed');
        return;
      }

      // Generate realistic dummy order data
      const productOptions = ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones'];
      const product = productOptions[Math.floor(Math.random() * productOptions.length)];
      
      const demoOrder = {
        productId: `PROD-${Math.floor(Math.random() * 5) + 1}`,
        productName: product,
        quantity: Math.floor(Math.random() * 3) + 1,
        totalPrice: (Math.random() * 100 + 10).toFixed(2),
        isDemoOrder: true,
        customerName: `Demo Customer ${orderCount + 1}`,
        customerEmail: `demo${orderCount + 1}@example.com`
      };

      console.log(`📦 Generated demo order ${orderCount + 1}/${totalOrders}:`, demoOrder);

      // Process through the same pipeline as normal orders
      if (socketManager && typeof socketManager.processDemoOrder === 'function') {
        console.log('✅ Using socketManager.processDemoOrder');
        await socketManager.processDemoOrder(demoOrder);
      } else {
        // Fallback to direct processing
        console.log('⚠️ Using fallback processing for demo order');
        this.processOrder(demoOrder);
      }
      
      orderCount++;
    }, interval);

    return { totalOrders, interval };
  }
}

export default LoadBalancer;