import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Badge from '../../components/ui/Badge';
import { User, Clock, X } from 'lucide-react';
import { useCreateTicket, useTickets, useUpdateTicketStatus } from '../../hooks/useTickets';
import { useSites } from '../../hooks/useSites';
import { useUsers } from '../../hooks/useUsers';
import { useAppStore } from '../../store/useAppStore';

const TicketCard = ({ ticket, onDragStart }: { ticket: any, onDragStart: (e: any, id: string) => void }) => (
  <div 
    draggable
    onDragStart={(e) => onDragStart(e, ticket.id)}
    className="bg-background border border-border-subtle rounded-md p-3 hover:border-primary cursor-grab transition-colors"
  >
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-mono text-on-surface-variant">{ticket.id.substring(0,8)}</span>
      <Badge status={ticket.priority === 'high' ? 'critical' : ticket.priority === 'medium' ? 'warning' : 'healthy'}>
        {ticket.priority.toUpperCase()}
      </Badge>
    </div>
    <h4 className="font-sans text-sm font-medium text-on-surface mb-1">{ticket.title}</h4>
    <p className="text-xs font-mono text-on-surface-variant">{ticket.equipment?.name || 'General'} / {ticket.equipment?.room?.name || 'Unknown room'}</p>
    {ticket.diagnosis?.problem && (
      <p className="text-xs text-on-surface-variant mt-2 mb-3 line-clamp-2">{ticket.diagnosis.problem}</p>
    )}
    
    <div className="flex justify-between items-center border-t border-border-subtle pt-2">
      {ticket.assignee ? (
        <div className="flex items-center gap-1 text-xs text-on-surface">
          <User className="w-3 h-3 text-on-surface-variant" /> {ticket.assignee.firstName}
        </div>
      ) : (
        <span className="text-xs text-on-surface-variant italic">Unassigned</span>
      )}
      <div className="flex items-center gap-1 text-xs text-on-surface-variant">
        <Clock className="w-3 h-3" /> {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : new Date(ticket.createdAt).toLocaleDateString()}
      </div>
    </div>
  </div>
);

const KanbanColumn = ({ title, status, tickets, count, onDrop }: { title: string, status: string, tickets: any[], count: number, onDrop: (status: string, ticketId: string) => void }) => (
  <div 
    className="flex flex-col bg-bg-surface border border-border-subtle rounded-lg overflow-hidden h-full"
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => {
      e.preventDefault();
      const ticketId = e.dataTransfer.getData('ticketId');
      if (ticketId) onDrop(status, ticketId);
    }}
  >
    <div className="px-4 py-3 border-b border-border-subtle bg-bg-secondary flex justify-between items-center">
      <h3 className="font-sans text-sm font-medium text-on-surface">{title}</h3>
      <span className="text-xs font-mono bg-background px-2 py-0.5 rounded text-on-surface-variant">{count}</span>
    </div>
    <div className="flex-1 p-3 overflow-y-auto space-y-3">
      {tickets.map(t => (
        <TicketCard 
          key={t.id} 
          ticket={t} 
          onDragStart={(e, id) => e.dataTransfer.setData('ticketId', id)} 
        />
      ))}
      {tickets.length === 0 && (
        <div className="text-center p-4 text-xs text-on-surface-variant italic">No tickets</div>
      )}
    </div>
  </div>
);

