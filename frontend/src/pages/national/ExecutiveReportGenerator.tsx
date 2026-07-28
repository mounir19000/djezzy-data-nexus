import { FileText, Download, Filter } from 'lucide-react';

const ExecutiveReportGenerator = () => {
  return (
    <div className="h-full flex flex-col space-y-6 max-w-5xl mx-auto w-full">
      <header>
        <h2 className="text-3xl font-display font-bold text-on-surface">Executive Reports</h2>
        <p className="text-on-surface-variant font-sans mt-1">Generate and export automated operational summaries.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* Report Configuration */}
        <div className="col-span-1 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-6 flex items-center gap-2">
            <Filter className="w-5 h-5 text-on-surface-variant" /> Report Criteria
          </h3>
          
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Report Type</label>
              <select className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:border-primary focus:outline-none">
                <option>Weekly Network Health Summary</option>
                <option>Monthly Incident Resolution</option>
                <option>Site Specific (MSC10 Blida)</option>
                <option>Maintenance Compliance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Time Range</label>
              <select className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:border-primary focus:outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Current Quarter</option>
                <option>Custom Range...</option>
              </select>
            </div>
          </div>
          
          <button className="w-full bg-primary text-on-primary px-4 py-2 rounded-md font-sans font-medium hover:bg-primary-fixed-dim transition-colors mt-4">
            Generate Preview
          </button>
        </div>

        {/* Report Preview */}
        <div className="col-span-1 md:col-span-2 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-sans font-medium text-on-surface flex items-center gap-2">
              <FileText className="w-5 h-5 text-on-surface-variant" /> Preview
            </h3>
            <button className="border border-border-subtle text-on-surface px-4 py-1.5 rounded-md text-sm font-medium hover:bg-background transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
          
          <div className="flex-1 bg-background border border-border-subtle rounded-md p-8 overflow-y-auto">
            {/* Mock PDF Content */}
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center border-b border-border-subtle pb-6">
                <h1 className="text-2xl font-bold text-on-surface mb-2">Weekly Network Health Summary</h1>
                <p className="text-on-surface-variant">July 20, 2026 - July 27, 2026</p>
              </div>
              
              <div>
                <h2 className="text-lg font-bold text-on-surface mb-3">1. Executive Overview</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  The network maintained an overall health score of 94.2% this week. A total of 14 critical incidents were resolved, with an average Mean Time To Resolution (MTTR) of 2.4 hours. The AI Expert System generated 8,401 automated diagnoses, successfully preventing 3 major outages by predicting UPS bypass failures at MSC10 Blida.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-on-surface mb-3">2. Key Metrics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-bg-surface p-3 rounded border border-border-subtle">
                    <div className="text-xs text-on-surface-variant">Total Tickets</div>
                    <div className="text-xl font-bold text-on-surface">124</div>
                  </div>
                  <div className="bg-bg-surface p-3 rounded border border-border-subtle">
                    <div className="text-xs text-on-surface-variant">Maintenance Compliance</div>
                    <div className="text-xl font-bold text-status-healthy">98%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveReportGenerator;
