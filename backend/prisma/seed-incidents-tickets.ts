import { prisma } from '../src/config/prisma';

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@djezzy.dz' } });
  
  // Find a few pieces of equipment
  const equipments = await prisma.equipment.findMany({ take: 3 });
  
  if (admin && equipments.length >= 3) {
    // Create Alarms
    const alarm1 = await prisma.alarm.create({
      data: {
        equipmentId: equipments[0].id,
        severity: 'critical',
        description: 'Synchronization Failure Detected',
        active: true
      }
    });

    const alarm2 = await prisma.alarm.create({
      data: {
        equipmentId: equipments[1].id,
        severity: 'warning',
        description: 'Return Air Temp High',
        active: true
      }
    });

    const alarm3 = await prisma.alarm.create({
      data: {
        equipmentId: equipments[2].id,
        severity: 'warning',
        description: 'Voltage Sag Detected',
        active: true
      }
    });

    // Create Tickets linked to Alarms
    await prisma.ticket.create({
      data: {
        title: 'Check Sync Board',
        equipmentId: equipments[0].id,
        alarmId: alarm1.id,
        status: 'assigned',
        priority: 'high',
        assignedTo: admin.id
      }
    });

    await prisma.ticket.create({
      data: {
        title: 'Replace Filter',
        equipmentId: equipments[1].id,
        alarmId: alarm2.id,
        status: 'inProgress',
        priority: 'medium',
        assignedTo: admin.id
      }
    });

    await prisma.ticket.create({
      data: {
        title: 'Investigate Grid Log',
        equipmentId: equipments[2].id,
        alarmId: alarm3.id,
        status: 'resolved',
        priority: 'low',
        assignedTo: admin.id
      }
    });

    // An extra unlinked pending ticket
    await prisma.ticket.create({
      data: {
        title: 'Routine Maintenance',
        equipmentId: equipments[0].id,
        status: 'pending',
        priority: 'low',
      }
    });

    console.log('Dummy Alarms and Tickets have been seeded successfully!');
  } else {
    console.log('Missing admin user or equipment data to seed.');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
