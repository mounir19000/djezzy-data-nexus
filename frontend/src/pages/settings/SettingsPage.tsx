import { useState, useEffect } from 'react';
import { Save, AlertTriangle, Shield } from 'lucide-react';
import { useExpertRules, useUpdateRule } from '../../hooks/useSettings';
import { displayOperationalText } from '../../lib/frenchLabels';

const SettingsPage = () => {
  const { data: expertRules, isLoading } = useExpertRules();
  const { mutate: updateRule } = useUpdateRule();
  const [localRules, setLocalRules] = useState<any[]>([]);

  useEffect(() => {
    if (expertRules) {
      setLocalRules(expertRules);
    }
  }, [expertRules]);

  const handleSave = () => {
    localRules.forEach(rule => {
      // Find original to check if modified
      const original = expertRules?.find((r: any) => r.id === rule.id);
      if (original && original.threshold !== rule.threshold) {
        updateRule({ id: rule.id, threshold: Number(rule.threshold) });
      }
    });
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-4xl mx-auto w-full">
      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border-subtle bg-bg-secondary flex items-center justify-between">
          <h3 className="text-lg font-sans font-medium text-on-surface flex items-center gap-2">
            <Shield className="w-5 h-5 text-secondary" /> Règles du système expert
          </h3>
          <span className="text-xs font-mono text-status-warning bg-status-warning/10 px-2 py-0.5 rounded border border-status-warning/20">Privilèges Super administrateur requis</span>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-status-warning/10 border border-status-warning/20 rounded-md p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-status-warning shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-status-warning">Modification des seuils actifs</h4>
              <p className="text-xs text-status-warning/80 mt-1">Les changements effectués ici mettent à jour le système expert basé sur les règles. Des valeurs incorrectes peuvent provoquer de fausses alarmes ou masquer des défauts critiques.</p>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-on-surface-variant text-sm">Chargement des règles...</div>
            ) : localRules.map((rule, idx) => (
              <div key={rule.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-background border border-border-subtle p-4 rounded-md">
                <div className="md:col-span-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-on-surface-variant bg-bg-secondary px-1.5 py-0.5 rounded">{rule.id.substring(0,8)}</span>
                    <h4 className="font-sans font-medium text-on-surface">{displayOperationalText(rule.name)}</h4>
                  </div>
                  <p className="text-sm text-on-surface-variant">{displayOperationalText(rule.description)}</p>
                </div>
                <div className="md:col-span-4 flex items-center justify-end gap-2">
                  <input 
                    type="number" 
                    value={rule.threshold} 
                    onChange={(e) => {
                      const newRules = [...localRules];
                      newRules[idx].threshold = e.target.value;
                      setLocalRules(newRules);
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
          <button 
            onClick={() => setLocalRules(expertRules || [])}
            className="px-4 py-2 text-sm font-medium text-on-surface hover:bg-background rounded-md transition-colors"
          >
            Reinitialiser
          </button>
          <button 
            onClick={handleSave}
            className="bg-primary text-on-primary px-4 py-2 rounded-md font-sans font-medium hover:bg-primary-fixed-dim transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Enregistrer la configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
