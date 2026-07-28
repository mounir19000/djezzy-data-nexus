import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import RoomCard from '../../components/twin/RoomCard';
import Badge from '../../components/ui/Badge';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { useSite } from '../../hooks/useSites';
import PowerFlowView from './PowerFlowView';

const roomLayout: Record<string, string> = {
  'UPS Room': 'col-span-2 row-span-1',
  'Battery Room': 'col-span-1 row-span-2',
  'Switch Room': 'col-span-1 row-span-1',
  'ENR Room': 'col-span-1 row-span-1',
  'V-SAT Room': 'col-span-1 row-span-1',
  'Generator Area': 'col-span-2 row-span-1',
  'Electrical Room': 'col-span-1 row-span-1',
  'Cooling Systems': 'col-span-1 row-span-1'
};

const calculateRoomHealth = (temperature: number, threshold: number) => {
  const warningStart = threshold * 0.8;

  if (temperature < warningStart) return 100;
  if (temperature <= threshold) {
    return Math.max(70, 100 - ((temperature - warningStart) / (threshold - warningStart)) * 30);
  }

  return Math.max(0, 70 - ((temperature - threshold) / (threshold * 0.1)) * 70);
};

const statusFromHealth = (healthScore: number, activeAlarms: number): 'healthy' | 'warning' | 'critical' | 'offline' => {
  if (activeAlarms > 0 && healthScore < 80) return 'critical';
  if (healthScore < 70) return 'critical';
  if (healthScore < 90 || activeAlarms > 0) return 'warning';
  return 'healthy';
};

const DigitalTwinDashboard = () => {
  const [activeTab, setActiveTab] = useState<'physical' | 'power'>('physical');
  const params = useParams();
  const [searchParams] = useSearchParams();
  const siteId = params.siteId || searchParams.get('siteId') || 'msc10-blida';
  const { data: currentSite, isLoading, isError } = useSite(siteId);
  const equipmentData = useTelemetryStore(state => state.equipmentData);

  const siteName = currentSite?.name || 'MSC10 Blida';
  const roomSummaries = useMemo(() => {
    return currentSite?.rooms?.map((room: any) => {
      const equipment = room.equipments || [];
      const telemetry = equipment
        .map((item: any) => equipmentData[item.id]?.metrics)
        .filter(Boolean);
      const temperature = telemetry.length
        ? telemetry.reduce((sum: number, item: any) => sum + item.temperature, 0) / telemetry.length
        : room.targetTemp * 0.92;
      const humidity = telemetry.length
        ? telemetry.reduce((sum: number, item: any) => sum + item.humidity, 0) / telemetry.length
        : room.targetHumidity;
      const activeAlarms = equipment.reduce((sum: number, item: any) => sum + (item.alarms?.length || 0), 0);
      const openTickets = equipment.reduce((sum: number, item: any) => sum + (item.tickets?.length || 0), 0);
      const hasOfflineEquipment = equipment.some((item: any) => item.status === 'offline');
      const healthScore = hasOfflineEquipment ? 65 : calculateRoomHealth(temperature, room.targetTemp);

      return {
        ...room,
        temperature,
        humidity,
        healthScore,
        activeAlarms,
        openTickets,
        equipmentCount: equipment.length,
        status: hasOfflineEquipment ? 'offline' : statusFromHealth(healthScore, activeAlarms)
      };
    }) || [];
  }, [currentSite, equipmentData]);

  const criticalRooms = roomSummaries.filter((room: any) => room.status === 'critical').length;
  const warningRooms = roomSummaries.filter((room: any) => room.status === 'warning' || room.status === 'offline').length;

  if (isLoading) {
    return (
      <div className="h-full min-h-[560px] bg-bg-surface border border-border-subtle rounded-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-display font-bold text-on-surface">Loading Digital Twin</h2>
          <p className="text-on-surface-variant mt-2">Preparing site room and equipment state...</p>
        </div>
      </div>
    );
  }

  if (isError || !currentSite) {
    return (
      <div className="h-full min-h-[560px] bg-bg-surface border border-border-subtle rounded-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-display font-bold text-status-critical">Digital Twin Unavailable</h2>
          <p className="text-on-surface-variant mt-2">The selected site could not be loaded.</p>
        </div>
      </div>
    );
  }

  if (roomSummaries.length === 0) {
    return (
      <div className="h-full min-h-[560px] bg-bg-surface border border-border-subtle rounded-lg p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-display font-bold text-on-surface">{siteName} Digital Twin</h2>
          <p className="text-on-surface-variant mt-2">No rooms or equipment have been configured for this site yet. Add the site model in Site Settings to activate the Digital Twin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">{siteName} Digital Twin</h2>
          <p className="text-on-surface-variant font-sans mt-1">Physical room health, live telemetry, tickets, and power topology.</p>
        </div>
        <div className="flex bg-bg-surface border border-border-subtle rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('physical')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'physical' ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-background'}`}
          >
            Physical View
          </button>
          <button 
            onClick={() => setActiveTab('power')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'power' ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-background'}`}
          >
            Power Flow View
          </button>
        </div>
      </header>

      {activeTab === 'physical' ? (
        <div className="flex-1 bg-bg-surface border border-border-subtle rounded-lg p-6 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-sans font-medium text-on-surface">Facility Floor Plan</h3>
            {criticalRooms > 0 ? (
              <Badge status="critical">{criticalRooms} Critical Room{criticalRooms > 1 ? 's' : ''}</Badge>
            ) : warningRooms > 0 ? (
              <Badge status="warning">{warningRooms} Room{warningRooms > 1 ? 's' : ''} Require Attention</Badge>
            ) : (
              <Badge status="healthy">Rooms Healthy</Badge>
            )}
          </div>
          
          <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-4 min-h-[500px]">
            {roomSummaries.map((room: any) => (
              <RoomCard
                key={room.id}
                name={room.name}
                status={room.status}
                temp={Number(room.temperature.toFixed(1))}
                humidity={Number(room.humidity.toFixed(1))}
                healthScore={room.healthScore}
                tickets={room.openTickets}
                alarms={room.activeAlarms}
                equipmentCount={room.equipmentCount}
                className={roomLayout[room.name] || 'col-span-1 row-span-1'}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-[560px]">
          <PowerFlowView />
        </div>
      )}
    </div>
  );
};

export default DigitalTwinDashboard;
