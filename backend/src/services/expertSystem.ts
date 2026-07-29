import { ALARM_LABELS, PRIMARY_CONTACT, RULES_KB, ScadaExpertRuleKnowledge } from './scadaExpertKnowledge';

type Priority = 'low' | 'medium' | 'high';
type Severity = 'Info' | 'Faible' | 'Moyenne' | 'Elevee' | 'Critique';

interface DiagnosisInput {
  id?: string;
  severity: string;
  description: string;
  active?: boolean;
  createdAt?: Date | string;
  clearedAt?: Date | string | null;
  equipment?: EquipmentInput | null;
}

interface EquipmentInput {
  id?: string;
  name?: string | null;
  type?: string | null;
  room?: {
    id?: string;
    name?: string | null;
    siteId?: string | null;
    site?: {
      id?: string;
      name?: string | null;
    } | null;
  } | null;
}

interface NormalizedScadaAlarm {
  id: string;
  type: string;
  site: string;
  siteName?: string;
  room?: string;
  upsId?: string;
  unitId?: string;
  start: Date;
  end?: Date | null;
  active: boolean;
  rawDescription: string;
  equipmentName?: string;
  equipmentType?: string;
}

interface RuleContext {
  site?: string;
  room?: string;
  upsId?: string;
  unitId?: string;
}

export interface ExpertDiagnosis {
  ruleId?: string;
  faultId?: string;
  ruleName?: string;
  problem: string;
  category: string;
  severity?: Severity | string;
  isCritical?: boolean;
  probableCauses: string[];
  operationalImpacts: string[];
  technicalJustification: string;
  recommendedActions: string[];
  recoveryConditions: string[];
  contactPerson: string;
  contacts?: string[];
  confidence: number;
  priority: Priority;
  site?: string;
  room?: string;
  upsId?: string;
  unitId?: string;
  alarmTypes?: string[];
  alarmNames?: string[];
  matchedAlarmIds?: string[];
  equipmentConcerned?: string[];
}

export interface ExpertKnowledgeArticle {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
  ruleId: string;
  faultId: string;
  failureType: string;
  severity: string;
  problem: string;
  symptoms: string[];
  causes: string[];
  resolution: string[];
  relatedEquipment: string[];
  engineerNotes: string[];
  similarCases: string[];
  relatedTickets: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    site?: string;
    room?: string;
    equipment?: string;
  }>;
  rooms: string[];
  alarmTypes: string[];
}

const RULE_ORDER = [...Array.from({ length: 30 }, (_, index) => `R${String(index + 1).padStart(2, '0')}`), 'M01', 'M02', 'M03'] as Array<keyof typeof RULES_KB>;
const HISTORY_MINUTES = 6 * 60;
const ELEVATED_SEVERITIES = new Set(['Elevee', 'Critique']);
const CRITICAL_SEVERITIES = new Set(['Critique']);
const KNOWLEDGE_TIMESTAMP = '2026-07-28T00:00:00.000Z';
const ALARM_LABEL_MAP = ALARM_LABELS as Record<string, string>;
const PRIMARY_CONTACT_MAP = PRIMARY_CONTACT as Record<string, string>;

const severityRank: Record<string, number> = {
  Info: 0,
  Faible: 1,
  Moyenne: 2,
  Elevee: 3,
  Critique: 4
};

const alarmLabel = (alarmType: string) => ALARM_LABEL_MAP[alarmType] || alarmType;

const stripDiacritics = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const canonical = (value: string) => stripDiacritics(value).toLowerCase();
const normalizeWhitespace = (value: string) => value.replace(/\\/g, ' ').replace(/\s+/g, ' ').trim();
const includesAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term));

