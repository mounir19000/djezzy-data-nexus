import React, { useState } from 'react';
import { FileText, Download, Upload, CheckCircle } from 'lucide-react';

const Reports = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">Reports</h2>
          <p className="text-on-surface-variant font-sans mt-1">Generate and submit operational shift reports.</p>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        
        {/* Submit Report Form */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col h-full overflow-y-auto">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-on-surface-variant" /> New Shift Report
          </h3>
          
          {isSubmitted ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <CheckCircle className="w-16 h-16 text-status-healthy mb-4" />
              <h4 className="text-xl font-medium text-on-surface mb-2">Report Submitted Successfully</h4>
              <p className="text-on-surface-variant">The shift report has been logged in the system.</p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="mt-6 bg-primary text-on-primary px-4 py-2 rounded-md font-medium hover:bg-primary-fixed-dim transition-colors"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Shift Type</label>
                  <select required className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary">
                    <option value="Morning">Morning (08:00 - 16:00)</option>
                    <option value="Evening">Evening (16:00 - 00:00)</option>
                    <option value="Night">Night (00:00 - 08:00)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Overall Status</label>
                  <select required className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary">
                    <option value="Normal">Normal Operations</option>
                    <option value="Degraded">Degraded - Active Incidents</option>
                    <option value="Critical">Critical - Major Outages</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-on-surface border-b border-border-subtle pb-2">Checklist</h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface">All scheduled maintenance completed?</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="maint" value="yes" required className="accent-primary" /> Yes
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="maint" value="no" required className="accent-primary" /> No
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface">Any new critical alarms raised during shift?</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="alarms" value="yes" required className="accent-primary" /> Yes
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="alarms" value="no" required className="accent-primary" /> No
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface">All handover items discussed with next shift?</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="handover" value="yes" required className="accent-primary" /> Yes
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="handover" value="no" required className="accent-primary" /> No
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-on-surface mb-1">Additional Notes (Optional)</label>
                <textarea rows={4} className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:outline-none focus:border-primary" placeholder="Enter any extra information, handover notes, or issues encountered..."></textarea>
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end">
                <button type="submit" className="bg-primary text-on-primary px-6 py-2 rounded-md font-medium hover:bg-primary-fixed-dim transition-colors flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Submit Report
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Previous Reports History */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col h-full">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-6 flex items-center gap-2">
            <Download className="w-5 h-5 text-on-surface-variant" /> Recent Reports
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-background border border-border-subtle rounded-md p-4 flex items-center justify-between hover:border-primary cursor-pointer transition-colors">
                <div>
                  <h4 className="font-sans font-medium text-on-surface mb-1">Morning Shift - MSC10 Blida</h4>
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                    <span>July {28 - item}, 2026</span>
                    <span className="bg-status-healthy/10 text-status-healthy px-2 py-0.5 rounded">Normal</span>
                  </div>
                </div>
                <button className="text-primary hover:bg-bg-secondary p-2 rounded-full transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
