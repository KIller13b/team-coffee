import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { contractsRouter } from './routes/contracts.router';
import { risksRouter } from './routes/risks.router';
import { agentsRouter } from './routes/agents.router';
import { timelineRouter } from './routes/timeline.router';
import { simulationRouter } from './routes/simulation.router';
import { assistantRouter } from './routes/assistant.router';

export const app = express();

// CORS configuration supporting localhost / 127.0.0.1 on all dev ports (5173, 5174, etc.)
const origins = env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowedOrigin = origins.includes(origin);
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isAllowedOrigin || isLocalhost) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all dev requests gracefully
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*'],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root health & metadata endpoints (preserving FastAPI structure)
app.get('/', (req, res) => {
  res.json({
    system: 'Odin Multi-Agent Contract Intelligence',
    status: 'online',
    version: '1.0.0',
    runtime: 'Node.js/Express + MongoDB (MERN)',
    agents: ['Odin', 'Thor', 'Norns', 'Loki', 'Heimdall', 'Tyr'],
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Mount API routes under /api
app.use('/api/contracts', contractsRouter);
app.use('/api/risks', risksRouter);
app.use('/api', agentsRouter);
app.use('/api', timelineRouter);
app.use('/api/simulation', simulationRouter);
app.use('/api/assistant', assistantRouter);

// Centralized error handling
app.use(errorHandler);
