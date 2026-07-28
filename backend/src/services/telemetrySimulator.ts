import { Server } from 'socket.io';
import { prisma } from '../config/prisma';

export const startTelemetrySimulation = (io: Server) => {
  setInterval(async () => {
    try {
      // Fetch all equipment to generate telemetry for them
      const equipments = await prisma.equipment.findMany({
        include: { room: true }
      });

      for (const eq of equipments) {
        // Base metrics vary slightly
        const variance = (Math.random() * 2 - 1); // -1 to +1
        const temperature = parseFloat(((eq.room?.targetTemp || 22) + variance).toFixed(2));
        const load = parseFloat((40 + (Math.random() * 20)).toFixed(2)); // 40-60%
        const powerDraw = parseFloat((eq.type === 'UPS' ? 120 + variance * 5 : 48 + variance).toFixed(2));
        const humidity = parseFloat(((eq.room?.targetHumidity || 45) + (Math.random() * 4 - 2)).toFixed(2));

        // Save individual telemetry metrics
        await prisma.telemetry.createMany({
          data: [
            { equipmentId: eq.id, metricType: 'temperature', value: temperature },
            { equipmentId: eq.id, metricType: 'humidity', value: humidity },
            { equipmentId: eq.id, metricType: 'load', value: load },
            { equipmentId: eq.id, metricType: 'powerDraw', value: powerDraw },
          ]
        });

        // Broadcast over Socket.io
        io.emit('telemetry_update', {
          equipmentId: eq.id,
          equipmentName: eq.name,
          siteId: eq.room?.siteId,
          metrics: {
            temperature,
            load,
            powerDraw,
            humidity,
            status: eq.status
          },
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Telemetry Simulation Error:', error);
    }
  }, 5000); // Send updates every 5 seconds
};
