import React, { useState, useEffect } from 'react';
import KPICard from '../../components/ui/KPICard';
import Badge from '../../components/ui/Badge';
import { Activity, MapPin, AlertTriangle, ShieldCheck, Ticket, Wrench, CheckCircle } from 'lucide-react';
import { useDashboardMetrics } from '../../hooks/useDashboard';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon issue in react
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SIMULATED_FEED_DATA = [
  { id: 'sim-1', type: 'alarm', title: 'Site MSC10 Blida - WARNING', description: 'UPS-A temperature approaching threshold (24.5°C)', severity: 'warning' },
  { id: 'sim-2', type: 'ticket', title: 'Ticket TKT-8921 Updated', description: 'Ticket status is now inProgress.', severity: 'secondary' },
  { id: 'sim-3', type: 'alarm', title: 'Site MSC01 Algiers - CRITICAL', description: 'Main Grid Power Loss Detected', severity: 'critical' },
  { id: 'sim-4', type: 'alarm', title: 'Site MSC10 Blida - HEALTHY', description: 'Generator auto-start successful', severity: 'healthy' },
  { id: 'sim-5', type: 'ticket', title: 'Ticket TKT-8804 Resolved', description: 'Battery bank B replaced successfully.', severity: 'healthy' },
];

const NationalOperationsDashboard = () => {
  const { data: metrics, isLoading } = useDashboardMetrics();
  const [liveFeed, setLiveFeed] = useState<any[]>([]);

  // Simulate real-time data stream
  useEffect(() => {
    if (metrics?.feed) {
      setLiveFeed(metrics.feed); // Initialize with backend feed
    }
    
    let index = 0;
    const interval = setInterval(() => {
      const newItem = { ...SIMULATED_FEED_DATA[index % SIMULATED_FEED_DATA.length], time: new Date().toISOString(), id: `sim-${Date.now()}` };
      setLiveFeed((prev) => [newItem, ...prev].slice(0, 50)); // Keep last 50 items
      index++;
    }, 4000); // New item every 4 seconds

    return () => clearInterval(interval);
  }, [metrics?.feed]);

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
        <KPICard title="Overall Health Score" value={isLoading ? '...' : `${metrics?.overallHealthScore}%`} trend="1.2%" trendUp={true} icon={<Activity className="w-5 h-5" />} />
        <KPICard title="Total Sites" value={isLoading ? '...' : metrics?.totalSites} icon={<MapPin className="w-5 h-5" />} />
        <KPICard title="Healthy Sites" value={isLoading ? '...' : metrics?.healthySites} icon={<ShieldCheck className="w-5 h-5 text-status-healthy" />} />
        <KPICard title="Critical Sites" value={isLoading ? '...' : metrics?.criticalSites} trend="1 Site Fixed" trendUp={true} icon={<AlertTriangle className="w-5 h-5 text-status-critical" />} />
        
        <KPICard title="Open Tickets" value={isLoading ? '...' : metrics?.openTickets} trend="5 New Today" trendUp={false} icon={<Ticket className="w-5 h-5" />} />
        <KPICard title="Pending Maintenance" value={isLoading ? '...' : metrics?.pendingMaintenance} icon={<Wrench className="w-5 h-5" />} />
        <KPICard title="Closed Tickets Today" value={isLoading ? '...' : metrics?.closedTicketsToday} icon={<CheckCircle className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-lg p-6 min-h-[500px] flex flex-col">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-4">Algeria Infrastructure Map</h3>
          <div className="flex-1 border-2 border-border-subtle rounded-lg overflow-hidden relative z-0">
            <MapContainer center={[36.7538, 3.0588]} zoom={6} className="h-full w-full">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[36.4700, 2.8277]}>
                <Popup>
                  <strong>MSC10 Blida</strong><br />Health: 92.5%
                </Popup>
              </Marker>
              <Marker position={[36.7538, 3.0588]}>
                <Popup>
                  <strong>MSC01 Algiers</strong><br />Health: 98.0%
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col h-[500px]">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-4">Live Incident Feed (Simulated)</h3>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {isLoading && liveFeed.length === 0 ? (
              <div className="text-on-surface-variant text-sm">Loading feed...</div>
            ) : liveFeed.length === 0 ? (
              <div className="text-on-surface-variant text-sm italic">No recent activity.</div>
            ) : liveFeed.map((item: any) => (
              <div key={item.id} className={`border-l-4 ${item.severity === 'critical' ? 'border-status-critical' : item.severity === 'warning' ? 'border-status-warning' : item.severity === 'healthy' ? 'border-status-healthy' : 'border-secondary'} bg-background p-3 rounded-r-md transition-all duration-300 animate-in fade-in slide-in-from-top-4`}>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-sans font-medium text-on-surface">{item.title}</span>
                  <span className="text-xs font-mono text-on-surface-variant shrink-0 ml-2">
                    {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default NationalOperationsDashboard;
