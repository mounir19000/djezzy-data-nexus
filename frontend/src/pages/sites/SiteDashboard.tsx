import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Activity, AlertTriangle, BatteryCharging, CheckCircle, ChevronDown, Server, ThermometerSun, Zap } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { useSiteDashboard } from '../../hooks/useSites';

const statusForScore = (score: number): 'healthy' | 'warning' | 'critical' => {
  if (score >= 90) return 'healthy';
  if (score >= 70) return 'warning';
  return 'critical';
};

const toneForStatus = {
  healthy: {
    text: 'text-status-healthy',
    border: 'border-status-healthy/40',
    bg: 'bg-status-healthy/10',
    bar: 'bg-status-healthy',
    ring: 'rgba(34, 197, 94, 0.95)'
  },
  warning: {
    text: 'text-status-warning',
    border: 'border-status-warning/40',
    bg: 'bg-status-warning/10',
    bar: 'bg-status-warning',
    ring: 'rgba(245, 158, 11, 0.95)'
  },
  critical: {
    text: 'text-status-critical',
    border: 'border-status-critical/40',
    bg: 'bg-status-critical/10',
    bar: 'bg-status-critical',
    ring: 'rgba(239, 68, 68, 0.95)'
  }
};

const statusLabel = {
  healthy: 'Healthy',
  warning: 'Needs attention',
  critical: 'Critical'
};

const uniqueItems = (items: string[]) => [...new Set(items.filter(Boolean))];

const causesFor = (component: any) => {
  const causes = uniqueItems(component.causes || []);
  return causes.length > 0 ? causes : ['No active causes detected.'];
};

const iconForComponent = (component: any) => {
  const name = `${component.name} ${component.type}`.toLowerCase();

  if (name.includes('ups')) return Zap;
  if (name.includes('battery')) return BatteryCharging;
  if (name.includes('switch') || name.includes('vsat') || name.includes('enr')) return Server;
  if (name.includes('room')) return ThermometerSun;

  return Activity;
};

