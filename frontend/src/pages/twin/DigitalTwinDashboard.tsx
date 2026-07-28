import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import RoomCard from '../../components/twin/RoomCard';
import RoomDetailsPanel from '../../components/twin/RoomDetailsPanel';
import Badge from '../../components/ui/Badge';
import { useTelemetryStore } from '../../store/useTelemetryStore';
import { useSite } from '../../hooks/useSites';



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
  const params = useParams();
  const [searchParams] = useSearchParams();
  const siteId = params.siteId || searchParams.get('siteId') || 'msc10-blida';
  const { data: currentSite, isLoading, isError } = useSite(siteId);
  const equipmentData = useTelemetryStore(state => state.equipmentData);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const siteName = currentSite?.name || 'MSC10 Blida';
  const roomSummaries = useMemo(() => {
    return (currentSite?.rooms || [])
      .filter((room: any) => room.equipments && room.equipments.length > 0)
      .map((room: any) => {
        const equipment = room.equipments || [];
        const isUPSRoom = room.name.toLowerCase().includes('ups');
        const actualTargetTemp = isUPSRoom ? 40 : 26.5;

        const telemetry = equipment
          .map((item: any) => equipmentData[item.id]?.metrics)
          .filter(Boolean);
        const temperature = telemetry.length
          ? telemetry.reduce((sum: number, item: any) => sum + item.temperature, 0) / telemetry.length
          : actualTargetTemp * 0.92;
        const activeAlarms = equipment.reduce((sum: number, item: any) => sum + (item.alarms?.length || 0), 0);
        const openTickets = equipment.reduce((sum: number, item: any) => sum + (item.tickets?.length || 0), 0);
        const hasOfflineEquipment = equipment.some((item: any) => item.status === 'offline');
        const healthScore = hasOfflineEquipment ? 65 : calculateRoomHealth(temperature, actualTargetTemp);

        return {
          ...room,
          targetTemp: actualTargetTemp,
          temperature,
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
          <p className="text-on-surface-variant mt-2">Coming soon. This site does not have its Digital Twin model loaded yet.</p>
        </div>
      </div>
    );
  }

  const selectedRoom = selectedRoomId ? roomSummaries.find((r: any) => r.id === selectedRoomId) : null;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-1 bg-bg-surface border border-border-subtle rounded-lg overflow-hidden flex">
        <div className="flex-1 p-6 flex flex-col">
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

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[500px] auto-rows-max content-start">
            {roomSummaries.map((room: any) => (
              <RoomCard
                key={room.id}
                name={room.name}
                status={room.status}
                temp={Number(room.temperature.toFixed(1))}
                healthScore={room.healthScore}
                tickets={room.openTickets}
                alarms={room.activeAlarms}
                equipmentCount={room.equipmentCount}

                selected={selectedRoomId === room.id}
                onClick={() => setSelectedRoomId(room.id)}
              />
            ))}
          </div>
        </div>
        
        {selectedRoom && (
          <RoomDetailsPanel 
            room={selectedRoom} 
            onClose={() => setSelectedRoomId(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default DigitalTwinDashboard;
