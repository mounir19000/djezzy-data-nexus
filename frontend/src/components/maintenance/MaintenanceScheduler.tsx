import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, AlertTriangle, Users } from 'lucide-react';
import Badge from '../ui/Badge';
import { API_BASE_URL } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';
import { displayRecurrence, displayText, formatDateTime } from '../../lib/frenchLabels';

interface MaintenanceSchedulerProps {
  siteId?: string;
}

const fetchSchedules = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch(`${API_BASE_URL}/api/maintenance/schedules`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Échec du chargement des planifications');
  return res.json();
};

const fetchEngineers = async () => {
  const token = localStorage.getItem('djezzy_token');
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Échec du chargement des utilisateurs');
  const users = await res.json();
  return users.filter((u: any) => u.role === 'Engineer');
};

const fetchEquipment = async (siteId?: string, user?: any) => {
  const token = localStorage.getItem('djezzy_token');
  if (siteId) {
    const res = await fetch(`${API_BASE_URL}/api/sites/${siteId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Échec du chargement des équipements');
    const data = await res.json();
    return data.rooms?.flatMap((r: any) => r.equipments?.map((eq:any) => ({...eq, siteName: data.name}))) || [];
  } else {
    const res = await fetch(`${API_BASE_URL}/api/sites`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Échec du chargement des équipements');
    let sites = await res.json();
    
    if (user && user.role !== 'Super Admin') {
      const assignedSiteIds = user.siteIds || ['msc10-blida'];
      sites = sites.filter((s: any) => assignedSiteIds.includes(s.id));
    }
    
    return sites.flatMap((site: any) => site.rooms?.flatMap((r: any) => r.equipments?.map((eq: any) => ({ ...eq, siteName: site.name }))) || []);
  }
};

const MaintenanceScheduler: React.FC<MaintenanceSchedulerProps> = ({ siteId }) => {
  const user = useAppStore((state: any) => state.user);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'sudden' | 'recurring'>('recurring');

  const { data: schedules } = useQuery({ queryKey: ['schedules'], queryFn: fetchSchedules });
  const { data: engineers } = useQuery({ queryKey: ['engineers'], queryFn: fetchEngineers });
  const { data: equipmentList } = useQuery({ queryKey: ['equipment', siteId, user?.id], queryFn: () => fetchEquipment(siteId, user) });

  const [title, setTitle] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [recurrence, setRecurrence] = useState('weekly');

  const createSchedule = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`${API_BASE_URL}/api/maintenance/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Échec de la création de la planification');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['site-dashboard', siteId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTitle('');
      setEquipmentId('');
      setAssignedTo('');
      setStartDate('');
    }
  });

  const createSuddenTask = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`${API_BASE_URL}/api/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Échec de la création de la tâche de maintenance urgente');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate dashboard maintenance tasks
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['site-dashboard', siteId] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTitle('');
      setEquipmentId('');
      setAssignedTo('');
      setStartDate('');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'recurring') {
      createSchedule.mutate({ title, equipmentId, assignedTo, startDate, recurrence });
    } else {
      createSuddenTask.mutate({ title, equipmentId, assignedTo, scheduledDate: startDate });
    }
  };

  return (
    <div className="bg-bg-surface/80 backdrop-blur-sm border border-border-subtle rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      <div className="border-b border-border-subtle px-6 py-4 flex gap-6 bg-background/50">
        <button
          onClick={() => setActiveTab('recurring')}
          className={`text-sm font-medium transition-all duration-200 border-b-2 pb-1 ${activeTab === 'recurring' ? 'text-primary border-primary' : 'text-on-surface-variant hover:text-on-surface border-transparent'}`}
        >
          Maintenance récurrente
        </button>
        <button
          onClick={() => setActiveTab('sudden')}
          className={`text-sm font-medium transition-all duration-200 border-b-2 pb-1 ${activeTab === 'sudden' ? 'text-status-warning border-status-warning' : 'text-on-surface-variant hover:text-on-surface border-transparent'}`}
        >
          Maintenance urgente
        </button>
      </div>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-on-surface flex items-center gap-2">
            {activeTab === 'recurring' ? 'Créer une planification récurrente' : 'Déclencher une maintenance urgente'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">Titre</label>
              <input
                required
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                placeholder="ex. Vérifier l’huile du groupe électrogène"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">Appareil / équipement</label>
              <select
                required
                value={equipmentId}
                onChange={e => setEquipmentId(e.target.value)}
                className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="">Sélectionner un équipement...</option>
                {equipmentList?.map((eq: any) => (
                  <option key={eq.id} value={eq.id}>{eq.name} ({displayText(eq.type)}) - {displayText(eq.siteName)}</option>
                ))}
              </select>
            </div>
            {activeTab === 'recurring' && (
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Récurrence</label>
                <select
                  value={recurrence}
                  onChange={e => setRecurrence(e.target.value)}
                  className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                >
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuelle</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">Ingénieur assigné</label>
              <select
                required
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="">Sélectionner un ingénieur...</option>
                {engineers?.map((user: any) => (
                  <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1 uppercase tracking-wider">Date de début</label>
              <input
                required
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all duration-200"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={createSchedule.isPending || createSuddenTask.isPending}
                className={`w-full py-2.5 rounded-lg font-medium text-sm text-white shadow-md transition-all duration-300 hover:shadow-lg transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${activeTab === 'recurring' ? 'bg-gradient-to-r from-primary to-primary-fixed-dim' : 'bg-gradient-to-r from-status-warning to-amber-600 text-black'}`}
              >
                {createSchedule.isPending || createSuddenTask.isPending ? 'Enregistrement...' : activeTab === 'recurring' ? 'Créer la planification' : 'Declencher maintenant'}
              </button>
            </div>
          </form>
        </div>

        <div>
          <h3 className="text-lg font-medium text-on-surface mb-4">Planifications actives</h3>
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {!schedules || schedules.length === 0 ? (
              <div className="text-sm text-on-surface-variant italic p-4 bg-background rounded-lg border border-border-subtle border-dashed">Aucune planification récurrente active.</div>
            ) : (
              schedules.map((sched: any) => (
                <div key={sched.id} className="bg-background border border-border-subtle rounded-lg p-4 hover:border-primary/50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-semibold text-on-surface">{sched.title}</h4>
                    <Badge status="healthy">{displayRecurrence(sched.recurrence)}</Badge>
                  </div>
                  <div className="space-y-1.5 mt-3">
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <Clock className="w-3.5 h-3.5 text-primary" /> <span className="text-on-surface">Prochaine execution :</span> {formatDateTime(sched.nextRunDate)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <AlertTriangle className="w-3.5 h-3.5 text-status-warning" /> {sched.equipment?.name} ({displayText(sched.equipment?.type)})
                    </div>
                    {sched.assignee && (
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <Users className="w-3.5 h-3.5 text-blue-400" /> {sched.assignee.firstName} {sched.assignee.lastName}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceScheduler;
