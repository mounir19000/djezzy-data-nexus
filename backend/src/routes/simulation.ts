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
    res.status(500).json({ error: 'Échec du chargement du statut de simulation' });
  }
});

router.post('/pause', (req: Request, res: Response) => {
  try {
    pauseTelemetrySimulation();
    const status = getTelemetrySimulationStatus();
    res.json({ message: 'Simulation en pause', status });
  } catch (error) {
    console.error('Error pausing simulation:', error);
    res.status(500).json({ error: 'Échec de la mise en pause de la simulation' });
  }
});

router.post('/resume', (req: Request, res: Response) => {
  try {
    resumeTelemetrySimulation();
    const status = getTelemetrySimulationStatus();
    res.json({ message: 'Simulation reprise', status });
  } catch (error) {
    console.error('Error resuming simulation:', error);
    res.status(500).json({ error: 'Échec de la reprise de la simulation' });
  }
});

router.post('/reset', (req: Request, res: Response) => {
  try {
    resetTelemetrySimulation();
    const status = getTelemetrySimulationStatus();
    res.json({ message: 'Simulation réinitialisée', status });
  } catch (error) {
    console.error('Error resetting simulation:', error);
    res.status(500).json({ error: 'Échec de la réinitialisation de la simulation' });
  }
});

export default router;
