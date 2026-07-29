import { FileText, Download, Filter } from 'lucide-react';

const ExecutiveReportGenerator = () => {
  return (
    <div className="h-full flex flex-col space-y-6 max-w-5xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* Report Configuration */}
        <div className="col-span-1 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-6 flex items-center gap-2">
            <Filter className="w-5 h-5 text-on-surface-variant" /> Criteres du rapport
          </h3>
          
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Type de rapport</label>
              <select className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:border-primary focus:outline-none">
                <option>Synthèse hebdomadaire de la santé réseau</option>
                <option>Résolution mensuelle des incidents</option>
                <option>Specifique au site (MSC10 Blida)</option>
                <option>Conformite maintenance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Période</label>
              <select className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-on-surface focus:border-primary focus:outline-none">
                <option>7 derniers jours</option>
                <option>30 derniers jours</option>
                <option>Trimestre en cours</option>
                <option>Période personnalisée...</option>
              </select>
            </div>
          </div>
          
          <button className="w-full bg-primary text-on-primary px-4 py-2 rounded-md font-sans font-medium hover:bg-primary-fixed-dim transition-colors mt-4">
            Générer l’aperçu
          </button>
        </div>

        {/* Report Preview */}
        <div className="col-span-1 md:col-span-2 bg-bg-surface border border-border-subtle rounded-lg p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-sans font-medium text-on-surface flex items-center gap-2">
              <FileText className="w-5 h-5 text-on-surface-variant" /> Apercu
            </h3>
            <button className="border border-border-subtle text-on-surface px-4 py-1.5 rounded-md text-sm font-medium hover:bg-background transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Exporter PDF
            </button>
          </div>
          
          <div className="flex-1 bg-background border border-border-subtle rounded-md p-8 overflow-y-auto">
            {/* Mock PDF Content */}
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center border-b border-border-subtle pb-6">
                <h1 className="text-2xl font-bold text-on-surface mb-2">Synthèse hebdomadaire de la santé réseau</h1>
                <p className="text-on-surface-variant">20 juillet 2026 - 27 juillet 2026</p>
              </div>
              
              <div>
                <h2 className="text-lg font-bold text-on-surface mb-3">1. Vue exécutive</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Le réseau a maintenu un score de santé global de 94,2% cette semaine. Au total, 14 incidents critiques ont été résolus, avec un temps moyen de résolution (MTTR) de 2,4 heures. Le système expert IA a généré 8 401 diagnostics automatisés et a évité 3 interruptions majeures en anticipant des défauts de bypass UPS à MSC10 Blida.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-on-surface mb-3">2. Indicateurs clés</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-bg-surface p-3 rounded border border-border-subtle">
                    <div className="text-xs text-on-surface-variant">Tickets totaux</div>
                    <div className="text-xl font-bold text-on-surface">124</div>
                  </div>
                  <div className="bg-bg-surface p-3 rounded border border-border-subtle">
                    <div className="text-xs text-on-surface-variant">Conformite maintenance</div>
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
