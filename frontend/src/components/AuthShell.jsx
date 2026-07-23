import React from 'react';

export default function AuthShell({ eyebrow, title, subtitle, footer, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-500">{eyebrow}</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-slate-50">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-xl shadow-black/20">
          {children}
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
      </div>
    </div>
  );
}
