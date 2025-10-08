/**
 * Log Entry Component
 * Individual log entry display
 */

import React from 'react';
import { formatTimeOnly } from '../../utils/formatTimestamp';

const LogEntry = ({ log }) => {
  const getLevelStyles = () => {
    switch (log.level) {
      case 'SUCCESS':
        return {
          bg: 'bg-green-900/30',
          border: 'border-l-green-400',
          text: 'text-green-300',
          badge: 'bg-green-500/20 text-green-300 border-green-400/50'
        };
      case 'ERROR':
        return {
          bg: 'bg-red-900/30',
          border: 'border-l-red-400',
          text: 'text-red-300',
          badge: 'bg-red-500/20 text-red-300 border-red-400/50'
        };
      case 'WARNING':
        return {
          bg: 'bg-yellow-900/30',
          border: 'border-l-yellow-400',
          text: 'text-yellow-300',
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50'
        };
      case 'INFO':
      default:
        return {
          bg: 'bg-blue-900/30',
          border: 'border-l-blue-400',
          text: 'text-blue-300',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-400/50'
        };
    }
  };

  const getLevelIcon = () => {
    switch (log.level) {
      case 'SUCCESS':
        return '✅';
      case 'ERROR':
        return '❌';
      case 'WARNING':
        return '⚠️';
      case 'INFO':
      default:
        return 'ℹ️';
    }
  };

  const styles = getLevelStyles();

  return (
    <div className={`${styles.bg} ${styles.border} border-l-4 rounded-r-md p-3 mb-1 hover:bg-opacity-50 transition-all duration-200`}>
      <div className="flex items-start space-x-3">
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="text-sm">{getLevelIcon()}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles.badge}`}>
            {log.level}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <span className={`flex-1 ${styles.text} font-medium text-sm leading-relaxed break-words`}>
              {log.message}
            </span>
            <span className="flex-shrink-0 text-xs text-gray-400 ml-4 font-mono bg-gray-800 px-2 py-0.5 rounded">
              {formatTimeOnly(log.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogEntry;
