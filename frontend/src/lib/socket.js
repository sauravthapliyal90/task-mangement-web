import { io } from 'socket.io-client';

let socket = null;

// One connection per session, authenticated with the same JWT used for
// REST calls (matches backend/src/realtime.js's `auth: { token }` check).
// Same-origin path so it works through the Vite dev proxy and in prod.
export function connectSocket(token) {
  if (socket) return socket;
  socket = io({
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket() {
  return socket;
}
