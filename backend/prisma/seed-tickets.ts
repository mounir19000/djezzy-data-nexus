import { prisma } from '../src/config/prisma';

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@djezzy.dz' } });
  const equipment = await prisma.equipment.findFirst();

  if (admin && equipment) {
    await prisma.ticket.create({
      data: {
        title: 'Verify Sync Failure',
        equipmentId: equipment.id,
        priority: 'high',
        status: 'pending',
        assignedTo: admin.id
      }
    });
    console.log('Tickets seeded');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