const TicketKanban = () => {
  const { data: tickets, isLoading } = useTickets();
  const { mutate: updateStatus } = useUpdateTicketStatus();
  const { mutate: createTicket, isPending: isCreating } = useCreateTicket();
  const { data: sites } = useSites();
  const { data: users } = useUsers();
  const user = useAppStore((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    equipmentId: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: ''
  });

  const canCreateTicket = user?.role === 'Super Admin' || user?.role === 'Site Operator';

  const groupedTickets = useMemo(() => {
    if (!tickets) return { pending: [], assigned: [], inProgress: [], resolved: [], closed: [] };
    return {
      pending: tickets.filter((t: any) => t.status === 'pending'),
      assigned: tickets.filter((t: any) => t.status === 'assigned'),
      inProgress: tickets.filter((t: any) => t.status === 'inProgress'),
      resolved: tickets.filter((t: any) => t.status === 'resolved'),
      closed: tickets.filter((t: any) => t.status === 'closed')
    };
  }, [tickets]);

  const equipmentOptions = useMemo(() => {
    return sites?.flatMap((site: any) => site.rooms?.flatMap((room: any) => room.equipments?.map((equipment: any) => ({
      ...equipment,
      roomName: room.name,
      siteName: site.name
    })) || []) || []) || [];
  }, [sites]);

  const engineerOptions = useMemo(() => {
    return users?.filter((candidate: any) => candidate.role === 'Engineer') || [];
  }, [users]);

  const handleDrop = (status: string, ticketId: string) => {
    if (user?.role === 'Site Operator' && ['resolved', 'closed'].includes(status)) return;
    updateStatus({ id: ticketId, status });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    createTicket({
      title: form.title,
      equipmentId: form.equipmentId,
      priority: form.priority as 'low' | 'medium' | 'high',
      assignedTo: form.assignedTo || undefined,
      dueDate: form.dueDate || undefined
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setForm({ title: '', equipmentId: '', priority: 'medium', assignedTo: '', dueDate: '' });
      },
      onError: (error) => setFormError(error.message)
    });
  };

  if (isLoading) return <div className="p-8 text-on-surface">Loading kanban...</div>;

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">Incident Tickets</h2>
          <p className="text-on-surface-variant font-sans mt-1">Operational Kanban board for active interventions.</p>
        </div>
        {canCreateTicket && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-on-primary px-4 py-2 rounded-md font-sans font-medium hover:bg-primary-fixed-dim transition-colors"
          >
            + New Ticket
          </button>
        )}
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 min-h-[500px]">
        <KanbanColumn title="Pending" status="pending" tickets={groupedTickets.pending} count={groupedTickets.pending.length} onDrop={handleDrop} />
        <KanbanColumn title="Assigned" status="assigned" tickets={groupedTickets.assigned} count={groupedTickets.assigned.length} onDrop={handleDrop} />
        <KanbanColumn title="In Progress" status="inProgress" tickets={groupedTickets.inProgress} count={groupedTickets.inProgress.length} onDrop={handleDrop} />
        <KanbanColumn title="Resolved" status="resolved" tickets={groupedTickets.resolved} count={groupedTickets.resolved.length} onDrop={handleDrop} />
        <KanbanColumn title="Closed" status="closed" tickets={groupedTickets.closed} count={groupedTickets.closed.length} onDrop={handleDrop} />
      </div>

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-lg w-full max-w-lg shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border-subtle">
              <h3 className="text-lg font-sans font-medium text-on-surface">Create New Ticket</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Title</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Ticket title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Site</label>
                  <select
                    disabled
                    className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary disabled:opacity-70"
                    value="msc10-blida"
                  >
                    <option value="">Select a site...</option>
                    {sites?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Equipment</label>
                  <select
                    required
                    value={form.equipmentId}
                    onChange={(event) => setForm((current) => ({ ...current, equipmentId: event.target.value }))}
                    className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="">Select equipment...</option>
                    {equipmentOptions.map((equipment: any) => (
                      <option key={equipment.id} value={equipment.id}>{equipment.name} / {equipment.roomName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                    className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Assignee</label>
                  <select
                    value={form.assignedTo}
                    onChange={(event) => setForm((current) => ({ ...current, assignedTo: event.target.value }))}
                    className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="">Unassigned</option>
                    {engineerOptions.map((engineer: any) => (
                      <option key={engineer.id} value={engineer.id}>{engineer.firstName} {engineer.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                  className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              {formError && <div className="text-sm text-status-warning">{formError}</div>}
              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md font-medium text-on-surface hover:bg-bg-secondary transition-colors">Cancel</button>
                <button disabled={isCreating} type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-md font-medium hover:bg-primary-fixed-dim transition-colors disabled:opacity-50">
                  {isCreating ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketKanban;
