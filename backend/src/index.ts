import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import notificationRoutes from './routes/notifications';
import incidentsRoutes from './routes/incidents';
import ticketsRoutes from './routes/tickets';
import maintenanceRoutes from './routes/maintenance';
import knowledgeRoutes from './routes/knowledge';
import settingsRoutes from './routes/settings';
import dashboardRoutes from './routes/dashboard';
import sitesRoutes from './routes/sites';
import usersRoutes from './routes/users';
import simulationRoutes from './routes/simulation';
import { startTelemetrySimulation } from './services/telemetrySimulator';
import { startMaintenanceCron } from './services/maintenanceCron';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || '0.0.0.0';
const configuredFrontendOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isLocalNetworkOrigin = (origin: string) => {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    );
  } catch {
    return false;
  }
};

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (configuredFrontendOrigins.length > 0) {
      callback(null, configuredFrontendOrigins.includes(origin));
      return;
    }

    callback(null, isLocalNetworkOrigin(origin));
  },
  credentials: true,
};

const io = new Server(httpServer, {
  cors: {
    origin: configuredFrontendOrigins.length > 0 ? configuredFrontendOrigins : true,
  }
});
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/simulation', simulationRoutes);
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', message: 'Djezzy SSOP API is running' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

startTelemetrySimulation(io);
startMaintenanceCron();

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
