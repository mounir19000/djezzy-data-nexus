export type LabelOption = {
  value: string;
  label: string;
};

export const statusLabels: Record<string, string> = {
  healthy: 'Sain',
  warning: 'Avertissement',
  critical: 'Critique',
  offline: 'Hors ligne',
  completed: 'Terminé',
  pending: 'En attente',
  assigned: 'Assigné',
  inProgress: 'En cours',
  resolved: 'Résolu',
  closed: 'Clôturé'
};

export const priorityLabels: Record<string, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Haute'
};

export const recurrenceLabels: Record<string, string> = {
  weekly: 'Hebdomadaire',
  monthly: 'Mensuelle'
};

export const roleLabels: Record<string, string> = {
  'Super Admin': 'Super administrateur',
  Engineer: 'Ingénieur',
  'Site Operator': 'Opérateur de site'
};

const exactTextLabels: Record<string, string> = {
  'MSC01 Algiers': 'MSC01 Alger',
  'Algiers, Algeria': 'Alger, Algérie',
  'Blida, Algeria': 'Blida, Algérie',
  'Selected site': 'Site sélectionné',
  Site: 'Site',
  General: 'Général',
  'Unknown room': 'Salle inconnue',
  Unknown: 'Inconnu',
  Equipment: 'Équipement',
  Room: 'Salle',
  Battery: 'Batterie',
  Network: 'Réseau',
  Generator: 'Groupe électrogène',
  Transformer: 'Transformateur',
  Cooling: 'Climatisation',
  Rectifier: 'Redresseur',
  'UPS Room': 'Salle UPS',
  'Battery Room': 'Salle batteries',
  'Switch Room': 'Salle switch',
  'ENR Room': 'Salle ENR',
  'V-SAT Room': 'Salle V-SAT',
  'Generator Area': 'Zone groupes électrogènes',
  'Cooling Systems': 'Systèmes de refroidissement',
  'Electrical Room': 'Salle électrique',
  'Switch / Network Room': 'Salle switch / réseau',
  'Energy Room': 'Salle énergie',
  'Data Center': 'Data center',
  'Power Systems': 'Systèmes énergie',
  'Cooling & HVAC': 'Climatisation et HVAC',
  'Network & Telemetry': 'Réseau et télémétrie',
  'General SOP': 'Procédure générale',
  'Incident Reports': 'Rapports incidents',
  'UPS Synchronization Recovery Procedure': 'Procédure de reprise après défaut de synchronisation UPS',
  'Cooling High Temperature Response': 'Réponse à une température élevée de climatisation',
  '# UPS Synchronization Recovery Procedure\n\n## Symptoms\nUPS synchronization failure, bypass alarm, or unbalanced output load.\n\n## Corrective Actions\n- Verify UPS front-panel fault code.\n- Confirm L1/L2/L3 output sequence and load balance.\n- Keep redundant UPS protection available while dispatching a UPS specialist.\n\n## Recovery\nUPS must return to inverter-protected operation with no active critical alarm.': '# Procédure de reprise après défaut de synchronisation UPS\n\n## Symptômes\nDéfaut de synchronisation UPS, alarme bypass ou charge de sortie déséquilibrée.\n\n## Actions correctives\n- Vérifier le code défaut en façade de l’UPS.\n- Confirmer la séquence de sortie L1/L2/L3 et l’équilibre de charge.\n- Conserver la protection UPS redondante pendant l’intervention d’un spécialiste UPS.\n\n## Retour à la normale\nL’UPS doit revenir en fonctionnement protégé par onduleur, sans alarme critique active.',
  '# Cooling High Temperature Response\n\n## Symptoms\nReturn-air temperature alarm or room score degradation.\n\n## Corrective Actions\n- Confirm cooling unit state and alarm panel.\n- Inspect filters and rack airflow.\n- Escalate if temperature does not recover within 15 minutes.': '# Réponse à une température élevée de climatisation\n\n## Symptômes\nAlarme de température d’air retour ou dégradation du score de salle.\n\n## Actions correctives\n- Confirmer l’état de l’unité de climatisation et du panneau d’alarmes.\n- Inspecter les filtres et le flux d’air autour des baies.\n- Escalader si la température ne revient pas à la normale sous 15 minutes.',
  'Battery Room High Temperature': 'Température élevée en salle batteries',
  'Battery Room room-health score begins degrading above 80 percent of this threshold.': 'Le score de santé de la salle batteries commence à se dégrader au-delà de 80 pour cent de ce seuil.',
  'Switch Room High Temperature': 'Température élevée en salle switch',
  'Switch Room room-health score threshold from the Blida health methodology.': 'Seuil du score de santé de la salle switch selon la méthodologie Blida.',
  'UPS Load Warning': 'Avertissement de charge UPS',
  'UPS health score degrades when maximum phase load approaches this limit.': 'Le score de santé UPS se dégrade lorsque la charge maximale par phase approche cette limite.',
  'Grid Failure Site Health Cap': 'Plafond de santé site en cas de défaut réseau',
  'If all three grid phases are zero, cap the site score at 50.': 'Si les trois phases réseau sont à zéro, plafonner le score du site à 50.',
  'No active causes detected.': 'Aucune cause active détectée.',
  'Grid power is unavailable.': 'L’alimentation secteur est indisponible.',
  'Battery reserve is almost depleted.': 'La réserve batterie est presque épuisée.',
  'UPS is stable': 'UPS stable',
  'UPS load is very high': 'Charge UPS très élevée',
  'UPS load is elevated': 'Charge UPS élevée',
  'Battery reserve needs attention': 'La réserve batterie requiert une attention',
  'UPS is running hot': 'UPS en température élevée',
  'PDF weighted Blida methodology': 'Méthodologie pondérée Blida PDF',
  'Configured component average': 'Moyenne des composants configurés'
};

