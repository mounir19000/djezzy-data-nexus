import express, { Request, Response } from 'express';
import {
  pauseTelemetrySimulation,
  resumeTelemetrySimulation,
  resetTelemetrySimulation,
  getTelemetrySimulationStatus
} from '../services/telemetrySimulator';

const router = express.Router();

router.get('/status', (req: Request, res: Response) => {
  try {
    const status = getTelemetrySimulationStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting simulation status:', error);
    res.status(500).json({ error: 'Failed to get simulation status' });
  }
});

router.post('/pause', (req: Request, res: Response) => {
  try {
    pauseTelemetrySimulation();
    const status = getTelemetrySimulationStatus();
    res.json({ message: 'Simulation paused', status });
  } catch (error) {
    console.error('Error pausing simulation:', error);
    res.status(500).json({ error: 'Failed to pause simulation' });
  }
});

router.post('/resume', (req: Request, res: Response) => {
  try {
    resumeTelemetrySimulation();
    const status = getTelemetrySimulationStatus();
    res.json({ message: 'Simulation resumed', status });
  } catch (error) {
    console.error('Error resuming simulation:', error);
    res.status(500).json({ error: 'Failed to resume simulation' });
  }
});

router.post('/reset', (req: Request, res: Response) => {
  try {
    resetTelemetrySimulation();
    const status = getTelemetrySimulationStatus();
    res.json({ message: 'Simulation reset', status });
  } catch (error) {
    console.error('Error resetting simulation:', error);
    res.status(500).json({ error: 'Failed to reset simulation' });
  }
});

export default router;
