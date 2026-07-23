import React, { useState } from 'react';
import { useTasks, useRealtimeTasks } from '../hooks/useTasks.js';
import AnalyticsStrip from '../components/AnalyticsStrip.jsx';
import FilterBar from '../components/FilterBar.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskTable from '../components/TaskTable.jsx';

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  const [editingTask, setEditingTask] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading } = useTasks(filters);

  useRealtimeTasks();

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsCreateOpen(true);
  };

  const handleEditTask = (task) => {
    console.log('Dashboard received', task);

    setEditingTask(task);
    setIsCreateOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setIsCreateOpen(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-xl font-semibold text-slate-50">
          Tasks
        </h1>
        <p className="text-sm text-slate-500">
          Everything you can see, filtered and live-synced.
        </p>
      </div>

      <AnalyticsStrip />

      <div className="mb-6 flex justify-end">
        <button
          onClick={handleCreateTask}
          className="rounded-lg bg-signal-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-signal-400"
        >
          + New Task
        </button>
      </div>

      <TaskForm
        open={isCreateOpen}
        onClose={handleCloseModal}
        task={editingTask}
      />

      <FilterBar
        filters={filters}
        onChange={setFilters}
      />

      <TaskTable
        tasks={data?.data ?? []}
        isLoading={isLoading}
        onEdit={handleEditTask}
      />
    </div>
  );
}