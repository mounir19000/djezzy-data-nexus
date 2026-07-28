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
  console.log('Starting seed...');

  // Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      permissions: ['*']
    }
  });

  const engineerRole = await prisma.role.upsert({
    where: { name: 'Engineer' },
    update: {},
    create: {
      name: 'Engineer',
      permissions: ['read:sites', 'write:tickets', 'read:alarms']
    }
  });

  const operatorRole = await prisma.role.upsert({
    where: { name: 'Site Operator' },
    update: {},
    create: {
      name: 'Site Operator',
      permissions: ['read:sites', 'write:alarms', 'write:tickets']
    }
  });

  // Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@djezzy.dz' },
    update: {},
    create: {
      email: 'admin@djezzy.dz',
      passwordHash: 'hashed_password_mock', // In real app, this would be bcrypt
      firstName: 'System',
      lastName: 'Administrator',
      roleId: superAdminRole.id
    }
  });

  // Site
  const blidaSite = await prisma.site.upsert({
    where: { id: 'msc10-blida' },
    update: {
      latitude: 36.4700,
      longitude: 2.8277,
    },
    create: {
      id: 'msc10-blida',
      name: 'MSC10 Blida',
      location: 'Blida, Algeria',
      latitude: 36.4700,
      longitude: 2.8277,
      overallHealth: 92.5
    }
  });

  const algiersSite = await prisma.site.upsert({
    where: { id: 'msc01-algiers' },
    update: {
      latitude: 36.7538,
      longitude: 3.0588,
    },
    create: {
      id: 'msc01-algiers',
      name: 'MSC01 Algiers',
      location: 'Algiers, Algeria',
      latitude: 36.7538,
      longitude: 3.0588,
      overallHealth: 98.0
    }
  });

  // Rooms
  const upsRoom = await prisma.room.create({
    data: {
      siteId: blidaSite.id,
      name: 'UPS Room',
      targetTemp: 22.0,
      targetHumidity: 45.0
    }
  });

  const batteryRoom = await prisma.room.create({
    data: {
      siteId: blidaSite.id,
      name: 'Battery Room',
      targetTemp: 24.0,
      targetHumidity: 50.0
    }
  });

  // Equipments
  const ups1 = await prisma.equipment.create({
    data: {
      roomId: upsRoom.id,
      name: 'UPS-A',
      type: 'UPS',
      status: 'healthy'
    }
  });

  const batt1 = await prisma.equipment.create({
    data: {
      roomId: batteryRoom.id,
      name: 'BATT-BANK-A',
      type: 'Battery',
      status: 'healthy'
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
