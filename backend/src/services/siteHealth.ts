type LatestMetricMap = Record<string, Record<string, number>>;

interface AlarmLike {
  severity: string;
  description: string;
}

interface EquipmentLike {
  id: string;
  name: string;
  type: string;
  alarms?: AlarmLike[];
  status?: string;
}

interface RoomLike {
  id: string;
  name: string;
  targetTemp: number;
  equipments?: EquipmentLike[];
}

interface SiteLike {
  id: string;
  name: string;
  overallHealth: number;
  rooms?: RoomLike[];
}

const round = (value: number) => Math.round(value * 10) / 10;
const clamp = (value: number) => Math.min(100, Math.max(0, value));

export const scoreTemperature = (temperature: number, threshold: number) => {
  const warningStart = threshold * 0.8;

  if (temperature < warningStart) return 100;
  if (temperature <= threshold) {
    return clamp(100 - ((temperature - warningStart) / (threshold - warningStart)) * 30);
  }

  return clamp(70 - ((temperature - threshold) / (threshold * 0.1)) * 70);
};

const scoreLoad = (load: number) => {
  if (load < 60) return 100;
  if (load <= 85) return clamp(100 - ((load - 60) / 25) * 30);

  return clamp(70 - ((load - 85) / 15) * 70);
};

const statusFromScore = (score: number) => {
  if (score >= 90) return 'healthy';
  if (score >= 70) return 'warning';
  return 'critical';
};

const latestMetric = (metrics: LatestMetricMap, equipmentId: string, metricType: string) => {
  const value = metrics[equipmentId]?.[metricType];
  return typeof value === 'number' ? value : undefined;
};

const latestMetricFromAliases = (metrics: LatestMetricMap, equipmentId: string, metricTypes: string[]) => {
  for (const metricType of metricTypes) {
    const value = latestMetric(metrics, equipmentId, metricType);
    if (typeof value === 'number') return value;
  }

  return undefined;
};

type Phase = 'L1' | 'L2' | 'L3';

const phases: Phase[] = ['L1', 'L2', 'L3'];

const inputVoltageMetricTypes = (phase: Phase) => [`inputVoltage${phase}`, `DS3_Input_Voltage_${phase}`];
const outputLoadMetricTypes = (phase: Phase) => [`outputLoad${phase}`, `DS3_Output_Load_${phase}`];

const roomTemperature = (room: RoomLike, metrics: LatestMetricMap, targetTemp: number) => {
  const temperatures = (room.equipments || [])
    .map((equipment) => latestMetric(metrics, equipment.id, 'temperature'))
    .filter((value): value is number => typeof value === 'number');

  if (temperatures.length === 0) return targetTemp * 0.92;

  return temperatures.reduce((sum, value) => sum + value, 0) / temperatures.length;
};

const alarmPenalty = (alarms: AlarmLike[]) => {
  return alarms.reduce((sum, alarm) => {
    if (alarm.severity === 'critical') return sum + 60;
    if (alarm.severity === 'warning') return sum + 20;
    return sum;
  }, 0);
};

const sentenceCase = (value: string) => value
  .split(' ')
  .map((word, index) => {
    if (/^[A-Z0-9-]+$/.test(word)) return word;
    const lower = word.toLowerCase();
    return index === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
  })
  .join(' ');

const alarmCausesForEquipment = (equipment: EquipmentLike[]) => equipment.flatMap((item) =>
  (item.alarms || []).map((alarm) => {
    const description = sentenceCase(alarm.description);
    return description.toLowerCase().includes(item.name.toLowerCase())
      ? description
      : `${description} on ${item.name}`;
  })
);

const mainCause = (causes: string[]) => causes[0] || 'No active causes detected.';

const scorePhaseBalance = (unbalance: number) => {
  if (unbalance < 10) return 100;
  if (unbalance <= 25) return 70;
  return 30;
};

const roomCauses = (room: RoomLike, temperature: number, score: number, targetTemp: number) => {
  const equipment = room.equipments || [];
  const causes = alarmCausesForEquipment(equipment);

  if (temperature > targetTemp) {
    causes.push(`${room.name} is running hot`);
  } else if (score < 90) {
    causes.push(`${room.name} temperature is rising`);
  }

  return causes.length > 0 ? causes : [`${room.name} is stable`];
};

