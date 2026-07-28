import { prisma } from '../src/config/prisma';

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@djezzy.dz' } });
  if (user) {
    await prisma.notification.createMany({
      data: [
        { userId: user.id, message: 'UPS-A load exceeded 80%', read: false },
        { userId: user.id, message: 'New Ticket TCK-1049 assigned to you', read: false },
        { userId: user.id, message: 'Generator scheduled for maintenance', read: true }
      ]
    });
    console.log('Notifications created');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
