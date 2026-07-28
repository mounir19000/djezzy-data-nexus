import { useMemo } from 'react';
import KPICard from '../../components/ui/KPICard';
import Badge from '../../components/ui/Badge';
import { Activity, AlertTriangle, Ticket } from 'lucide-react';
import { useDashboardMetrics } from '../../hooks/useDashboard';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const statusForHealth = (health: number): 'healthy' | 'warning' | 'critical' => {
  if (health >= 90) return 'healthy';
  if (health >= 70) return 'warning';
  return 'critical';
};

const markerIcon = (status: 'healthy' | 'warning' | 'critical') => L.divIcon({
  className: '',
  html: `<span style="display:block;width:18px;height:18px;border-radius:999px;background:${status === 'healthy' ? '#22C55E' : status === 'warning' ? '#F59E0B' : '#EF4444'};border:2px solid #0F1115;box-shadow:0 0 0 4px rgba(255,255,255,0.12)"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const NationalOperationsDashboard = () => {
  const { data: metrics, isLoading } = useDashboardMetrics();
  const liveFeed = metrics?.feed || [];
  const sites = metrics?.sites || [];
  const rankedSites = useMemo(() => [...sites].sort((a: any, b: any) => a.overallHealth - b.overallHealth), [sites]);

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
        <KPICard title="Critical Sites" value={isLoading ? '...' : metrics?.criticalSites} icon={<AlertTriangle className="w-5 h-5 text-status-critical" />} />
        <KPICard title="Active Incidents" value={isLoading ? '...' : metrics?.activeIncidents} icon={<AlertTriangle className="w-5 h-5 text-status-critical" />} />
        <KPICard title="Open Tickets" value={isLoading ? '...' : metrics?.openTickets} icon={<Ticket className="w-5 h-5" />} />
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
              {sites.filter((site: any) => site.latitude && site.longitude).map((site: any) => {
                const status = statusForHealth(site.overallHealth);
                return (
                  <Marker key={site.id} position={[site.latitude, site.longitude]} icon={markerIcon(status)}>
                    <Popup>
                      <strong>{site.name}</strong><br />
                      Health: {site.overallHealth}%<br />
                      <a href={`/sites/${site.id}/dashboard`}>Open Site Dashboard</a>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col h-[500px]">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-4">Live Incident Feed</h3>
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

      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <h3 className="text-lg font-sans font-medium text-on-surface mb-4">Site Health Ranking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rankedSites.map((site: any) => (
            <div key={site.id} className="bg-background border border-border-subtle rounded-md p-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-on-surface">{site.name}</h4>
                <p className="text-xs font-mono text-on-surface-variant">{site.location}</p>
              </div>
              <Badge status={statusForHealth(site.overallHealth)}>{site.overallHealth}%</Badge>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default NationalOperationsDashboard;
