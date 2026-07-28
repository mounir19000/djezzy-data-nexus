import React from 'react';
import Badge from '../ui/Badge';
import { Thermometer, AlertCircle, Ticket } from 'lucide-react';

interface RoomCardProps {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  temp: number;
  healthScore?: number;
  tickets: number;
  alarms: number;
  equipmentCount?: number;
  className?: string;
}

const RoomCard: React.FC<RoomCardProps> = ({ name, status, temp, healthScore, tickets, alarms, equipmentCount = 0, className = '' }) => {
  const bgColors = {
    healthy: 'bg-bg-surface hover:border-status-healthy',
    warning: 'bg-status-warning/10 hover:border-status-warning',
    critical: 'bg-status-critical/10 hover:border-status-critical',
    offline: 'bg-bg-surface opacity-50 hover:border-status-offline',
  };

  return (
    <div className={`border border-border-subtle rounded-lg p-4 cursor-pointer transition-colors relative group overflow-hidden ${bgColors[status]} ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-on-surface font-sans font-medium">{name}</h3>
          {healthScore !== undefined && (
            <p className="text-xs font-mono text-on-surface-variant mt-1">Health {Math.round(healthScore)}%</p>
          )}
        </div>
        <Badge status={status}>{status.toUpperCase()}</Badge>
      </div>

      <div className="flex items-center mt-auto">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-on-surface-variant" />
          <span className="text-sm font-mono text-on-surface">{temp}°C</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border-subtle flex justify-between">
        <div className="flex items-center gap-1">
          <AlertCircle className={`w-4 h-4 ${alarms > 0 ? 'text-status-critical' : 'text-status-healthy'}`} />
          <span className="text-xs font-mono text-on-surface-variant">{alarms} Alarms</span>
        </div>
        <div className="flex items-center gap-1">
          <Ticket className="w-4 h-4 text-on-surface-variant" />
          <span className="text-xs font-mono text-on-surface-variant">{tickets} Tickets</span>
        </div>
      </div>
      <div className="mt-2 text-xs font-mono text-on-surface-variant">{equipmentCount} Equipment</div>
    </div>
  );
};

export default RoomCard;
