import React, { useState } from 'react';
import { useTasks, useRealtimeTasks } from '../hooks/useTasks.js';
import AnalyticsStrip from '../components/AnalyticsStrip.jsx';
import FilterBar from '../components/FilterBar.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskTable from '../components/TaskTable.jsx';

export default function DashboardPage() {

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const { data, isLoading } = useTasks(filters);
  useRealtimeTasks();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-xl font-semibold text-slate-50">Tasks</h1>
        <p className="text-sm text-slate-500">Everything you can see, filtered and live-synced.</p>
      </div>
      <AnalyticsStrip />
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-lg bg-signal-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-signal-400"
        >
          + New Task
        </button>
      </div>

      <TaskForm
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <FilterBar filters={filters} onChange={setFilters} />
      <TaskTable tasks={data?.data ?? []} isLoading={isLoading} />
    </div>
  );
}
