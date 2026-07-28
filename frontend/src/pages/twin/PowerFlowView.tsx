import { useMemo } from 'react';
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
  const hasDetailedTopology = siteId === 'msc10-blida' && allEquipment.some((item: any) => item.name === 'UPS-A');

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

  const upsA = Object.values(equipmentData).find(e => e.equipmentName === 'UPS-A');
  const upsLoad = upsA?.metrics?.load || 54;
  const upsStatus = statusForEquipment('UPS-A');
  const atsStatus = statusForEquipment('ATS-TGBT');
  const generatorStatus = statusForEquipment('GE-02-SDMO-400KVA');
  const coolingStatus = statusForEquipment('CLIM-STULZ-01');

  const nodes: Node[] = useMemo(() => [
    ...(hasDetailedTopology ? [
      { id: 'grid', position: { x: 330, y: 20 }, data: { label: 'National Grid\nL1/L2/L3 Input' }, type: 'input' as const, style: nodeStyle(atsStatus === 'warning' ? 'warning' : 'healthy') },
      { id: 'transformer', position: { x: 330, y: 130 }, data: { label: 'Transformer TR1\n400 KVA' }, style: nodeStyle(statusForEquipment('Transformer-TR1-400KVA')) },
      { id: 'ats', position: { x: 330, y: 240 }, data: { label: 'ATS / TGBT\nSource Transfer' }, style: nodeStyle(atsStatus) },
      { id: 'generator1', position: { x: 70, y: 215 }, data: { label: 'GE-01 Cummins\n400 KVA' }, style: nodeStyle(statusForEquipment('GE-01-CUMMINS-400KVA')) },
      { id: 'generator2', position: { x: 70, y: 325 }, data: { label: 'GE-02 SDMO\nStandby' }, style: nodeStyle(generatorStatus) },
      { id: 'ups', position: { x: 330, y: 365 }, data: { label: `UPS-A\nLoad ${upsLoad.toFixed(1)}%` }, style: nodeStyle(upsLoad > 85 ? 'critical' : upsStatus) },
      { id: 'panel', position: { x: 330, y: 490 }, data: { label: 'Distribution Panels\nProtected Loads' }, style: nodeStyle(upsStatus === 'critical' ? 'critical' : atsStatus) },
      { id: 'switch', position: { x: 60, y: 630 }, data: { label: 'Switch Room\nCore Equipment' }, type: 'output' as const, style: nodeStyle(statusForEquipment('SWITCH-MSC10-Core')) },
      { id: 'battery', position: { x: 250, y: 630 }, data: { label: 'Battery Room\nBattery Bank' }, type: 'output' as const, style: nodeStyle(statusForEquipment('BATT-BANK-A')) },
      { id: 'enr', position: { x: 440, y: 630 }, data: { label: 'ENR Room\nHuawei Rectifier' }, type: 'output' as const, style: nodeStyle(statusForEquipment('PS-HUAWEI-TP48300D')) },
      { id: 'vsat', position: { x: 630, y: 630 }, data: { label: 'V-SAT Room\nTransmission Rack' }, type: 'output' as const, style: nodeStyle(statusForEquipment('VSAT-RACK-01')) },
      { id: 'cooling', position: { x: 630, y: 365 }, data: { label: 'Cooling Systems\nSTULZ / ENIEM' }, type: 'output' as const, style: nodeStyle(coolingStatus) }
    ] : [
      { id: 'grid', position: { x: 300, y: 40 }, data: { label: `${currentSite?.name || 'Site'}\nGrid Input` }, type: 'input' as const, style: nodeStyle('healthy') },
      { id: 'panel', position: { x: 300, y: 210 }, data: { label: 'Site Distribution\nConfigured Loads' }, style: nodeStyle(rooms.some((room: any) => statusForRoom(room) === 'critical') ? 'critical' : rooms.some((room: any) => statusForRoom(room) === 'warning') ? 'warning' : 'healthy') },
      ...rooms.map((room: any, index: number) => {
        const column = index % 4;
        const row = Math.floor(index / 4);
        const status = statusForRoom(room);
        const equipmentCount = room.equipments?.length || 0;

        return {
          id: room.id,
          position: { x: 60 + column * 190, y: 410 + row * 140 },
          data: { label: `${room.name}\n${equipmentCount} equipment` },
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
          <p className="text-on-surface-variant mt-2">No room or equipment topology has been configured for this site yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[560px] w-full bg-background rounded-lg border border-border-subtle overflow-hidden">
      <ReactFlow nodes={nodes} edges={edges} fitView nodesDraggable={false} nodesConnectable={false} elementsSelectable>
        <Background color="#334155" gap={16} />
        <Controls className="bg-bg-surface border-border-subtle fill-on-surface" />
      </ReactFlow>
    </div>
  );
};

export default PowerFlowView;
