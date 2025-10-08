/**
 * System Log Component
 * Real-time system logs display
 */

import React, { useEffect, useRef } from 'react';
import { useServer } from '../../context/ServerContext';
import { useSocket } from '../../context/SocketContext';
import LogEntry from './LogEntry';

const SystemLog = () => {
  const { logs, loading } = useServer();
  const { socket } = useSocket();
  const logContainerRef = useRef(null);
  const [autoScroll, setAutoScroll] = React.useState(true);

  // Handle clear logs
  const handleClearLogs = () => {
    if (socket && socket.connected) {
      socket.emit('clearLogs');
    }
  };

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading logs...</div>
      </div>
    );
  }

  const logLevelCounts = logs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Logs</h2>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            <span>Auto-scroll</span>
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Logs</div>
          <div className="text-2xl font-bold">{logs.length}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <div className="text-sm text-green-600">Success</div>
          <div className="text-2xl font-bold text-green-600">
            {logLevelCounts.SUCCESS || 0}
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <div className="text-sm text-blue-600">Info</div>
          <div className="text-2xl font-bold text-blue-600">
            {logLevelCounts.INFO || 0}
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <div className="text-sm text-yellow-600">Warning</div>
          <div className="text-2xl font-bold text-yellow-600">
            {logLevelCounts.WARNING || 0}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <div className="text-sm text-red-600">Error</div>
          <div className="text-2xl font-bold text-red-600">
            {logLevelCounts.ERROR || 0}
          </div>
        </div>
      </div>

      {/* Log Console */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl border border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg flex items-center space-x-2">
            <span className="text-2xl">📋</span>
            <span>Real-Time Event Log</span>
          </h3>
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-2 text-green-400 text-sm font-medium">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></span>
              <span>LIVE</span>
            </span>
            <button
              onClick={handleClearLogs}
              className="text-gray-400 hover:text-white text-xs px-2 py-1 border border-gray-600 rounded hover:border-gray-500 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div
          ref={logContainerRef}
          className="bg-gray-950 rounded-md border border-gray-700 p-4 h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
          style={{
            fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace'
          }}
        >
          {logs.length === 0 ? (
            <div className="text-gray-400 text-center py-12 text-sm">
              <div className="text-2xl mb-2">🔍</div>
              <div>No logs yet. Interact with the system to see events...</div>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <LogEntry key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start">
          <span className="text-xl mr-3">💡</span>
          <div className="text-sm text-blue-700">
            <strong>System logs show real-time distributed system events:</strong>
            <ul className="mt-2 ml-4 list-disc">
              <li>Leader election process (Bully Algorithm)</li>
              <li>Data replication across servers</li>
              <li>Server crashes and recoveries</li>
              <li>Order processing and distribution</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLog;
