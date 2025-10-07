/**
 * System Overview Component
 * Main dashboard showing all servers and system controls
 */

import React from 'react';
import { useServer } from '../../context/ServerContext';
import ServerNode from './ServerNode';

const SystemOverview = () => {
  const { servers, leader, crashServer, restartServer, loading } = useServer();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading system...</div>
      </div>
    );
  }

  const activeServers = servers.filter(s => s.status === 'active').length;
  const crashedServers = servers.filter(s => s.status === 'crashed').length;

  return (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Servers</div>
          <div className="text-3xl font-bold text-gray-900">{servers.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Active Servers</div>
          <div className="text-3xl font-bold text-green-600">{activeServers}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Crashed Servers</div>
          <div className="text-3xl font-bold text-red-600">{crashedServers}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Current Leader</div>
          <div className="text-3xl font-bold text-blue-600">
            {leader ? `Server ${leader}` : 'None'}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">ℹ️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-bold text-blue-900">Distributed System Simulation</h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>• Crash any server to simulate failure and observe leader election (Bully Algorithm)</p>
              <p>• All write operations are handled by the leader and replicated to followers</p>
              <p>• Watch the System Logs for detailed distributed system events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Server Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4">Server Instances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((server) => (
            <ServerNode
              key={server.id}
              server={server}
              onCrash={crashServer}
              onRestart={restartServer}
            />
          ))}
        </div>
      </div>

      {/* Distributed System Concepts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">🎓 Distributed System Concepts Demonstrated</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-bold text-blue-900">Leader Election (Bully Algorithm)</h4>
            <p className="text-sm text-gray-700">Server with highest ID becomes leader when current leader crashes</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-bold text-green-900">Data Replication</h4>
            <p className="text-sm text-gray-700">All write operations replicated to active servers for consistency</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-bold text-orange-900">Fault Tolerance</h4>
            <p className="text-sm text-gray-700">System continues operating even when servers crash</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-bold text-purple-900">Crash Recovery</h4>
            <p className="text-sm text-gray-700">Crashed servers can restart and sync data from leader</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;
