import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, AlertTriangle, X, History } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { useQuery } from '@tanstack/react-query';
import { useMaintenanceTasks } from '../../hooks/useMaintenance';
import { useAppStore } from '../../store/useAppStore';
import MaintenanceScheduler from '../../components/maintenance/MaintenanceScheduler';
import MaintenanceTaskModal from '../../components/maintenance/MaintenanceTaskModal';
import MaintenanceScheduleModal from '../../components/maintenance/MaintenanceScheduleModal';
import { API_BASE_URL } from '../../lib/api';
import { displayText, formatDate } from '../../lib/frenchLabels';

const fetchSchedules = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch(`${API_BASE_URL}/api/maintenance/schedules`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch schedules');
  return res.json();
};

const MaintenanceCalendar = () => {
  const { data: tasks, isLoading: isTasksLoading } = useMaintenanceTasks();
  const { data: schedules } = useQuery({ queryKey: ['schedules'], queryFn: fetchSchedules });
  
  const user = useAppStore((state: any) => state.user);
  const canSchedule = ['Super Admin', 'Site Operator'].includes(user?.role || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const upcomingTasks = useMemo(() => tasks?.filter((task: any) => task.status !== 'completed') || [], [tasks]);

  const events = useMemo(() => {
    const taskEvents = tasks?.map((task: any) => {
      const isCompleted = task.status === 'completed';
      return {
        id: `task-${task.id}`,
        title: `${task.title}`,
        start: task.scheduledDate,
        allDay: true,
        backgroundColor: isCompleted ? 'var(--color-status-healthy)' : 'var(--color-primary)',
        borderColor: isCompleted ? 'var(--color-status-healthy)' : 'var(--color-primary)',
        textColor: isCompleted ? '#ffffff' : 'var(--color-on-primary)',
        extendedProps: { type: 'task', resource: task }
      };
    }) || [];
    
    const scheduleEvents: any[] = [];
    schedules?.forEach((sched: any) => {
       if (sched.nextRunDate) {
         let current = new Date(sched.nextRunDate);
         const limit = sched.recurrence === 'weekly' ? 24 : 12; // Project 24 weeks or 12 months ahead
         
         for (let i = 0; i < limit; i++) {
           scheduleEvents.push({
             id: `sched-${sched.id}-${i}`,
             title: `🔄 ${sched.title}`,
             start: new Date(current),
             allDay: true,
             backgroundColor: 'var(--color-surface-container-high)',
             borderColor: 'var(--color-border-subtle)',
             textColor: 'var(--color-on-surface)',
             extendedProps: { type: 'schedule', resource: { ...sched, projectedDate: new Date(current) } }
           });
           
           // Advance date
           if (sched.recurrence === 'weekly') {
             current.setDate(current.getDate() + 7);
           } else if (sched.recurrence === 'monthly') {
             current.setMonth(current.getMonth() + 1);
           } else {
             break; // Unknown recurrence
           }
         }
       }
    });

    return [...taskEvents, ...scheduleEvents];
  }, [tasks, schedules]);

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      <div className="flex justify-end gap-3">
        <Link
          to="/mantainancehistory"
          className="bg-bg-surface border border-border-subtle text-on-surface px-5 py-2.5 rounded-lg font-sans font-medium hover:border-primary hover:text-primary transition-colors flex items-center gap-2"
        >
          <History className="w-4 h-4" /> Historique
        </Link>
        {canSchedule && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary px-5 py-2.5 rounded-lg font-sans font-medium hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4" /> Planifier une maintenance
          </button>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="col-span-1 lg:col-span-2 bg-bg-surface border border-border-subtle rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 flex flex-col min-h-[500px] lg:h-[700px] overflow-hidden">
          <h3 className="text-lg font-sans font-semibold text-on-surface mb-6 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" /> Calendrier de maintenance
          </h3>
          <div className="flex-1 min-h-[400px]">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              locale={frLocale}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={events}
              eventClick={(info) => {
                const type = info.event.extendedProps.type;
                if (type === 'task') {
                  setSelectedTask(info.event.extendedProps.resource);
                } else if (type === 'schedule') {
                  setSelectedSchedule(info.event.extendedProps.resource);
                }
              }}
              height="100%"
            />
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="col-span-1 bg-bg-surface border border-border-subtle rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 flex flex-col h-full overflow-hidden">
          <h3 className="text-lg font-sans font-semibold text-on-surface mb-6">Tâches à venir</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            
            {isTasksLoading ? (
              <div className="text-on-surface-variant text-sm">Chargement des tâches...</div>
            ) : upcomingTasks.length === 0 ? (
              <div className="text-on-surface-variant text-sm italic">Aucune maintenance à venir planifiee.</div>
            ) : (
              upcomingTasks.map((task: any) => {
                const isOverdue = new Date(task.scheduledDate) < new Date() && task.status !== 'completed';
                const isSoon = new Date(task.scheduledDate).getTime() - new Date().getTime() < 172800000; // < 2 days
                
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setSelectedTask(task)}
                    className={`w-full text-left bg-background rounded-lg p-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md cursor-pointer border-l-4 ${isOverdue ? 'border-l-status-critical border border-status-critical/30' : isSoon ? 'border-l-status-warning border border-status-warning/30' : 'border-l-primary border border-border-subtle'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-sans font-semibold text-on-surface line-clamp-2">{task.title}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ml-2 ${
                        isOverdue ? 'text-status-critical bg-status-critical/10 border border-status-critical/20' : 
                        isSoon ? 'text-status-warning bg-status-warning/10 border border-status-warning/20' : 
                        'text-primary bg-primary/10 border border-primary/20'
                      }`}>
                        {isOverdue ? 'En retard' : formatDate(task.scheduledDate)}
                      </span>
                    </div>
                    <div className="text-xs text-on-surface-variant mb-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40" />
                      {task.equipment?.name || displayText('General')}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-on-surface-variant bg-bg-secondary px-2 py-1 rounded">
                        {isOverdue ? <AlertTriangle className="w-3.5 h-3.5 text-status-critical" /> : <Clock className="w-3.5 h-3.5 text-primary" />} 
                        {formatDate(task.scheduledDate)}
                      </span>
                      <span className="text-on-surface-variant">Assigné : <span className="font-medium text-on-surface">{task.assignee ? task.assignee.firstName : 'Non assigné'}</span></span>
                    </div>
                  </button>
                );
              })
            )}

          </div>
        </div>
      </div>

      {/* Schedule Maintenance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-bg-surface border border-border-subtle rounded-xl w-full max-w-5xl shadow-2xl flex flex-col transform scale-100 transition-transform">
            <div className="flex justify-between items-center p-5 border-b border-border-subtle bg-bg-secondary/30">
              <h3 className="text-lg font-sans font-semibold text-on-surface flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" /> Planifier une maintenance
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <MaintenanceScheduler />
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Task Modal */}
      {selectedTask && (
        <MaintenanceTaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Maintenance Schedule Modal */}
      {selectedSchedule && (
        <MaintenanceScheduleModal
          schedule={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
        />
      )}
    </div>
  );
};

export default MaintenanceCalendar;
