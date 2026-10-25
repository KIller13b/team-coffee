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

    // 3. Start Express HTTP Server
    const server = app.listen(env.PORT, env.HOST, () => {
      console.log(`[Express] Server running on http://${env.HOST}:${env.PORT}`);
      console.log(`[Express] Health check: http://${env.HOST}:${env.PORT}/health`);
      console.log(`[Express] API Base: http://${env.HOST}:${env.PORT}/api`);
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

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err: any) {
    console.error('[Bootstrap] Fatal startup error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  bootstrap();
}
