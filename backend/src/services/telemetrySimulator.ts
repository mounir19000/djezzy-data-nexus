import fs from 'fs';
import path from 'path';
import { Server } from 'socket.io';
import { prisma } from '../config/prisma';

type SimulationRow = Record<string, string>;

interface SimEquipment {
  id: string;
  name: string;
  type: string;
  status: string;
  room?: {
    siteId: string;
    targetHumidity: number;
  } | null;
}

interface AlarmTransition {
  equipment: SimEquipment;
  state: 'A' | 'D';
  severity?: 'warning' | 'critical';
  description: string;
  key: string;
}

const CSV_FILE = 'blida_simulated_34h.csv';
const SIMULATION_INTERVAL_MS = Number(process.env.TELEMETRY_SIMULATION_INTERVAL_MS || 5000);
const phases = ['L1', 'L2', 'L3'] as const;

const roundMetric = (value: number) => Math.round(value * 100) / 100;
const normalize = (value: string) => value.replace(/\\/g, ' ').replace(/\s+/g, ' ').trim();
const normalizeKey = (value: string) => normalize(value)
  .replace(/^(ups log|clim log|scada):\s*/i, '')
  .replace(/^\[(a|d|q)\]\s*/i, '')
  .replace(/^(warning|critical|information):\s*/i, '')
  .replace(/\s+has been restored$/i, '')
  .toLowerCase();

const parseCsvLine = (line: string) => {
  const cells: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      cell += char;
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      cells.push(cell);
      cell = '';
    } else {
      cell += char;
    }
  }

  cells.push(cell);
  return cells;
};

