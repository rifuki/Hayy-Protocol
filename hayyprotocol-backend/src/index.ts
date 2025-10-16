import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { config } from './config.js';
import { setupRelayer } from './relayer.js';
import { setupAPIRoutes } from './routes/api.js';
import pino from 'pino';

const logger = pino({ level: config.LOG_LEVEL });

const app = new Hono();

// Enable CORS
app.use('/*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081', 'https://hayyprotocol.vercel.app'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Setup API routes
setupAPIRoutes(app);

// Start relayer in background
const relayerCleanup = setupRelayer();

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  relayerCleanup();
  process.exit(0);
});



process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully...');
  relayerCleanup();
  process.exit(0);
});

const port = config.PORT || 3001;

logger.info(`🚀 HayyProtocol API Server starting on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port: port,
}, (info) => {
  logger.info(`✅ HayyProtocol API Server running on http://localhost:${info.port}`);
});
