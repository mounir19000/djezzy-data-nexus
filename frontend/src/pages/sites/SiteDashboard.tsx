import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { useSiteDashboard } from '../../hooks/useSites';
import { displayOperationalText, displayStatus, displayText } from '../../lib/frenchLabels';

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
  healthy: 'Sain',
  warning: 'Avertissement',
  critical: 'Critique'
};

const uniqueItems = (items: string[]) => [...new Set(items.filter(Boolean))];

const SiteDashboard = () => {
  const { siteId } = useParams();
  const { data, isLoading, isError } = useSiteDashboard(siteId);

  if (isLoading) {
    return (
      <div className="h-full min-h-[560px] bg-bg-surface border border-border-subtle rounded-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-display font-bold text-on-surface">Chargement du tableau de bord site</h2>
          <p className="text-on-surface-variant mt-2">Chargement du dernier état du site...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-full min-h-[560px] bg-bg-surface border border-border-subtle rounded-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-display font-bold text-status-critical">Tableau de bord site indisponible</h2>
          <p className="text-on-surface-variant mt-2">Le site sélectionné n’a pas pu être chargé.</p>
        </div>
      </div>
    );
  }

  const { site, health, summary, alarms, tickets } = data;
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
          <h2 className="text-2xl font-display font-bold text-on-surface">{displayText(site.name)} Tableau de bord</h2>
          <p className="text-on-surface-variant mt-3">Bientôt disponible. Ce site n’a pas encore de modèle opérationnel, de télémétrie ou d’alarmes chargés.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={`bg-bg-surface border ${healthTone.border} rounded-lg p-6 xl:col-span-2 overflow-hidden relative`}>
          <div className="absolute inset-x-0 top-0 h-1 bg-border-subtle">
            <div className={`h-full ${healthTone.bar}`} style={{ width: `${Math.max(4, health.score)}%` }} />
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-on-surface-variant">Santé du site</p>
                <h3 className="text-2xl font-display font-bold text-on-surface mt-1">{statusLabel[healthStatus]}</h3>
              </div>

              <div>
                <p className="text-xs uppercase text-on-surface-variant font-mono">Causes principales</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(healthCauses.length > 0 ? healthCauses : ['No active causes detected.']).map((cause) => (
                    <span key={cause} className={`inline-flex items-center gap-2 rounded-md border ${healthTone.border} ${healthTone.bg} px-3 py-2 text-sm text-on-surface`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${healthTone.bar}`} />
                      {displayOperationalText(cause)}
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
              <p className="text-sm text-on-surface-variant">Alarmes actives</p>
              <div className="text-5xl font-display font-bold text-on-surface mt-3">{summary.activeAlarms}</div>
            </div>
            <div className="w-11 h-11 rounded-md bg-status-critical/10 border border-status-critical/30 grid place-items-center">
              <AlertTriangle className="w-5 h-5 text-status-critical" />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md border border-status-critical/30 bg-status-critical/10 text-status-critical">{alarmCounts.critical || 0} critiques</span>
            <span className="px-2.5 py-1 rounded-md border border-status-warning/30 bg-status-warning/10 text-status-warning">{alarmCounts.warning || 0} avertissements</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Open Tickets */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-sans font-medium text-on-surface">Tickets ouverts</h3>
              <p className="text-sm text-on-surface-variant mt-1">Tickets actifs recents.</p>
            </div>
            <Link to={`/sites/${site.id}/tickets`} className="text-xs text-primary hover:underline">Tout voir</Link>
          </div>
          <div className="space-y-3 flex-1">
            {tickets.filter((t: any) => !['resolved', 'closed'].includes(t.status)).slice(0, 5).length === 0 ? (
              <div className="bg-background border border-border-subtle rounded-md p-4 text-sm text-on-surface-variant flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-status-healthy" /> Aucun ticket ouvert.
              </div>
            ) : tickets.filter((t: any) => !['resolved', 'closed'].includes(t.status)).slice(0, 5).map((ticket: any) => (
              <div key={ticket.id} className="bg-background border border-border-subtle rounded-md p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-on-surface truncate">{ticket.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-1 truncate">
                      {ticket.equipment?.name} / {displayText(ticket.equipment?.room?.name)}
                    </p>
                  </div>
                  <Badge status={ticket.priority === 'high' ? 'critical' : ticket.priority === 'medium' ? 'warning' : 'healthy'}>{displayStatus(ticket.status)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* Alarms */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-sans font-medium text-on-surface">Alarmes</h3>
              <p className="text-sm text-on-surface-variant mt-1">Causes actuelles à examiner.</p>
            </div>
            <Link to={`/sites/${site.id}/incidents`} className="text-xs text-primary hover:underline">Centre incidents</Link>
          </div>
          <div className="space-y-3 flex-1">
            {alarms.length === 0 ? (
              <div className="bg-background border border-border-subtle rounded-md p-4 text-sm text-on-surface-variant flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-status-healthy" /> Aucune alarme active.
              </div>
            ) : alarms.slice(0, 5).map((alarm: any) => (
              <div key={alarm.id} className="bg-background border border-border-subtle rounded-md p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-on-surface truncate">{displayOperationalText(alarm.description)}</h4>
                    <p className="text-xs text-on-surface-variant mt-1 truncate">{alarm.equipment?.name} / {displayText(alarm.equipment?.room?.name)}</p>
                  </div>
                  <Badge status={alarm.severity}>{displayStatus(alarm.severity, true)}</Badge>
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
