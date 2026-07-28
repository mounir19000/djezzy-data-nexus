import { create } from 'zustand';

interface TelemetryMetrics {
  temperature: number;
  humidity: number;
  load: number;
  outputLoadL1?: number;
  outputLoadL2?: number;
  outputLoadL3?: number;
  phaseUnbalance?: number;
  powerDraw: number;
  inputVoltageL1?: number;
  inputVoltageL2?: number;
  inputVoltageL3?: number;
  outputVoltageL1?: number;
  outputVoltageL2?: number;
  outputVoltageL3?: number;
  batteryCapacity?: number;
  status: string;
}

interface TelemetryUpdate {
  equipmentId: string;
  equipmentName: string;
  siteId: string;
  simulationTime?: string;
  metrics: TelemetryMetrics;
  timestamp: string;
}

interface TelemetryState {
  equipmentData: Record<string, TelemetryUpdate>;
  updateTelemetry: (update: TelemetryUpdate) => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  equipmentData: {},
  updateTelemetry: (update) => set((state) => ({
    equipmentData: {
      ...state.equipmentData,
      [update.equipmentId]: update
    }
  }))
}));
