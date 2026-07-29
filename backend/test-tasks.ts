import { prisma } from './src/config/prisma';
prisma.maintenanceTask.findMany().then(tasks => {
  console.log('TASKS:', JSON.stringify(tasks, null, 2));
  return prisma.maintenanceSchedule.findMany();
}).then(schedules => {
  console.log('SCHEDULES:', JSON.stringify(schedules, null, 2));
  prisma.$disconnect();
});
