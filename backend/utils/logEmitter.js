/**
 * Log Emitter
 * 
 * Centralized logging system for the distributed system.
 * All system events are logged and broadcasted to connected clients via Socket.IO
 * 
 * Log Levels:
 * - INFO: General information
 * - SUCCESS: Successful operations
 * - WARNING: Warning conditions
 * - ERROR: Error conditions
 */

let io = null; // Socket.IO instance
const logs = []; // Store logs in memory
const MAX_LOGS = 500; // Maximum logs to keep in memory

/**
 * Initialize log emitter with Socket.IO instance
 */
export function initLogEmitter(socketIO) {
  io = socketIO;
  console.log('✓ Log Emitter initialized');
}

/**
 * Emit a log entry
 * @param {string} level - Log level (INFO, SUCCESS, WARNING, ERROR)
 * @param {string} message - Log message
 * @param {object} metadata - Additional metadata
 */
export function emitLog(level, message, metadata = {}) {
  const logEntry = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
    level,
    message,
    metadata
  };

  // Add to in-memory store
  logs.unshift(logEntry);
  
  // Keep only last MAX_LOGS entries
  if (logs.length > MAX_LOGS) {
    logs.pop();
  }

  // Console output with color coding
  const colorCodes = {
    INFO: '\x1b[36m',    // Cyan
    SUCCESS: '\x1b[32m', // Green
    WARNING: '\x1b[33m', // Yellow
    ERROR: '\x1b[31m'    // Red
  };
  const resetCode = '\x1b[0m';
  const color = colorCodes[level] || '';
  
  console.log(`${color}[${level}]${resetCode} ${message}`);

  // Broadcast to all connected clients via Socket.IO
  if (io) {
    io.emit('logUpdate', logEntry);
  }

  return logEntry;
}

/**
 * Get all logs
 */
export function getLogs() {
  return logs;
}

/**
 * Clear all logs
 */
export function clearLogs() {
  logs.length = 0;
  emitLog('INFO', 'System logs cleared');
  
  if (io) {
    io.emit('logCleared');
  }
}

/**
 * Get logs by level
 */
export function getLogsByLevel(level) {
  return logs.filter(log => log.level === level);
}

/**
 * Export logs as JSON
 */
export function exportLogs() {
  return JSON.stringify(logs, null, 2);
}
