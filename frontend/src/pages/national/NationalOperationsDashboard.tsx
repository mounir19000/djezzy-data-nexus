import React from 'react';
import KPICard from '../../components/ui/KPICard';
import Badge from '../../components/ui/Badge';
import { Activity, MapPin, AlertTriangle, ShieldCheck, Ticket, Wrench, CheckCircle } from 'lucide-react';
import { useDashboardMetrics } from '../../hooks/useDashboard';

const NationalOperationsDashboard = () => {
  const { data: metrics, isLoading } = useDashboardMetrics();

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
        <KPICard title="AI Diagnoses Run" value={isLoading ? '...' : metrics?.aiDiagnosesRun} icon={<Activity className="w-5 h-5 text-secondary" />} />
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
            {isLoading ? (
              <div className="text-on-surface-variant text-sm">Loading feed...</div>
            ) : metrics?.feed?.length === 0 ? (
              <div className="text-on-surface-variant text-sm italic">No recent activity.</div>
            ) : metrics?.feed?.map((item: any) => (
              <div key={item.id} className={`border-l-4 ${item.severity === 'critical' ? 'border-status-critical' : item.severity === 'warning' ? 'border-status-warning' : item.severity === 'healthy' ? 'border-status-healthy' : 'border-secondary'} bg-background p-3 rounded-r-md`}>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-sans font-medium text-on-surface">{item.title}</span>
                  <span className="text-xs font-mono text-on-surface-variant">
                    {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
