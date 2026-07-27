import React from 'react';
import Badge from '../../components/ui/Badge';
import { User, Clock } from 'lucide-react';

const mockTickets = {
  pending: [
    { id: 'TKT-209', priority: 'high', equipment: 'UPS 2', title: 'Verify Sync Failure', due: 'Today' }
  ],
  assigned: [
    { id: 'TKT-205', priority: 'medium', equipment: 'CRAC 1', title: 'Filter Replacement', engineer: 'Karim', due: 'Tomorrow' }
  ],
  inProgress: [
    { id: 'TKT-201', priority: 'high', equipment: 'Generator', title: 'Oil Leak Repair', engineer: 'Amine', due: 'Today' }
  ],
  resolved: [
    { id: 'TKT-198', priority: 'low', equipment: 'Room Sensor', title: 'Recalibrate Temp', engineer: 'Karim', due: 'Yesterday' }
  ]
};

const TicketCard = ({ ticket }: { ticket: any }) => (
  <div className="bg-background border border-border-subtle rounded-md p-3 hover:border-primary cursor-grab transition-colors">
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-mono text-on-surface-variant">{ticket.id}</span>
      <span className={`w-2 h-2 rounded-full ${ticket.priority === 'high' ? 'bg-status-critical' : ticket.priority === 'medium' ? 'bg-status-warning' : 'bg-status-healthy'}`}></span>
    </div>
    <h4 className="font-sans text-sm font-medium text-on-surface mb-1">{ticket.title}</h4>
    <p className="text-xs font-mono text-on-surface-variant mb-3">{ticket.equipment}</p>
    
    <div className="flex justify-between items-center border-t border-border-subtle pt-2">
      {ticket.engineer ? (
        <div className="flex items-center gap-1 text-xs text-on-surface">
          <User className="w-3 h-3 text-on-surface-variant" /> {ticket.engineer}
        </div>
      ) : (
        <span className="text-xs text-on-surface-variant italic">Unassigned</span>
      )}
      <div className="flex items-center gap-1 text-xs text-on-surface-variant">
        <Clock className="w-3 h-3" /> {ticket.due}
      </div>
    </div>
  </div>
);

const KanbanColumn = ({ title, tickets, count }: { title: string, tickets: any[], count: number }) => (
  <div className="flex flex-col bg-bg-surface border border-border-subtle rounded-lg overflow-hidden h-full">
    <div className="px-4 py-3 border-b border-border-subtle bg-bg-secondary flex justify-between items-center">
      <h3 className="font-sans text-sm font-medium text-on-surface">{title}</h3>
      <span className="text-xs font-mono bg-background px-2 py-0.5 rounded text-on-surface-variant">{count}</span>
    </div>
    <div className="flex-1 p-3 overflow-y-auto space-y-3">
      {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
    </div>
  </div>
);

const TicketKanban = () => {
  return (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">Incident Tickets</h2>
          <p className="text-on-surface-variant font-sans mt-1">Operational Kanban board for active interventions.</p>
        </div>
        <button className="bg-primary text-on-primary px-4 py-2 rounded-md font-sans font-medium hover:bg-primary-fixed-dim transition-colors">
          + New Ticket
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[500px]">
        <KanbanColumn title="Pending" tickets={mockTickets.pending} count={1} />
        <KanbanColumn title="Assigned" tickets={mockTickets.assigned} count={1} />
        <KanbanColumn title="In Progress" tickets={mockTickets.inProgress} count={1} />
        <KanbanColumn title="Resolved" tickets={mockTickets.resolved} count={1} />
      </div>
    </div>
  );
};

export default TicketKanban;
