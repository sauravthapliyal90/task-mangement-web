import React, { useState } from 'react';

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITIES = [
  { value: '', label: 'All priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function FilterBar({ filters, onChange }) {
  const [search, setSearch] = useState(filters.search || '');

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-slate-200"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className="rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-slate-200"
      >
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onChange({ ...filters, search });
        }}
        className="flex flex-1 min-w-[200px] gap-2"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or description…"
          className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="whitespace-nowrap rounded-lg border border-ink-600 px-3 py-2 text-sm text-slate-300 transition hover:border-signal-500/50 hover:text-signal-400"
        >
          Search
        </button>
      </form>
    </div>
  );
}
