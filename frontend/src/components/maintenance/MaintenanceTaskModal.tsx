import React, { useState } from 'react';
import { X, CheckCircle, FileText, User, Calendar, Settings } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Badge from '../ui/Badge';
import { useAppStore } from '../../store/useAppStore';

interface MaintenanceTaskModalProps {
  task: any;
  onClose: () => void;
}

const MaintenanceTaskModal: React.FC<MaintenanceTaskModalProps> = ({ task, onClose }) => {
  const user = useAppStore((state: any) => state.user);
  const queryClient = useQueryClient();
  const [isReporting, setIsReporting] = useState(false);
  
  const [actionTaken, setActionTaken] = useState('');
  const [currentState, setCurrentState] = useState('Healthy');
  const [notes, setNotes] = useState('');

  const canComplete = task.status !== 'completed' && (user?.id === task.assignedTo || user?.role === 'Super Admin' || user?.role === 'Site Operator');

  const completeTask = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`http://localhost:4000/api/maintenance/tasks/${task.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to submit report');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['site-dashboard'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeTask.mutate({ actionTaken, currentState, notes });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-bg-surface border border-border-subtle rounded-lg w-full max-w-2xl shadow-xl flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border-subtle bg-bg-secondary/50">
          <h3 className="text-lg font-sans font-semibold text-on-surface flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            {task.title}
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background rounded-lg p-3 border border-border-subtle">
              <span className="text-xs text-on-surface-variant font-mono uppercase block mb-1">Equipment</span>
              <div className="font-medium text-on-surface text-sm">
                {task.equipment?.name} ({task.equipment?.type})
                <div className="text-xs text-on-surface-variant font-normal mt-0.5">
                  {task.equipment?.room?.site?.name} • {task.equipment?.room?.name}
                </div>
              </div>
            </div>
            
            <div className="bg-background rounded-lg p-3 border border-border-subtle">
              <span className="text-xs text-on-surface-variant font-mono uppercase block mb-1">Status</span>
              <Badge status={task.status === 'completed' ? 'healthy' : task.status === 'inProgress' ? 'warning' : 'offline'}>
                {task.status.toUpperCase()}
              </Badge>
            </div>
            
            <div className="bg-background rounded-lg p-3 border border-border-subtle flex items-center gap-3">
              <Calendar className="w-8 h-8 text-on-surface-variant opacity-50" />
              <div>
                <span className="text-xs text-on-surface-variant font-mono uppercase block mb-0.5">Scheduled For</span>
                <span className="font-medium text-on-surface text-sm">
                  {new Date(task.scheduledDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="bg-background rounded-lg p-3 border border-border-subtle flex items-center gap-3">
              <User className="w-8 h-8 text-on-surface-variant opacity-50" />
              <div>
                <span className="text-xs text-on-surface-variant font-mono uppercase block mb-0.5">Assigned To</span>
                <span className="font-medium text-on-surface text-sm">
                  {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Report Display if Completed */}
          {task.status === 'completed' && task.report && (
            <div className="mt-6 border border-status-healthy/30 bg-status-healthy/5 rounded-lg overflow-hidden">
              <div className="bg-status-healthy/10 px-4 py-2 border-b border-status-healthy/30 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-status-healthy" />
                <span className="font-medium text-status-healthy text-sm">Maintenance Report</span>
              </div>
              <div className="p-4 space-y-4 text-sm">
                <div>
                  <span className="block text-xs font-mono text-on-surface-variant uppercase mb-1">Action Taken</span>
                  <p className="text-on-surface whitespace-pre-wrap">{task.report.actionTaken}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-mono text-on-surface-variant uppercase mb-1">Current State</span>
                    <Badge status={task.report.currentState === 'Healthy' ? 'healthy' : 'warning'}>
                      {task.report.currentState}
                    </Badge>
                  </div>
                  <div>
                    <span className="block text-xs font-mono text-on-surface-variant uppercase mb-1">Submitted</span>
                    <span className="text-on-surface">{new Date(task.report.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                {task.report.notes && (
                  <div>
                    <span className="block text-xs font-mono text-on-surface-variant uppercase mb-1">Notes</span>
                    <p className="text-on-surface whitespace-pre-wrap">{task.report.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Report Form if Reporting */}
          {isReporting && (
            <form onSubmit={handleSubmit} className="mt-6 border-t border-border-subtle pt-6 space-y-4">
              <h4 className="font-medium text-on-surface flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-primary" /> Complete Maintenance Task
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Action Taken *</label>
                <textarea
                  required
                  rows={3}
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Describe what maintenance was performed..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Current State of Equipment *</label>
                <select
                  value={currentState}
                  onChange={(e) => setCurrentState(e.target.value)}
                  className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Healthy">Healthy - Fully Operational</option>
                  <option value="Warning">Warning - Needs Monitoring</option>
                  <option value="Critical">Critical - Follow-up Required</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Additional Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Any extra observations (optional)..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsReporting(false)}
                  className="px-4 py-2 rounded-md font-medium text-on-surface hover:bg-bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completeTask.isPending}
                  className="bg-primary text-on-primary px-4 py-2 rounded-md font-medium hover:bg-primary-fixed-dim transition-colors disabled:opacity-50"
                >
                  {completeTask.isPending ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer Actions */}
        {!isReporting && (
          <div className="p-4 border-t border-border-subtle flex justify-end gap-3 bg-bg-secondary/30">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium text-on-surface hover:bg-bg-surface transition-colors border border-border-subtle"
            >
              Close
            </button>
            {canComplete && (
              <button
                onClick={() => setIsReporting(true)}
                className="bg-primary text-on-primary px-4 py-2 rounded-md font-medium hover:bg-primary-fixed-dim transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Complete Task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceTaskModal;
