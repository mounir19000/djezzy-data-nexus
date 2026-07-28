import { prisma } from '../src/config/prisma';

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@djezzy.dz' } });
  const equipment = await prisma.equipment.findFirst();

  if (admin && equipment) {
    // Seed Maintenance Tasks
    await prisma.maintenanceTask.createMany({
      data: [
        {
          title: 'Quarterly Generator Inspection',
          equipmentId: equipment.id,
          status: 'pending',
          assignedTo: admin.id,
          scheduledDate: new Date(new Date().setDate(new Date().getDate() + 5)) // 5 days from now
        },
        {
          title: 'Filter Replacement',
          equipmentId: equipment.id,
          status: 'inProgress',
          assignedTo: admin.id,
          scheduledDate: new Date()
        }
      ]
    });

    // Seed Knowledge Base
    await prisma.knowledgeBase.createMany({
      data: [
        {
          title: 'UPS Synchronization Recovery Procedure',
          category: 'Procedures',
          tags: ['UPS', 'Critical', 'Electrical'],
          content: 'Step 1: Verify phase alignment on panel. Step 2: Switch to bypass if deviation > 5%.'
        },
        {
          title: 'Cooling System Emergency Shutdown',
          category: 'Safety',
          tags: ['HVAC', 'Safety'],
          content: 'In case of fire alarm, CRAC units must be manually isolated from main panel.'
        }
      ]
    });

    // Seed Expert Rules
    await prisma.expertRule.createMany({
      data: [
        {
          name: 'Critical Temp Threshold',
          description: 'Triggers critical alarm if room temperature exceeds this limit.',
          parameter: 'temperature',
          threshold: 27.5,
          unit: '°C'
        },
        {
          name: 'UPS Load Warning',
          description: 'Triggers warning if UPS load exceeds this limit.',
          parameter: 'ups_load',
          threshold: 80.0,
          unit: '%'
        }
      ]
    });

    console.log('Phase 15 mock data seeded successfully!');
  } else {
    console.log('Missing admin or equipment to seed phase 15 data.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
