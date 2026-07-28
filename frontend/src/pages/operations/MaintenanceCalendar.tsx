import React from 'react';
import { Calendar as CalendarIcon, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useMaintenanceTasks } from '../../hooks/useMaintenance';

const MaintenanceCalendar = () => {
  const { data: tasks, isLoading } = useMaintenanceTasks();
  return (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">Maintenance & Scheduling</h2>
          <p className="text-on-surface-variant font-sans mt-1">Preventative maintenance and inspection schedules.</p>
        </div>
        <button className="bg-primary text-on-primary px-4 py-2 rounded-md font-sans font-medium hover:bg-primary-fixed-dim transition-colors flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" /> Schedule Maintenance
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View Placeholder */}
        <div className="col-span-1 lg:col-span-2 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col min-h-[500px]">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-6 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-on-surface-variant" /> July 2026
          </h3>
          <div className="flex-1 border-2 border-dashed border-border-subtle rounded-lg flex items-center justify-center bg-background">
            <p className="text-on-surface-variant font-mono">Interactive FullCalendar View</p>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="col-span-1 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col h-full overflow-hidden">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-4">Upcoming Tasks</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            
            {isLoading ? (
              <div className="text-on-surface-variant text-sm">Loading tasks...</div>
            ) : tasks?.length === 0 ? (
              <div className="text-on-surface-variant text-sm italic">No upcoming maintenance scheduled.</div>
            ) : (
              tasks?.map((task: any) => {
                const isOverdue = new Date(task.scheduledDate) < new Date() && task.status !== 'completed';
                const isSoon = new Date(task.scheduledDate).getTime() - new Date().getTime() < 172800000; // < 2 days
                
                return (
                  <div key={task.id} className={`bg-background border rounded-md p-4 ${isOverdue ? 'border-status-critical' : isSoon ? 'border-l-4 border-l-status-warning' : 'border-border-subtle'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-sans font-medium text-on-surface">{task.title}</span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                        isOverdue ? 'text-status-critical bg-status-critical/10' : 
                        isSoon ? 'text-status-warning bg-status-warning/10' : 
                        'text-status-healthy bg-status-healthy/10'
                      }`}>
                        {isOverdue ? 'Overdue' : new Date(task.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant font-mono mb-2">Equipment: {task.equipment?.name || 'General'}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1 text-on-surface-variant">
                        {isOverdue ? <AlertTriangle className="w-3 h-3 text-status-critical" /> : <Clock className="w-3 h-3" />} 
                        {new Date(task.scheduledDate).toLocaleDateString()}
                      </span>
                      <span className="text-on-surface">Assigned: <span className="font-medium">{task.assignee ? task.assignee.firstName : 'Unassigned'}</span></span>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCalendar;
