import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./config/env.js";
import logger from "./utils/logger.js";

let io = null;

// Bonus feature: real-time task notifications via Socket.io.
// Clients connect with `auth: { token: <JWT> }` and are placed into a
// room per user id, so task events can be targeted (e.g. only notify
// the assignee) instead of broadcasting everything to everyone -
// this is what keeps it viable at scale with many concurrent clients.
function initRealtime(server) {
  io = new Server(server, {
    cors: { origin: env.clientOrigin },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const payload = jwt.verify(token, env.jwt.secret);
      socket.userId = payload.sub;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    logger.debug(`Socket connected for user ${socket.userId}`);

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected for user ${socket.userId}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

export { initRealtime, getIO };
