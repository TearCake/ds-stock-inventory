/**
 * Server Node Component
 * Displays individual server status with controls
 */

import React from 'react';

const ServerNode = ({ server, onCrash, onRestart }) => {
  const getStatusColor = () => {
    if (server.isLeader) return 'bg-server-leader border-server-leader';
    if (server.status === 'active') return 'bg-server-active border-server-active';
    return 'bg-server-crashed border-server-crashed';
  };

  const getStatusText = () => {
    if (server.isLeader) return 'LEADER';
    return server.status.toUpperCase();
  };

  const getStatusIcon = () => {
    if (server.isLeader) return '👑';
    if (server.status === 'active') return '⚡';
    return '💥';
  };

  return (
    <div className={`border-4 rounded-lg p-4 ${getStatusColor()} bg-opacity-10 transition-all hover:shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-3xl">{getStatusIcon()}</span>
          <div>
            <h3 className="font-bold text-lg">Server {server.id}</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              server.isLeader 
                ? 'bg-server-leader text-white' 
                : server.status === 'active' 
                ? 'bg-server-active text-white' 
                : 'bg-server-crashed text-white'
            }`}>
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-3">
        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
          <div className="bg-gray-100 p-2 rounded">
            <div className="text-gray-600">Products</div>
            <div className="font-bold">{server.productCount || 0}</div>
          </div>
          <div className="bg-gray-100 p-2 rounded">
            <div className="text-gray-600">Orders</div>
            <div className="font-bold">{server.orderCount || 0}</div>
          </div>
        </div>
        
        {/* Load Indicators */}
        {server.loadBalancer && (
          <div className="space-y-2">
            <div className="text-xs text-gray-600 flex justify-between">
              <span>CPU Usage</span>
              <span>{Math.round(server.loadBalancer.cpuUsage || 0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, server.loadBalancer.cpuUsage || 0)}%` }}
              ></div>
            </div>
            
            <div className="text-xs text-gray-600 flex justify-between">
              <span>Active Connections</span>
              <span>{server.loadBalancer.activeConnections || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (server.loadBalancer.activeConnections || 0) * 10)}%` }}
              ></div>
            </div>
            
            <div className="text-xs text-gray-600 flex justify-between">
              <span>Response Time</span>
              <span>{Math.round(server.loadBalancer.avgResponseTime || 0)}ms</span>
            </div>
            
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div className="bg-blue-50 p-1 rounded text-center">
                <div className="font-bold text-blue-600">{server.loadBalancer.totalRequests || 0}</div>
                <div className="text-gray-600">Requests</div>
              </div>
              <div className="bg-green-50 p-1 rounded text-center">
                <div className="font-bold text-green-600">{server.loadBalancer.weight || 1}</div>
                <div className="text-gray-600">Weight</div>
              </div>
              <div className="bg-purple-50 p-1 rounded text-center">
                <div className="font-bold text-purple-600">{Math.round(server.loadBalancer.healthScore || 100)}</div>
                <div className="text-gray-600">Health</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {server.status === 'active' ? (
          <button
            onClick={() => onCrash(server.id)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            💥 Crash
          </button>
        ) : (
          <button
            onClick={() => onRestart(server.id)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            🔄 Restart
          </button>
        )}
      </div>

      {/* Leader indicator */}
      {server.isLeader && (
        <div className="mt-2 text-xs text-center text-blue-600 font-semibold">
          ⭐ Current Leader ⭐
        </div>
      )}
    </div>
  );
};

export default ServerNode;
