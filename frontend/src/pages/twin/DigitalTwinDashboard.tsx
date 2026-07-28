import React, { useState } from 'react';
import RoomCard from '../../components/twin/RoomCard';
import Badge from '../../components/ui/Badge';
import { useTelemetryStore } from '../../store/useTelemetryStore';

const DigitalTwinDashboard = () => {
  const [activeTab, setActiveTab] = useState<'physical' | 'power'>('physical');
  const equipmentData = useTelemetryStore(state => state.equipmentData);

  // Helper to extract metrics safely
  const getMetrics = (eqName: string) => {
    const eq = Object.values(equipmentData).find(e => e.equipmentName === eqName);
    return eq?.metrics;
  };

  const upsMetrics = getMetrics('UPS-A');
  const battMetrics = getMetrics('BATT-BANK-A');

  const upsTemp = upsMetrics?.temperature || 27.5;
  const upsHum = upsMetrics?.humidity || 45;
  
  const battTemp = battMetrics?.temperature || 22.1;
  const battHum = battMetrics?.humidity || 40;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">MSC10 Blida Digital Twin</h2>
          <p className="text-on-surface-variant font-sans mt-1">Interactive facility model and live telemetry.</p>
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
            {upsTemp > 25 && <Badge status="warning">UPS Room Temp Warning</Badge>}
          </div>
          
          {/* Functional CSS Grid Layout as Floor Plan */}
          <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-4 min-h-[500px]">
            <RoomCard name="UPS Room" status={upsTemp > 25 ? 'warning' : 'healthy'} temp={upsTemp} humidity={upsHum} tickets={1} alarms={upsTemp > 25 ? 1 : 0} className="col-span-2 row-span-1" />
            <RoomCard name="Battery Room" status={battTemp > 25 ? 'warning' : 'healthy'} temp={battTemp} humidity={battHum} tickets={0} alarms={0} className="col-span-1 row-span-2" />
            <RoomCard name="Switch Room" status="healthy" temp={21.0} humidity={38} tickets={0} alarms={0} className="col-span-1 row-span-1" />
            <RoomCard name="ENR Room" status="healthy" temp={23.5} humidity={42} tickets={0} alarms={0} className="col-span-1 row-span-1" />
            <RoomCard name="V-SAT Room" status="healthy" temp={24.0} humidity={41} tickets={0} alarms={0} className="col-span-1 row-span-1" />
            
            <RoomCard name="Generator Area" status="healthy" temp={30.2} humidity={35} tickets={0} alarms={0} className="col-span-2 row-span-1" />
            <RoomCard name="Electrical Room" status="critical" temp={35.1} humidity={50} tickets={2} alarms={1} className="col-span-1 row-span-1" />
            <RoomCard name="Cooling Systems" status="healthy" temp={18.0} humidity={60} tickets={1} alarms={0} className="col-span-1 row-span-1" />
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-bg-surface border border-border-subtle rounded-lg p-6 flex items-center justify-center">
          <p className="text-on-surface-variant font-mono">React Flow topology will be rendered here. (See Power Flow component)</p>
        </div>
      )}
    </div>
  );
};

export default DigitalTwinDashboard;
