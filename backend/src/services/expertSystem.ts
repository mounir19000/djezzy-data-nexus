interface DiagnosisInput {
  severity: string;
  description: string;
  equipment?: {
    name?: string | null;
    type?: string | null;
    room?: {
      name?: string | null;
    } | null;
  } | null;
}

export interface ExpertDiagnosis {
  problem: string;
  category: 'Power' | 'Cooling' | 'UPS' | 'Battery' | 'Telemetry' | 'General';
  probableCauses: string[];
  operationalImpacts: string[];
  technicalJustification: string;
  recommendedActions: string[];
  recoveryConditions: string[];
  contactPerson: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
}

const includesAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term));

const severityToPriority = (severity: string): 'low' | 'medium' | 'high' => {
  if (severity === 'critical') return 'high';
  if (severity === 'warning') return 'medium';
  return 'low';
};

export const generateDiagnosis = (alarm: DiagnosisInput): ExpertDiagnosis => {
  const description = alarm.description.toLowerCase();
  const equipmentType = alarm.equipment?.type?.toLowerCase() || '';
  const equipmentName = alarm.equipment?.name || 'Monitored equipment';
  const roomName = alarm.equipment?.room?.name || 'Unknown room';
  const priority = severityToPriority(alarm.severity);

  if (includesAny(description, ['temp', 'temperature', 'clim', 'return air', 'haute'])) {
    return {
      problem: `${roomName} thermal condition outside target range`,
      category: 'Cooling',
      probableCauses: [
        'Cooling unit under-performing or stopped',
        'Blocked filter or reduced air circulation',
        'Room load increased beyond cooling capacity'
      ],
      operationalImpacts: [
        'Thermal stress on telecom and power equipment',
        'Higher probability of cascading alarms if temperature continues rising'
      ],
      technicalJustification: 'The room temperature alarm matches the configured environmental threshold methodology for MSC10 Blida rooms.',
      recommendedActions: [
        'Verify the active cooling unit state and alarm panel.',
        'Inspect air filters and airflow around the affected racks.',
        'Escalate to HVAC maintenance if the room does not recover within 15 minutes.'
      ],
      recoveryConditions: [
        'Room temperature returns below the configured high threshold.',
        'No active cooling or high-temperature alarms remain for the room.'
      ],
      contactPerson: 'Cooling/HVAC technician',
      confidence: 90,
      priority
    };
  }

  if (includesAny(description, ['absence de tension', 'grid', 'voltage sag', 'input supply', 'reseau'])) {
    return {
      problem: 'Site power input instability detected',
      category: 'Power',
      probableCauses: [
        'Utility grid outage or voltage sag',
        'Transformer input instability',
        'ATS transition or protection event'
      ],
      operationalImpacts: [
        'Site may be operating on backup power or exposed to input fluctuations',
        'UPS batteries can discharge if grid power remains unavailable'
      ],
      technicalJustification: 'The alarm text matches critical SCADA power events used by the Blida health-score kill-switch methodology.',
      recommendedActions: [
        'Confirm three-phase input voltage on the power panel.',
        'Verify ATS source selection and generator readiness.',
        'Monitor UPS battery capacity until stable grid input is restored.'
      ],
      recoveryConditions: [
        'L1, L2, and L3 input voltages return to nominal range.',
        'ATS is stable on grid or generator source with UPS battery capacity protected.'
      ],
      contactPerson: 'Power systems engineer',
      confidence: 94,
      priority
    };
  }

  if (includesAny(description, ['bypass', 'sync', 'synchronization', 'ups failure', 'general alarm', 'rectifier']) || equipmentType === 'ups') {
    return {
      problem: `${equipmentName} protection path degraded`,
      category: 'UPS',
      probableCauses: [
        'Inverter phase synchronization fault',
        'Static bypass switch or rectifier input fault',
        'UPS control board or protection logic event'
      ],
      operationalImpacts: [
        'Critical loads may lose clean protected power',
        'Switch and transmission rooms become vulnerable to grid fluctuations'
      ],
      technicalJustification: 'The expert rules classify UPS bypass, synchronization, rectifier, and general UPS alarms as high-risk power protection events.',
      recommendedActions: [
        'Verify UPS front-panel alarm codes and current operating mode.',
        'Confirm output phase sequence and load balance across L1, L2, and L3.',
        'Keep redundant protection available and dispatch a UPS specialist if the alarm remains active.'
      ],
      recoveryConditions: [
        'UPS returns to inverter-protected operation.',
        'Output load is balanced and no UPS critical alarm remains active.'
      ],
      contactPerson: 'Tier 2 UPS specialist',
      confidence: 92,
      priority
    };
  }

  if (includesAny(description, ['battery', 'charger'])) {
    return {
      problem: `${equipmentName} backup capacity requires attention`,
      category: 'Battery',
      probableCauses: [
        'Battery string degradation',
        'Charger preventive alarm',
        'Extended backup-power operation'
      ],
      operationalImpacts: [
        'Reduced site autonomy during power loss',
        'Higher shutdown risk if grid power fails before batteries recover'
      ],
      technicalJustification: 'Battery capacity and charger alarms directly affect the UPS health component of the site health methodology.',
      recommendedActions: [
        'Check UPS battery capacity and charger status.',
        'Inspect battery cabinet temperature and visible cell condition.',
        'Schedule autonomy testing if capacity remains below expected float level.'
      ],
      recoveryConditions: [
        'Battery capacity returns to expected float level.',
        'No charger or battery alarms remain active.'
      ],
      contactPerson: 'Power systems engineer',
      confidence: 86,
      priority
    };
  }

  return {
    problem: `${equipmentName} alarm requires operator review`,
    category: 'General',
    probableCauses: [
      'Equipment state changed outside expected operating envelope',
      'SCADA event requires validation against field status'
    ],
    operationalImpacts: [
      'Potential degradation of MSC10 Blida operating conditions',
      'Incident may require engineer intervention if it persists'
    ],
    technicalJustification: 'No specialized rule matched the alarm text, so the platform falls back to the general alarm review workflow.',
    recommendedActions: [
      'Validate the alarm in SCADA and inspect the affected room.',
      'Create an actionable ticket if the condition persists or affects service risk.',
      'Attach field notes after intervention so the knowledge base can be updated.'
    ],
    recoveryConditions: [
      'Alarm is cleared or acknowledged after field validation.',
      'Related equipment status returns to healthy.'
    ],
    contactPerson: 'Site engineer',
    confidence: 72,
    priority
  };
};