export const reportOptions = {
  failureDomains: [
    { value: 'Power', label: 'Énergie' },
    { value: 'UPS', label: 'UPS' },
    { value: 'Cooling', label: 'Climatisation' },
    { value: 'Battery', label: 'Batterie' },
    { value: 'Network', label: 'Réseau' },
    { value: 'Generator', label: 'Groupe électrogène' },
    { value: 'SCADA / Sensor', label: 'SCADA / Capteur' },
    { value: 'Other', label: 'Autre' }
  ],
  rootCauses: [
    { value: 'Grid outage / Sonelgaz', label: 'Coupure réseau / Sonelgaz' },
    { value: 'UPS bypass or internal fault', label: 'Bypass UPS ou défaut interne' },
    { value: 'Cooling unit fault', label: 'Défaut d’unité de climatisation' },
    { value: 'High room temperature', label: 'Température de salle élevée' },
    { value: 'Battery degradation', label: 'Dégradation batterie' },
    { value: 'Network or communication fault', label: 'Défaut réseau ou communication' },
    { value: 'Sensor noise / false alarm', label: 'Bruit capteur / fausse alarme' },
    { value: 'Human operation / configuration', label: 'Opération humaine / configuration' },
    { value: 'Unknown after inspection', label: 'Inconnu après inspection' }
  ],
  actionsTaken: [
    { value: 'Restored normal supply', label: 'Alimentation normale rétablie' },
    { value: 'Reset or acknowledged alarm', label: 'Alarme réinitialisée ou acquittée' },
    { value: 'Switched equipment mode', label: 'Mode équipement basculé' },
    { value: 'Restarted cooling equipment', label: 'Équipement de climatisation redémarré' },
    { value: 'Dispatched field intervention', label: 'Intervention terrain déclenchée' },
    { value: 'Escalated to vendor', label: 'Escalade fournisseur' },
    { value: 'Replaced or isolated component', label: 'Composant remplacé ou isolé' },
    { value: 'No action required', label: 'Aucune action requise' }
  ],
  serviceImpacts: [
    { value: 'None', label: 'Aucun' },
    { value: 'Degraded redundancy', label: 'Redondance dégradée' },
    { value: 'Partial outage', label: 'Interruption partielle' },
    { value: 'Major outage', label: 'Interruption majeure' },
    { value: 'Unknown', label: 'Inconnu' }
  ],
  currentStates: [
    { value: 'Restored', label: 'Rétabli' },
    { value: 'Stable under monitoring', label: 'Stable sous surveillance' },
    { value: 'Escalated / waiting vendor', label: 'Escalade / attente fournisseur' },
    { value: 'Needs follow-up', label: 'Suivi nécessaire' },
    { value: 'False alarm closed', label: 'Fausse alarme clôturée' }
  ],
  maintenanceStates: [
    { value: 'Healthy', label: 'Sain - pleinement opérationnel' },
    { value: 'Warning', label: 'Avertissement - surveillance requise' },
    { value: 'Critical', label: 'Critique - suivi requis' }
  ]
} satisfies Record<string, LabelOption[]>;

const reportValueLabels = Object.values(reportOptions)
  .flat()
  .reduce<Record<string, string>>((labels, option) => {
    labels[option.value] = option.label;
    return labels;
  }, {});

export const displayText = (value?: string | null, fallback = '') => {
  if (!value) return fallback;
  return exactTextLabels[value] || value;
};

export const displayStatus = (value?: string | null, uppercase = false) => {
  const label = value ? statusLabels[value] || exactTextLabels[value] || value : '';
  return uppercase ? label.toUpperCase() : label;
};

export const displayPriority = (value?: string | null, uppercase = false) => {
  const label = value ? priorityLabels[value] || value : '';
  return uppercase ? label.toUpperCase() : label;
};

export const displayRecurrence = (value?: string | null, uppercase = false) => {
  const label = value ? recurrenceLabels[value] || value : '';
  return uppercase ? label.toUpperCase() : label;
};

export const displayRole = (value?: string | null) => value ? roleLabels[value] || value : '';

export const displayReportValue = (value?: string | null) => {
  if (!value) return '';
  return reportValueLabels[value] || displayText(value, value);
};

export const displayOperationalText = (value?: string | null) => {
  if (!value) return '';
  let translated = exactTextLabels[value] || value;
  [
    'MSC01 Algiers',
    'Algiers, Algeria',
    'Blida, Algeria',
    'UPS Room',
    'Battery Room',
    'Switch Room',
    'ENR Room',
    'V-SAT Room',
    'Generator Area',
    'Cooling Systems',
    'Electrical Room',
    'Switch / Network Room',
    'Energy Room',
    'Data Center'
  ].forEach((source) => {
    translated = translated.replaceAll(source, exactTextLabels[source]);
  });
  translated = translated.replace(/\bon\b/g, 'sur');
  translated = translated.replace(/ is running hot$/i, ' en température élevée');
  translated = translated.replace(/ temperature is rising$/i, ' température en hausse');
  translated = translated.replace(/ is stable$/i, ' stable');
  translated = translated.replace(/ output phases are severely unbalanced/i, ' phases de sortie fortement déséquilibrées');
  translated = translated.replace(/ output phases are unbalanced/i, ' phases de sortie déséquilibrées');
  return translated;
};

export const formatDate = (value: string | Date) => new Date(value).toLocaleDateString('fr-FR');

export const formatDateTime = (value: string | Date) => new Date(value).toLocaleString('fr-FR');

export const formatTime = (value: string | Date) => new Date(value).toLocaleTimeString('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});
