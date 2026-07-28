import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, FileCheck, Plus, User, X } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { useCreateTicket, useSubmitTicketReport, useTickets, useUpdateTicketStatus } from '../../hooks/useTickets';
import { useSites } from '../../hooks/useSites';
import { useUsers } from '../../hooks/useUsers';
import { useAppStore } from '../../store/useAppStore';

const columns = [
  { title: 'Pending', status: 'pending' },
  { title: 'Assigned', status: 'assigned' },
  { title: 'In Progress', status: 'inProgress' },
  { title: 'Resolved', status: 'resolved' },
  { title: 'Closed', status: 'closed' }
];

const failureDomains = [
  'Power',
  'UPS',
  'Cooling',
  'Battery',
  'Network',
  'Generator',
  'SCADA / Sensor',
  'Other'
];

const rootCauses = [
  'Grid outage / Sonelgaz',
  'UPS bypass or internal fault',
  'Cooling unit fault',
  'High room temperature',
  'Battery degradation',
  'Network or communication fault',
  'Sensor noise / false alarm',
  'Human operation / configuration',
  'Unknown after inspection'
];

const actionsTaken = [
  'Restored normal supply',
  'Reset or acknowledged alarm',
  'Switched equipment mode',
  'Restarted cooling equipment',
  'Dispatched field intervention',
  'Escalated to vendor',
  'Replaced or isolated component',
  'No action required'
];

const serviceImpacts = ['None', 'Degraded redundancy', 'Partial outage', 'Major outage', 'Unknown'];
const currentStates = ['Restored', 'Stable under monitoring', 'Escalated / waiting vendor', 'Needs follow-up', 'False alarm closed'];

const emptyReport = {
  isFailure: 'yes',
  failureDomain: failureDomains[0],
  rootCause: rootCauses[0],
  actionTaken: actionsTaken[0],
  serviceImpact: serviceImpacts[0],
  currentState: currentStates[0],
  notes: ''
};

const TicketCard = ({
  ticket,
  canReport,
  canAssign,
  canDrag,
  onReport,
  onAssign,
  onDragStart
}: {
  ticket: any;
  canReport: boolean;
  canAssign: boolean;
  canDrag: boolean;
  onReport: () => void;
  onAssign: () => void;
  onDragStart: (event: any, id: string) => void;
}) => (
  <div
    draggable={canDrag}
    onDragStart={(event) => onDragStart(event, ticket.id)}
    className={`bg-background border border-border-subtle rounded-md p-3 transition-colors ${canDrag ? 'hover:border-primary cursor-grab' : 'cursor-not-allowed opacity-90'}`}
  >
    <div className="flex justify-between items-start gap-3 mb-2">
      <div className="min-w-0">
        <span className="text-xs font-mono text-on-surface-variant">{ticket.id.substring(0, 8)}</span>
        {ticket.source === 'alarm_auto' && (
          <span className="ml-2 text-[11px] font-mono bg-secondary/10 text-secondary px-2 py-0.5 rounded">AUTO</span>
        )}
      </div>
      <Badge status={ticket.priority === 'high' ? 'critical' : ticket.priority === 'medium' ? 'warning' : 'healthy'}>
        {ticket.priority.toUpperCase()}
      </Badge>
    </div>

    <h4 className="font-sans text-sm font-medium text-on-surface leading-snug">{ticket.title}</h4>
    <p className="text-xs font-mono text-on-surface-variant mt-1">
      {ticket.equipment?.room?.site?.name || 'Site'} / {ticket.equipment?.name || 'General'} / {ticket.equipment?.room?.name || 'Unknown room'}
    </p>

    {ticket.diagnosis?.problem && (
      <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{ticket.diagnosis.problem}</p>
    )}

    <div className="mt-3 flex items-center gap-2">
      {ticket.report ? (
        <span className="inline-flex items-center gap-1 text-xs text-status-healthy">
          <CheckCircle className="w-3 h-3" /> Reported
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs text-status-warning">
          <AlertCircle className="w-3 h-3" /> Report needed
        </span>
      )}
      {canReport && (
        <button
          type="button"
          onClick={onReport}
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-border-subtle px-2 py-1 text-xs text-on-surface hover:border-primary hover:text-primary transition-colors"
        >
          <FileCheck className="w-3 h-3" /> {ticket.report ? 'Edit' : 'Report'}
        </button>
      )}
    </div>

    <div className="flex justify-between items-center border-t border-border-subtle pt-2 mt-3 gap-3">
      {ticket.assignee ? (
        <div className="flex items-center gap-1 text-xs text-on-surface min-w-0">
          <User className="w-3 h-3 text-on-surface-variant shrink-0" />
          <span className="truncate">{ticket.assignee.firstName} {ticket.assignee.lastName}</span>
        </div>
      ) : (
        <button
          type="button"
          disabled={!canAssign}
          onClick={onAssign}
          className="text-xs text-on-surface-variant italic hover:text-primary disabled:hover:text-on-surface-variant disabled:cursor-not-allowed"
        >
          Unassigned
        </button>
      )}
      <div className="flex items-center gap-1 text-xs text-on-surface-variant shrink-0">
        <Clock className="w-3 h-3" /> {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : new Date(ticket.createdAt).toLocaleDateString()}
      </div>
    </div>
  </div>
);

