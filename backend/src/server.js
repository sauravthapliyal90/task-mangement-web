import http from "http";
import { env, validateEnv } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { initRealtime } from "./realtime.js";
import logger from "./utils/logger.js";
import app from "./app.js";

validateEnv();

const server = http.createServer(app);
initRealtime(server);

async function start() {
  try {
    await connectDB();
    server.listen(env.port, () => {
      logger.info(`Server listening on port ${env.port} [${env.nodeEnv}]`);
      logger.info(`API docs available at http://localhost:${env.port}/api-docs`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

// Graceful shutdown: stop accepting new connections, let in-flight
// requests finish, then close the DB pool - important once this runs
// behind an orchestrator (PM2/Kubernetes) that sends SIGTERM on deploys.
async function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);
  server.close(async () => {
    await disconnectDB();
    logger.info('Shutdown complete');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});

start();

export default server;