const SiteDashboard = () => {
  const { siteId } = useParams();
  const { data, isLoading, isError } = useSiteDashboard(siteId);
  const [expandedComponentId, setExpandedComponentId] = useState<string | null>(null);

  const sortedComponents = useMemo(() => {
    return [...(data?.health?.components || [])].sort((a: any, b: any) => a.score - b.score);
  }, [data?.health?.components]);

  if (isLoading) {
    return (
      <div className="h-full min-h-[560px] bg-bg-surface border border-border-subtle rounded-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-display font-bold text-on-surface">Loading Site Dashboard</h2>
          <p className="text-on-surface-variant mt-2">Loading latest site status...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-full min-h-[560px] bg-bg-surface border border-border-subtle rounded-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-display font-bold text-status-critical">Site Dashboard Unavailable</h2>
          <p className="text-on-surface-variant mt-2">The selected site could not be loaded.</p>
        </div>
      </div>
    );
  }

  const { site, health, summary, alarms } = data;
  const healthStatus = statusForScore(health.score);
  const healthTone = toneForStatus[healthStatus];
  const healthCauses = uniqueItems(health.causes || []);
  const alarmCounts = alarms.reduce((counts: Record<string, number>, alarm: any) => {
    counts[alarm.severity] = (counts[alarm.severity] || 0) + 1;
    return counts;
  }, {});

  if ((health.components?.length || 0) === 0) {
    return (
      <div className="h-full min-h-[560px] bg-bg-surface border border-border-subtle rounded-lg p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-display font-bold text-on-surface">{site.name} Dashboard</h2>
          <p className="text-on-surface-variant mt-3">Coming soon. This site does not have its operational model, telemetry, or alarms loaded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">{site.name} Dashboard</h2>
          <p className="text-on-surface-variant font-sans mt-1">{site.location} operational health and active alarms.</p>
        </div>
        <Badge status={healthStatus}>{statusLabel[healthStatus]}</Badge>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={`bg-bg-surface border ${healthTone.border} rounded-lg p-6 xl:col-span-2 overflow-hidden relative`}>
          <div className="absolute inset-x-0 top-0 h-1 bg-border-subtle">
            <div className={`h-full ${healthTone.bar}`} style={{ width: `${Math.max(4, health.score)}%` }} />
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-on-surface-variant">Site Health</p>
                <h3 className="text-2xl font-display font-bold text-on-surface mt-1">{statusLabel[healthStatus]}</h3>
              </div>

              <div>
                <p className="text-xs uppercase text-on-surface-variant font-mono">Main Causes</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(healthCauses.length > 0 ? healthCauses : ['No active causes detected.']).map((cause) => (
                    <span key={cause} className={`inline-flex items-center gap-2 rounded-md border ${healthTone.border} ${healthTone.bg} px-3 py-2 text-sm text-on-surface`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${healthTone.bar}`} />
                      {cause}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="w-36 h-36 rounded-full grid place-items-center shrink-0"
              style={{ background: `conic-gradient(${healthTone.ring} ${health.score * 3.6}deg, rgba(51, 65, 85, 0.75) 0deg)` }}
            >
              <div className="w-[116px] h-[116px] rounded-full bg-background border border-border-subtle grid place-items-center">
                <div className="text-center">
                  <div className="text-4xl font-display font-bold text-on-surface">{health.score}%</div>
                  <div className={`text-xs font-mono mt-1 ${healthTone.text}`}>score</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Active Alarms</p>
              <div className="text-5xl font-display font-bold text-on-surface mt-3">{summary.activeAlarms}</div>
            </div>
            <div className="w-11 h-11 rounded-md bg-status-critical/10 border border-status-critical/30 grid place-items-center">
              <AlertTriangle className="w-5 h-5 text-status-critical" />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md border border-status-critical/30 bg-status-critical/10 text-status-critical">{alarmCounts.critical || 0} critical</span>
            <span className="px-2.5 py-1 rounded-md border border-status-warning/30 bg-status-warning/10 text-status-warning">{alarmCounts.warning || 0} warning</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 xl:col-span-2">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-sans font-medium text-on-surface">Health Scores</h3>
              <p className="text-sm text-on-surface-variant mt-1">Scores and active causes by component.</p>
            </div>
          </div>
          {sortedComponents.length === 0 ? (
            <div className="text-sm text-on-surface-variant bg-background border border-border-subtle rounded-md p-4">
              No room or UPS model has been configured for this site yet.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedComponents.map((component: any) => {
                const expanded = expandedComponentId === component.id;
                const componentStatus = statusForScore(component.score);
                const componentTone = toneForStatus[componentStatus];
                const Icon = iconForComponent(component);
                const causes = causesFor(component);

                return (
                  <div key={component.id} className={`bg-background border rounded-lg overflow-hidden transition-colors ${expanded ? componentTone.border : 'border-border-subtle'}`}>
                    <button
                      type="button"
                      className="w-full text-left p-4 hover:bg-bg-surface/60 transition-colors"
                      aria-expanded={expanded}
                      onClick={() => setExpandedComponentId(expanded ? null : component.id)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-md ${componentTone.bg} ${componentTone.text} border ${componentTone.border} grid place-items-center shrink-0`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-medium text-on-surface truncate">{component.name}</h4>
                            <p className="text-xs text-on-surface-variant mt-1 truncate">{component.summary || causes[0]}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-xl font-display font-bold text-on-surface">{component.score}%</div>
                            <div className={`text-[11px] font-mono ${componentTone.text}`}>{statusLabel[componentStatus]}</div>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      <div className="mt-4 h-1.5 bg-bg-surface rounded-full overflow-hidden">
                        <div
                          className={`h-full ${componentTone.bar}`}
                          style={{ width: `${Math.max(4, component.score)}%` }}
                        />
                      </div>
                    </button>

                    {expanded && (
                      <div className="border-t border-border-subtle px-4 py-4">
                        <p className="text-xs uppercase text-on-surface-variant font-mono">Causes</p>
                        <div className="mt-3 space-y-2">
                          {causes.map((cause) => (
                            <div key={cause} className="flex items-start gap-2 text-sm text-on-surface">
                              <span className={`w-1.5 h-1.5 rounded-full mt-2 ${componentTone.bar}`} />
                              <span>{cause}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-sans font-medium text-on-surface">Alarms</h3>
              <p className="text-sm text-on-surface-variant mt-1">Current causes needing review.</p>
            </div>
            <Link to="/incidents" className="text-xs text-primary hover:underline">Incident Center</Link>
          </div>
          <div className="space-y-3">
            {alarms.length === 0 ? (
              <div className="bg-background border border-border-subtle rounded-md p-4 text-sm text-on-surface-variant flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-status-healthy" /> No active alarms.
              </div>
            ) : alarms.map((alarm: any) => (
              <div key={alarm.id} className="bg-background border border-border-subtle rounded-md p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-on-surface">{alarm.description}</h4>
                    <p className="text-xs text-on-surface-variant mt-1 truncate">{alarm.equipment?.name} / {alarm.equipment?.room?.name}</p>
                  </div>
                  <Badge status={alarm.severity}>{alarm.severity.toUpperCase()}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDashboard;
