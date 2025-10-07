/**
 * Format timestamp to human-readable format
 */
export function formatTimestamp(isoString) {
  if (!isoString) return 'N/A';
  
  const date = new Date(isoString);
  
  // Format: Dec 7, 2024 at 3:45:23 PM
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  
  return date.toLocaleString('en-US', options);
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return 'N/A';
  
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Format time only (HH:MM:SS)
 */
export function formatTimeOnly(isoString) {
  if (!isoString) return 'N/A';
  
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
