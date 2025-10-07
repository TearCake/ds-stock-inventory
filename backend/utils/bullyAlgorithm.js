/**
 * Bully Algorithm Implementation
 * 
 * The Bully Algorithm is a distributed leader election algorithm.
 * When a server detects the leader has crashed, it initiates an election.
 * The server with the highest ID becomes the new leader.
 * 
 * Process:
 * 1. Server detects leader crash
 * 2. Sends ELECTION message to all servers with higher IDs
 * 3. If no response, declares itself leader
 * 4. If response received, waits for COORDINATOR message
 * 5. Server with highest ID sends COORDINATOR to all lower ID servers
 */

import { emitLog } from './logEmitter.js';

class BullyAlgorithm {
  constructor(servers) {
    this.servers = servers; // Array of server objects
    this.currentLeader = null;
    this.electionInProgress = false;
  }

  /**
   * Initialize leader - elect server with highest ID that is active
   */
  initializeLeader() {
    const activeServers = this.servers.filter(s => s.status === 'active');
    
    if (activeServers.length === 0) {
      emitLog('ERROR', 'No active servers available for leader election');
      return null;
    }

    // Find server with highest ID
    const leader = activeServers.reduce((max, server) => 
      server.id > max.id ? server : max
    );

    this.currentLeader = leader.id;
    leader.isLeader = true;

    emitLog('SUCCESS', `Server ${leader.id} initialized as leader`);
    return leader;
  }

  /**
   * Start election process when leader crashes
   * @param {number} initiatorId - ID of server initiating election
   */
  startElection(initiatorId) {
    if (this.electionInProgress) {
      emitLog('WARNING', `Election already in progress, ignoring request from Server ${initiatorId}`);
      return null;
    }

    this.electionInProgress = true;
    emitLog('INFO', `Server ${initiatorId} initiating Bully Algorithm election`);

    const initiator = this.servers.find(s => s.id === initiatorId);
    
    if (!initiator || initiator.status !== 'active') {
      emitLog('ERROR', `Initiator Server ${initiatorId} is not active`);
      this.electionInProgress = false;
      return null;
    }
    
    // Find all active servers with higher IDs
    const higherIdServers = this.servers.filter(
      s => s.id > initiatorId && s.status === 'active'
    );

    if (higherIdServers.length === 0) {
      // No higher ID servers, this server becomes leader
      emitLog('INFO', `No higher ID servers found. Server ${initiatorId} will become leader`);
      return this.electLeader(initiatorId);
    } else {
      // Send election messages to higher ID servers
      emitLog('INFO', `Server ${initiatorId} sending ELECTION to servers: ${higherIdServers.map(s => s.id).join(', ')}`);
      
      // In Bully Algorithm, the highest ID server always wins
      // Simulate election process and elect highest ID
      const highestServer = higherIdServers.reduce((max, s) => 
        s.id > max.id ? s : max
      );
      
      emitLog('INFO', `Server ${highestServer.id} has highest ID among active servers`);
      return this.electLeader(highestServer.id);
    }
  }

  /**
   * Elect a server as leader
   * @param {number} serverId - ID of server to become leader
   */
  electLeader(serverId) {
    // Remove leader status from all servers
    this.servers.forEach(s => s.isLeader = false);

    // Find and elect new leader
    const newLeader = this.servers.find(s => s.id === serverId);
    
    if (!newLeader || newLeader.status !== 'active') {
      emitLog('ERROR', `Cannot elect Server ${serverId} - server not available`);
      this.electionInProgress = false;
      return;
    }

    newLeader.isLeader = true;
    this.currentLeader = serverId;
    this.electionInProgress = false;

    emitLog('SUCCESS', `🎖️ Server ${serverId} elected as new LEADER (Bully Algorithm)`);
    emitLog('INFO', `Server ${serverId} sending COORDINATOR message to all lower ID servers`);

    return newLeader;
  }

  /**
   * Get current leader
   */
  getLeader() {
    return this.servers.find(s => s.id === this.currentLeader);
  }

  /**
   * Handle server crash - trigger election if leader crashed
   * @param {number} serverId - ID of crashed server
   * @returns {object|null} - New leader or null
   */
  handleServerCrash(serverId) {
    const server = this.servers.find(s => s.id === serverId);
    
    if (!server) {
      emitLog('ERROR', `Server ${serverId} not found`);
      return null;
    }
    
    // Remove leader status if this server was leader
    if (server.isLeader) {
      server.isLeader = false;
      this.currentLeader = null;
    }
    
    // Find active servers for new election
    const activeServers = this.servers.filter(s => s.status === 'active');
    
    if (activeServers.length === 0) {
      emitLog('ERROR', 'No active servers available to elect as leader');
      return null;
    }
    
    // If crashed server was leader, elect new one
    if (server.id === serverId && activeServers.length > 0) {
      // Get highest ID active server to initiate election
      const initiator = activeServers.reduce((max, s) => s.id > max.id ? s : max);
      emitLog('INFO', `Initiating election with Server ${initiator.id}`);
      return this.startElection(initiator.id);
    }
    
    return null;
  }
}

export default BullyAlgorithm;
