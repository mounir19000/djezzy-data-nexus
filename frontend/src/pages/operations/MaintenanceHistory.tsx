import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, History, Search, Trash2, User, Wrench, X } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { useDeleteMaintenanceTask, useMaintenanceHistory } from '../../hooks/useMaintenance';
import { useSites } from '../../hooks/useSites';
import { useAppStore } from '../../store/useAppStore';
import { displayText, formatDate, formatDateTime, reportOptions } from '../../lib/frenchLabels';

const statusForState = (state?: string): 'healthy' | 'warning' | 'critical' | 'offline' => {
  const normalized = state?.toLowerCase() || '';
  if (normalized.includes('critical')) return 'critical';
  if (normalized.includes('warning')) return 'warning';
  if (normalized.includes('healthy')) return 'healthy';
  return 'offline';
};

const MaintenanceHistory = () => {
  const user = useAppStore((state: any) => state.user);
  const { data: sites } = useSites();
  const [searchTerm, setSearchTerm] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [deleteIntent, setDeleteIntent] = useState<any | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const { data, isLoading, error } = useMaintenanceHistory(searchTerm, siteFilter);
  const deleteTask = useDeleteMaintenanceTask();
  const history = useMemo(() => data || [], [data]);
  const canDelete = ['Super Admin', 'Site Operator'].includes(user?.role || '');

  const summary = useMemo(() => {
    return history.reduce((acc: any, task: any) => {
      const state = task.report?.currentState || '';
      acc.total += 1;
      if (state.toLowerCase().includes('critical')) acc.critical += 1;
      if (state.toLowerCase().includes('warning')) acc.warning += 1;
      if (state.toLowerCase().includes('healthy')) acc.healthy += 1;
      return acc;
    }, { total: 0, healthy: 0, warning: 0, critical: 0 });
  }, [history]);

  const handleDeleteConfirm = () => {
    if (!deleteIntent) return;

    setDeleteError('');
    deleteTask.mutate(deleteIntent.id, {
      onSuccess: () => setDeleteIntent(null),
      onError: (mutationError) => setDeleteError(mutationError.message)
    });
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
          <p className="text-sm text-on-surface-variant">Interventions terminées</p>
          <div className="text-3xl font-display font-bold text-on-surface mt-2">{summary.total}</div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
          <p className="text-sm text-on-surface-variant">État sain</p>
          <div className="text-3xl font-display font-bold text-status-healthy mt-2">{summary.healthy}</div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
          <p className="text-sm text-on-surface-variant">A surveiller</p>
          <div className="text-3xl font-display font-bold text-status-warning mt-2">{summary.warning}</div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
          <p className="text-sm text-on-surface-variant">Suivi critique</p>
          <div className="text-3xl font-display font-bold text-status-critical mt-2">{summary.critical}</div>
        </div>
      </section>

      <section className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col min-h-[520px]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5">
          <h3 className="text-lg font-sans font-medium text-on-surface flex items-center gap-2 shrink-0">
            <History className="w-5 h-5 text-primary" /> Historique maintenance
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 flex-1 xl:justify-end">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Rechercher titre, équipement, site, assigné ou rapport..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full bg-background border border-border-subtle rounded-md py-2 pl-9 pr-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            {user?.role === 'Super Admin' && (
              <select
                value={siteFilter}
                onChange={(event) => setSiteFilter(event.target.value)}
                className="bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary min-w-[160px]"
              >
                <option value="">Tous les sites</option>
                {sites?.map((site: any) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-status-warning/10 border border-status-warning/30 text-status-warning rounded-md px-4 py-3 text-sm">
            {(error as Error).message}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {isLoading ? (
            <div className="text-on-surface-variant text-sm">Chargement de l’historique maintenance...</div>
          ) : history.length === 0 ? (
            <div className="bg-background border border-dashed border-border-subtle rounded-md p-8 text-center text-on-surface-variant">
              Aucun enregistrement de maintenance ne correspond à votre recherche.
            </div>
          ) : history.map((task: any) => (
            <article key={task.id} className="bg-background border border-border-subtle rounded-md p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-on-surface-variant">{task.id.substring(0, 8)}</span>
                    <Badge status={statusForState(task.report?.currentState)}>
                      {reportOptions.maintenanceStates.find((option) => option.value === task.report?.currentState)?.label || task.report?.currentState || 'Terminé'}
                    </Badge>
                  </div>
                  <h4 className="font-sans font-medium text-on-surface mt-2">{task.title}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {displayText(task.equipment?.room?.site?.name || 'Site')} / {task.equipment?.name || displayText('Equipment')} / {displayText(task.equipment?.room?.name || 'Room')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-xs text-on-surface-variant text-right">
                    <div>{formatDateTime(task.report?.createdAt || task.scheduledDate)}</div>
                    <div>Planifie le {formatDate(task.scheduledDate)}</div>
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setDeleteIntent(task)}
                      title="Supprimer l’enregistrement de maintenance"
                      aria-label={`Supprimer l’enregistrement de maintenance ${task.id.substring(0, 8)}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border-subtle text-on-surface-variant hover:border-status-critical hover:text-status-critical transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-4 text-sm">
                <div className="bg-bg-surface border border-border-subtle rounded-md p-3">
                  <p className="text-xs uppercase font-mono text-on-surface-variant mb-1 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" /> Action effectuée
                  </p>
                  <p className="text-on-surface whitespace-pre-wrap">{task.report?.actionTaken || 'Aucune action enregistree.'}</p>
                </div>
                <div className="bg-bg-surface border border-border-subtle rounded-md p-3">
                  <p className="text-xs uppercase font-mono text-on-surface-variant mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> État actuel
                  </p>
                  <p className="text-on-surface">{reportOptions.maintenanceStates.find((option) => option.value === task.report?.currentState)?.label || task.report?.currentState || 'Terminé'}</p>
                </div>
                <div className="bg-bg-surface border border-border-subtle rounded-md p-3">
                  <p className="text-xs uppercase font-mono text-on-surface-variant mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Soumis par
                  </p>
                  <p className="text-on-surface">
                    {task.report?.submitter ? `${task.report.submitter.firstName} ${task.report.submitter.lastName}` : task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Inconnu'}
                  </p>
                </div>
              </div>

              {task.report?.notes && (
                <div className="mt-3 text-sm bg-bg-surface border border-border-subtle rounded-md p-3">
                  <p className="text-xs uppercase font-mono text-on-surface-variant mb-1">Notes</p>
                  <p className="text-on-surface whitespace-pre-wrap">{task.report.notes}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {deleteIntent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-lg w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-border-subtle">
              <h3 className="text-lg font-sans font-medium text-on-surface">Supprimer l’enregistrement de maintenance</h3>
              <button onClick={() => setDeleteIntent(null)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {deleteError && (
                <div className="bg-status-critical/10 border border-status-critical/30 text-status-critical text-sm px-4 py-3 rounded-md flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}
              <p className="text-sm text-on-surface-variant">
                {deleteIntent.title} sera retiré de l’historique de maintenance.
              </p>
              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                <button type="button" onClick={() => setDeleteIntent(null)} className="px-4 py-2 rounded-md font-medium text-on-surface hover:bg-bg-secondary transition-colors">
                  Annuler
                </button>
                <button disabled={deleteTask.isPending} type="button" onClick={handleDeleteConfirm} className="bg-status-critical text-white px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> {deleteTask.isPending ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceHistory;
