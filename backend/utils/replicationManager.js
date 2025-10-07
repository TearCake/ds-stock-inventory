/**
 * Replication Manager
 * 
 * Handles data replication across all active servers in the distributed system.
 * When a write operation (create/update/delete) occurs on the leader,
 * it must be replicated to all follower servers for consistency.
 * 
 * Features:
 * - Synchronous replication to all active servers
 * - Handles products and orders replication
 * - Tracks replication status and failures
 */

import { emitLog } from './logEmitter.js';

class ReplicationManager {
  constructor(servers) {
    this.servers = servers;
  }

  /**
   * Replicate data to all active servers
   * @param {string} dataType - 'product' or 'order'
   * @param {string} operation - 'create', 'update', or 'delete'
   * @param {object} data - The data to replicate
   * @param {number} sourceServerId - ID of server initiating replication
   */
  replicate(dataType, operation, data, sourceServerId) {
    const activeServers = this.servers.filter(
      s => s.status === 'active' && s.id !== sourceServerId
    );

    emitLog('INFO', `🔄 Replicating ${dataType} ${operation} from Server ${sourceServerId} to ${activeServers.length} servers`);

    let successCount = 0;
    let failCount = 0;

    activeServers.forEach(server => {
      try {
        switch (dataType) {
          case 'product':
            this.replicateProduct(server, operation, data);
            break;
          case 'order':
            this.replicateOrder(server, operation, data);
            break;
          default:
            throw new Error(`Unknown data type: ${dataType}`);
        }
        successCount++;
        emitLog('SUCCESS', `  ✓ Replicated to Server ${server.id}`);
      } catch (error) {
        failCount++;
        emitLog('ERROR', `  ✗ Replication failed to Server ${server.id}: ${error.message}`);
      }
    });

    emitLog('INFO', `Replication complete: ${successCount} success, ${failCount} failed`);

    return {
      success: successCount,
      failed: failCount,
      total: activeServers.length
    };
  }

  /**
   * Replicate product operation
   */
  replicateProduct(server, operation, product) {
    switch (operation) {
      case 'create':
      case 'update':
        const existingIndex = server.products.findIndex(p => p.id === product.id);
        if (existingIndex !== -1) {
          server.products[existingIndex] = { ...product };
        } else {
          server.products.push({ ...product });
        }
        break;
      
      case 'delete':
        server.products = server.products.filter(p => p.id !== product.id);
        break;
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  /**
   * Replicate order operation
   */
  replicateOrder(server, operation, order) {
    switch (operation) {
      case 'create':
        server.orders.push({ ...order });
        break;
      
      case 'update':
        const existingIndex = server.orders.findIndex(o => o.id === order.id);
        if (existingIndex !== -1) {
          server.orders[existingIndex] = { ...order };
        } else {
          server.orders.push({ ...order });
        }
        break;
      
      case 'delete':
        server.orders = server.orders.filter(o => o.id !== order.id);
        break;
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    // Also update product stock if order affects inventory
    if (operation === 'create' && order.productId) {
      const product = server.products.find(p => p.id === order.productId);
      if (product) {
        product.stock -= order.quantity;
      }
    }
  }

  /**
   * Sync server data with leader (used when server recovers from crash)
   */
  syncWithLeader(serverId, leaderId) {
    const server = this.servers.find(s => s.id === serverId);
    const leader = this.servers.find(s => s.id === leaderId);

    if (!server || !leader) {
      emitLog('ERROR', `Cannot sync: Server ${serverId} or Leader ${leaderId} not found`);
      return false;
    }

    emitLog('INFO', `🔄 Syncing Server ${serverId} with Leader ${leaderId}`);

    // Deep copy products and orders from leader
    server.products = JSON.parse(JSON.stringify(leader.products));
    server.orders = JSON.parse(JSON.stringify(leader.orders));

    emitLog('SUCCESS', `✓ Server ${serverId} synchronized with Leader ${leaderId}`);
    emitLog('INFO', `  Products: ${server.products.length}, Orders: ${server.orders.length}`);

    return true;
  }

  /**
   * Check consistency across all servers (for debugging/monitoring)
   */
  checkConsistency() {
    const activeServers = this.servers.filter(s => s.status === 'active');
    
    if (activeServers.length < 2) {
      return { consistent: true, message: 'Only one active server' };
    }

    const leader = activeServers.find(s => s.isLeader);
    if (!leader) {
      return { consistent: false, message: 'No leader found' };
    }

    const inconsistencies = [];

    activeServers.forEach(server => {
      if (server.id === leader.id) return;

      if (server.products.length !== leader.products.length) {
        inconsistencies.push(`Server ${server.id}: Product count mismatch`);
      }

      if (server.orders.length !== leader.orders.length) {
        inconsistencies.push(`Server ${server.id}: Order count mismatch`);
      }
    });

    if (inconsistencies.length > 0) {
      emitLog('WARNING', `⚠️ Consistency issues detected: ${inconsistencies.join(', ')}`);
      return { consistent: false, issues: inconsistencies };
    }

    return { consistent: true, message: 'All servers consistent' };
  }
}

export default ReplicationManager;
