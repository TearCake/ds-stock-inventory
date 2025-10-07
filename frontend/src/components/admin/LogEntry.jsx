/**
 * Log Entry Component
 * Individual log entry display
 */

import React from 'react';
import { formatTimeOnly } from '../../utils/formatTimestamp';

const LogEntry = ({ log }) => {
  const getLevelColor = () => {
    switch (log.level) {
      case 'SUCCESS':
        return 'text-log-success bg-green-50 border-green-200';
      case 'ERROR':
        return 'text-log-error bg-red-50 border-red-200';
      case 'WARNING':
        return 'text-log-warning bg-yellow-50 border-yellow-200';
      case 'INFO':
      default:
        return 'text-log-info bg-blue-50 border-blue-200';
    }
  };

  const getLevelIcon = () => {
    switch (log.level) {
      case 'SUCCESS':
        return '✓';
      case 'ERROR':
        return '✗';
      case 'WARNING':
        return '⚠';
      case 'INFO':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`border-l-4 p-3 mb-2 font-mono text-sm ${getLevelColor()}`}>
      <div className="flex items-start space-x-3">
        <span className="flex-shrink-0 font-bold">{getLevelIcon()}</span>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <span className="flex-1">{log.message}</span>
            <span className="flex-shrink-0 text-xs opacity-70 ml-3">
              {formatTimeOnly(log.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogEntry;
