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
        const inputVoltageL1 = parseFloat((227 + variance).toFixed(2));
        const inputVoltageL2 = parseFloat((230 + variance).toFixed(2));
        const inputVoltageL3 = parseFloat((231 + variance).toFixed(2));
        const batteryCapacity = parseFloat((98 + Math.random() * 2).toFixed(2));

        // Save individual telemetry metrics
        const telemetryData = [
          { equipmentId: eq.id, metricType: 'temperature', value: temperature },
          { equipmentId: eq.id, metricType: 'humidity', value: humidity },
          { equipmentId: eq.id, metricType: 'load', value: load },
          { equipmentId: eq.id, metricType: 'powerDraw', value: powerDraw },
        ];

        if (eq.type === 'UPS' || eq.type === 'ATS') {
          telemetryData.push(
            { equipmentId: eq.id, metricType: 'inputVoltageL1', value: inputVoltageL1 },
            { equipmentId: eq.id, metricType: 'inputVoltageL2', value: inputVoltageL2 },
            { equipmentId: eq.id, metricType: 'inputVoltageL3', value: inputVoltageL3 }
          );
        }

        if (eq.type === 'UPS' || eq.type === 'Battery') {
          telemetryData.push({ equipmentId: eq.id, metricType: 'batteryCapacity', value: batteryCapacity });
        }

        await prisma.telemetry.createMany({ data: telemetryData });

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
            inputVoltageL1,
            inputVoltageL2,
            inputVoltageL3,
            batteryCapacity,
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
