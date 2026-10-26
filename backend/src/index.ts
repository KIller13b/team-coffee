import { app } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { warRoomState } from './services/warRoomState';

async function bootstrap() {
  try {
    console.log('[Bootstrap] Starting Odin Multi-Agent Contract Intelligence Backend (MERN)...');
    
    // 1. Connect to MongoDB (with auto in-memory fallback)
    await connectDatabase();

    // 2. Initialize War Room State & Pipeline
    await warRoomState.initialize();

    // 3. Start Express HTTP Server with automatic EADDRINUSE retry
    const startServer = (retries = 5, delay = 600) => {
      const server = app.listen(env.PORT, env.HOST, () => {
        console.log(`[Express] Server running on http://${env.HOST}:${env.PORT}`);
        console.log(`[Express] Health check: http://${env.HOST}:${env.PORT}/health`);
        console.log(`[Express] API Base: http://${env.HOST}:${env.PORT}/api`);
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE' && retries > 0) {
          console.warn(`[Express] Port ${env.PORT} is temporarily busy. Retrying in ${delay}ms... (${retries} retries left)`);
          setTimeout(() => {
            try {
              server.close();
            } catch {}
            startServer(retries - 1, delay);
          }, delay);
        } else {
          console.error('[Express] Server listener error:', err.message);
          process.exit(1);
        }
      });

      // Graceful shutdown
      const shutdown = async (signal: string) => {
        console.log(`\n[Shutdown] Received ${signal}. Closing server and disconnecting database...`);
        server.close(async () => {
          await disconnectDatabase();
          console.log('[Shutdown] Graceful shutdown completed.');
          process.exit(0);
        });
      };

      process.once('SIGINT', () => shutdown('SIGINT'));
      process.once('SIGTERM', () => shutdown('SIGTERM'));
    };

    startServer();
  } catch (err: any) {
    console.error('[Bootstrap] Fatal startup error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  bootstrap();
}