const resolveSimulationPath = () => {
  const candidates = [
    path.resolve(process.cwd(), 'data', CSV_FILE),
    path.resolve(process.cwd(), '..', 'data', CSV_FILE),
    path.resolve(__dirname, '..', '..', '..', 'data', CSV_FILE)
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
};

const loadSimulationRows = () => {
  const csvPath = resolveSimulationPath();
  if (!csvPath) {
    console.warn(`Telemetry simulation data file not found: ${CSV_FILE}`);
    return [];
  }

  const [headerLine, ...lines] = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  return lines
    .filter(Boolean)
    .map((line) => {
      const values = parseCsvLine(line);
      return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
    });
};

const simulationRows = loadSimulationRows();
let simulationCursor = Math.min(
  simulationRows.length > 0 ? simulationRows.length - 1 : 0,
  Math.max(0, Number(process.env.TELEMETRY_SIMULATION_START_INDEX || 0))
);

const numericValue = (row: SimulationRow, key: string, fallback = 0) => {
  const parsed = Number(row[key]);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const max = (values: number[]) => Math.max(...values);
const min = (values: number[]) => Math.min(...values);

const findEquipment = (equipments: SimEquipment[], id: string, type: string, nameIncludes?: string) => {
  return equipments.find((equipment) => equipment.id === id)
    || equipments.find((equipment) => equipment.type.toLowerCase() === type.toLowerCase() && (!nameIncludes || equipment.name.toLowerCase().includes(nameIncludes.toLowerCase())));
};

const splitAlarmEntries = (value: string) => value
  .split('|')
  .map((entry) => entry.trim())
  .filter(Boolean);

const isRelevantScadaEntry = (rawEntry: string) => {
  const lower = rawEntry.toLowerCase();
  const hasExplicitSite = rawEntry.includes('\\');
  return !hasExplicitSite || lower.includes('blida msc 10');
};

const severityForAlarm = (description: string): 'warning' | 'critical' | null => {
  const lower = description.toLowerCase();

  if (
    lower.includes('general alarm')
    || lower.includes('input supply not ok')
    || lower.includes('absence de tension')
    || lower.includes('absence resaux')
    || lower.includes('defaut groupe')
    || lower.includes('generator fault')
    || lower.includes('temperature haute')
    || lower.includes('fire common')
    || lower.includes('inondation')
    || lower.includes('failure')
  ) {
    return 'critical';
  }

  if (
    lower.includes('operating on battery')
    || lower.includes('on batterie')
    || lower.includes('charger preventive')
    || lower.includes('on bypass')
    || lower.includes('alarme clim')
    || lower.includes('alarm set')
    || lower.includes('wrong password')
    || lower.includes('login failure')
    || lower.includes('liaison scada')
    || lower.includes('low battery')
    || lower.includes('batterie faible')
    || lower.includes('pression')
    || lower.includes('gaz chaud')
    || lower.includes('redresseur')
    || lower.includes('disjoncteur')
    || lower.includes('overload')
    || lower.includes('surcharge')
    || lower.includes('stulz')
  ) {
    return 'warning';
  }

  return null;
};

const equipmentForAlarm = (
  description: string,
  source: string,
  equipment: {
    ups?: SimEquipment;
    ats?: SimEquipment;
    cooling?: SimEquipment;
    battery?: SimEquipment;
    generator?: SimEquipment;
    switchCore?: SimEquipment;
    electrical?: SimEquipment;
  }
) => {
  const lower = description.toLowerCase();

  if (lower.includes('clim') || lower.includes('liebert') || lower.includes('stulz') || lower.includes('temperature')) {
    if (lower.includes('salle batterie') && equipment.battery) return equipment.battery;
    if ((lower.includes('salle switch') || lower.includes('salle technique')) && equipment.switchCore) return equipment.switchCore;
    return equipment.cooling;
  }

  if (lower.includes('groupe') || lower.includes('generator')) {
    return equipment.generator || equipment.ats;
  }

  if (lower.includes('absence') || lower.includes('reseau') || lower.includes('resaux') || lower.includes('sonalgaz') || lower.includes('tension')) {
    return equipment.ats;
  }

  if (lower.includes('inondation') || lower.includes('fuite')) {
    return equipment.electrical || equipment.cooling || equipment.ats;
  }

  if (source === 'DS3_UPS_Alarm' || lower.includes('ups') || lower.includes('rectifier') || lower.includes('bypass') || lower.includes('battery') || lower.includes('charger')) {
    return equipment.ups;
  }

  return equipment.ups || equipment.ats || equipment.cooling;
};

const sourceLabel = (source: string) => {
  if (source === 'DS3_UPS_Alarm') return 'UPS Log';
  if (source === 'DS3_Clim_Alarm') return 'Clim Log';
  return 'SCADA';
};

const alarmStateFromEntry = (rawEntry: string) => {
  const match = rawEntry.trim().match(/^\[([ADQ])\]\s*(.+)$/i);
  if (!match) return null;

  const state = match[1].toUpperCase();
  if (state !== 'A' && state !== 'D') return null;

  return {
    state: state as 'A' | 'D',
    description: match[2].trim()
  };
};

const alarmTransitionsFromRow = (
  row: SimulationRow,
  equipment: {
    ups?: SimEquipment;
    ats?: SimEquipment;
    cooling?: SimEquipment;
    battery?: SimEquipment;
    generator?: SimEquipment;
    switchCore?: SimEquipment;
    electrical?: SimEquipment;
  }
) => {
  const alarmColumns = ['DS3_UPS_Alarm', 'DS3_Clim_Alarm', 'DS2_SCADA_Alarm'];
  const transitions: AlarmTransition[] = [];
  const seen = new Set<string>();

  for (const source of alarmColumns) {
    for (const rawEntry of splitAlarmEntries(row[source] || '')) {
      if (source === 'DS2_SCADA_Alarm' && !isRelevantScadaEntry(rawEntry)) continue;

      const alarmState = alarmStateFromEntry(rawEntry);
      if (!alarmState) continue;

      const cleaned = normalize(alarmState.description);
      const description = cleaned.replace(/^(Warning|Critical|Information):\s*/i, '').trim();
      const targetEquipment = equipmentForAlarm(description, source, equipment);
      if (!targetEquipment) continue;

      const severity = severityForAlarm(description);
      if (alarmState.state === 'A' && !severity) continue;

      const transition = {
        equipment: targetEquipment,
        state: alarmState.state,
        severity: severity || undefined,
        description: `${sourceLabel(source)}: ${description}`,
        key: normalizeKey(description)
      };
      const dedupeKey = `${transition.state}:${transition.equipment.id}:${transition.key}`;

      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        transitions.push(transition);
      }
    }
  }

  return transitions;
};

const notifyAlarmRecipients = async (
  alarm: { id: string; severity: string; description: string },
  equipment: SimEquipment,
  io: Server
) => {
  const siteId = equipment.room?.siteId;
  if (!siteId) return;

  const recipients = await prisma.user.findMany({
    where: {
      OR: [
        { siteAssignments: { some: { siteId } } },
        { role: { name: 'Super Admin' } }
      ]
    },
    select: { id: true }
  });
  const recipientIds = [...new Set(recipients.map((recipient) => recipient.id))];

  for (const recipientId of recipientIds) {
    await prisma.notification.create({
      data: {
        userId: recipientId,
        siteId,
        message: `${alarm.severity.toUpperCase()} simulated alarm: ${alarm.description}`
      }
    });

    io.emit('notification_update');
  }
};

const clearActiveAlarm = async (
  transition: AlarmTransition,
  clearedAt: Date,
  io: Server
) => {
  const activeAlarms = await prisma.alarm.findMany({
    where: {
      equipmentId: transition.equipment.id,
      active: true
    },
    select: { id: true, description: true }
  });
  const alarmIds = activeAlarms
    .filter((alarm) => normalizeKey(alarm.description).includes(transition.key) || transition.key.includes(normalizeKey(alarm.description)))
    .map((alarm) => alarm.id);

  if (alarmIds.length > 0) {
    await prisma.alarm.updateMany({
      where: { id: { in: alarmIds } },
      data: { active: false, clearedAt }
    });
    io.emit('alarm_update', { type: 'cleared', alarmIds, clearedAt });
  }
};

const applyAlarmTransitions = async (
  transitions: AlarmTransition[],
  timestamp: Date,
  io: Server
) => {
  for (const transition of transitions) {
    if (transition.state === 'D') {
      await clearActiveAlarm(transition, timestamp, io);
      continue;
    }

    const existing = await prisma.alarm.findFirst({
      where: {
        equipmentId: transition.equipment.id,
        active: true,
        description: transition.description
      }
    });

    if (existing) continue;

    const alarm = await prisma.alarm.create({
      data: {
        equipmentId: transition.equipment.id,
        severity: transition.severity!,
        description: transition.description,
        active: true,
        createdAt: timestamp,
        clearedAt: null
      }
    });

    io.emit('alarm_update', { type: 'created', alarm });
    await notifyAlarmRecipients(alarm, transition.equipment, io);
  }
};

export const startTelemetrySimulation = (io: Server) => {
  if (simulationRows.length === 0) {
    console.warn('Telemetry simulation disabled because no simulation rows were loaded.');
    return;
  }

  setInterval(async () => {
    try {
      const row = simulationRows[simulationCursor];
      simulationCursor = (simulationCursor + 1) % simulationRows.length;

      const timestamp = new Date();
      const equipments = await prisma.equipment.findMany({
        include: { room: true }
      }) as SimEquipment[];

      const ups = findEquipment(equipments, 'eq-ups-a', 'UPS');
      const ats = findEquipment(equipments, 'eq-ats-tgbt', 'ATS');
      const battery = findEquipment(equipments, 'eq-battery-bank-a', 'Battery');
      const switchCore = findEquipment(equipments, 'eq-switch-core', 'Network', 'switch');
      const vsat = findEquipment(equipments, 'eq-vsat-rack', 'Network', 'vsat');
      const enr = findEquipment(equipments, 'eq-rectifier-huawei', 'Rectifier');
      const cooling = findEquipment(equipments, 'eq-clim-stulz-01', 'Cooling', 'stulz');

      const inputVoltages = phases.map((phase) => numericValue(row, `DS3_Input_Voltage_${phase}`));
      const outputVoltages = phases.map((phase) => numericValue(row, `DS3_Output_Voltage_${phase}`));
      const outputLoads = phases.map((phase) => numericValue(row, `DS3_Output_Load_${phase}`));
      const upsLoad = max(outputLoads);
      const telemetryData: Array<{ equipmentId: string; metricType: string; value: number; timestamp: Date }> = [];
      const telemetryUpdates: Array<{ equipment: SimEquipment; metrics: Record<string, number> }> = [];

      const addTelemetry = (equipment: SimEquipment | undefined, metrics: Record<string, number | undefined>) => {
        if (!equipment) return;

        const numericMetrics = Object.fromEntries(
          Object.entries(metrics).filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1]))
        );

        telemetryData.push(...Object.entries(numericMetrics).map(([metricType, value]) => ({
          equipmentId: equipment.id,
          metricType,
          value,
          timestamp
        })));
        telemetryUpdates.push({ equipment, metrics: numericMetrics });
      };

      addTelemetry(ups, {
        temperature: numericValue(row, 'DS3_UPS_Temp'),
        humidity: ups?.room?.targetHumidity,
        load: upsLoad,
        powerDraw: roundMetric(upsLoad * 2.25),
        inputVoltageL1: inputVoltages[0],
        inputVoltageL2: inputVoltages[1],
        inputVoltageL3: inputVoltages[2],
        outputVoltageL1: outputVoltages[0],
        outputVoltageL2: outputVoltages[1],
        outputVoltageL3: outputVoltages[2],
        outputLoadL1: outputLoads[0],
        outputLoadL2: outputLoads[1],
        outputLoadL3: outputLoads[2],
        phaseUnbalance: roundMetric(max(outputLoads) - min(outputLoads)),
        batteryCapacity: numericValue(row, 'DS3_Battery_Capacity')
      });
      addTelemetry(ats, {
        load: upsLoad,
        powerDraw: roundMetric(upsLoad * 1.1),
        inputVoltageL1: inputVoltages[0],
        inputVoltageL2: inputVoltages[1],
        inputVoltageL3: inputVoltages[2],
        humidity: ats?.room?.targetHumidity
      });
      addTelemetry(battery, {
        temperature: numericValue(row, 'DS2_BAT MSC10'),
        humidity: battery?.room?.targetHumidity,
        batteryCapacity: numericValue(row, 'DS3_Battery_Capacity')
      });
      addTelemetry(switchCore, {
        temperature: numericValue(row, 'DS2_SWITCH MSC10'),
        humidity: switchCore?.room?.targetHumidity
      });
      addTelemetry(enr, {
        temperature: numericValue(row, 'DS2_ENR MSC 10'),
        humidity: enr?.room?.targetHumidity
      });
      addTelemetry(vsat, {
        temperature: numericValue(row, 'DS2_V-SAT MSC10'),
        humidity: vsat?.room?.targetHumidity
      });
      addTelemetry(cooling, {
        temperature: numericValue(row, 'DS2_SWITCH MSC10'),
        humidity: cooling?.room?.targetHumidity
      });

      if (telemetryData.length > 0) {
        await prisma.telemetry.createMany({ data: telemetryData });
      }

      for (const update of telemetryUpdates) {
        io.emit('telemetry_update', {
          equipmentId: update.equipment.id,
          equipmentName: update.equipment.name,
          siteId: update.equipment.room?.siteId,
          simulationTime: row.Sim_Datetime,
          metrics: {
            ...update.metrics,
            status: update.equipment.status
          },
          timestamp
        });
      }

      const transitions = alarmTransitionsFromRow(row, {
        ups,
        ats,
        cooling,
        battery,
        generator: findEquipment(equipments, 'eq-generator-01', 'Generator'),
        switchCore,
        electrical: enr || ats
      });
      await applyAlarmTransitions(transitions, timestamp, io);
    } catch (error) {
      console.error('Telemetry Simulation Error:', error);
    }
  }, SIMULATION_INTERVAL_MS);
};
