import React, { useState } from 'react';
import { Save, AlertTriangle, Shield, CheckCircle } from 'lucide-react';

const rulesConfig = [
  { id: 'R-01', name: 'Critical Temperature Threshold', description: 'Triggers critical alarm if any Battery Room exceeds this value.', value: '28', unit: '°C' },
  { id: 'R-02', name: 'UPS Bypass Timeout', description: 'Grace period before UPS bypass triggers a severity escalation.', value: '5', unit: 'minutes' },
  { id: 'R-03', name: 'Grid Voltage Sag Tolerance', description: 'Minimum voltage before ATS attempts switchover.', value: '190', unit: 'V' },
];

const SettingsPage = () => {
  const [rules, setRules] = useState(rulesConfig);

  return (
    <div className="h-full flex flex-col space-y-6 max-w-4xl mx-auto w-full">
      <header>
        <h2 className="text-3xl font-display font-bold text-on-surface">Platform Settings</h2>
        <p className="text-on-surface-variant font-sans mt-1">Configure global platform thresholds and expert system logic.</p>
      </header>

      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border-subtle bg-bg-secondary flex items-center justify-between">
          <h3 className="text-lg font-sans font-medium text-on-surface flex items-center gap-2">
            <Shield className="w-5 h-5 text-secondary" /> Expert System Rules
          </h3>
          <span className="text-xs font-mono text-status-warning bg-status-warning/10 px-2 py-0.5 rounded border border-status-warning/20">Admin Privileges Required</span>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-status-warning/10 border border-status-warning/20 rounded-md p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-status-warning shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-status-warning">Modifying Active Thresholds</h4>
              <p className="text-xs text-status-warning/80 mt-1">Changes made here will instantly update the AI inference engine across all Djezzy sites. Incorrect values may cause false alarms or suppress critical failures.</p>
            </div>
          </div>

          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div key={rule.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-background border border-border-subtle p-4 rounded-md">
                <div className="md:col-span-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-on-surface-variant bg-bg-secondary px-1.5 py-0.5 rounded">{rule.id}</span>
                    <h4 className="font-sans font-medium text-on-surface">{rule.name}</h4>
                  </div>
                  <p className="text-sm text-on-surface-variant">{rule.description}</p>
                </div>
                <div className="md:col-span-4 flex items-center justify-end gap-2">
                  <input 
                    type="number" 
                    value={rule.value} 
                    onChange={(e) => {
                      const newRules = [...rules];
                      newRules[idx].value = e.target.value;
                      setRules(newRules);
                    }}
                    className="w-24 bg-bg-surface border border-border-subtle rounded-md px-3 py-1.5 text-on-surface font-mono text-right focus:border-primary focus:outline-none"
                  />
                  <span className="text-on-surface-variant font-mono w-12">{rule.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border-subtle bg-bg-secondary flex justify-end gap-3">
          <button className="px-4 py-2 text-sm font-medium text-on-surface hover:bg-background rounded-md transition-colors">
            Reset to Defaults
          </button>
          <button className="bg-primary text-on-primary px-4 py-2 rounded-md font-sans font-medium hover:bg-primary-fixed-dim transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
