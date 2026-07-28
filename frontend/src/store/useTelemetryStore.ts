import { create } from 'zustand';

interface TelemetryMetrics {
  temperature: number;
  humidity: number;
  load: number;
  powerDraw: number;
  status: string;
}

interface TelemetryUpdate {
  equipmentId: string;
  equipmentName: string;
  siteId: string;
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
