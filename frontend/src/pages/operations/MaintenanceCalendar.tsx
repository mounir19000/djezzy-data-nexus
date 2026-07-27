import React from 'react';
import { Calendar as CalendarIcon, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const MaintenanceCalendar = () => {
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
            
            <div className="bg-background border border-border-subtle rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-sans font-medium text-on-surface">Generator Oil Change</span>
                <span className="text-xs font-mono text-status-critical bg-status-critical/10 px-2 py-0.5 rounded">Overdue</span>
              </div>
              <p className="text-xs text-on-surface-variant font-mono mb-2">Equipment: GEN-01 (Blida)</p>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1 text-on-surface-variant"><AlertTriangle className="w-3 h-3 text-status-critical" /> Was due Jul 25</span>
                <span className="text-on-surface">Assigned: <span className="font-medium">Amine</span></span>
              </div>
            </div>

            <div className="bg-background border border-border-subtle rounded-md p-4 border-l-4 border-l-status-warning">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-sans font-medium text-on-surface">CRAC Filter Replacement</span>
                <span className="text-xs font-mono text-status-warning bg-status-warning/10 px-2 py-0.5 rounded">Tomorrow</span>
              </div>
              <p className="text-xs text-on-surface-variant font-mono mb-2">Equipment: CRAC-02 (Oran_04)</p>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1 text-on-surface-variant"><Clock className="w-3 h-3" /> Jul 29</span>
                <span className="text-on-surface">Assigned: <span className="font-medium">Karim</span></span>
              </div>
            </div>

            <div className="bg-background border border-border-subtle rounded-md p-4 border-l-4 border-l-status-healthy">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-sans font-medium text-on-surface">Battery Bank Load Test</span>
                <span className="text-xs font-mono text-status-healthy bg-status-healthy/10 px-2 py-0.5 rounded">In 3 days</span>
              </div>
              <p className="text-xs text-on-surface-variant font-mono mb-2">Equipment: BATT-01 (Blida)</p>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1 text-on-surface-variant"><Clock className="w-3 h-3" /> Jul 31</span>
                <span className="text-on-surface">Assigned: <span className="font-medium">Yacine</span></span>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCalendar;