const upsCauses = (
  upsEquipment: EquipmentLike,
  gridAlarms: AlarmLike[],
  load?: number,
  temperature?: number,
  batteryCapacity?: number,
  phaseUnbalance?: number,
  gridFailure = false
) => {
  const causes = alarmCausesForEquipment([upsEquipment]);

  gridAlarms.forEach((alarm) => causes.push(sentenceCase(alarm.description)));

  if (typeof load === 'number' && load > 85) {
    causes.push('UPS load is very high');
  } else if (typeof load === 'number' && load >= 60) {
    causes.push('UPS load is elevated');
  }

  if (typeof phaseUnbalance === 'number' && phaseUnbalance > 25) {
    causes.push(`UPS output phases are severely unbalanced (${round(phaseUnbalance)}%).`);
  } else if (typeof phaseUnbalance === 'number' && phaseUnbalance >= 20) {
    causes.push(`UPS output phases are unbalanced (${round(phaseUnbalance)}%).`);
  }

  if (gridFailure && typeof batteryCapacity === 'number' && batteryCapacity < 20) {
    causes.push('Battery reserve is almost depleted');
  } else if (!gridFailure && typeof batteryCapacity === 'number' && batteryCapacity < 95) {
    causes.push('Battery reserve needs attention');
  }

  if (typeof temperature === 'number' && temperature > 40) {
    causes.push('UPS is running hot');
  }

  return causes.length > 0 ? causes : ['UPS is stable'];
};

