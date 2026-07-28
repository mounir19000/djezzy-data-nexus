import React, { useMemo, useState } from 'react';
import Badge from '../../components/ui/Badge';
import { User, Clock, X } from 'lucide-react';
import { useTickets, useUpdateTicketStatus } from '../../hooks/useTickets';
import { useSites } from '../../hooks/useSites';

const TicketCard = ({ ticket, onDragStart }: { ticket: any, onDragStart: (e: any, id: string) => void }) => (
  <div 
    draggable
    onDragStart={(e) => onDragStart(e, ticket.id)}
    className="bg-background border border-border-subtle rounded-md p-3 hover:border-primary cursor-grab transition-colors"
  >
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-mono text-on-surface-variant">{ticket.id.substring(0,8)}</span>
      <span className={`w-2 h-2 rounded-full ${ticket.priority === 'high' ? 'bg-status-critical' : ticket.priority === 'medium' ? 'bg-status-warning' : 'bg-status-healthy'}`}></span>
    </div>
    <h4 className="font-sans text-sm font-medium text-on-surface mb-1">{ticket.title}</h4>
    <p className="text-xs font-mono text-on-surface-variant mb-3">{ticket.equipment?.name || 'General'}</p>
    
    <div className="flex justify-between items-center border-t border-border-subtle pt-2">
      {ticket.assignee ? (
        <div className="flex items-center gap-1 text-xs text-on-surface">
          <User className="w-3 h-3 text-on-surface-variant" /> {ticket.assignee.firstName}
        </div>
      ) : (
        <span className="text-xs text-on-surface-variant italic">Unassigned</span>
      )}
      <div className="flex items-center gap-1 text-xs text-on-surface-variant">
        <Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleDateString()}
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
  const { data: sites } = useSites();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const groupedTickets = useMemo(() => {
    if (!tickets) return { pending: [], assigned: [], inProgress: [], resolved: [] };
    return {
      pending: tickets.filter((t: any) => t.status === 'pending'),
      assigned: tickets.filter((t: any) => t.status === 'assigned'),
      inProgress: tickets.filter((t: any) => t.status === 'inProgress'),
      resolved: tickets.filter((t: any) => t.status === 'resolved' || t.status === 'closed')
    };
  }, [tickets]);

  const handleDrop = (status: string, ticketId: string) => {
    updateStatus({ id: ticketId, status });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create ticket mutation would go here
    setIsModalOpen(false);
  };

  if (isLoading) return <div className="p-8 text-on-surface">Loading kanban...</div>;

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">Incident Tickets</h2>
          <p className="text-on-surface-variant font-sans mt-1">Operational Kanban board for active interventions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-4 py-2 rounded-md font-sans font-medium hover:bg-primary-fixed-dim transition-colors"
        >
          + New Ticket
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[500px]">
        <KanbanColumn title="Pending" status="pending" tickets={groupedTickets.pending} count={groupedTickets.pending.length} onDrop={handleDrop} />
        <KanbanColumn title="Assigned" status="assigned" tickets={groupedTickets.assigned} count={groupedTickets.assigned.length} onDrop={handleDrop} />
        <KanbanColumn title="In Progress" status="inProgress" tickets={groupedTickets.inProgress} count={groupedTickets.inProgress.length} onDrop={handleDrop} />
        <KanbanColumn title="Resolved" status="resolved" tickets={groupedTickets.resolved} count={groupedTickets.resolved.length} onDrop={handleDrop} />
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
                <input required type="text" className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary" placeholder="Ticket title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Description</label>
                <textarea rows={3} className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary" placeholder="Detailed description of the issue..."></textarea>
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
                  <label className="block text-sm font-medium text-on-surface mb-1">Equipment / Alarm (Optional)</label>
                  <select className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary">
                    <option value="">None</option>
                    <option value="eq-1">UPS-A</option>
                    <option value="eq-2">Generator 1</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Priority</label>
                  <select className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Assignee</label>
                  <select className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary">
                    <option value="">Unassigned</option>
                    <option value="eng-1">Ahmed Engineer</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md font-medium text-on-surface hover:bg-bg-secondary transition-colors">Cancel</button>
                <button type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-md font-medium hover:bg-primary-fixed-dim transition-colors">Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketKanban;
