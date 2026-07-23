import React from 'react';
import { useAnalytics } from '../hooks/useTasks.js';

const STATS = [
  { key: 'pending', label: 'Pending', color: 'text-slate-200' },
  { key: 'inProgress', label: 'In progress', color: 'text-amber-400' },
  { key: 'completed', label: 'Completed', color: 'text-signal-400' },
  { key: 'overdue', label: 'Overdue', color: 'text-coral-400' },
];

export default function AnalyticsStrip() {
  const { data, isLoading } = useAnalytics();
  const stats = data?.data;

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STATS.map(({ key, label, color }) => (
        <div
          key={key}
          className="rounded-xl border border-ink-700 bg-ink-900 px-4 py-3"
        >
          <p className={`font-mono text-2xl font-semibold ${color}`}>
            {isLoading ? '—' : stats?.[key] ?? 0}
          </p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
