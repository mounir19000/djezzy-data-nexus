import React from 'react';
import { X, Thermometer, AlertCircle, Ticket, Server, Activity } from 'lucide-react';
import Badge from '../ui/Badge';
import { displayStatus, displayText } from '../../lib/frenchLabels';

interface RoomDetailsPanelProps {
  room: any;
  onClose: () => void;
}

const RoomDetailsPanel: React.FC<RoomDetailsPanelProps> = ({ room, onClose }) => {
  const equipments = room.equipments || [];

  const healthReasons: { text: string; severity: 'warning' | 'critical' | 'offline' }[] = [];
  if (room.temperature >= room.targetTemp) {
    healthReasons.push({ text: `Température critique (${room.temperature.toFixed(1)}°C, cible : ${room.targetTemp}°C)`, severity: 'critical' });
  } else if (room.temperature >= room.targetTemp * 0.8) {
    healthReasons.push({ text: `Température élevée (${room.temperature.toFixed(1)}°C, cible : ${room.targetTemp}°C)`, severity: 'warning' });
  }
  
  if (room.activeAlarms > 0) {
    healthReasons.push({ text: `${room.activeAlarms} alarme(s) active(s) signalee(s)`, severity: 'critical' });
  }
  const offlineEq = equipments.filter((eq: any) => eq.status === 'offline');
  if (offlineEq.length > 0) {
    healthReasons.push({ text: `${offlineEq.length} équipement(s) hors ligne`, severity: 'offline' });
  }

  return (
    <div className="w-96 bg-bg-surface border-l border-border-subtle h-full flex flex-col">
      <div className="p-6 border-b border-border-subtle flex justify-between items-start">
        <div>
          <h2 className="text-xl font-display font-bold text-on-surface">{displayText(room.name)}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge status={room.status}>{displayStatus(room.status, true)}</Badge>
            <span className="text-sm font-mono text-on-surface-variant">
              Santé : {Math.round(room.healthScore)}%
            </span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-bg-surface-hover rounded-full text-on-surface-variant transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {room.healthScore < 100 && healthReasons.length > 0 && (
          <div className="bg-bg-base border border-border-subtle rounded-lg p-4">
            <h3 className="text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-on-surface-variant" />
              Points de vigilance
            </h3>
            <ul className="space-y-2 mt-3">
              {healthReasons.map((reason, i) => {
                const colorMap = {
                  warning: 'text-status-warning bg-status-warning/10 border-status-warning/20',
                  critical: 'text-status-critical bg-status-critical/10 border-status-critical/20',
                  offline: 'text-on-surface-variant bg-bg-surface-hover border-border-subtle'
                };
                
                return (
                  <li key={i} className={`text-xs p-2 rounded border ${colorMap[reason.severity]} flex items-start gap-2`}>
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{reason.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-base rounded-lg p-4 border border-border-subtle">
            <div className="flex items-center gap-2 text-on-surface-variant mb-2">
              <Thermometer className="w-4 h-4" />
              <span className="text-sm font-medium">Temp. moyenne</span>
            </div>
            <div className="text-2xl font-mono text-on-surface">{room.temperature.toFixed(1)}°C</div>
            <div className="text-xs text-on-surface-variant mt-1">Cible : {room.targetTemp}°C</div>
          </div>
          <div className="bg-bg-base rounded-lg p-4 border border-border-subtle">
            <div className="flex items-center gap-2 text-on-surface-variant mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Équipements</span>
            </div>
            <div className="text-2xl font-mono text-on-surface">{room.equipmentCount}</div>
            <div className="text-xs text-on-surface-variant mt-1">Total appareils</div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-bg-base">
            <div className="flex items-center gap-2">
              <AlertCircle className={`w-5 h-5 ${room.activeAlarms > 0 ? 'text-status-critical' : 'text-status-healthy'}`} />
              <span className="text-sm font-medium text-on-surface">Alarmes</span>
            </div>
            <span className="font-mono font-bold text-on-surface">{room.activeAlarms}</span>
          </div>
          <div className="flex-1 flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-bg-base">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-on-surface-variant" />
              <span className="text-sm font-medium text-on-surface">Tickets</span>
            </div>
            <span className="font-mono font-bold text-on-surface">{room.openTickets}</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-sans font-medium text-on-surface mb-4">Détails des équipements</h3>
          <div className="space-y-3">
            {equipments.map((eq: any) => (
              <div key={eq.id} className="border border-border-subtle rounded-lg p-3 bg-bg-base flex items-center gap-2">
                <Server className="w-4 h-4 text-on-surface-variant" />
                <span className="font-medium text-on-surface">{eq.name}</span>
              </div>
            ))}
            {equipments.length === 0 && (
              <div className="text-center text-sm text-on-surface-variant p-4 border border-dashed border-border-subtle rounded-lg">
                Aucune donnée d’équipement disponible.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPanel;
