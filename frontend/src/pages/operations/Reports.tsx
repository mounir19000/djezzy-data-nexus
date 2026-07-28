import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, FileText, User, Search, Filter } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { useTickets } from '../../hooks/useTickets';
import { useSites } from '../../hooks/useSites';

const Reports = () => {
  const { siteId } = useParams();
  const { data: tickets, isLoading } = useTickets(siteId);

  const { data: sites } = useSites();

  const [searchTerm, setSearchTerm] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [failureFilter, setFailureFilter] = useState('');

  const reportedTickets = useMemo(() => tickets?.filter((ticket: any) => ticket.report) || [], [tickets]);

  const filteredReportedTickets = useMemo(() => {
    let result = reportedTickets;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((ticket: any) =>
        ticket.id.toLowerCase().includes(lowerSearch) ||
        ticket.title.toLowerCase().includes(lowerSearch) ||
        ticket.report.rootCause?.toLowerCase().includes(lowerSearch) ||
        ticket.report.actionTaken?.toLowerCase().includes(lowerSearch) ||
        ticket.equipment?.name?.toLowerCase().includes(lowerSearch) ||
        ticket.report.submitter?.firstName?.toLowerCase().includes(lowerSearch) ||
        ticket.report.submitter?.lastName?.toLowerCase().includes(lowerSearch)
      );
    }
    if (siteFilter) {
      result = result.filter((ticket: any) => 
        ticket.equipment?.room?.site?.id === siteFilter || ticket.equipment?.room?.siteId === siteFilter
      );
    }
    if (failureFilter) {
      const isFailure = failureFilter === 'yes';
      result = result.filter((ticket: any) => ticket.report.isFailure === isFailure);
    }
    return result;
  }, [reportedTickets, searchTerm, siteFilter, failureFilter]);
  const missingReports = useMemo(() => tickets?.filter((ticket: any) => !ticket.report && ticket.status !== 'pending' && ticket.status !== 'closed') || [], [tickets]);
  const confirmedFailures = reportedTickets.filter((ticket: any) => ticket.report.isFailure).length;
  const falseAlarms = reportedTickets.length - confirmedFailures;

  if (isLoading) return <div className="p-8 text-on-surface">Loading reports...</div>;

  return (
    <div className="h-full flex flex-col space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
          <p className="text-sm text-on-surface-variant">Submitted Reports</p>
          <div className="text-3xl font-display font-bold text-on-surface mt-2">{reportedTickets.length}</div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
          <p className="text-sm text-on-surface-variant">Confirmed Failures</p>
          <div className="text-3xl font-display font-bold text-status-critical mt-2">{confirmedFailures}</div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
          <p className="text-sm text-on-surface-variant">False Alarms</p>
          <div className="text-3xl font-display font-bold text-status-healthy mt-2">{falseAlarms}</div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
          <p className="text-sm text-on-surface-variant">Awaiting Report</p>
          <div className="text-3xl font-display font-bold text-status-warning mt-2">{missingReports.length}</div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-0">
        <section className="xl:col-span-2 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col min-h-[480px]">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5">
            <h3 className="text-lg font-sans font-medium text-on-surface flex items-center gap-2 shrink-0">
              <FileText className="w-5 h-5 text-on-surface-variant" /> Report History
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 flex-1 xl:justify-end">
              <div className="relative w-full sm:max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background border border-border-subtle rounded-md py-2 pl-9 pr-3 text-sm text-on-surface focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-brand-primary min-w-[150px]"
              >
                <option value="">All Sites</option>
                {sites?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                value={failureFilter}
                onChange={(e) => setFailureFilter(e.target.value)}
                className="bg-background border border-border-subtle rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-brand-primary min-w-[130px]"
              >
                <option value="">All Types</option>
                <option value="yes">Confirmed Failures</option>
                <option value="no">False Alarms</option>
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {filteredReportedTickets.length === 0 ? (
              <div className="bg-background border border-dashed border-border-subtle rounded-md p-8 text-center text-on-surface-variant">
                {reportedTickets.length === 0 ? 'No ticket reports submitted yet.' : 'No reports match your search.'}
              </div>
            ) : filteredReportedTickets.map((ticket: any) => (
              <div key={ticket.id} className="bg-background border border-border-subtle rounded-md p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-on-surface-variant">{ticket.id.substring(0, 8)}</span>
                      <Badge status={ticket.report.isFailure ? 'critical' : 'healthy'}>
                        {ticket.report.isFailure ? 'FAILURE' : 'NO FAILURE'}
                      </Badge>
                    </div>
                    <h4 className="font-sans font-medium text-on-surface mt-2">{ticket.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {ticket.equipment?.room?.site?.name} / {ticket.equipment?.name} / {ticket.equipment?.room?.name}
                    </p>
                  </div>
                  <div className="text-xs text-on-surface-variant shrink-0">
                    {new Date(ticket.report.updatedAt || ticket.report.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
                  <div>
                    <p className="text-xs uppercase font-mono text-on-surface-variant">Root Cause</p>
                    <p className="text-on-surface mt-1">{ticket.report.rootCause}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-mono text-on-surface-variant">Action Taken</p>
                    <p className="text-on-surface mt-1">{ticket.report.actionTaken}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-mono text-on-surface-variant">Impact</p>
                    <p className="text-on-surface mt-1">{ticket.report.serviceImpact}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-mono text-on-surface-variant">Current State</p>
                    <p className="text-on-surface mt-1">{ticket.report.currentState}</p>
                  </div>
                </div>

                {ticket.report.notes && (
                  <div className="mt-4 border-t border-border-subtle pt-3">
                    <p className="text-xs uppercase font-mono text-on-surface-variant">Notes</p>
                    <p className="text-sm text-on-surface mt-1">{ticket.report.notes}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 text-xs text-on-surface-variant">
                  <User className="w-3 h-3" />
                  <span>{ticket.report.submitter?.firstName} {ticket.report.submitter?.lastName}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col min-h-[480px]">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-5">Report Queue</h3>
          <div className="space-y-3 overflow-y-auto pr-2">
            {missingReports.length === 0 ? (
              <div className="bg-background border border-border-subtle rounded-md p-4 text-sm text-on-surface-variant flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-status-healthy" /> No active ticket is waiting for a report.
              </div>
            ) : missingReports.map((ticket: any) => (
              <div key={ticket.id} className="bg-background border border-border-subtle rounded-md p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-status-warning mt-1 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-on-surface">{ticket.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : 'Unassigned'} / {ticket.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reports;
