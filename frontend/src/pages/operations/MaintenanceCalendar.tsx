import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';
import { useMaintenanceTasks } from '../../hooks/useMaintenance';
import { useSites } from '../../hooks/useSites';

const MaintenanceCalendar = () => {
  const { data: tasks, isLoading } = useMaintenanceTasks();
  const { data: sites } = useSites();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">Maintenance & Scheduling</h2>
          <p className="text-on-surface-variant font-sans mt-1">Preventative maintenance and inspection schedules.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-4 py-2 rounded-md font-sans font-medium hover:bg-primary-fixed-dim transition-colors flex items-center gap-2"
        >
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

      {/* Schedule Maintenance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-lg w-full max-w-lg shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border-subtle">
              <h3 className="text-lg font-sans font-medium text-on-surface">Schedule Maintenance</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Task Title</label>
                <input required type="text" className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary" placeholder="Maintenance title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Description</label>
                <textarea rows={3} className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary" placeholder="Detailed description of the maintenance..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Site</label>
                  <select required className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary">
                    <option value="">Select a site...</option>
                    {sites?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Equipment</label>
                  <select required className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary">
                    <option value="">Select equipment...</option>
                    <option value="eq-1">UPS-A</option>
                    <option value="eq-2">Generator 1</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Scheduled Date</label>
                  <input required type="date" className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Status</label>
                  <select className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary">
                    <option value="pending">Pending</option>
                    <option value="inProgress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Assigned Engineer</label>
                <select className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary">
                  <option value="">Unassigned</option>
                  <option value="eng-1">Ahmed Engineer</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md font-medium text-on-surface hover:bg-bg-secondary transition-colors">Cancel</button>
                <button type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-md font-medium hover:bg-primary-fixed-dim transition-colors">Schedule Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceCalendar;
