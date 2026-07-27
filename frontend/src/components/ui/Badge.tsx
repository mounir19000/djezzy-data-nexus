import React from 'react';

interface BadgeProps {
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  children: React.ReactNode;
}

const statusConfig = {
  healthy: 'bg-status-healthy/10 text-status-healthy border-status-healthy/20',
  warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
  critical: 'bg-status-critical/10 text-status-critical border-status-critical/20',
  offline: 'bg-status-offline/10 text-status-offline border-status-offline/20',
};

const dotConfig = {
  healthy: 'bg-status-healthy',
  warning: 'bg-status-warning',
  critical: 'bg-status-critical',
  offline: 'bg-status-offline',
};

const Badge: React.FC<BadgeProps> = ({ status, children }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${statusConfig[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotConfig[status]}`}></span>
      {children}
    </span>
  );
};

export default Badge;
