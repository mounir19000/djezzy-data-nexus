import React, { useState, useEffect } from 'react';
import Badge from '../../components/ui/Badge';
import { AlertTriangle, Activity, Zap, Info, ArrowRight, Check } from 'lucide-react';
import { useIncidents, useAcknowledgeIncident } from '../../hooks/useIncidents';

const IncidentDiagnosisCenter = () => {
  const { data: alarms, isLoading } = useIncidents();
  const { mutate: acknowledge, isPending } = useAcknowledgeIncident();
  const [selectedAlarm, setSelectedAlarm] = useState<any>(null);

  useEffect(() => {
    if (alarms && alarms.length > 0 && !selectedAlarm) {
      setSelectedAlarm(alarms[0]);
    } else if (alarms && alarms.length === 0) {
      setSelectedAlarm(null);
    }
  }, [alarms, selectedAlarm]);

  if (isLoading) {
    return <div className="p-8 text-on-surface">Loading incidents...</div>;
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <header>
        <h2 className="text-3xl font-display font-bold text-on-surface">Incident Diagnosis Center</h2>
        <p className="text-on-surface-variant font-sans mt-1">Live alarms and AI-driven root cause analysis.</p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Alarm Feed */}
        <div className="col-span-1 lg:col-span-5 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col h-full overflow-hidden">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-4">Live SCADA Alarms</h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {!alarms || alarms.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-border-subtle rounded-lg text-on-surface-variant">
                No active alarms detected. System healthy!
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
                  <Badge status={alarm.severity as any}>{alarm.severity.toUpperCase()}</Badge>
                </div>
                
                <div>
                  <h4 className="font-sans font-medium text-on-surface">{alarm.equipment?.name} - {alarm.description}</h4>
                  <p className="text-sm text-on-surface-variant mt-1 font-mono">Location: {alarm.equipment?.room?.name || 'Unknown'}</p>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 text-secondary text-sm font-medium">
                    <Activity className="w-4 h-4" />
                    <span>Expert Diagnosis Available</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); acknowledge(alarm.id); }}
                    disabled={isPending}
                    className="text-xs flex items-center gap-1 bg-status-healthy/10 text-status-healthy px-2 py-1 rounded hover:bg-status-healthy/20 transition-colors"
                  >
                    <Check className="w-3 h-3" /> Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnosis Workspace */}
        <div className="col-span-1 lg:col-span-7 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col h-full overflow-hidden">
          {!selectedAlarm ? (
             <div className="flex items-center justify-center h-full text-on-surface-variant">Select an alarm to view expert diagnosis.</div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6 border-b border-border-subtle pb-4">
                <h3 className="text-lg font-sans font-medium text-on-surface flex items-center gap-2">
                  <Zap className="w-5 h-5 text-secondary" />
                  AI Expert Diagnosis
                </h3>
                <span className="text-sm font-mono text-on-surface-variant">For {selectedAlarm.id.substring(0, 8)}</span>
              </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            <div>
              <h4 className="text-sm font-mono text-on-surface-variant uppercase tracking-wider mb-2">Detected Problem</h4>
              <p className="text-lg font-sans font-medium text-on-surface">{selectedAlarm.desc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background border border-border-subtle p-4 rounded-lg">
                <h4 className="text-sm font-mono text-status-warning uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Probable Causes
                </h4>
                <ul className="list-disc list-inside text-sm text-on-surface space-y-1">
                  <li>Inverter phase desynchronization</li>
                  <li>Static bypass switch malfunction</li>
                  <li>Control board logic error</li>
                </ul>
              </div>

              <div className="bg-background border border-border-subtle p-4 rounded-lg">
                <h4 className="text-sm font-mono text-status-critical uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Operational Impacts
                </h4>
                <ul className="list-disc list-inside text-sm text-on-surface space-y-1">
                  <li>Loss of clean power to Switch Room</li>
                  <li>Vulnerability to grid fluctuations</li>
                </ul>
              </div>
            </div>

            <div className="bg-bg-secondary p-5 rounded-lg border-l-4 border-primary">
              <h4 className="text-sm font-mono text-primary uppercase tracking-wider mb-3">Recommended Actions</h4>
              <ol className="list-decimal list-inside text-sm text-on-surface space-y-2">
                <li>Manually verify UPS output phase sequence on front panel.</li>
                <li>Check bypass static switch telemetry for fault codes.</li>
                <li>If inverter fault confirmed, keep on bypass and dispatch Tier 2 UPS Specialist.</li>
              </ol>
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Info className="w-4 h-4" /> Confidence: 92%
              </div>
              <button className="bg-primary text-on-primary px-6 py-2 rounded-md font-sans font-medium flex items-center gap-2 hover:bg-primary-fixed-dim transition-colors">
                Create Actionable Ticket
                <ArrowRight className="w-4 h-4" />
              </button>
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
