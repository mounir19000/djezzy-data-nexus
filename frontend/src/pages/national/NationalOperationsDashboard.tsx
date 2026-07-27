import React from 'react';
import KPICard from '../../components/ui/KPICard';
import Badge from '../../components/ui/Badge';
import { Activity, MapPin, AlertTriangle, ShieldCheck, Ticket, Wrench, CheckCircle } from 'lucide-react';

const NationalOperationsDashboard = () => {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">National Operations</h2>
          <p className="text-on-surface-variant font-sans mt-1">Real-time overview of all Djezzy infrastructure.</p>
        </div>
        <Badge status="healthy">Live Data Feed Active</Badge>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Overall Health Score" value="94.2%" trend="1.2%" trendUp={true} icon={<Activity className="w-5 h-5" />} />
        <KPICard title="Total Sites" value="1,248" icon={<MapPin className="w-5 h-5" />} />
        <KPICard title="Healthy Sites" value="1,192" icon={<ShieldCheck className="w-5 h-5 text-status-healthy" />} />
        <KPICard title="Critical Sites" value="3" trend="1 Site Fixed" trendUp={true} icon={<AlertTriangle className="w-5 h-5 text-status-critical" />} />
        
        <KPICard title="Open Tickets" value="47" trend="5 New Today" trendUp={false} icon={<Ticket className="w-5 h-5" />} />
        <KPICard title="Pending Maintenance" value="112" icon={<Wrench className="w-5 h-5" />} />
        <KPICard title="Closed Tickets Today" value="14" icon={<CheckCircle className="w-5 h-5" />} />
        <KPICard title="AI Diagnoses Run" value="8,401" icon={<Activity className="w-5 h-5 text-secondary" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-lg p-6 min-h-[500px] flex flex-col">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-4">Algeria Infrastructure Map</h3>
          <div className="flex-1 border-2 border-dashed border-border-subtle rounded-lg flex items-center justify-center bg-background">
            <p className="text-on-surface-variant font-mono">Interactive Map Rendered Here (GL/Leaflet)</p>
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-4">Live Incident Feed</h3>
          <div className="flex-1 space-y-4 overflow-y-auto">
            {/* Feed Item 1 */}
            <div className="border-l-4 border-status-critical bg-background p-3 rounded-r-md">
              <div className="flex justify-between items-start">
                <span className="text-sm font-sans font-medium text-on-surface">MSC10 Blida - UPS Bypass</span>
                <span className="text-xs font-mono text-on-surface-variant">2m ago</span>
              </div>
              <p className="text-sm text-on-surface-variant mt-1">UPS2 has entered bypass mode due to sync failure.</p>
            </div>
            {/* Feed Item 2 */}
            <div className="border-l-4 border-status-warning bg-background p-3 rounded-r-md">
              <div className="flex justify-between items-start">
                <span className="text-sm font-sans font-medium text-on-surface">Site Oran_04 - High Temp</span>
                <span className="text-xs font-mono text-on-surface-variant">15m ago</span>
              </div>
              <p className="text-sm text-on-surface-variant mt-1">Battery room temp rising above 28°C threshold.</p>
            </div>
             {/* Feed Item 3 */}
             <div className="border-l-4 border-secondary bg-background p-3 rounded-r-md">
              <div className="flex justify-between items-start">
                <span className="text-sm font-sans font-medium text-on-surface">AI Expert Diagnosis</span>
                <span className="text-xs font-mono text-on-surface-variant">22m ago</span>
              </div>
              <p className="text-sm text-on-surface-variant mt-1">Generated diagnosis for MSC10 UPS sync failure. Recommended action: Check inverter phase.</p>
            </div>
            {/* Feed Item 4 */}
            <div className="border-l-4 border-status-healthy bg-background p-3 rounded-r-md">
              <div className="flex justify-between items-start">
                <span className="text-sm font-sans font-medium text-on-surface">Ticket #4012 Resolved</span>
                <span className="text-xs font-mono text-on-surface-variant">1h ago</span>
              </div>
              <p className="text-sm text-on-surface-variant mt-1">Engineer Karim closed cooling unit maintenance.</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default NationalOperationsDashboard;
