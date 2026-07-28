import React from 'react';
import Badge from '../ui/Badge';
import { Thermometer, AlertCircle, Ticket } from 'lucide-react';

interface RoomCardProps {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  temp: number;
  healthScore?: number;
  tickets: number;
  alarms: number;
  equipmentCount?: number;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ name, status, temp, healthScore, tickets, alarms, equipmentCount = 0, className = '', onClick, selected }) => {
  const bgColors = {
    healthy: 'bg-bg-surface hover:border-status-healthy',
    warning: 'bg-status-warning/10 hover:border-status-warning',
    critical: 'bg-status-critical/10 hover:border-status-critical',
  };

  return (
    <div 
      onClick={onClick}
      className={`border ${selected ? 'border-primary-main ring-1 ring-primary-main' : 'border-border-subtle'} rounded-lg p-4 cursor-pointer transition-colors relative group overflow-hidden ${bgColors[status]} ${className}`}
    >
      <div className="flex justify-between items-start mb-4 gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-on-surface font-sans font-medium truncate">{name}</h3>
          {healthScore !== undefined && (
            <div className="mt-2 w-full max-w-[140px]">
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className="text-on-surface-variant uppercase tracking-wider">Health</span>
                <span className={
                  healthScore >= 90 ? 'text-status-healthy font-bold' :
                  healthScore >= 70 ? 'text-status-warning font-bold' :
                  'text-status-critical font-bold'
                }>{Math.round(healthScore)}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    healthScore >= 90 ? 'bg-status-healthy' :
                    healthScore >= 70 ? 'bg-status-warning' :
                    'bg-status-critical'
                  }`}
                  style={{ width: `${Math.max(4, healthScore)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="shrink-0">
          <Badge status={status}>{status.toUpperCase()}</Badge>
        </div>
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
