import { prisma } from '../src/config/prisma';

const passwordHash = 'hashed_password_mock';
const desiredRoomIds = [
  'room-ups',
  'room-battery',
  'room-switch',
  'room-enr',
  'room-vsat',
  'room-generator',
  'room-cooling',
  'room-electrical'
];
const desiredEquipmentIds = [
  'eq-ups-a',
  'eq-battery-bank-a',
  'eq-switch-core',
  'eq-vsat-rack',
  'eq-rectifier-huawei',
  'eq-generator-01',
  'eq-generator-02',
  'eq-transformer-tr1',
  'eq-ats-tgbt',
  'eq-clim-stulz-01',
  'eq-clim-eniem-01'
];

async function main() {
  console.log('Starting DDN seed...');

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: { permissions: ['*'] },
    create: {
      name: 'Super Admin',
      permissions: ['*']
    }
  });

  const engineerRole = await prisma.role.upsert({
    where: { name: 'Engineer' },
    update: {
      permissions: [
        'read:sites',
        'read:alarms',
        'read:diagnoses',
        'assign:tickets',
        'resolve:tickets',
        'submit:ticket_reports',
        'manage:maintenance',
        'write:knowledge'
      ]
    },
    create: {
      name: 'Engineer',
      permissions: [
        'read:sites',
        'read:alarms',
        'read:diagnoses',
        'assign:tickets',
        'resolve:tickets',
        'submit:ticket_reports',
        'manage:maintenance',
        'write:knowledge'
      ]
    }
  });

  const operatorRole = await prisma.role.upsert({
    where: { name: 'Site Operator' },
    update: {
      permissions: [
        'read:sites',
        'read:alarms',
        'read:diagnoses',
        'create:tickets',
        'delete:tickets'
      ]
    },
    create: {
      name: 'Site Operator',
      permissions: [
        'read:sites',
        'read:alarms',
        'read:diagnoses',
        'create:tickets',
        'delete:tickets'
      ]
    }
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@djezzy.dz' },
    update: {
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      roleId: superAdminRole.id
    },
    create: {
      email: 'admin@djezzy.dz',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      roleId: superAdminRole.id
    }
  });

  const engineerUser = await prisma.user.upsert({
    where: { email: 'engineer@djezzy.dz' },
    update: {
      passwordHash,
      firstName: 'Ahmed',
      lastName: 'Belkacem',
      roleId: engineerRole.id
    },
    create: {
      email: 'engineer@djezzy.dz',
      passwordHash,
      firstName: 'Ahmed',
      lastName: 'Belkacem',
      roleId: engineerRole.id
    }
  });

  const operatorUser = await prisma.user.upsert({
    where: { email: 'operator@djezzy.dz' },
    update: {
      passwordHash,
      firstName: 'Nadia',
      lastName: 'Mansouri',
      roleId: operatorRole.id
    },
    create: {
      email: 'operator@djezzy.dz',
      passwordHash,
      firstName: 'Nadia',
      lastName: 'Mansouri',
      roleId: operatorRole.id
    }
  });

  const algiersSite = await prisma.site.upsert({
    where: { id: 'msc01-algiers' },
    update: {
      name: 'MSC01 Algiers',
      location: 'Algiers, Algeria',
      latitude: 36.7538,
      longitude: 3.0588,
      overallHealth: 98
    },
    create: {
      id: 'msc01-algiers',
      name: 'MSC01 Algiers',
      location: 'Algiers, Algeria',
      latitude: 36.7538,
      longitude: 3.0588,
      overallHealth: 98
    }
  });

  const blidaSite = await prisma.site.upsert({
    where: { id: 'msc10-blida' },
    update: {
      name: 'MSC10 Blida',
      location: 'Blida, Algeria',
      latitude: 36.47,
      longitude: 2.8277,
      overallHealth: 82.5
    },
    create: {
      id: 'msc10-blida',
      name: 'MSC10 Blida',
      location: 'Blida, Algeria',
      latitude: 36.47,
      longitude: 2.8277,
      overallHealth: 82.5
    }
  });

  await Promise.all([
    prisma.siteAssignment.upsert({
      where: { userId_siteId: { userId: adminUser.id, siteId: algiersSite.id } },
      update: {},
      create: { userId: adminUser.id, siteId: algiersSite.id }
    }),
    prisma.siteAssignment.upsert({
      where: { userId_siteId: { userId: adminUser.id, siteId: blidaSite.id } },
      update: {},
      create: { userId: adminUser.id, siteId: blidaSite.id }
    }),
    prisma.siteAssignment.upsert({
      where: { userId_siteId: { userId: engineerUser.id, siteId: blidaSite.id } },
      update: {},
      create: { userId: engineerUser.id, siteId: blidaSite.id }
    }),
    prisma.siteAssignment.upsert({
      where: { userId_siteId: { userId: operatorUser.id, siteId: blidaSite.id } },
      update: {},
      create: { userId: operatorUser.id, siteId: blidaSite.id }
    })
  ]);

  const legacyEquipment = await prisma.equipment.findMany({
    where: {
      room: { siteId: blidaSite.id },
      id: { notIn: desiredEquipmentIds }
    },
    select: { id: true }
  });
  const legacyEquipmentIds = legacyEquipment.map((item) => item.id);

  if (legacyEquipmentIds.length > 0) {
    await prisma.telemetry.deleteMany({ where: { equipmentId: { in: legacyEquipmentIds } } });
    await prisma.ticket.deleteMany({ where: { equipmentId: { in: legacyEquipmentIds } } });
    await prisma.alarm.deleteMany({ where: { equipmentId: { in: legacyEquipmentIds } } });
    await prisma.maintenanceTask.deleteMany({ where: { equipmentId: { in: legacyEquipmentIds } } });
    await prisma.equipment.deleteMany({ where: { id: { in: legacyEquipmentIds } } });
  }

  await prisma.room.deleteMany({
    where: {
      siteId: blidaSite.id,
      id: { notIn: desiredRoomIds }
    }
  });

  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { id: 'room-ups' },
      update: { siteId: blidaSite.id, name: 'UPS Room', targetTemp: 25, targetHumidity: 45 },
      create: { id: 'room-ups', siteId: blidaSite.id, name: 'UPS Room', targetTemp: 25, targetHumidity: 45 }
    }),
    prisma.room.upsert({
      where: { id: 'room-battery' },
      update: { siteId: blidaSite.id, name: 'Battery Room', targetTemp: 25, targetHumidity: 50 },
      create: { id: 'room-battery', siteId: blidaSite.id, name: 'Battery Room', targetTemp: 25, targetHumidity: 50 }
    }),
    prisma.room.upsert({
      where: { id: 'room-switch' },
      update: { siteId: blidaSite.id, name: 'Switch Room', targetTemp: 30, targetHumidity: 45 },
      create: { id: 'room-switch', siteId: blidaSite.id, name: 'Switch Room', targetTemp: 30, targetHumidity: 45 }
    }),
    prisma.room.upsert({
      where: { id: 'room-enr' },
      update: { siteId: blidaSite.id, name: 'ENR Room', targetTemp: 28, targetHumidity: 45 },
      create: { id: 'room-enr', siteId: blidaSite.id, name: 'ENR Room', targetTemp: 28, targetHumidity: 45 }
    }),
    prisma.room.upsert({
      where: { id: 'room-vsat' },
      update: { siteId: blidaSite.id, name: 'V-SAT Room', targetTemp: 28, targetHumidity: 45 },
      create: { id: 'room-vsat', siteId: blidaSite.id, name: 'V-SAT Room', targetTemp: 28, targetHumidity: 45 }
    }),
    prisma.room.upsert({
      where: { id: 'room-generator' },
      update: { siteId: blidaSite.id, name: 'Generator Area', targetTemp: 35, targetHumidity: 40 },
      create: { id: 'room-generator', siteId: blidaSite.id, name: 'Generator Area', targetTemp: 35, targetHumidity: 40 }
    }),
    prisma.room.upsert({
      where: { id: 'room-cooling' },
      update: { siteId: blidaSite.id, name: 'Cooling Systems', targetTemp: 24, targetHumidity: 50 },
      create: { id: 'room-cooling', siteId: blidaSite.id, name: 'Cooling Systems', targetTemp: 24, targetHumidity: 50 }
    }),
    prisma.room.upsert({
      where: { id: 'room-electrical' },
      update: { siteId: blidaSite.id, name: 'Electrical Room', targetTemp: 28, targetHumidity: 45 },
      create: { id: 'room-electrical', siteId: blidaSite.id, name: 'Electrical Room', targetTemp: 28, targetHumidity: 45 }
    })
  ]);

  const roomById = Object.fromEntries(rooms.map((room) => [room.id, room]));

  const equipment = await Promise.all([
    prisma.equipment.upsert({
      where: { id: 'eq-ups-a' },
      update: { roomId: roomById['room-ups'].id, name: 'UPS', type: 'UPS', status: 'warning' },
      create: { id: 'eq-ups-a', roomId: roomById['room-ups'].id, name: 'UPS', type: 'UPS', status: 'warning' }
    }),
    prisma.equipment.upsert({
      where: { id: 'eq-battery-bank-a' },
      update: { roomId: roomById['room-battery'].id, name: 'BATT-BANK-A', type: 'Battery', status: 'healthy' },
      create: { id: 'eq-battery-bank-a', roomId: roomById['room-battery'].id, name: 'BATT-BANK-A', type: 'Battery', status: 'healthy' }
    }),
    prisma.equipment.upsert({
      where: { id: 'eq-switch-core' },
      update: { roomId: roomById['room-switch'].id, name: 'SWITCH-MSC10-Core', type: 'Network', status: 'healthy' },
      create: { id: 'eq-switch-core', roomId: roomById['room-switch'].id, name: 'SWITCH-MSC10-Core', type: 'Network', status: 'healthy' }
    }),
    prisma.equipment.upsert({
      where: { id: 'eq-vsat-rack' },
      update: { roomId: roomById['room-vsat'].id, name: 'VSAT-RACK-01', type: 'Network', status: 'healthy' },
      create: { id: 'eq-vsat-rack', roomId: roomById['room-vsat'].id, name: 'VSAT-RACK-01', type: 'Network', status: 'healthy' }
    }),
    prisma.equipment.upsert({
      where: { id: 'eq-rectifier-huawei' },
      update: { roomId: roomById['room-enr'].id, name: 'PS-HUAWEI-TP48300D', type: 'Rectifier', status: 'healthy' },
      create: { id: 'eq-rectifier-huawei', roomId: roomById['room-enr'].id, name: 'PS-HUAWEI-TP48300D', type: 'Rectifier', status: 'healthy' }
    }),
    prisma.equipment.upsert({
      where: { id: 'eq-generator-01' },
      update: { roomId: roomById['room-generator'].id, name: 'GE-01-CUMMINS-400KVA', type: 'Generator', status: 'healthy' },
      create: { id: 'eq-generator-01', roomId: roomById['room-generator'].id, name: 'GE-01-CUMMINS-400KVA', type: 'Generator', status: 'healthy' }
    }),
    prisma.equipment.upsert({
      where: { id: 'eq-generator-02' },
      update: { roomId: roomById['room-generator'].id, name: 'GE-02-SDMO-400KVA', type: 'Generator', status: 'offline' },
      create: { id: 'eq-generator-02', roomId: roomById['room-generator'].id, name: 'GE-02-SDMO-400KVA', type: 'Generator', status: 'offline' }
    }),
    prisma.equipment.upsert({
      where: { id: 'eq-transformer-tr1' },
      update: { roomId: roomById['room-electrical'].id, name: 'Transformer-TR1-400KVA', type: 'Transformer', status: 'healthy' },
      create: { id: 'eq-transformer-tr1', roomId: roomById['room-electrical'].id, name: 'Transformer-TR1-400KVA', type: 'Transformer', status: 'healthy' }
    }),
    prisma.equipment.upsert({
      where: { id: 'eq-ats-tgbt' },
      update: { roomId: roomById['room-electrical'].id, name: 'ATS-TGBT', type: 'ATS', status: 'warning' },
      create: { id: 'eq-ats-tgbt', roomId: roomById['room-electrical'].id, name: 'ATS-TGBT', type: 'ATS', status: 'warning' }
    }),
    prisma.equipment.upsert({
      where: { id: 'eq-clim-stulz-01' },
      update: { roomId: roomById['room-cooling'].id, name: 'CLIM-STULZ-01', type: 'Cooling', status: 'warning' },
      create: { id: 'eq-clim-stulz-01', roomId: roomById['room-cooling'].id, name: 'CLIM-STULZ-01', type: 'Cooling', status: 'warning' }
    }),
    prisma.equipment.upsert({
      where: { id: 'eq-clim-eniem-01' },
      update: { roomId: roomById['room-battery'].id, name: 'CLIM-ENIEM-01-BATTERY', type: 'Cooling', status: 'healthy' },
      create: { id: 'eq-clim-eniem-01', roomId: roomById['room-battery'].id, name: 'CLIM-ENIEM-01-BATTERY', type: 'Cooling', status: 'healthy' }
    })
  ]);

  await prisma.telemetry.deleteMany({
    where: { equipmentId: { in: desiredEquipmentIds } }
  });

  await prisma.notification.deleteMany();
  await prisma.ticket.deleteMany({
    where: { equipmentId: { in: desiredEquipmentIds } }
  });
  await prisma.maintenanceTask.deleteMany({
    where: { equipmentId: { in: desiredEquipmentIds } }
  });
  await prisma.alarm.deleteMany({
    where: { equipmentId: { in: desiredEquipmentIds } }
  });

  await Promise.all([
    prisma.knowledgeBase.upsert({
      where: { id: 'kb-ups-sync-recovery' },
      update: {
        title: 'UPS Synchronization Recovery Procedure',
        category: 'Power Systems',
        tags: ['UPS', 'Critical', 'Electrical', 'MSC10'],
        content: '# UPS Synchronization Recovery Procedure\n\n## Symptoms\nUPS synchronization failure, bypass alarm, or unbalanced output load.\n\n## Corrective Actions\n- Verify UPS front-panel fault code.\n- Confirm L1/L2/L3 output sequence and load balance.\n- Keep redundant UPS protection available while dispatching a UPS specialist.\n\n## Recovery\nUPS must return to inverter-protected operation with no active critical alarm.'
      },
      create: {
        id: 'kb-ups-sync-recovery',
        title: 'UPS Synchronization Recovery Procedure',
        category: 'Power Systems',
        tags: ['UPS', 'Critical', 'Electrical', 'MSC10'],
        content: '# UPS Synchronization Recovery Procedure\n\n## Symptoms\nUPS synchronization failure, bypass alarm, or unbalanced output load.\n\n## Corrective Actions\n- Verify UPS front-panel fault code.\n- Confirm L1/L2/L3 output sequence and load balance.\n- Keep redundant UPS protection available while dispatching a UPS specialist.\n\n## Recovery\nUPS must return to inverter-protected operation with no active critical alarm.'
      }
    }),
    prisma.knowledgeBase.upsert({
      where: { id: 'kb-cooling-high-temp' },
      update: {
        title: 'Cooling High Temperature Response',
        category: 'Cooling & HVAC',
        tags: ['Cooling', 'Temperature', 'MSC10'],
        content: '# Cooling High Temperature Response\n\n## Symptoms\nReturn-air temperature alarm or room score degradation.\n\n## Corrective Actions\n- Confirm cooling unit state and alarm panel.\n- Inspect filters and rack airflow.\n- Escalate if temperature does not recover within 15 minutes.'
      },
      create: {
        id: 'kb-cooling-high-temp',
        title: 'Cooling High Temperature Response',
        category: 'Cooling & HVAC',
        tags: ['Cooling', 'Temperature', 'MSC10'],
        content: '# Cooling High Temperature Response\n\n## Symptoms\nReturn-air temperature alarm or room score degradation.\n\n## Corrective Actions\n- Confirm cooling unit state and alarm panel.\n- Inspect filters and rack airflow.\n- Escalate if temperature does not recover within 15 minutes.'
      }
    })
  ]);

  await Promise.all([
    prisma.expertRule.upsert({
      where: { id: 'rule-battery-temp' },
      update: {
        name: 'Battery Room High Temperature',
        description: 'Battery Room room-health score begins degrading above 80 percent of this threshold.',
        parameter: 'DS2_BAT MSC10',
        threshold: 25,
        unit: 'C',
        siteId: blidaSite.id
      },
      create: {
        id: 'rule-battery-temp',
        name: 'Battery Room High Temperature',
        description: 'Battery Room room-health score begins degrading above 80 percent of this threshold.',
        parameter: 'DS2_BAT MSC10',
        threshold: 25,
        unit: 'C',
        siteId: blidaSite.id
      }
    }),
    prisma.expertRule.upsert({
      where: { id: 'rule-switch-temp' },
      update: {
        name: 'Switch Room High Temperature',
        description: 'Switch Room room-health score threshold from the Blida health methodology.',
        parameter: 'DS2_SWITCH MSC10',
        threshold: 30,
        unit: 'C',
        siteId: blidaSite.id
      },
      create: {
        id: 'rule-switch-temp',
        name: 'Switch Room High Temperature',
        description: 'Switch Room room-health score threshold from the Blida health methodology.',
        parameter: 'DS2_SWITCH MSC10',
        threshold: 30,
        unit: 'C',
        siteId: blidaSite.id
      }
    }),
    prisma.expertRule.upsert({
      where: { id: 'rule-ups-load' },
      update: {
        name: 'UPS Load Warning',
        description: 'UPS health score degrades when maximum phase load approaches this limit.',
        parameter: 'DS3_Output_Load_Max',
        threshold: 85,
        unit: '%',
        siteId: blidaSite.id
      },
      create: {
        id: 'rule-ups-load',
        name: 'UPS Load Warning',
        description: 'UPS health score degrades when maximum phase load approaches this limit.',
        parameter: 'DS3_Output_Load_Max',
        threshold: 85,
        unit: '%',
        siteId: blidaSite.id
      }
    }),
    prisma.expertRule.upsert({
      where: { id: 'rule-grid-failure' },
      update: {
        name: 'Grid Failure Site Health Cap',
        description: 'If all three grid phases are zero, cap the site score at 50.',
        parameter: 'DS3_Input_Voltage_All_Phases',
        threshold: 0,
        unit: 'V',
        siteId: blidaSite.id
      },
      create: {
        id: 'rule-grid-failure',
        name: 'Grid Failure Site Health Cap',
        description: 'If all three grid phases are zero, cap the site score at 50.',
        parameter: 'DS3_Input_Voltage_All_Phases',
        threshold: 0,
        unit: 'V',
        siteId: blidaSite.id
      }
    })
  ]);

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
