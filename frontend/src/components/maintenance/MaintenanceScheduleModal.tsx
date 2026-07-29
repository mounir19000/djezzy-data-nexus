import React from 'react';
import { X, Calendar, User, Repeat } from 'lucide-react';

interface MaintenanceScheduleModalProps {
  schedule: any;
  onClose: () => void;
}

const MaintenanceScheduleModal: React.FC<MaintenanceScheduleModalProps> = ({ schedule, onClose }) => {
  const targetDate = schedule.projectedDate || new Date(schedule.nextRunDate);
  const generationDate = new Date(targetDate);
  generationDate.setDate(generationDate.getDate() - 1);
  
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-bg-surface border border-border-subtle rounded-lg w-full max-w-xl shadow-xl flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border-subtle bg-bg-secondary/50">
          <h3 className="text-lg font-sans font-semibold text-on-surface flex items-center gap-2">
            <Repeat className="w-5 h-5 text-on-surface-variant" />
            {schedule.title} (Recurring)
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Body */}
        <div className="p-6 space-y-6">
          <div className="text-sm text-on-surface-variant bg-bg-secondary p-4 rounded-md border border-border-subtle flex flex-col gap-2">
            <p>
              This is a <strong>recurring schedule</strong>. It acts as a visual placeholder for future maintenance.
            </p>
            <p className="text-primary font-medium">
              A clickable task will automatically be generated on {generationDate.toLocaleDateString()} (24 hours prior).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background rounded-lg p-3 border border-border-subtle">
              <span className="text-xs text-on-surface-variant font-mono uppercase block mb-1">Equipment</span>
              <div className="font-medium text-on-surface text-sm">
                {schedule.equipment?.name} ({schedule.equipment?.type})
                <div className="text-xs text-on-surface-variant font-normal mt-0.5">
                  {schedule.equipment?.room?.site?.name} • {schedule.equipment?.room?.name}
                </div>
              </div>
            </div>
            
            <div className="bg-background rounded-lg p-3 border border-border-subtle">
              <span className="text-xs text-on-surface-variant font-mono uppercase block mb-1">Recurrence</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border bg-bg-secondary text-on-surface border-border-subtle">
                {schedule.recurrence.toUpperCase()}
              </span>
            </div>
            
            <div className="bg-background rounded-lg p-3 border border-border-subtle flex items-center gap-3">
              <Calendar className="w-8 h-8 text-on-surface-variant opacity-50" />
              <div>
                <span className="text-xs text-on-surface-variant font-mono uppercase block mb-0.5">Target Date</span>
                <span className="font-medium text-on-surface text-sm">
                  {new Date(targetDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="bg-background rounded-lg p-3 border border-border-subtle flex items-center gap-3">
              <User className="w-8 h-8 text-on-surface-variant opacity-50" />
              <div>
                <span className="text-xs text-on-surface-variant font-mono uppercase block mb-0.5">Assigned To</span>
                <span className="font-medium text-on-surface text-sm">
                  {schedule.assignee ? `${schedule.assignee.firstName} ${schedule.assignee.lastName}` : 'Unassigned'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border-subtle flex justify-end bg-bg-secondary/30">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-medium text-on-surface hover:bg-bg-surface transition-colors border border-border-subtle"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceScheduleModal;
