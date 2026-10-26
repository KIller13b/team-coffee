import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { authRouter } from './routes/auth.router';
import { contractsRouter } from './routes/contracts.router';
import { risksRouter } from './routes/risks.router';
import { agentsRouter } from './routes/agents.router';
import { timelineRouter } from './routes/timeline.router';
import { simulationRouter } from './routes/simulation.router';
import { assistantRouter } from './routes/assistant.router';

export const app = express();

// CORS configuration: strictly allow approved origins and localhost dev ports
const origins = env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const isAllowedOrigin = origins.includes(origin);
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isAllowedOrigin || isLocalhost) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy violation: Origin '${origin}' is not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Root health & metadata endpoints (public)
app.get('/', (req, res) => {
  res.json({
    system: 'Odin Multi-Agent Contract Intelligence',
    status: 'online',
    version: '1.0.0',
    runtime: 'Node.js/Express + MongoDB (MERN)',
    agents: ['Odin', 'Thor', 'Norns', 'Loki', 'Heimdall', 'Tyr'],
    security: {
      auth: 'JWT / Role-Based Access Control',
      cors: 'Restricted Allowlist',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Authentication routes
app.use('/api/auth', authRouter);

// Apply auth middleware to all remaining /api routes
app.use('/api', authMiddleware);

// Mount core business routers
app.use('/api/contracts', contractsRouter);
app.use('/api/risks', risksRouter);
app.use('/api', agentsRouter);
app.use('/api', timelineRouter);
app.use('/api/simulation', simulationRouter);
app.use('/api/assistant', assistantRouter);

// Centralized error handling
app.use(errorHandler);
