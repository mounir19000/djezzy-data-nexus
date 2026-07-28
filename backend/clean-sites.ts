import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const sites = await prisma.site.findMany();
  for (const site of sites) {
    if (site.id !== 'msc10-blida' && site.id !== 'msc01-algiers') {
      console.log('Deleting extra site:', site.id, site.name);
      const equipments = await prisma.equipment.findMany({ where: { room: { siteId: site.id } } });
      for (const eq of equipments) {
        await prisma.telemetry.deleteMany({ where: { equipmentId: eq.id } });
        await prisma.alarm.deleteMany({ where: { equipmentId: eq.id } });
        await prisma.ticket.deleteMany({ where: { equipmentId: eq.id } });
        await prisma.maintenanceTask.deleteMany({ where: { equipmentId: eq.id } });
      }
      await prisma.equipment.deleteMany({ where: { room: { siteId: site.id } } });
      await prisma.room.deleteMany({ where: { siteId: site.id } });
      await prisma.expertRule.deleteMany({ where: { siteId: site.id } });
      await prisma.site.delete({ where: { id: site.id } });
    }
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