export const calculateSiteHealth = (site: SiteLike, metrics: LatestMetricMap) => {
  const rooms = site.rooms || [];
  const allEquipment = rooms.flatMap((room) => room.equipments || []);
  const allAlarms = allEquipment.flatMap((equipment) => equipment.alarms || []);
  const gridVoltages = phases
    .map((phase) => allEquipment
      .map((equipment) => latestMetricFromAliases(metrics, equipment.id, inputVoltageMetricTypes(phase)))
      .find((value) => typeof value === 'number'));
  const hasCompleteGridVoltages = gridVoltages.every((value) => typeof value === 'number');
  const gridFailure = hasCompleteGridVoltages && gridVoltages.every((value) => value === 0);
  const batteryCapacity = allEquipment
    .map((equipment) => latestMetricFromAliases(metrics, equipment.id, ['batteryCapacity', 'DS3_Battery_Capacity']))
    .find((value) => typeof value === 'number');
  const roomScores = rooms.map((room) => {
    const isUPSRoom = room.name.toLowerCase().includes('ups');
    const actualTargetTemp = isUPSRoom ? 40 : 26.5;
    const temperature = roomTemperature(room, metrics, actualTargetTemp);
    const score = scoreTemperature(temperature, actualTargetTemp);
    const causes = roomCauses(room, temperature, score, actualTargetTemp);

    return {
      id: room.id,
      name: room.name,
      type: 'room',
      score: round(score),
      status: statusFromScore(score),
      weight: 0,
      temperature: round(temperature),
      threshold: actualTargetTemp,
      summary: mainCause(causes),
      causes
    };
  });

  const upsEquipment = allEquipment.find((equipment) => equipment.type.toLowerCase() === 'ups');
  const upsPhaseLoadReadings = upsEquipment
    ? phases.map((phase) => latestMetricFromAliases(metrics, upsEquipment.id, outputLoadMetricTypes(phase)))
    : [];
  const numericUpsPhaseLoads = upsPhaseLoadReadings.filter((value): value is number => typeof value === 'number');
  const hasCompleteUpsPhaseLoads = numericUpsPhaseLoads.length === phases.length;
  const phaseUnbalance = hasCompleteUpsPhaseLoads
    ? Math.max(...numericUpsPhaseLoads) - Math.min(...numericUpsPhaseLoads)
    : undefined;
  const upsLoad = hasCompleteUpsPhaseLoads
    ? Math.max(...numericUpsPhaseLoads)
    : upsEquipment ? latestMetric(metrics, upsEquipment.id, 'load') ?? 50 : undefined;
  const upsTemperature = upsEquipment
    ? latestMetricFromAliases(metrics, upsEquipment.id, ['temperature', 'DS3_UPS_Temp']) ?? 25
    : undefined;
  const upsAlarms = upsEquipment?.alarms || [];
  const gridAlarms = allAlarms.filter((alarm) => alarm.description.toLowerCase().includes('grid'));
  const siteAlarmPenalty = alarmPenalty([...upsAlarms, ...gridAlarms]);
  const loadScore = typeof upsLoad === 'number' ? scoreLoad(upsLoad) : 100;
  const phaseBalanceScore = typeof phaseUnbalance === 'number' ? scorePhaseBalance(phaseUnbalance) : 100;
  const batteryScore = typeof batteryCapacity === 'number' ? (batteryCapacity >= 95 ? 100 : 0) : 100;
  const internalTempScore = typeof upsTemperature === 'number' ? scoreTemperature(upsTemperature, 40) : 100;
  const upsBaseMetrics = [
    { score: loadScore, weight: 35 },
    { score: phaseBalanceScore, weight: 20 },
    ...(gridFailure ? [] : [{ score: batteryScore, weight: 30 }]),
    { score: internalTempScore, weight: 15 }
  ];
  const upsBaseMetricWeight = upsBaseMetrics.reduce((sum, metric) => sum + metric.weight, 0);
  const upsBaseScore = upsBaseMetricWeight > 0
    ? upsBaseMetrics.reduce((sum, metric) => sum + metric.score * metric.weight, 0) / upsBaseMetricWeight
    : 100;
  const upsScore = upsEquipment ? clamp(upsBaseScore - siteAlarmPenalty) : undefined;
  const upsIssueList = upsEquipment ? upsCauses(upsEquipment, gridAlarms, upsLoad, upsTemperature, batteryCapacity, phaseUnbalance, gridFailure) : [];
  const upsComponent = upsEquipment ? {
    id: upsEquipment.id,
    name: upsEquipment.name,
    type: 'ups',
    score: round(upsScore ?? 0),
    status: statusFromScore(upsScore ?? 0),
    weight: 40,
    load: typeof upsLoad === 'number' ? round(upsLoad) : null,
    phaseLoads: hasCompleteUpsPhaseLoads ? Object.fromEntries(phases.map((phase, index) => [phase, round(numericUpsPhaseLoads[index])])) : null,
    phaseUnbalance: typeof phaseUnbalance === 'number' ? round(phaseUnbalance) : null,
    loadScore: round(loadScore),
    phaseBalanceScore: round(phaseBalanceScore),
    batteryScore: gridFailure ? null : round(batteryScore),
    internalTempScore: round(internalTempScore),
    temperature: typeof upsTemperature === 'number' ? round(upsTemperature) : null,
    batteryCapacity: typeof batteryCapacity === 'number' ? round(batteryCapacity) : null,
    penalty: siteAlarmPenalty,
    summary: mainCause(upsIssueList),
    causes: upsIssueList
  } : null;

  const roomByName = Object.fromEntries(roomScores.map((room) => [room.name, room]));
  const weightedComponents = [
    upsComponent && { ...upsComponent, weight: 40 },
    roomByName['Battery Room'] && { ...roomByName['Battery Room'], weight: 25 },
    roomByName['Switch Room'] && { ...roomByName['Switch Room'], weight: 15 },
    roomByName['ENR Room'] && { ...roomByName['ENR Room'], weight: 10 },
    roomByName['V-SAT Room'] && { ...roomByName['V-SAT Room'], weight: 10 }
  ].filter(Boolean) as Array<{ score: number; weight: number; [key: string]: unknown }>;

  const fallbackComponents = [
    ...(upsComponent ? [upsComponent] : []),
    ...roomScores
  ];
  const componentsForScore = weightedComponents.length > 0
    ? weightedComponents
    : fallbackComponents.map((component) => ({ ...component, weight: fallbackComponents.length ? 100 / fallbackComponents.length : 0 }));
  const totalWeight = componentsForScore.reduce((sum, component) => sum + component.weight, 0);
  const weightedScore = totalWeight > 0
    ? componentsForScore.reduce((sum, component) => sum + component.score * component.weight, 0) / totalWeight
    : site.overallHealth;

  const imminentShutdown = gridFailure && typeof batteryCapacity === 'number' && batteryCapacity < 20;
  const overrides: string[] = [];
  let score = weightedScore;

  if (gridFailure) {
    score = Math.min(score, 50);
    overrides.push('Grid power is unavailable.');
  }

  if (imminentShutdown) {
    score = 5;
    overrides.push('Battery reserve is almost depleted.');
  }

  const componentCauses = componentsForScore
    .filter((component) => component.status !== 'healthy')
    .flatMap((component) => component.causes as string[] | undefined)
    .filter((cause): cause is string => Boolean(cause));
  const causes = [...overrides, ...componentCauses].slice(0, 4);

  return {
    score: round(score),
    status: statusFromScore(score),
    method: weightedComponents.length > 0 ? 'PDF weighted Blida methodology' : 'Configured component average',
    components: componentsForScore.map((component) => ({
      ...component,
      score: round(component.score),
      weight: round(component.weight)
    })),
    roomScores,
    ups: upsComponent,
    overrides,
    causes: causes.length > 0 ? causes : ['No active causes detected.']
  };
};
