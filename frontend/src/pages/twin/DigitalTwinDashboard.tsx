import React, { useState } from 'react';
import RoomCard from '../../components/twin/RoomCard';
import Badge from '../../components/ui/Badge';

const DigitalTwinDashboard = () => {
  const [activeTab, setActiveTab] = useState<'physical' | 'power'>('physical');

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
            <Badge status="warning">UPS Room Temp Warning</Badge>
          </div>
          
          {/* Functional CSS Grid Layout as Floor Plan */}
          <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-4 min-h-[500px]">
            <RoomCard name="UPS Room" status="warning" temp={27.5} humidity={45} tickets={1} alarms={2} className="col-span-2 row-span-1" />
            <RoomCard name="Battery Room" status="healthy" temp={22.1} humidity={40} tickets={0} alarms={0} className="col-span-1 row-span-2" />
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
