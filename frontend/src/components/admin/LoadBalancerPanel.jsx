/**
 * Load Balancer Configuration Panel
 * 
 * UI component for configuring load balancing algorithms and managing demo load testing
 */

import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';

const LoadBalancerPanel = () => {
  const socket = useSocket();
  const [config, setConfig] = useState({
    algorithm: 'round-robin',
    ordersPerSecond: 10,
    durationSeconds: 30
  });
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const algorithms = [
    { value: 'round-robin', label: 'Round Robin', description: 'Cycles through servers sequentially' },
    { value: 'least-connections', label: 'Least Connections', description: 'Routes to server with fewest active connections' },
    { value: 'weighted', label: 'Weighted', description: 'Routes based on server capacity/weight' },
    { value: 'least-response-time', label: 'Least Response Time', description: 'Routes to fastest responding server' }
  ];

  const loadPresets = [
    { name: 'Light Load', ordersPerSecond: 5, durationSeconds: 20, color: 'green' },
    { name: 'Medium Load', ordersPerSecond: 15, durationSeconds: 30, color: 'yellow' },
    { name: 'Heavy Load', ordersPerSecond: 50, durationSeconds: 20, color: 'orange' },
    { name: 'Stress Test', ordersPerSecond: 100, durationSeconds: 15, color: 'red' }
  ];

  useEffect(() => {
    // Listen for load balancer stats updates
    const handleStatsUpdate = (data) => {
      setStats(data.loadBalancer);
    };

    if (socket) {
      socket.on('systemState', handleStatsUpdate);
      return () => socket.off('systemState', handleStatsUpdate);
    }
  }, [socket]);

  const handleAlgorithmChange = (algorithm) => {
    setConfig(prev => ({ ...prev, algorithm }));
    if (socket) {
      socket.emit('changeLoadBalancerAlgorithm', algorithm);
    }
  };

  const handleDemoLoad = async () => {
    if (!socket || isLoading) return;

    setIsLoading(true);
    try {
      socket.emit('startDemoLoad', {
        ordersPerSecond: config.ordersPerSecond,
        durationSeconds: config.durationSeconds
      });

      // Simulate loading state for UI feedback
      setTimeout(() => {
        setIsLoading(false);
      }, config.durationSeconds * 1000);
    } catch (error) {
      console.error('Error starting demo load:', error);
      setIsLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setConfig(prev => ({
      ...prev,
      ordersPerSecond: preset.ordersPerSecond,
      durationSeconds: preset.durationSeconds
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
          <span className="text-2xl">⚖️</span>
          <span>Load Balancer Configuration</span>
        </h3>
        <div className="flex items-center space-x-2">
          {stats && (
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
              Total Requests: {stats.totalRequests}
            </span>
          )}
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3 text-gray-700">Load Balancing Algorithm</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {algorithms.map((algo) => (
            <button
              key={algo.value}
              onClick={() => handleAlgorithmChange(algo.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md ${
                config.algorithm === algo.value
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-800">{algo.label}</div>
              <div className="text-sm text-gray-600 mt-1">{algo.description}</div>
              {config.algorithm === algo.value && (
                <div className="mt-2 flex items-center text-blue-600 text-sm">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Currently Active
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Demo Load Testing */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3 text-gray-700">Demo Load Testing</h4>
        
        {/* Load Presets */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets:</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {loadPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`p-3 rounded-lg border text-center transition-all duration-200 hover:shadow-md ${
                  preset.color === 'green' ? 'border-green-300 bg-green-50 hover:bg-green-100' :
                  preset.color === 'yellow' ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100' :
                  preset.color === 'orange' ? 'border-orange-300 bg-orange-50 hover:bg-orange-100' :
                  'border-red-300 bg-red-50 hover:bg-red-100'
                }`}
              >
                <div className="font-semibold text-sm">{preset.name}</div>
                <div className="text-xs text-gray-600">{preset.ordersPerSecond}/sec</div>
                <div className="text-xs text-gray-600">{preset.durationSeconds}s</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orders per Second: {config.ordersPerSecond}
            </label>
            <input
              type="range"
              min="1"
              max="200"
              value={config.ordersPerSecond}
              onChange={(e) => setConfig(prev => ({ ...prev, ordersPerSecond: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>100</span>
              <span>200</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration: {config.durationSeconds}s
            </label>
            <input
              type="range"
              min="5"
              max="120"
              value={config.durationSeconds}
              onChange={(e) => setConfig(prev => ({ ...prev, durationSeconds: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5s</span>
              <span>60s</span>
              <span>120s</span>
            </div>
          </div>
        </div>

        {/* Start Demo Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleDemoLoad}
            disabled={isLoading}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center space-x-2 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Running Demo Load...</span>
              </>
            ) : (
              <>
                <span className="text-xl">🚀</span>
                <span>Start Demo Load</span>
              </>
            )}
          </button>
        </div>

        {isLoading && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <div className="font-semibold text-blue-800">Demo Load Running</div>
                <div className="text-sm text-blue-600">
                  Generating {config.ordersPerSecond} orders/sec for {config.durationSeconds} seconds
                </div>
                <div className="text-sm text-blue-600">
                  Total: {config.ordersPerSecond * config.durationSeconds} orders
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      {stats && (
        <div className="border-t pt-4">
          <h4 className="text-lg font-semibold mb-3 text-gray-700">Performance Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.activeServers}</div>
              <div className="text-sm text-gray-600">Active Servers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalRequests}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.algorithm}</div>
              <div className="text-sm text-gray-600">Current Algorithm</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.servers ? Math.round(stats.servers.reduce((sum, s) => sum + s.loadPercentage, 0) / stats.servers.length) : 0}%
              </div>
              <div className="text-sm text-gray-600">Avg Load</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadBalancerPanel;