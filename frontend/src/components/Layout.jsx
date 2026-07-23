import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { getSocket } from '../lib/socket';

function RealtimePulse() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    setConnected(socket.connected);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
      <span className="relative flex h-2 w-2">
        {connected && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            connected ? 'bg-signal-400' : 'bg-slate-600'
          }`}
        />
      </span>
      {connected ? 'live' : 'offline'}
    </div>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-ink-800 bg-ink-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-500/15 font-display text-sm font-bold text-signal-400">
              TM
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-slate-100 leading-none">
                Task Manager
              </p>
              <RealtimePulse />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-100">{user?.username}</p>
              <p className="font-mono text-xs text-slate-500">{user?.roles?.join(', ')}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-ink-600 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-coral-500/50 hover:text-coral-400"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