const KanbanColumn = ({
  title,
  status,
  tickets,
  onDrop,
  onReport,
  onAssign,
  canReportTicket,
  canAssignTicket,
  canDragTicket
}: {
  title: string;
  status: string;
  tickets: any[];
  onDrop: (status: string, ticketId: string) => void;
  onReport: (ticket: any) => void;
  onAssign: (ticket: any, targetStatus?: string) => void;
  canReportTicket: (ticket: any) => boolean;
  canAssignTicket: (ticket: any) => boolean;
  canDragTicket: (ticket: any) => boolean;
}) => (
  <div
    className="flex flex-col bg-bg-surface border border-border-subtle rounded-lg overflow-hidden h-full"
    onDragOver={(event) => event.preventDefault()}
    onDrop={(event) => {
      event.preventDefault();
      const ticketId = event.dataTransfer.getData('ticketId');
      if (ticketId) onDrop(status, ticketId);
    }}
  >
    <div className="px-4 py-3 border-b border-border-subtle bg-bg-secondary flex justify-between items-center">
      <h3 className="font-sans text-sm font-medium text-on-surface">{title}</h3>
      <span className="text-xs font-mono bg-background px-2 py-0.5 rounded text-on-surface-variant">{tickets.length}</span>
    </div>
    <div className="flex-1 p-3 overflow-y-auto space-y-3">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          canReport={canReportTicket(ticket)}
          canAssign={canAssignTicket(ticket)}
          canDrag={canDragTicket(ticket)}
          onReport={() => onReport(ticket)}
          onAssign={() => onAssign(ticket)}
          onDragStart={(event, id) => event.dataTransfer.setData('ticketId', id)}
        />
      ))}
      {tickets.length === 0 && (
        <div className="text-center p-4 text-xs text-on-surface-variant italic">No tickets</div>
      )}
    </div>
  </div>
);

