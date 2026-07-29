import cron from 'node-cron';
import { prisma } from '../config/prisma';

export const startMaintenanceCron = () => {
  // Run every day at 00:00 (midnight)
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running maintenance schedule check...');
    try {
      const now = new Date();
      // Look for schedules where nextRunDate is within the next 24 hours
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);

      const schedules = await prisma.maintenanceSchedule.findMany({
        where: {
          nextRunDate: {
            lte: tomorrow
          }
        },
        include: {
          equipment: true
        }
      });

      console.log(`[Cron] Found ${schedules.length} maintenance schedules due.`);

      for (const schedule of schedules) {
        // Create the maintenance task
        const task = await prisma.maintenanceTask.create({
          data: {
            title: `[Recurrent] ${schedule.title}`,
            equipmentId: schedule.equipmentId,
            status: 'pending',
            assignedTo: schedule.assignedTo,
            scheduledDate: schedule.nextRunDate
          }
        });

        // Notify the assignee (1 day in advance)
        if (schedule.assignedTo) {
          await prisma.notification.create({
            data: {
              userId: schedule.assignedTo,
              message: `Maintenance récurrente prévue demain : ${schedule.title} sur ${schedule.equipment.name}`,
            }
          });
        }

        // Calculate next run date
        const nextDate = new Date(schedule.nextRunDate);
        if (schedule.recurrence === 'weekly') {
          nextDate.setDate(nextDate.getDate() + 7);
        } else if (schedule.recurrence === 'monthly') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else {
          // Default to weekly if invalid
          nextDate.setDate(nextDate.getDate() + 7);
        }

        // Update the schedule
        await prisma.maintenanceSchedule.update({
          where: { id: schedule.id },
          data: { nextRunDate: nextDate }
        });
      }
    } catch (error) {
      console.error('[Cron] Error running maintenance schedule check:', error);
    }
  });

  console.log('[Cron] Maintenance cron service started.');
};
