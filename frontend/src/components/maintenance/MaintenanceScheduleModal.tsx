import React, { useState } from 'react';
import { X, Calendar, User, Repeat, Trash2, AlertTriangle } from 'lucide-react';
import { useDeleteMaintenanceSchedule } from '../../hooks/useMaintenance';
import { useAppStore } from '../../store/useAppStore';
import { displayRecurrence, displayText, formatDate } from '../../lib/frenchLabels';

interface MaintenanceScheduleModalProps {
  schedule: any;
  onClose: () => void;
}

const MaintenanceScheduleModal: React.FC<MaintenanceScheduleModalProps> = ({ schedule, onClose }) => {
  const user = useAppStore((state: any) => state.user);
  const canDelete = ['Super Admin', 'Site Operator'].includes(user?.role || '');
  const deleteSchedule = useDeleteMaintenanceSchedule();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const targetDate = schedule.projectedDate || new Date(schedule.nextRunDate);
  const generationDate = new Date(targetDate);
  generationDate.setDate(generationDate.getDate() - 1);

  const handleDelete = () => {
    setDeleteError('');
    deleteSchedule.mutate(schedule.id, {
      onSuccess: onClose,
      onError: (error) => setDeleteError(error.message)
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-bg-surface border border-border-subtle rounded-lg w-full max-w-xl shadow-xl flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border-subtle bg-bg-secondary/50">
          <h3 className="text-lg font-sans font-semibold text-on-surface flex items-center gap-2">
            <Repeat className="w-5 h-5 text-on-surface-variant" />
            {schedule.title} (recurrent)
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Détails */}
        <div className="p-6 space-y-6">
          <div className="text-sm text-on-surface-variant bg-bg-secondary p-4 rounded-md border border-border-subtle flex flex-col gap-2">
            <p>
              Ceci est une <strong>planification récurrente</strong>. Elle sert de repère visuel pour les maintenances futures.
            </p>
            <p className="text-primary font-medium">
              Une tâche cliquable sera générée automatiquement le {formatDate(generationDate)} (24 heures avant).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background rounded-lg p-3 border border-border-subtle">
              <span className="text-xs text-on-surface-variant font-mono uppercase block mb-1">Équipement</span>
              <div className="font-medium text-on-surface text-sm">
                {schedule.equipment?.name} ({displayText(schedule.equipment?.type)})
                <div className="text-xs text-on-surface-variant font-normal mt-0.5">
                  {displayText(schedule.equipment?.room?.site?.name)} • {displayText(schedule.equipment?.room?.name)}
                </div>
              </div>
            </div>
            
            <div className="bg-background rounded-lg p-3 border border-border-subtle">
              <span className="text-xs text-on-surface-variant font-mono uppercase block mb-1">Récurrence</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border bg-bg-secondary text-on-surface border-border-subtle">
                {displayRecurrence(schedule.recurrence, true)}
              </span>
            </div>
            
            <div className="bg-background rounded-lg p-3 border border-border-subtle flex items-center gap-3">
              <Calendar className="w-8 h-8 text-on-surface-variant opacity-50" />
              <div>
                <span className="text-xs text-on-surface-variant font-mono uppercase block mb-0.5">Date cible</span>
                <span className="font-medium text-on-surface text-sm">
                  {formatDate(targetDate)}
                </span>
              </div>
            </div>

            <div className="bg-background rounded-lg p-3 border border-border-subtle flex items-center gap-3">
              <User className="w-8 h-8 text-on-surface-variant opacity-50" />
              <div>
                <span className="text-xs text-on-surface-variant font-mono uppercase block mb-0.5">Assigné a</span>
                <span className="font-medium text-on-surface text-sm">
                  {schedule.assignee ? `${schedule.assignee.firstName} ${schedule.assignee.lastName}` : 'Non assigné'}
                </span>
              </div>
            </div>
          </div>

          {deleteError && (
            <div className="bg-status-critical/10 border border-status-critical/30 text-status-critical text-sm px-4 py-3 rounded-md flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border-subtle bg-bg-secondary/30">
          {isConfirmingDelete ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-on-surface-variant">
                Supprimer définitivement cette planification récurrente ?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-4 py-2 rounded-md font-medium text-on-surface hover:bg-bg-surface transition-colors border border-border-subtle"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={deleteSchedule.isPending}
                  onClick={handleDelete}
                  className="bg-status-critical text-white px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> {deleteSchedule.isPending ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between gap-3">
              {canDelete ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-4 py-2 rounded-md font-medium text-status-critical hover:bg-status-critical/10 transition-colors border border-status-critical/30 flex items-center gap-2"
                >
                <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md font-medium text-on-surface hover:bg-bg-surface transition-colors border border-border-subtle"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceScheduleModal;