const toDate = (value?: Date | string | null) => {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const severityToPriority = (severity: string): Priority => {
  if (severity === 'Critique' || severity === 'Elevee' || severity === 'critical') return 'high';
  if (severity === 'Moyenne' || severity === 'warning') return 'medium';
  return 'low';
};

const getContacts = (category: string, severity: string) => {
  const contacts = [PRIMARY_CONTACT_MAP[category] || 'Technicien de maintenance'];

  if (ELEVATED_SEVERITIES.has(severity)) {
    contacts.push('Responsable technique du site');
  }

  if (severity === 'Critique') {
    contacts.push('Astreinte / Cadre de garde (intervention immédiate)');
  }

  if (category === 'Sécurité') {
    contacts.push('Équipe Sécurité / HSE');
  }

  return [...new Set(contacts)];
};

const stripAlarmPrefix = (description: string) => normalizeWhitespace(description)
  .replace(/^(UPS Log|Clim Log|Journal UPS|Journal clim|SCADA):\s*/i, '')
  .replace(/^\[(A|D|Q)\]\s*/i, '')
  .replace(/^(Warning|Critical|Information):\s*/i, '')
  .replace(/\s+has been restored$/i, '')
  .trim();

const roomFromEquipment = (equipment?: EquipmentInput | null) => {
  const name = canonical(equipment?.room?.name || '');
  if (!name) return undefined;
  if (includesAny(name, ['ups'])) return 'salle_ups';
  if (includesAny(name, ['battery', 'batterie'])) return 'salle_batterie';
  if (includesAny(name, ['switch', 'network', 'technical', 'telecom', 'vsat', 'v-sat'])) return 'salle_reseau';
  if (includesAny(name, ['energy', 'energie', 'enr', 'electrical', 'generator'])) return 'salle_energie';
  if (includesAny(name, ['data center', 'datacenter'])) return 'datacenter';
  return undefined;
};

const extractRoom = (description: string, equipment?: EquipmentInput | null) => {
  const text = canonical(description);
  if (includesAny(text, ['salle ups', 'ups room'])) return 'salle_ups';
  if (includesAny(text, ['salle batterie', 'battery room'])) return 'salle_batterie';
  if (includesAny(text, ['salle switch', 'salle technique', 'switch room', 'network room'])) return 'salle_reseau';
  if (includesAny(text, ['salle energie', 'tgbt', 'enr room', 'electrical room'])) return 'salle_energie';
  if (includesAny(text, ['data center', 'datacenter'])) return 'datacenter';
  return roomFromEquipment(equipment);
};

const extractUpsId = (description: string, equipment?: EquipmentInput | null) => {
  const match = description.match(/UPS\s*(\d+)/i);
  if (match) return `UPS${match[1]}`;

  const equipmentMatch = (equipment?.name || '').match(/UPS\s*-?\s*(\d+)/i);
  if (equipmentMatch) return `UPS${equipmentMatch[1]}`;

  return undefined;
};

const extractUnitId = (description: string, equipment?: EquipmentInput | null) => {
  const stulz = description.match(/STULZ\s*(\d+)/i);
  if (stulz) return `STULZ${stulz[1]}`;

  const module = description.match(/MODULE\s*(\d+)/i);
  if (module) return `MODULE${module[1]}`;

  if (/LIEBERT/i.test(description)) return 'LIEBERT';

  const equipmentName = equipment?.name || '';
  const equipmentStulz = equipmentName.match(/STULZ[-\s]*(\d+)/i);
  if (equipmentStulz) return `STULZ${equipmentStulz[1]}`;

  return undefined;
};

const classifyAlarmType = (description: string, equipment?: EquipmentInput | null) => {
  const text = canonical(description);
  const equipmentType = canonical(equipment?.type || '');
  const room = extractRoom(description, equipment);

  if (includesAny(text, ['wrong password', 'login failure', 'echec de connexion'])) return 'login_failure';
  if (includesAny(text, ['liaison scada coupee', 'liaison coupee', "n'est pas etablie", 'link lost'])) return 'scada_link_lost';
  if (includesAny(text, ['auto-diagnostic', 'auto diagnostic', 'system diagnostic', 'os handle count'])) return 'system_diagnostic';
  if (includesAny(text, ['inondation', "fuite d'eau", 'flood'])) return 'flood_alarm';

  if (includesAny(text, ['temperature haute', 'high temperature', 'temp high', 'return air'])) {
    if (room === 'salle_batterie' || includesAny(text, ['batterie', 'battery'])) return 'temp_high_battery_room';
    if (room === 'salle_reseau' || includesAny(text, ['switch', 'technique', 'network'])) return 'temp_high_switch_room';
    if (room === 'salle_energie' || includesAny(text, ['energie', 'enr', 'tgbt'])) return 'temp_high_energy_room';
    if (room === 'datacenter' || includesAny(text, ['data center', 'datacenter'])) return 'temp_high_datacenter';
    return 'temp_high_ups_room';
  }

  if (includesAny(text, ['pression haute', 'pressure high'])) return 'clim_pressure_high';
  if (includesAny(text, ['pression basse', 'pressure low'])) return 'clim_pressure_low';
  if (includesAny(text, ['gaz chaud', 'hotgas', 'hot gas'])) return 'clim_hotgas';
  if (includesAny(text, ['fire common', 'incendie'])) return 'clim_fire_common';
  if (includesAny(text, ['alarme clim', 'clim fault', 'climatisation', 'stulz', 'liebert']) || equipmentType === 'cooling') return 'clim_fault_general';

  if (includesAny(text, ['demarrage groupe', 'generator start', 'groupe electrogene start'])) return 'generator_start';
  if (includesAny(text, ['defaut groupe', 'default groupe', 'generator fault', 'groupe electrogene en panne'])) return 'generator_fault';
  if (includesAny(text, ['absence de tension', 'absence tension', 'absence reseau', 'absence resaux', 'input supply not ok', 'grid outage', 'sonalgaz'])) return 'power_absence';

  if (includesAny(text, ['redresseur', 'rectifier'])) return 'rectifier_fault';
  if (includesAny(text, ['disjoncteur', 'breaker'])) {
    if (includesAny(text, ['arrive', 'input', 'amont'])) return 'breaker_fault_input';
    if (includesAny(text, ['depart', 'output', 'aval'])) return 'breaker_fault_output';
    return 'breaker_fault_generic';
  }

  if (includesAny(text, ['low battery', 'batterie faible', 'battery low', 'charger preventive'])) return 'ups_low_battery';
  if (includesAny(text, ['bypass', 'on bypass'])) return 'ups_on_bypass';
  if (includesAny(text, ['overload', 'surcharge'])) return 'ups_overload';
  if (includesAny(text, ['on batterie', 'on battery', 'operating on battery'])) return 'ups_on_battery';
  if (includesAny(text, ['ups failure', 'failure', 'general alarm']) || equipmentType === 'ups') return 'ups_failure';

  return undefined;
};

export const normalizeScadaAlarm = (alarm: DiagnosisInput): NormalizedScadaAlarm | null => {
  const description = stripAlarmPrefix(alarm.description || '');
  const type = classifyAlarmType(description, alarm.equipment);
  const siteId = alarm.equipment?.room?.site?.id || alarm.equipment?.room?.siteId || 'unknown-site';
  const start = toDate(alarm.createdAt) || new Date();

  if (!type) return null;

  return {
    id: alarm.id || `${siteId}:${type}:${description}:${start.toISOString()}`,
    type,
    site: siteId,
    siteName: alarm.equipment?.room?.site?.name || undefined,
    room: extractRoom(description, alarm.equipment),
    upsId: extractUpsId(description, alarm.equipment),
    unitId: extractUnitId(description, alarm.equipment),
    start,
    end: toDate(alarm.clearedAt) || null,
    active: alarm.active !== false,
    rawDescription: description,
    equipmentName: alarm.equipment?.name || undefined,
    equipmentType: alarm.equipment?.type || undefined
  };
};

class ExpertState {
  active: NormalizedScadaAlarm[];
  history: NormalizedScadaAlarm[];

  constructor(alarms: NormalizedScadaAlarm[], now: Date) {
    const cutoff = now.getTime() - HISTORY_MINUTES * 60 * 1000;
    this.active = alarms.filter((alarm) => alarm.active);
    this.history = alarms.filter((alarm) => !alarm.active && (alarm.end?.getTime() || alarm.start.getTime()) >= cutoff);
  }

  private matches(alarm: NormalizedScadaAlarm, filters: RuleContext) {
    if (filters.site && alarm.site !== filters.site) return false;
    if (filters.room && alarm.room !== filters.room) return false;
    if (filters.upsId && alarm.upsId !== filters.upsId) return false;
    if (filters.unitId && alarm.unitId !== filters.unitId) return false;
    return true;
  }

  activeList(type: string, filters: RuleContext = {}) {
    return this.active.filter((alarm) => alarm.type === type && this.matches(alarm, filters));
  }

  isActive(type: string, filters: RuleContext = {}) {
    return this.activeList(type, filters).length > 0;
  }

  allRecent(type: string, minutes: number, now: Date, filters: RuleContext = {}) {
    const cutoff = now.getTime() - minutes * 60 * 1000;
    return [...this.active, ...this.history].filter((alarm) =>
      alarm.type === type && this.matches(alarm, filters) && alarm.start.getTime() >= cutoff
    );
  }

  recentStarts(type: string, minutes: number, now: Date, filters: RuleContext = {}) {
    return this.allRecent(type, minutes, now, filters).length;
  }

  distinctRecent(type: string, key: 'room' | 'upsId' | 'unitId', minutes: number, now: Date, filters: RuleContext = {}) {
    const values = this.allRecent(type, minutes, now, filters)
      .map((alarm) => alarm[key])
      .filter((value): value is string => Boolean(value));
    return [...new Set(values)].sort();
  }
}

const contextKey = (ruleId: string, ctx: RuleContext) => {
  const parts = Object.entries(ctx)
    .filter(([, value]) => value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`);
  return [ruleId, ...parts].join('|');
};

const uniqueContexts = (ruleId: string, contexts: RuleContext[]) => {
  const seen = new Set<string>();
  return contexts.filter((ctx) => {
    const key = contextKey(ruleId, ctx);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const tempClimRoom = (state: ExpertState, tempType: string) => {
  const climTypes = ['clim_fault_general', 'clim_pressure_high', 'clim_pressure_low', 'clim_hotgas', 'clim_fire_common'];
  return state.activeList(tempType)
    .filter((alarm) => climTypes.some((type) => state.isActive(type, { site: alarm.site, room: alarm.room })))
    .map((alarm) => ({ site: alarm.site, room: alarm.room }));
};

const tempNoClimRoom = (state: ExpertState, tempType: string) => {
  const climTypes = ['clim_fault_general', 'clim_pressure_high', 'clim_pressure_low', 'clim_hotgas', 'clim_fire_common'];
  return state.activeList(tempType)
    .filter((alarm) => !climTypes.some((type) => state.isActive(type, { site: alarm.site, room: alarm.room })))
    .map((alarm) => ({ site: alarm.site, room: alarm.room }));
};

const checkRule = (ruleId: keyof typeof RULES_KB, state: ExpertState, now: Date): RuleContext[] => {
  switch (ruleId) {
    case 'R01':
      return state.activeList('power_absence')
        .filter((alarm) => state.isActive('generator_fault', { site: alarm.site }) && state.isActive('ups_on_battery', { site: alarm.site }))
        .map((alarm) => ({ site: alarm.site }));
    case 'R02':
      return state.activeList('power_absence')
        .filter((alarm) => state.recentStarts('generator_start', 15, now, { site: alarm.site }) > 0 && state.recentStarts('ups_on_battery', 15, now, { site: alarm.site }) > 0)
        .map((alarm) => ({ site: alarm.site }));
    case 'R03':
      return state.activeList('power_absence').flatMap((alarm) =>
        state.activeList('ups_on_bypass', { site: alarm.site }).map((ups) => ({ site: alarm.site, upsId: ups.upsId }))
      );
    case 'R04':
      return state.activeList('ups_on_battery')
        .filter((alarm) => state.recentStarts('ups_low_battery', 30, now, { site: alarm.site, upsId: alarm.upsId }) > 0)
        .map((alarm) => ({ site: alarm.site, upsId: alarm.upsId }));
    case 'R05':
      return state.activeList('ups_low_battery')
        .filter((alarm) => !state.isActive('ups_on_battery', { site: alarm.site, upsId: alarm.upsId }))
        .map((alarm) => ({ site: alarm.site, upsId: alarm.upsId }));
    case 'R06':
      return state.activeList('ups_on_bypass')
        .filter((alarm) => ['breaker_fault_generic', 'breaker_fault_input', 'breaker_fault_output', 'rectifier_fault'].some((type) => state.isActive(type, { site: alarm.site, upsId: alarm.upsId })))
        .map((alarm) => ({ site: alarm.site, upsId: alarm.upsId }));
    case 'R07':
      return state.activeList('ups_on_bypass')
        .filter((alarm) => !['breaker_fault_generic', 'rectifier_fault', 'power_absence', 'ups_overload'].some((type) => state.isActive(type, { site: alarm.site, upsId: alarm.upsId })))
        .map((alarm) => ({ site: alarm.site, upsId: alarm.upsId }));
    case 'R08':
      return state.activeList('rectifier_fault')
        .filter((alarm) => state.isActive('ups_on_battery', { site: alarm.site, upsId: alarm.upsId }))
        .map((alarm) => ({ site: alarm.site, upsId: alarm.upsId }));
    case 'R09':
      return state.activeList('rectifier_fault')
        .filter((alarm) => !state.isActive('ups_on_battery', { site: alarm.site, upsId: alarm.upsId }))
        .map((alarm) => ({ site: alarm.site, upsId: alarm.upsId }));
    case 'R10':
      return state.activeList('breaker_fault_input').map((alarm) => ({ site: alarm.site, upsId: alarm.upsId }));
    case 'R11':
      return state.activeList('breaker_fault_output').map((alarm) => ({ site: alarm.site, upsId: alarm.upsId }));
    case 'R12':
      return state.activeList('ups_overload')
        .filter((alarm) => state.recentStarts('ups_overload', 30, now, { site: alarm.site, upsId: alarm.upsId }) >= 1)
        .map((alarm) => ({ site: alarm.site, upsId: alarm.upsId }));
    case 'R13':
      return state.activeList('ups_on_bypass')
        .filter((alarm) => state.recentStarts('ups_overload', 10, now, { site: alarm.site, upsId: alarm.upsId }) > 0)
        .map((alarm) => ({ site: alarm.site, upsId: alarm.upsId }));
    case 'R14':
      return state.activeList('ups_failure').map((alarm) => ({ site: alarm.site, upsId: alarm.upsId }));
    case 'R15':
      return [...new Set(state.active.map((alarm) => alarm.site))]
        .filter((site) => {
          const upsBattery = new Set(state.distinctRecent('ups_on_battery', 'upsId', 15, now, { site }));
          const upsBypass = new Set(state.distinctRecent('ups_on_bypass', 'upsId', 15, now, { site }));
          return new Set([...upsBattery, ...upsBypass]).size >= 2;
        })
        .map((site) => ({ site }));
    case 'R16':
      return state.activeList('power_absence')
        .filter((alarm) => !state.isActive('ups_on_battery', { site: alarm.site }) && !state.isActive('generator_fault', { site: alarm.site }) && !state.isActive('generator_start', { site: alarm.site }))
        .map((alarm) => ({ site: alarm.site }));
    case 'R17':
      return state.activeList('generator_fault')
        .filter((alarm) => !state.isActive('power_absence', { site: alarm.site }))
        .map((alarm) => ({ site: alarm.site }));
    case 'R18':
      return tempClimRoom(state, 'temp_high_ups_room');
    case 'R19':
      return tempNoClimRoom(state, 'temp_high_ups_room');
    case 'R20':
      return tempClimRoom(state, 'temp_high_battery_room');
    case 'R21':
      return tempNoClimRoom(state, 'temp_high_battery_room');
    case 'R22':
      return tempClimRoom(state, 'temp_high_switch_room');
    case 'R23':
      return tempNoClimRoom(state, 'temp_high_switch_room');
    case 'R24':
      return [...new Set(state.active.filter((alarm) => alarm.room).map((alarm) => `${alarm.site}|${alarm.room}`))]
        .filter((siteRoom) => {
          const [site, room] = siteRoom.split('|');
          return state.distinctRecent('clim_fault_general', 'unitId', 30, now, { site, room }).length >= 2;
        })
        .map((siteRoom) => {
          const [site, room] = siteRoom.split('|');
          return { site, room };
        });
    case 'R25':
      return state.activeList('clim_pressure_high')
        .filter((alarm) => state.isActive('clim_hotgas', { site: alarm.site, room: alarm.room, unitId: alarm.unitId }))
        .map((alarm) => ({ site: alarm.site, room: alarm.room, unitId: alarm.unitId }));
    case 'R26':
      return state.activeList('clim_pressure_low')
        .filter((alarm) => state.isActive('clim_fire_common', { site: alarm.site, room: alarm.room, unitId: alarm.unitId }))
        .map((alarm) => ({ site: alarm.site, room: alarm.room, unitId: alarm.unitId }));
    case 'R27':
      return [...new Set(state.active.map((alarm) => alarm.site))]
        .filter((site) => {
          const zones = new Set<string>();
          ['temp_high_ups_room', 'temp_high_battery_room', 'temp_high_switch_room', 'temp_high_energy_room', 'temp_high_datacenter'].forEach((type) => {
            state.distinctRecent(type, 'room', 30, now, { site }).forEach((room) => zones.add(room));
          });
          return zones.size >= 2;
        })
        .map((site) => ({ site }));
    case 'R28':
      return state.activeList('flood_alarm')
        .filter((alarm) => !state.isActive('clim_fault_general', { site: alarm.site, room: alarm.room }))
        .map((alarm) => ({ site: alarm.site, room: alarm.room }));
    case 'R29':
      return state.activeList('flood_alarm')
        .filter((alarm) => state.isActive('clim_fault_general', { site: alarm.site, room: alarm.room }))
        .map((alarm) => ({ site: alarm.site, room: alarm.room }));
    case 'R30':
      return state.activeList('ups_on_battery')
        .filter((alarm) => state.isActive('temp_high_ups_room', { site: alarm.site }) && state.isActive('generator_fault', { site: alarm.site }))
        .map((alarm) => ({ site: alarm.site }));
    case 'M01':
      return state.activeList('scada_link_lost')
        .filter((alarm) => state.recentStarts('scada_link_lost', 60, now, { site: alarm.site }) >= 2)
        .map((alarm) => ({ site: alarm.site }));
    case 'M02':
      return state.activeList('system_diagnostic').map((alarm) => ({ site: alarm.site }));
    case 'M03':
      return state.activeList('login_failure')
        .filter((alarm) => state.recentStarts('login_failure', 30, now, { site: alarm.site }) >= 3)
        .map((alarm) => ({ site: alarm.site }));
    default:
      return [];
  }
};

const alarmMatchesContext = (alarm: NormalizedScadaAlarm, ctx: RuleContext) => {
  if (ctx.site && alarm.site !== ctx.site) return false;
  if (ctx.room && alarm.room !== ctx.room) return false;
  if (ctx.upsId && alarm.upsId !== ctx.upsId) return false;
  if (ctx.unitId && alarm.unitId !== ctx.unitId) return false;
  return true;
};

const matchedAlarmIds = (kb: ScadaExpertRuleKnowledge, ctx: RuleContext, state: ExpertState) => {
  return [...state.active, ...state.history]
    .filter((alarm) => kb.alarms.includes(alarm.type) && alarmMatchesContext(alarm, ctx))
    .map((alarm) => alarm.id);
};

const buildDiagnostic = (ruleId: keyof typeof RULES_KB, ctx: RuleContext, state: ExpertState, now: Date): ExpertDiagnosis => {
  const kb = RULES_KB[ruleId];
  const contacts = getContacts(kb.category, kb.severity);
  const equipmentConcerned = [
    ...kb.equipment,
    ...(ctx.upsId ? [ctx.upsId] : []),
    ...(ctx.unitId ? [ctx.unitId] : [])
  ];
  const alarmTypes = [...kb.alarms];
  const matchedIds = matchedAlarmIds(kb, ctx, state);

  return {
    ruleId,
    faultId: kb.fault_id,
    ruleName: kb.rule_name,
    problem: kb.problem,
    category: kb.category,
    severity: kb.severity,
    isCritical: CRITICAL_SEVERITIES.has(kb.severity),
    probableCauses: [...kb.causes],
    operationalImpacts: [...kb.impacts],
    technicalJustification: kb.justification_text,
    recommendedActions: [...kb.actions],
    recoveryConditions: [...kb.return_to_normal],
    contactPerson: contacts[0],
    contacts,
    confidence: Math.min(98, 78 + alarmTypes.length * 5 + (matchedIds.length > 1 ? 6 : 0)),
    priority: severityToPriority(kb.severity),
    site: ctx.site,
    room: ctx.room,
    upsId: ctx.upsId,
    unitId: ctx.unitId,
    alarmTypes,
    alarmNames: alarmTypes.map(alarmLabel),
    matchedAlarmIds: matchedIds,
    equipmentConcerned,
    // Backward-compatible aliases for older UI/helpers.
    ...(now ? {} : {})
  };
};

export const evaluateScadaExpertSystem = (alarms: NormalizedScadaAlarm[], now = new Date()): ExpertDiagnosis[] => {
  const state = new ExpertState(alarms, now);
  const diagnostics: ExpertDiagnosis[] = [];
  const seen = new Set<string>();

  for (const ruleId of RULE_ORDER) {
    for (const ctx of uniqueContexts(ruleId, checkRule(ruleId, state, now))) {
      const key = contextKey(ruleId, ctx);
      if (seen.has(key)) continue;
      seen.add(key);
      diagnostics.push(buildDiagnostic(ruleId, ctx, state, now));
    }
  }

  return diagnostics.sort((left, right) =>
    (severityRank[right.severity || 'Info'] || 0) - (severityRank[left.severity || 'Info'] || 0)
  );
};

const diagnosisMatchesAlarm = (diagnosis: ExpertDiagnosis, alarm: NormalizedScadaAlarm) => {
  if (!diagnosis.alarmTypes?.includes(alarm.type)) return false;
  if (diagnosis.site && diagnosis.site !== alarm.site) return false;
  if (diagnosis.room && alarm.room && diagnosis.room !== alarm.room) return false;
  if (diagnosis.upsId && alarm.upsId && diagnosis.upsId !== alarm.upsId) return false;
  if (diagnosis.unitId && alarm.unitId && diagnosis.unitId !== alarm.unitId) return false;
  return true;
};

const bestDiagnosis = (diagnoses: ExpertDiagnosis[]) => {
  return [...diagnoses].sort((left, right) => {
    const rankDiff = (severityRank[right.severity || 'Info'] || 0) - (severityRank[left.severity || 'Info'] || 0);
    if (rankDiff !== 0) return rankDiff;
    return (right.alarmTypes?.length || 0) - (left.alarmTypes?.length || 0);
  })[0];
};

const fallbackDiagnosis = (alarm: DiagnosisInput, normalized?: NormalizedScadaAlarm | null): ExpertDiagnosis => {
  const description = canonical(alarm.description || '');
  const equipmentName = alarm.equipment?.name || normalized?.equipmentName || 'Équipement surveillé';
  const roomName = alarm.equipment?.room?.name || normalized?.room || 'Salle inconnue';
  const priority = severityToPriority(alarm.severity);

  if (normalized?.type?.startsWith('temp_high') || includesAny(description, ['temp', 'temperature', 'clim', 'return air', 'haute'])) {
    return {
      problem: `Condition thermique de ${roomName} hors plage cible`,
      category: 'Climatisation',
      probableCauses: ['Unité de climatisation sous-performante ou arrêtée', 'Filtre bloqué ou circulation d’air réduite', 'Charge thermique de la salle au-delà de la capacité de refroidissement'],
      operationalImpacts: ['Stress thermique sur les équipements télécom et énergie', 'Probabilité accrue d’alarmes en cascade si la température continue à monter'],
      technicalJustification: 'L’alarme est reconnue comme un événement environnemental, mais aucune règle SCADA multi-alarmes plus forte ne correspond à l’état actuel du site.',
      recommendedActions: ['Vérifier l’état de l’unité de climatisation active et son panneau d’alarmes.', 'Inspecter les filtres à air et le flux d’air autour des baies touchées.', 'Escalader vers la maintenance HVAC si la salle ne revient pas à la normale sous 15 minutes.'],
      recoveryConditions: ['La température de la salle repasse sous le seuil haut configuré.', 'Aucune alarme active de climatisation ou de température haute ne reste présente pour la salle.'],
      contactPerson: PRIMARY_CONTACT['Climatisation'],
      confidence: 74,
      priority,
      alarmTypes: normalized ? [normalized.type] : undefined,
      alarmNames: normalized ? [alarmLabel(normalized.type)] : undefined
    };
  }

  if (normalized?.type === 'power_absence' || includesAny(description, ['absence de tension', 'grid', 'voltage sag', 'input supply', 'reseau'])) {
    return {
      problem: 'Instabilité de l’entrée énergie du site détectée',
      category: 'Énergie',
      probableCauses: ['Coupure du réseau électrique ou creux de tension', 'Instabilité d’entrée transformateur', 'Transition ATS ou événement de protection'],
      operationalImpacts: ['Le site peut fonctionner sur énergie de secours ou être exposé aux fluctuations d’entrée', 'Les batteries UPS peuvent se décharger si le réseau reste indisponible'],
      technicalJustification: 'L’alarme est reconnue comme un événement énergie, mais l’ensemble actuel d’alarmes ne satisfait pas une corrélation plus forte du système expert.',
      recommendedActions: ['Confirmer la tension d’entrée triphasée sur le tableau énergie.', 'Vérifier la sélection de source ATS et la disponibilité du groupe électrogène.', 'Surveiller la capacité batterie UPS jusqu’au rétablissement stable du réseau.'],
      recoveryConditions: ['Les tensions d’entrée L1, L2 et L3 reviennent dans la plage nominale.', 'L’ATS est stable sur la source réseau ou groupe avec la capacité batterie UPS protégée.'],
      contactPerson: PRIMARY_CONTACT['Énergie'],
      confidence: 76,
      priority,
      alarmTypes: normalized ? [normalized.type] : undefined,
      alarmNames: normalized ? [alarmLabel(normalized.type)] : undefined
    };
  }

  if (normalized?.type?.startsWith('ups_') || normalized?.type?.includes('rectifier') || includesAny(description, ['bypass', 'sync', 'synchronization', 'ups failure', 'general alarm', 'rectifier'])) {
    return {
      problem: `Chemin de protection dégradé sur ${equipmentName}`,
      category: 'UPS',
      probableCauses: ['Défaut de synchronisation de phase onduleur', 'Défaut du bypass statique ou de l’entrée redresseur', 'Événement de carte de contrôle UPS ou de logique de protection'],
      operationalImpacts: ['Les charges critiques peuvent perdre une alimentation propre et protégée', 'Les salles switch et transmission deviennent vulnérables aux fluctuations réseau'],
      technicalJustification: 'L’alarme est reconnue comme un événement UPS, mais aucune règle SCADA corrélée plus forte ne correspond à l’état actuel du site.',
      recommendedActions: ['Vérifier les codes d’alarme en façade UPS et le mode de fonctionnement actuel.', 'Confirmer la séquence des phases de sortie et l’équilibre de charge sur L1, L2 et L3.', 'Conserver la protection redondante disponible et déclencher un spécialiste UPS si l’alarme reste active.'],
      recoveryConditions: ['L’UPS revient en fonctionnement protégé par onduleur.', 'La charge de sortie est équilibrée et aucune alarme critique UPS ne reste active.'],
      contactPerson: PRIMARY_CONTACT.UPS,
      confidence: 76,
      priority,
      alarmTypes: normalized ? [normalized.type] : undefined,
      alarmNames: normalized ? [alarmLabel(normalized.type)] : undefined
    };
  }

  return {
    problem: `L’alarme ${equipmentName} nécessite une revue opérateur`,
    category: 'Général',
    probableCauses: ['L’état de l’équipement est sorti de son enveloppe de fonctionnement attendue', 'L’événement SCADA nécessite une validation par rapport à l’état terrain'],
    operationalImpacts: ['Dégradation potentielle des conditions opérationnelles du site', 'L’incident peut nécessiter une intervention ingénieur s’il persiste'],
    technicalJustification: 'Aucune règle spécialisée ne correspond au texte de l’alarme ; la plateforme applique donc le flux général de revue des alarmes.',
    recommendedActions: ['Valider l’alarme dans SCADA et inspecter la salle concernée.', 'Créer un ticket actionnable si la condition persiste ou affecte le risque service.', 'Ajouter les notes terrain après intervention pour mettre à jour la base de connaissances.'],
    recoveryConditions: ['L’alarme est levée ou acquittée après validation terrain.', 'L’état de l’équipement concerné revient à sain.'],
    contactPerson: 'Ingénieur du site',
    confidence: 60,
    priority,
    alarmTypes: normalized ? [normalized.type] : undefined,
    alarmNames: normalized ? [alarmLabel(normalized.type)] : undefined
  };
};

export const generateDiagnosis = (alarm: DiagnosisInput): ExpertDiagnosis => {
  const normalized = normalizeScadaAlarm(alarm);

  if (normalized) {
    const diagnosis = bestDiagnosis(evaluateScadaExpertSystem([normalized]).filter((item) => diagnosisMatchesAlarm(item, normalized)));
    if (diagnosis) return diagnosis;
  }

  return fallbackDiagnosis(alarm, normalized);
};

export const attachExpertDiagnosesToAlarms = (activeAlarms: DiagnosisInput[], contextAlarms: DiagnosisInput[] = activeAlarms) => {
  const normalizedById = new Map<string, NormalizedScadaAlarm>();
  const normalizedContext = contextAlarms
    .map((alarm) => normalizeScadaAlarm(alarm))
    .filter((alarm): alarm is NormalizedScadaAlarm => Boolean(alarm));

  normalizedContext.forEach((alarm) => normalizedById.set(alarm.id, alarm));

  activeAlarms.forEach((alarm) => {
    const normalized = normalizeScadaAlarm(alarm);
    if (normalized) normalizedById.set(normalized.id, normalized);
  });

  const diagnostics = evaluateScadaExpertSystem([...normalizedById.values()]);

  return activeAlarms.map((alarm) => {
    const normalized = normalizeScadaAlarm(alarm);
    const matches = normalized ? diagnostics.filter((diagnosis) => diagnosisMatchesAlarm(diagnosis, normalized)) : [];
    return {
      ...alarm,
      normalizedAlarm: normalized ? {
        type: normalized.type,
        label: alarmLabel(normalized.type),
        site: normalized.site,
        room: normalized.room,
        upsId: normalized.upsId,
        unitId: normalized.unitId
      } : null,
      diagnosis: bestDiagnosis(matches) || fallbackDiagnosis(alarm, normalized),
      expertDiagnostics: matches
    };
  });
};

const roomLabelForCode = (room: string) => {
  const labels: Record<string, string> = {
    salle_ups: 'Salle UPS',
    salle_batterie: 'Salle batteries',
    salle_reseau: 'Salle switch / réseau',
    salle_energie: 'Salle énergie',
    datacenter: 'Data center'
  };
  return labels[room] || room;
};

const roomsForAlarmTypes = (alarmTypes: string[]) => {
  const rooms = new Set<string>();
  alarmTypes.forEach((type) => {
    if (type.includes('ups_room')) rooms.add('Salle UPS');
    if (type.includes('battery_room')) rooms.add('Salle batteries');
    if (type.includes('switch_room')) rooms.add('Salle switch / réseau');
    if (type.includes('energy_room')) rooms.add('Salle énergie');
    if (type.includes('datacenter')) rooms.add('Data center');
  });
  return [...rooms];
};

const articleContent = (ruleId: string, kb: ScadaExpertRuleKnowledge) => [
  `# ${kb.rule_name}`,
  '',
  '## Problème',
  kb.problem,
  '',
  '## Symptômes',
  ...kb.alarms.map((alarmType) => `- ${alarmLabel(alarmType)}`),
  '',
  '## Cause',
  ...kb.causes.map((cause) => `- ${cause}`),
  '',
  '## Résolution',
  ...kb.actions.map((action) => `- ${action}`),
  '',
  '## Équipements liés',
  ...kb.equipment.map((equipment) => `- ${equipment}`),
  '',
  '## Retour à la normale',
  ...kb.return_to_normal.map((condition) => `- ${condition}`),
  '',
  '## Notes ingénieur',
  `Généré depuis la règle experte SCADA ${ruleId}. Ajoutez les notes terrain des tickets clôturés pour enrichir cet article.`
].join('\n');

export const buildExpertKnowledgeArticles = (tickets: any[] = []): ExpertKnowledgeArticle[] => {
  return RULE_ORDER.map((ruleId) => {
    const kb = RULES_KB[ruleId];
    const relatedTickets = tickets
      .filter((ticket) => {
        if (!ticket.alarm) return false;
        const diagnosis = generateDiagnosis({
          severity: ticket.alarm.severity,
          description: ticket.alarm.description,
          equipment: ticket.equipment
        });
        return diagnosis.ruleId === ruleId || kb.equipment.some((equipment) => canonical(ticket.equipment?.type || ticket.equipment?.name || '').includes(canonical(equipment)));
      })
      .slice(0, 6)
      .map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        site: ticket.equipment?.room?.site?.name,
        room: ticket.equipment?.room?.name,
        equipment: ticket.equipment?.name
      }));

    const similarCases = tickets
      .filter((ticket) => ticket.report && relatedTickets.some((related) => related.id === ticket.id))
      .slice(0, 4)
      .map((ticket) => `${ticket.id.substring(0, 8)}: ${ticket.report.rootCause || ticket.title}`);

    return {
      id: `expert-${String(ruleId).toLowerCase()}`,
      title: kb.rule_name,
      category: kb.category,
      tags: [
        'expert-system',
        String(ruleId),
        kb.fault_id,
        kb.severity,
        kb.category,
        ...kb.alarms,
        ...kb.equipment
      ],
      content: articleContent(String(ruleId), kb),
      createdAt: KNOWLEDGE_TIMESTAMP,
      updatedAt: KNOWLEDGE_TIMESTAMP,
      ruleId: String(ruleId),
      faultId: kb.fault_id,
      failureType: kb.category,
      severity: kb.severity,
      problem: kb.problem,
      symptoms: kb.alarms.map(alarmLabel),
      causes: [...kb.causes],
      resolution: [...kb.actions, ...kb.return_to_normal],
      relatedEquipment: [...kb.equipment],
      engineerNotes: [`Généré depuis la règle experte SCADA ${ruleId}.`],
      similarCases,
      relatedTickets,
      rooms: roomsForAlarmTypes(kb.alarms).map(roomLabelForCode),
      alarmTypes: [...kb.alarms]
    };
  });
};
