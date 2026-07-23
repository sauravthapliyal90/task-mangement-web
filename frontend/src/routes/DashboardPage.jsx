import React, { useState } from 'react';
import { useTasks, useRealtimeTasks } from '../hooks/useTasks.js';
import AnalyticsStrip from '../components/AnalyticsStrip.jsx';
import FilterBar from '../components/FilterBar.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskTable from '../components/TaskTable.jsx';

export default function DashboardPage() {
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
      <TaskForm />
      <FilterBar filters={filters} onChange={setFilters} />
      <TaskTable tasks={data?.data ?? []} isLoading={isLoading} />
    </div>
  );
}
