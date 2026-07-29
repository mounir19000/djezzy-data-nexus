import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ReactFlow, { Background, Controls } from 'reactflow';
import type { Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { useSite } from '../../hooks/useSites';

type FlowStatus = 'healthy' | 'warning' | 'critical' | 'offline';

const statusColor: Record<FlowStatus, string> = {
  healthy: '#22C55E',
  warning: '#F59E0B',
  critical: '#EF4444',
  offline: '#64748B'
};

const nodeStyle = (status: FlowStatus) => ({
  background: status === 'critical' ? '#3a1114' : status === 'warning' ? '#33280f' : '#181B22',
  color: '#e2e2e8',
  border: `1px solid ${statusColor[status]}`,
  borderRadius: '8px',
  padding: '12px',
  minWidth: 150,
  whiteSpace: 'pre-line' as const,
  boxShadow: status === 'critical' ? '0 0 0 2px rgba(239, 68, 68, 0.18)' : 'none'
});

const edgeStyle = (status: FlowStatus) => ({
  stroke: statusColor[status],
  strokeWidth: status === 'critical' ? 3 : 2
});

const PowerFlowView = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const equipmentData = useTelemetryStore(state => state.equipmentData);
  const siteId = params.siteId || searchParams.get('siteId') || 'msc10-blida';
  const { data: currentSite, isLoading, isError } = useSite(siteId);
  const rooms = currentSite?.rooms || [];
  const allEquipment = currentSite?.rooms?.flatMap((room: any) => room.equipments || []) || [];
  const hasDetailedTopology = siteId === 'msc10-blida' && allEquipment.some((item: any) => item.name === 'UPS');

  const [tooltip, setTooltip] = useState<{ x: number, y: number, alarms: any[], label: string } | null>(null);

  const getAlarmsForEquipment = (name: string) => {
    const equipment = allEquipment.find((item: any) => item.name === name);
    return equipment?.alarms || [];
  };

  const getAlarmsForRoom = (room: any) => {
    return room.equipments?.flatMap((item: any) => item.alarms || []) || [];
  };

  const statusForEquipment = (name: string): FlowStatus => {
    const equipment = allEquipment.find((item: any) => item.name === name);
    if (!equipment) return 'healthy';
    if (equipment.status === 'offline') return 'offline';
    if (equipment.alarms?.some((alarm: any) => alarm.severity === 'critical')) return 'critical';
    if (equipment.alarms?.length || equipment.status === 'warning') return 'warning';
    return 'healthy';
  };

  const statusForRoom = (room: any): FlowStatus => {
    const equipment = room.equipments || [];
    if (equipment.some((item: any) => item.status === 'offline')) return 'offline';
    if (equipment.some((item: any) => item.alarms?.some((alarm: any) => alarm.severity === 'critical'))) return 'critical';
    if (equipment.some((item: any) => item.status === 'warning' || item.alarms?.length)) return 'warning';
    return 'healthy';
  };

  const ups = Object.values(equipmentData).find(e => e.equipmentName === 'UPS');
  const upsLoad = ups?.metrics?.load || 54;
  const upsStatus = statusForEquipment('UPS');
  const atsStatus = statusForEquipment('ATS-TGBT');
  const generatorStatus = statusForEquipment('GE-02-SDMO-400KVA');
  const coolingStatus = statusForEquipment('CLIM-STULZ-01');

  const nodes: Node[] = useMemo(() => [
    ...(hasDetailedTopology ? [
      { id: 'grid', position: { x: 330, y: 20 }, data: { label: 'National Grid\nL1/L2/L3 Input', alarms: [] }, type: 'input' as const, style: nodeStyle(atsStatus === 'warning' ? 'warning' : 'healthy') },
      { id: 'transformer', position: { x: 330, y: 130 }, data: { label: 'Transformer TR1\n400 KVA', alarms: getAlarmsForEquipment('Transformer-TR1-400KVA') }, style: nodeStyle(statusForEquipment('Transformer-TR1-400KVA')) },
      { id: 'ats', position: { x: 330, y: 240 }, data: { label: 'ATS / TGBT\nSource Transfer', alarms: getAlarmsForEquipment('ATS-TGBT') }, style: nodeStyle(atsStatus) },
      { id: 'generator1', position: { x: 70, y: 215 }, data: { label: 'GE-01 Cummins\n400 KVA', alarms: getAlarmsForEquipment('GE-01-CUMMINS-400KVA') }, style: nodeStyle(statusForEquipment('GE-01-CUMMINS-400KVA')) },
      { id: 'generator2', position: { x: 70, y: 325 }, data: { label: 'GE-02 SDMO\nStandby', alarms: getAlarmsForEquipment('GE-02-SDMO-400KVA') }, style: nodeStyle(generatorStatus) },
      { id: 'ups', position: { x: 330, y: 365 }, data: { label: `UPS\nLoad ${upsLoad.toFixed(1)}%`, alarms: getAlarmsForEquipment('UPS') }, style: nodeStyle(upsLoad > 85 ? 'critical' : upsStatus) },
      { id: 'panel', position: { x: 330, y: 490 }, data: { label: 'Distribution Panels\nProtected Loads', alarms: [] }, style: nodeStyle(upsStatus === 'critical' ? 'critical' : atsStatus) },
      { id: 'switch', position: { x: 60, y: 630 }, data: { label: 'Switch Room\nCore Equipment', alarms: getAlarmsForEquipment('SWITCH-MSC10-Core') }, type: 'output' as const, style: nodeStyle(statusForEquipment('SWITCH-MSC10-Core')) },
      { id: 'battery', position: { x: 250, y: 630 }, data: { label: 'Battery Room\nBattery Bank', alarms: getAlarmsForEquipment('BATT-BANK-A') }, type: 'output' as const, style: nodeStyle(statusForEquipment('BATT-BANK-A')) },
      { id: 'enr', position: { x: 440, y: 630 }, data: { label: 'ENR Room\nHuawei Rectifier', alarms: getAlarmsForEquipment('PS-HUAWEI-TP48300D') }, type: 'output' as const, style: nodeStyle(statusForEquipment('PS-HUAWEI-TP48300D')) },
      { id: 'vsat', position: { x: 630, y: 630 }, data: { label: 'V-SAT Room\nTransmission Rack', alarms: getAlarmsForEquipment('VSAT-RACK-01') }, type: 'output' as const, style: nodeStyle(statusForEquipment('VSAT-RACK-01')) },
      { id: 'cooling', position: { x: 630, y: 365 }, data: { label: 'Cooling Systems\nSTULZ / ENIEM', alarms: getAlarmsForEquipment('CLIM-STULZ-01') }, type: 'output' as const, style: nodeStyle(coolingStatus) }
    ] : [
      { id: 'grid', position: { x: 300, y: 40 }, data: { label: `${currentSite?.name || 'Site'}\nGrid Input`, alarms: [] }, type: 'input' as const, style: nodeStyle('healthy') },
      { id: 'panel', position: { x: 300, y: 210 }, data: { label: 'Site Distribution\nConfigured Loads', alarms: [] }, style: nodeStyle(rooms.some((room: any) => statusForRoom(room) === 'critical') ? 'critical' : rooms.some((room: any) => statusForRoom(room) === 'warning') ? 'warning' : 'healthy') },
      ...rooms.map((room: any, index: number) => {
        const column = index % 4;
        const row = Math.floor(index / 4);
        const status = statusForRoom(room);
        const equipmentCount = room.equipments?.length || 0;

        return {
          id: room.id,
          position: { x: 60 + column * 190, y: 410 + row * 140 },
          data: { label: `${room.name}\n${equipmentCount} equipment`, alarms: getAlarmsForRoom(room) },
          type: 'output' as const,
          style: nodeStyle(status)
        };
      })
    ])
  ], [atsStatus, coolingStatus, currentSite?.name, generatorStatus, hasDetailedTopology, rooms, upsLoad, upsStatus, allEquipment]);

  const edges: Edge[] = useMemo(() => [
    ...(hasDetailedTopology ? [
      { id: 'grid-transformer', source: 'grid', target: 'transformer', animated: true, style: edgeStyle(atsStatus === 'warning' ? 'warning' : 'healthy') },
      { id: 'transformer-ats', source: 'transformer', target: 'ats', animated: true, style: edgeStyle(atsStatus) },
      { id: 'generator1-ats', source: 'generator1', target: 'ats', animated: generatorStatus !== 'offline', style: edgeStyle(statusForEquipment('GE-01-CUMMINS-400KVA')) },
      { id: 'generator2-ats', source: 'generator2', target: 'ats', animated: false, style: edgeStyle(generatorStatus) },
      { id: 'ats-ups', source: 'ats', target: 'ups', animated: true, style: edgeStyle(upsStatus === 'critical' ? 'critical' : atsStatus) },
      { id: 'ups-panel', source: 'ups', target: 'panel', animated: true, style: edgeStyle(upsStatus) },
      { id: 'panel-switch', source: 'panel', target: 'switch', animated: true, style: edgeStyle(upsStatus) },
      { id: 'panel-battery', source: 'panel', target: 'battery', animated: true, style: edgeStyle(statusForEquipment('BATT-BANK-A')) },
      { id: 'panel-enr', source: 'panel', target: 'enr', animated: true, style: edgeStyle(statusForEquipment('PS-HUAWEI-TP48300D')) },
      { id: 'panel-vsat', source: 'panel', target: 'vsat', animated: true, style: edgeStyle(statusForEquipment('VSAT-RACK-01')) },
      { id: 'panel-cooling', source: 'panel', target: 'cooling', animated: true, style: edgeStyle(coolingStatus) }
    ] : [
      { id: 'grid-panel', source: 'grid', target: 'panel', animated: true, style: edgeStyle('healthy') },
      ...rooms.map((room: any) => ({
        id: `panel-${room.id}`,
        source: 'panel',
        target: room.id,
        animated: true,
        style: edgeStyle(statusForRoom(room))
      }))
    ])
  ], [atsStatus, coolingStatus, generatorStatus, hasDetailedTopology, rooms, upsStatus, allEquipment]);

  const handleNodeMouseEnter = (event: React.MouseEvent, node: Node) => {
    const alarms = node.data?.alarms;
    if (alarms && alarms.length > 0) {
      setTooltip({
        x: event.clientX,
        y: event.clientY,
        alarms,
        label: typeof node.data.label === 'string' ? node.data.label.replace(/\n/g, ' ') : 'Node'
      });
    }
  };

  const handleNodeMouseMove = (event: React.MouseEvent) => {
    setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
  };

  const handleNodeMouseLeave = () => {
    setTooltip(null);
  };

  if (isLoading) {
    return (
      <div className="h-full min-h-[560px] w-full bg-background rounded-lg border border-border-subtle flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-display font-bold text-on-surface">Loading Power Flow</h2>
          <p className="text-on-surface-variant mt-2">Preparing electrical topology...</p>
        </div>
      </div>
    );
  }

  if (isError || !currentSite) {
    return (
      <div className="h-full min-h-[560px] w-full bg-background rounded-lg border border-border-subtle flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-display font-bold text-status-critical">Power Flow Unavailable</h2>
          <p className="text-on-surface-variant mt-2">The selected site could not be loaded.</p>
        </div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="h-full min-h-[560px] w-full bg-background rounded-lg border border-border-subtle flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-display font-bold text-on-surface">{currentSite.name} Power Flow</h2>
          <p className="text-on-surface-variant mt-2">Coming soon. This site does not have its power topology loaded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[560px] w-full bg-background rounded-lg border border-border-subtle overflow-hidden">
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        fitView 
        nodesDraggable={false} 
        nodesConnectable={false} 
        elementsSelectable
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseMove={handleNodeMouseMove}
        onNodeMouseLeave={handleNodeMouseLeave}
      >
        <Background color="#334155" gap={16} />
        <Controls className="bg-bg-surface border-border-subtle fill-on-surface" />
      </ReactFlow>

      {tooltip && (
        <div 
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+16px)] bg-bg-surface border border-border-subtle shadow-lg rounded-xl p-3 min-w-[250px] max-w-[320px] transition-opacity duration-150 ease-in-out"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="font-semibold text-on-surface mb-2 pb-2 border-b border-border-subtle text-sm">
            {tooltip.label} Alarms
          </div>
          <div className="flex flex-col gap-2">
            {tooltip.alarms.slice(0, 3).map((alarm: any, idx: number) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${alarm.severity === 'critical' ? 'bg-status-critical' : alarm.severity === 'warning' ? 'bg-status-warning' : 'bg-status-healthy'}`} />
                <div>
                  <div className="font-medium text-on-surface">{alarm.type || 'Alarm'}</div>
                  <div className="text-on-surface-variant mt-0.5 line-clamp-2">{alarm.message}</div>
                </div>
              </div>
            ))}
            {tooltip.alarms.length > 3 && (
              <div className="text-xs text-on-surface-variant italic mt-1">
                + {tooltip.alarms.length - 3} more alarms...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PowerFlowView;