const TicketKanban = () => {
  const { siteId } = useParams();
  const { data: tickets, isLoading } = useTickets(siteId);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateTicketStatus();
  const { mutate: createTicket, isPending: isCreating } = useCreateTicket();
  const { mutate: submitReport, isPending: isSubmittingReport } = useSubmitTicketReport();
  const { data: sites } = useSites();
  const { data: users } = useUsers();
  const user = useAppStore((state) => state.user);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [assignmentIntent, setAssignmentIntent] = useState<{ ticket: any; targetStatus: string } | null>(null);
  const [reportIntent, setReportIntent] = useState<{ ticket: any; targetStatus: string } | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [reportTicket, setReportTicket] = useState<any | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportForm, setReportForm] = useState(emptyReport);
  const [form, setForm] = useState({
    title: '',
    equipmentId: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: ''
  });

  const currentSite = useMemo(() => sites?.find((site: any) => site.id === siteId), [sites, siteId]);
  const scopedSites = useMemo(() => siteId ? sites?.filter((site: any) => site.id === siteId) : sites, [sites, siteId]);
  const canCreateTicket = ['Super Admin', 'Site Operator', 'Engineer'].includes(user?.role || '');
  const canAssign = ['Super Admin', 'Site Operator', 'Engineer'].includes(user?.role || '');

  const equipmentOptions = useMemo(() => {
    return scopedSites?.flatMap((site: any) => site.rooms?.flatMap((room: any) => room.equipments?.map((equipment: any) => ({
      ...equipment,
      roomName: room.name,
      siteName: site.name,
      siteId: site.id
    })) || []) || []) || [];
  }, [scopedSites]);

  const engineerOptions = useMemo(() => {
    const engineers = users?.filter((candidate: any) => candidate.role === 'Engineer') || [];
    const scoped = siteId ? engineers.filter((engineer: any) => engineer.siteIds?.includes(siteId)) : engineers;
    return user?.role === 'Engineer' ? scoped.filter((engineer: any) => engineer.id === user.id) : scoped;
  }, [users, siteId, user]);

  const groupedTickets = useMemo(() => {
    const grouped: Record<string, any[]> = { pending: [], assigned: [], inProgress: [], resolved: [], closed: [] };
    tickets?.forEach((ticket: any) => {
      if (grouped[ticket.status]) grouped[ticket.status].push(ticket);
    });
    return grouped;
  }, [tickets]);

  const canReportTicket = (ticket: any) => {
    if (ticket.status === 'pending' || ticket.status === 'closed') return false;
    if (user?.role === 'Super Admin') return true;
    return user?.role === 'Engineer' && ticket.assignedTo === user.id;
  };

  const canAssignTicket = (ticket: any) => {
    if (!canAssign || ticket.status === 'closed') return false;
    if (user?.role === 'Engineer') return !ticket.assignedTo || ticket.assignedTo === user.id;
    return true;
  };

  const canDragTicket = (ticket: any) => {
    if (ticket.status === 'closed') return false;
    if (!ticket.assignedTo) {
      return canAssign;
    }
    if (user?.role === 'Super Admin') return true;
    if (user?.role === 'Engineer' && ticket.assignedTo === user?.id) return true;
    return false;
  };

  const openCreateModal = () => {
    setFormError(null);
    setForm({
      title: '',
      equipmentId: '',
      priority: 'medium',
      assignedTo: user?.role === 'Engineer' ? user.id : '',
      dueDate: ''
    });
    setIsCreateOpen(true);
  };

  const openAssignmentModal = (ticket: any, targetStatus = 'assigned') => {
    setBoardError(null);
    setAssignmentIntent({ ticket, targetStatus });
    setSelectedAssignee(ticket.assignedTo || (user?.role === 'Engineer' ? user.id : ''));
  };

  const openReportModal = (ticket: any, targetStatus?: string) => {
    setReportError(null);
    setReportTicket(ticket);
    setReportIntent(targetStatus ? { ticket, targetStatus } : null);
    setReportForm(ticket.report ? {
      isFailure: ticket.report.isFailure ? 'yes' : 'no',
      failureDomain: ticket.report.failureDomain,
      rootCause: ticket.report.rootCause,
      actionTaken: ticket.report.actionTaken,
      serviceImpact: ticket.report.serviceImpact,
      currentState: ticket.report.currentState,
      notes: ticket.report.notes || ''
    } : emptyReport);
  };

  const handleDrop = (status: string, ticketId: string) => {
    setBoardError(null);
    const ticket = tickets?.find((item: any) => item.id === ticketId);
    if (!ticket || ticket.status === status) return;

    if (ticket.assignedTo) {
      if (status === 'pending') {
        if (user?.role !== 'Super Admin') {
          setBoardError('Only a Super Admin can send an assigned ticket back to Pending.');
          return;
        }
      } else {
        if (user?.id !== ticket.assignedTo) {
          setBoardError('Only the assigned engineer can move this ticket.');
          return;
        }
      }
    }

    if (['resolved', 'closed'].includes(status) && !ticket.report) {
      setBoardError('Submit the engineer response report before resolving or closing this ticket.');
      if (canReportTicket(ticket)) openReportModal(ticket, status);
      return;
    }

    if (status !== 'pending' && !ticket.assignedTo) {
      if (user?.role === 'Engineer') {
        updateStatus({
          id: ticketId,
          status,
          assignedTo: user.id
        }, {
          onError: (error) => setBoardError(error.message)
        });
      } else {
        openAssignmentModal(ticket, status);
      }
      return;
    }

    updateStatus({ id: ticketId, status }, {
      onError: (error) => setBoardError(error.message)
    });
  };

  const handleAssignmentSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!assignmentIntent || !selectedAssignee) return;

    updateStatus({
      id: assignmentIntent.ticket.id,
      status: assignmentIntent.targetStatus,
      assignedTo: selectedAssignee
    }, {
      onSuccess: () => setAssignmentIntent(null),
      onError: (error) => setBoardError(error.message)
    });
  };

  const handleCreateSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    createTicket({
      title: form.title,
      equipmentId: form.equipmentId,
      priority: form.priority as 'low' | 'medium' | 'high',
      assignedTo: form.assignedTo || undefined,
      dueDate: form.dueDate || undefined
    }, {
      onSuccess: () => setIsCreateOpen(false),
      onError: (error) => setFormError(error.message)
    });
  };

  const handleReportSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!reportTicket) return;

    setReportError(null);
    submitReport({
      id: reportTicket.id,
      report: {
        isFailure: reportForm.isFailure === 'yes',
        failureDomain: reportForm.failureDomain,
        rootCause: reportForm.rootCause,
        actionTaken: reportForm.actionTaken,
        serviceImpact: reportForm.serviceImpact,
        currentState: reportForm.currentState,
        notes: reportForm.notes
      }
    }, {
      onSuccess: () => {
        setReportTicket(null);
        if (reportIntent) {
          updateStatus({ id: reportIntent.ticket.id, status: reportIntent.targetStatus });
          setReportIntent(null);
        }
      },
      onError: (error) => setReportError(error.message)
    });
  };

  if (isLoading) return <div className="p-8 text-on-surface">Loading tickets...</div>;

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      <header className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">{siteId ? `${currentSite?.name || 'Site'} Tickets` : 'All Site Tickets'}</h2>
          <p className="text-on-surface-variant font-sans mt-1">Alarm-created and manually launched intervention tickets.</p>
        </div>
        {canCreateTicket && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-md font-sans font-medium hover:bg-primary-fixed-dim transition-colors"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        )}
      </header>

      {boardError && (
        <div className="bg-status-warning/10 border border-status-warning/30 text-status-warning rounded-md px-4 py-3 text-sm">
          {boardError}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 min-h-[520px]">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            status={column.status}
            tickets={groupedTickets[column.status]}
            onDrop={handleDrop}
            onReport={openReportModal}
            onAssign={openAssignmentModal}
            canReportTicket={canReportTicket}
            canAssignTicket={canAssignTicket}
            canDragTicket={canDragTicket}
          />
        ))}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-lg w-full max-w-xl shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border-subtle">
              <h3 className="text-lg font-sans font-medium text-on-surface">Launch Ticket</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Title</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Manual intervention title"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <option key={equipment.id} value={equipment.id}>{equipment.siteName} / {equipment.name} / {equipment.roomName}</option>
                    ))}
                  </select>
                </div>
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Due Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                    className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              {formError && <div className="text-sm text-status-warning">{formError}</div>}
              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-md font-medium text-on-surface hover:bg-bg-secondary transition-colors">Cancel</button>
                <button disabled={isCreating} type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-md font-medium hover:bg-primary-fixed-dim transition-colors disabled:opacity-50">
                  {isCreating ? 'Launching...' : 'Launch Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignmentIntent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-lg w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-border-subtle">
              <h3 className="text-lg font-sans font-medium text-on-surface">Assign Ticket</h3>
              <button onClick={() => setAssignmentIntent(null)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAssignmentSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Engineer</label>
                <select
                  required
                  value={selectedAssignee}
                  onChange={(event) => setSelectedAssignee(event.target.value)}
                  className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="">Select engineer...</option>
                  {engineerOptions.map((engineer: any) => (
                    <option key={engineer.id} value={engineer.id}>{engineer.firstName} {engineer.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                <button type="button" onClick={() => setAssignmentIntent(null)} className="px-4 py-2 rounded-md font-medium text-on-surface hover:bg-bg-secondary transition-colors">Cancel</button>
                <button disabled={isUpdatingStatus} type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-md font-medium hover:bg-primary-fixed-dim transition-colors disabled:opacity-50">
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reportTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-subtle rounded-lg w-full max-w-2xl shadow-xl flex flex-col max-h-[92vh]">
            <div className="flex justify-between items-center p-4 border-b border-border-subtle">
              <h3 className="text-lg font-sans font-medium text-on-surface">Engineer Response</h3>
              <button onClick={() => { setReportTicket(null); setReportIntent(null); }} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReportSubmit} className="p-4 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Was this a real failure?</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                    <input
                      type="radio"
                      name="isFailure"
                      value="yes"
                      checked={reportForm.isFailure === 'yes'}
                      onChange={(event) => setReportForm((current) => ({ ...current, isFailure: event.target.value }))}
                      className="accent-primary"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                    <input
                      type="radio"
                      name="isFailure"
                      value="no"
                      checked={reportForm.isFailure === 'no'}
                      onChange={(event) => setReportForm((current) => ({ ...current, isFailure: event.target.value }))}
                      className="accent-primary"
                    />
                    No
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Failure Domain</label>
                  <select value={reportForm.failureDomain} onChange={(event) => setReportForm((current) => ({ ...current, failureDomain: event.target.value }))} className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary">
                    {failureDomains.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Root Cause</label>
                  <select value={reportForm.rootCause} onChange={(event) => setReportForm((current) => ({ ...current, rootCause: event.target.value }))} className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary">
                    {rootCauses.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Action Taken</label>
                  <select value={reportForm.actionTaken} onChange={(event) => setReportForm((current) => ({ ...current, actionTaken: event.target.value }))} className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary">
                    {actionsTaken.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Service Impact</label>
                  <select value={reportForm.serviceImpact} onChange={(event) => setReportForm((current) => ({ ...current, serviceImpact: event.target.value }))} className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary">
                    {serviceImpacts.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Current State</label>
                <select value={reportForm.currentState} onChange={(event) => setReportForm((current) => ({ ...current, currentState: event.target.value }))} className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary">
                  {currentStates.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Additional Notes (Optional)</label>
                <textarea
                  rows={4}
                  value={reportForm.notes}
                  onChange={(event) => setReportForm((current) => ({ ...current, notes: event.target.value }))}
                  className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  placeholder="Short context, readings, vendor reference, or handover detail..."
                />
              </div>
              {reportError && <div className="text-sm text-status-warning">{reportError}</div>}
              <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                <button type="button" onClick={() => { setReportTicket(null); setReportIntent(null); }} className="px-4 py-2 rounded-md font-medium text-on-surface hover:bg-bg-secondary transition-colors">Cancel</button>
                <button disabled={isSubmittingReport} type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-md font-medium hover:bg-primary-fixed-dim transition-colors disabled:opacity-50">
                  {isSubmittingReport ? 'Submitting...' : 'Submit Response'}
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
