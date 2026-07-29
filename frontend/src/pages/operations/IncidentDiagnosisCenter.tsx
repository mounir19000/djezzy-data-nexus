import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { AlertTriangle, Activity, Zap, Info, ArrowRight, Check, FileText } from 'lucide-react';
import { useIncidents, useAcknowledgeIncident } from '../../hooks/useIncidents';
import { useCreateTicket } from '../../hooks/useTickets';
import { useAppStore } from '../../store/useAppStore';
import { useUsers } from '../../hooks/useUsers';
import { displayOperationalText, displayStatus, displayText } from '../../lib/frenchLabels';

const IncidentDiagnosisCenter = () => {
  const { siteId: routeSiteId } = useParams();
  const [searchParams] = useSearchParams();
  const siteId = routeSiteId || searchParams.get('siteId') || undefined;
  const { data: alarms, isLoading } = useIncidents(siteId);
  const { mutate: acknowledge, isPending } = useAcknowledgeIncident();
  const { mutate: createTicket, isPending: isCreatingTicket } = useCreateTicket();
  const { data: users } = useUsers();
  const user = useAppStore((state) => state.user);
  const [selectedAlarm, setSelectedAlarm] = useState<any>(null);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [selectedEngineer, setSelectedEngineer] = useState('');

  useEffect(() => {
    if (alarms && alarms.length > 0 && (!selectedAlarm || !alarms.some((alarm: any) => alarm.id === selectedAlarm.id))) {
      setSelectedAlarm(alarms[0]);
    } else if (alarms && alarms.length === 0) {
      setSelectedAlarm(null);
    }
  }, [alarms, selectedAlarm]);

  useEffect(() => {
    setCreatedTicketId(null);
    setTicketError(null);
    setSelectedEngineer('');
  }, [selectedAlarm?.id]);

  const canCreateTicket = user?.role === 'Super Admin' || user?.role === 'Site Operator';
  const engineerOptions = users?.filter((candidate: any) => candidate.role === 'Engineer') || [];
  const openTicket = selectedAlarm?.tickets?.find((ticket: any) => !['resolved', 'closed'].includes(ticket.status));
  const diagnosis = selectedAlarm?.diagnosis;
  const expertMatches = selectedAlarm?.expertDiagnostics || [];
  const alarmTag = selectedAlarm?.normalizedAlarm?.label || selectedAlarm?.normalizedAlarm?.type;

  const handleCreateTicket = () => {
    if (!selectedAlarm || !canCreateTicket || openTicket) return;

    createTicket({
      alarmId: selectedAlarm.id,
      title: `Intervenir sur ${selectedAlarm.equipment?.name || 'équipement'} : ${selectedAlarm.description}`,
      priority: diagnosis?.priority || (selectedAlarm.severity === 'critical' ? 'high' : 'medium'),
      assignedTo: selectedEngineer || undefined
    }, {
      onSuccess: (ticket: any) => setCreatedTicketId(ticket.id),
      onError: (error: Error & { ticket?: any }) => {
        if (error.ticket?.id) {
          setCreatedTicketId(error.ticket.id);
        }
        setTicketError(error.message);
      }
    });
  };

  if (isLoading) {
    return <div className="p-8 text-on-surface">Chargement des incidents...</div>;
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Alarm Feed */}
        <div className="col-span-1 lg:col-span-5 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col h-full overflow-hidden">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-4">Alarmes SCADA du site en direct</h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {!alarms || alarms.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-border-subtle rounded-lg text-on-surface-variant">
                Aucune alarme active détectée. Système sain.
              </div>
            ) : alarms.map((alarm: any) => (
              <div 
                key={alarm.id} 
                onClick={() => setSelectedAlarm(alarm)}
                className={`p-4 rounded-lg cursor-pointer border transition-colors flex flex-col gap-3 ${selectedAlarm?.id === alarm.id ? 'bg-bg-secondary border-primary' : 'bg-background border-border-subtle hover:border-on-surface-variant'}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-on-surface-variant">{alarm.id.substring(0, 8)}</span>
                    <span className="text-xs font-mono text-on-surface-variant px-2 py-0.5 bg-bg-surface rounded">{new Date(alarm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <Badge status={alarm.severity as any}>{displayStatus(alarm.severity, true)}</Badge>
                </div>
                
                <div>
                  <h4 className="font-sans font-medium text-on-surface">{alarm.equipment?.name} - {displayOperationalText(alarm.description)}</h4>
                  <p className="text-sm text-on-surface-variant mt-1 font-mono">Emplacement : {displayText(alarm.equipment?.room?.name || 'Unknown')}</p>
                  {alarm.normalizedAlarm?.label && (
                    <p className="text-xs text-secondary mt-2 font-mono">{alarm.normalizedAlarm.label}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 text-secondary text-sm font-medium">
                    <Activity className="w-4 h-4" />
                    <span>{alarm.tickets?.length ? 'Ticket lié' : alarm.diagnosis?.ruleId ? `Règle ${alarm.diagnosis.ruleId}` : 'Diagnostic expert disponible'}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); acknowledge(alarm.id); }}
                    disabled={isPending}
                    className="text-xs flex items-center gap-1 bg-status-healthy/10 text-status-healthy px-2 py-1 rounded hover:bg-status-healthy/20 transition-colors"
                  >
                    <Check className="w-3 h-3" /> Acquitter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnosis Workspace */}
        <div className="col-span-1 lg:col-span-7 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col h-full overflow-hidden">
          {!selectedAlarm ? (
             <div className="flex items-center justify-center h-full text-on-surface-variant">Sélectionnez une alarme pour afficher le diagnostic expert.</div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6 border-b border-border-subtle pb-4">
                <h3 className="text-lg font-sans font-medium text-on-surface flex items-center gap-2">
                  <Zap className="w-5 h-5 text-secondary" />
                  Diagnostic expert basé sur les règles
                </h3>
                <div className="flex items-center gap-2">
                  {diagnosis?.ruleId && <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 rounded px-2 py-1">{diagnosis.ruleId}</span>}
                  {diagnosis?.faultId && <span className="text-xs font-mono text-on-surface-variant bg-background border border-border-subtle rounded px-2 py-1">{diagnosis.faultId}</span>}
                  <span className="text-sm font-mono text-on-surface-variant">Pour {selectedAlarm.id.substring(0, 8)}</span>
                </div>
              </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            <div>
              <h4 className="text-sm font-mono text-on-surface-variant uppercase tracking-wider mb-2">Problème détecté</h4>
              <p className="text-lg font-sans font-medium text-on-surface">{displayOperationalText(diagnosis?.problem || selectedAlarm.description)}</p>
              <p className="text-sm text-on-surface-variant mt-1">{displayOperationalText(selectedAlarm.description)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {diagnosis?.ruleName && (
                  <span className="text-xs font-mono rounded-md border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-secondary">{diagnosis.ruleName}</span>
                )}
                {diagnosis?.category && (
                  <span className="text-xs font-mono rounded-md border border-border-subtle bg-background px-2.5 py-1 text-on-surface-variant">{diagnosis.category}</span>
                )}
                {alarmTag && (
                  <span className="text-xs font-mono rounded-md border border-border-subtle bg-background px-2.5 py-1 text-on-surface-variant">{alarmTag}</span>
                )}
              </div>
            </div>

            {(diagnosis?.alarmNames?.length || 0) > 0 && (
              <div className="bg-background border border-border-subtle p-4 rounded-lg">
                <h4 className="text-sm font-mono text-on-surface-variant uppercase tracking-wider mb-3">Schéma d’alarme reconnu</h4>
                <div className="flex flex-wrap gap-2">
                  {diagnosis.alarmNames.map((alarmName: string) => (
                    <span key={alarmName} className="text-xs rounded-md border border-border-subtle bg-bg-surface px-2.5 py-1 text-on-surface">{alarmName}</span>
                  ))}
                </div>
                {expertMatches.length > 1 && (
                  <p className="text-xs text-on-surface-variant mt-3">{expertMatches.length} règles expertes correspondent actuellement à ce contexte d’alarme ; affichage de celle avec la priorité la plus élevée.</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background border border-border-subtle p-4 rounded-lg">
                <h4 className="text-sm font-mono text-status-warning uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Causes probables
                </h4>
                <ul className="list-disc list-inside text-sm text-on-surface space-y-1">
                  {(diagnosis?.probableCauses || []).map((cause: string) => <li key={cause}>{displayOperationalText(cause)}</li>)}
                </ul>
              </div>

              <div className="bg-background border border-border-subtle p-4 rounded-lg">
                <h4 className="text-sm font-mono text-status-critical uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Impacts opérationnels
                </h4>
                <ul className="list-disc list-inside text-sm text-on-surface space-y-1">
                  {(diagnosis?.operationalImpacts || []).map((impact: string) => <li key={impact}>{displayOperationalText(impact)}</li>)}
                </ul>
              </div>
            </div>

            <div className="bg-bg-secondary p-5 rounded-lg border-l-4 border-primary">
              <h4 className="text-sm font-mono text-primary uppercase tracking-wider mb-3">Actions recommandees</h4>
              <ol className="list-decimal list-inside text-sm text-on-surface space-y-2">
                {(diagnosis?.recommendedActions || []).map((action: string) => <li key={action}>{displayOperationalText(action)}</li>)}
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background border border-border-subtle p-4 rounded-lg">
                <h4 className="text-sm font-mono text-on-surface-variant uppercase tracking-wider mb-2">Justification technique</h4>
                <p className="text-sm text-on-surface">{displayOperationalText(diagnosis?.technicalJustification)}</p>
              </div>
              <div className="bg-background border border-border-subtle p-4 rounded-lg">
                <h4 className="text-sm font-mono text-on-surface-variant uppercase tracking-wider mb-2">Conditions de retour à la normale</h4>
                <ul className="list-disc list-inside text-sm text-on-surface space-y-1">
                  {(diagnosis?.recoveryConditions || []).map((condition: string) => <li key={condition}>{displayOperationalText(condition)}</li>)}
                </ul>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <div className="flex flex-col gap-1 text-sm text-on-surface-variant">
                <span className="flex items-center gap-2"><Info className="w-4 h-4" /> Confiance : {diagnosis?.confidence || 0}%</span>
                <span>Contact : {(diagnosis?.contacts || [diagnosis?.contactPerson || 'Ingénieur du site']).map((contact: string) => displayOperationalText(contact)).join(' > ')}</span>
                {diagnosis?.ruleId && (
                  <Link to={`/knowledge?search=${encodeURIComponent(diagnosis.ruleId)}`} className="flex items-center gap-2 text-secondary hover:text-primary transition-colors">
                    <FileText className="w-4 h-4" /> Ouvrir l’article de connaissance {diagnosis.ruleId}
                  </Link>
                )}
                {(openTicket || createdTicketId) && (
                  <span className="flex items-center gap-2 text-primary">
                    <FileText className="w-4 h-4" /> Ticket {openTicket?.id?.substring(0, 8) || createdTicketId?.substring(0, 8)} lié
                  </span>
                )}
                {ticketError && <span className="text-status-warning">{ticketError}</span>}
              </div>
              <div className="flex items-center gap-3">
                {canCreateTicket && !openTicket && !createdTicketId && (
                  <select
                    value={selectedEngineer}
                    onChange={(event) => setSelectedEngineer(event.target.value)}
                    className="bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="">Non assigné</option>
                    {engineerOptions.map((engineer: any) => (
                      <option key={engineer.id} value={engineer.id}>{engineer.firstName} {engineer.lastName}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={handleCreateTicket}
                  disabled={!canCreateTicket || !!openTicket || isCreatingTicket}
                  className="bg-primary text-on-primary px-6 py-2 rounded-md font-sans font-medium flex items-center gap-2 hover:bg-primary-fixed-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {openTicket || createdTicketId ? 'Ticket créé' : isCreatingTicket ? 'Création du ticket...' : 'Créer un ticket actionnable'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentDiagnosisCenter;
