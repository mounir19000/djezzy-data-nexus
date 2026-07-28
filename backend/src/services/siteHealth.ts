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

const roomTemperature = (room: RoomLike, metrics: LatestMetricMap) => {
  const temperatures = (room.equipments || [])
    .map((equipment) => latestMetric(metrics, equipment.id, 'temperature'))
    .filter((value): value is number => typeof value === 'number');

  if (temperatures.length === 0) return room.targetTemp * 0.92;

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

const roomCauses = (room: RoomLike, temperature: number, score: number) => {
  const equipment = room.equipments || [];
  const causes = alarmCausesForEquipment(equipment);
  const offlineEquipment = equipment.filter((item) => item.status === 'offline');

  if (offlineEquipment.length > 0) {
    causes.push(`${offlineEquipment.map((item) => item.name).join(', ')} offline in ${room.name}`);
  }

  if (temperature > room.targetTemp) {
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
  batteryCapacity?: number
) => {
  const causes = alarmCausesForEquipment([upsEquipment]);

  gridAlarms.forEach((alarm) => causes.push(sentenceCase(alarm.description)));

  if (typeof load === 'number' && load > 85) {
    causes.push('UPS load is very high');
  } else if (typeof load === 'number' && load >= 60) {
    causes.push('UPS load is elevated');
  }

  if (typeof batteryCapacity === 'number' && batteryCapacity < 20) {
    causes.push('Battery reserve is almost depleted');
  } else if (typeof batteryCapacity === 'number' && batteryCapacity < 95) {
    causes.push('Battery reserve needs attention');
  }

  if (typeof temperature === 'number' && temperature > 30) {
    causes.push('UPS is running hot');
  }

  return causes.length > 0 ? causes : ['UPS is stable'];
};

export const calculateSiteHealth = (site: SiteLike, metrics: LatestMetricMap) => {
  const rooms = site.rooms || [];
  const allEquipment = rooms.flatMap((room) => room.equipments || []);
  const allAlarms = allEquipment.flatMap((equipment) => equipment.alarms || []);
  const gridVoltages = ['inputVoltageL1', 'inputVoltageL2', 'inputVoltageL3']
    .map((metricType) => allEquipment.map((equipment) => latestMetric(metrics, equipment.id, metricType)).find((value) => typeof value === 'number'));
  const batteryCapacity = allEquipment.map((equipment) => latestMetric(metrics, equipment.id, 'batteryCapacity')).find((value) => typeof value === 'number');
  const roomScores = rooms.map((room) => {
    const temperature = roomTemperature(room, metrics);
    const score = scoreTemperature(temperature, room.targetTemp);
    const causes = roomCauses(room, temperature, score);

    return {
      id: room.id,
      name: room.name,
      type: 'room',
      score: round(score),
      status: statusFromScore(score),
      weight: 0,
      temperature: round(temperature),
      threshold: room.targetTemp,
      summary: mainCause(causes),
      causes
    };
  });

  const upsEquipment = allEquipment.find((equipment) => equipment.type.toLowerCase() === 'ups');
  const upsLoad = upsEquipment ? latestMetric(metrics, upsEquipment.id, 'load') ?? 50 : undefined;
  const upsTemperature = upsEquipment ? latestMetric(metrics, upsEquipment.id, 'temperature') ?? 25 : undefined;
  const upsAlarms = upsEquipment?.alarms || [];
  const gridAlarms = allAlarms.filter((alarm) => alarm.description.toLowerCase().includes('grid'));
  const siteAlarmPenalty = alarmPenalty([...upsAlarms, ...gridAlarms]);
  const loadScore = typeof upsLoad === 'number' ? scoreLoad(upsLoad) : 100;
  const phaseBalanceScore = 100;
  const batteryScore = typeof batteryCapacity === 'number' ? (batteryCapacity >= 95 ? 100 : 0) : 100;
  const internalTempScore = typeof upsTemperature === 'number' ? scoreTemperature(upsTemperature, 30) : 100;
  const upsBaseScore = (loadScore * 0.35) + (phaseBalanceScore * 0.2) + (batteryScore * 0.3) + (internalTempScore * 0.15);
  const upsScore = upsEquipment ? clamp(upsBaseScore - siteAlarmPenalty) : undefined;
  const upsIssueList = upsEquipment ? upsCauses(upsEquipment, gridAlarms, upsLoad, upsTemperature, batteryCapacity) : [];
  const upsComponent = upsEquipment ? {
    id: upsEquipment.id,
    name: upsEquipment.name,
    type: 'ups',
    score: round(upsScore || 0),
    status: statusFromScore(upsScore || 0),
    weight: 40,
    load: typeof upsLoad === 'number' ? round(upsLoad) : null,
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

  const gridFailure = gridVoltages.every((value) => value === 0);
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
