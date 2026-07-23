import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { useAuth } from '../hooks/useAuth.jsx';
import { useUpdateTask, useDeleteTask, useAssignTask, useTeamOptions } from '../hooks/useTasks.js';

const PRIORITY_RAIL = {
  low: 'border-l-slate-500',
  medium: 'border-l-amber-500',
  high: 'border-l-coral-500',
};

const STATUS_STYLE = {
  pending: 'bg-slate-500/15 text-slate-300',
  'in-progress': 'bg-amber-500/15 text-amber-400',
  completed: 'bg-signal-500/15 text-signal-400',
};

const NEXT_STATUS = {
  pending: 'in-progress',
  'in-progress': 'completed',
  completed: 'pending',
};

const columnHelper = createColumnHelper();

export default function TaskTable({
  tasks,
  isLoading,
  onEdit,
}) {
  const { user } = useAuth();
  const canManage = user?.roles?.some((r) => r === 'admin' || r === 'manager');
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const assignTask = useAssignTask();
  const { data: teamData } = useTeamOptions(canManage);
  const [assigningId, setAssigningId] = useState(null);

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Task',
        cell: (info) => (
          <div>
            <p className="font-medium text-slate-100">{info.getValue()}</p>
            {info.row.original.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                {info.row.original.description}
              </p>
            )}
          </div>
        ),
      }),
      columnHelper.accessor('priority', {
        header: 'Priority',
        cell: (info) => <span className="text-xs capitalize text-slate-300">{info.getValue()}</span>,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const row = info.row.original;
          return (
            <button
              onClick={() => updateTask.mutate({ id: row._id, status: NEXT_STATUS[row.status] })}
              className={`rounded-full px-2.5 py-1 font-mono text-xs capitalize transition hover:opacity-80 ${STATUS_STYLE[info.getValue()]}`}
              title="Click to advance status"
            >
              {info.getValue()}
            </button>
          );
        },
      }),
      columnHelper.accessor('dueDate', {
        header: 'Due',
        cell: (info) => (
          <span className="font-mono text-xs text-slate-400">
            {info.getValue() ? new Date(info.getValue()).toLocaleDateString() : '—'}
          </span>
        ),
      }),
      columnHelper.accessor('assignedTo', {
        header: 'Assignee',
        cell: (info) => {
          const row = info.row.original;
          const assignee = info.getValue();
          if (!canManage) {
            return <span className="text-xs text-slate-400">{assignee?.username || 'Unassigned'}</span>;
          }
          if (assigningId === row._id) {
            const options = teamData?.data ?? [];
            return (
              <select
                autoFocus
                defaultValue={assignee?._id || ''}
                onChange={(e) => {
                  if (e.target.value) assignTask.mutate({ id: row._id, assignedTo: e.target.value });
                  setAssigningId(null);
                }}
                onBlur={() => setAssigningId(null)}
                className="rounded-lg border border-ink-600 bg-ink-800 px-2 py-1 text-xs text-slate-200"
              >
                <option value="">Unassigned</option>
                {options.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.username}
                  </option>
                ))}
              </select>
            );
          }
          return (
            <button
              onClick={() => setAssigningId(row._id)}
              className="text-xs text-slate-400 underline decoration-dotted hover:text-signal-400"
            >
              {assignee?.username || 'Assign…'}
            </button>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => (
          <div className="flex gap-2">

            {canManage && (
              <button
                onClick={() => {
                  console.log("Edit clicked");
                  console.log(info.row.original);
                  onEdit(info.row.original);
                }}
                className="text-xs text-signal-400 hover:underline"
              >
                Edit
              </button>
            )}

            {canManage && (
              <button
                onClick={() => {
                  if (confirm("Delete this task?")) {
                    deleteTask.mutate(info.row.original._id);
                  }
                }}
                className="text-xs text-coral-400 hover:underline"
              >
                Delete
              </button>
            )}

          </div>
        ),
      }),
    ],
    [canManage, assigningId, teamData, updateTask, assignTask, deleteTask]
  );

  const table = useReactTable({ data: tasks, columns, getCoreRowModel: getCoreRowModel() });

  if (isLoading) {
    return <p className="py-8 text-center font-mono text-sm text-slate-500">loading tasks…</p>;
  }

  if (!tasks.length) {
    return (
      <div className="rounded-xl border border-dashed border-ink-700 py-10 text-center">
        <p className="text-sm text-slate-500">No tasks match these filters yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto  rounded-xl border border-ink-700">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink-700 bg-ink-900/80">
            {table.getHeaderGroups()[0].headers.map((header) => (
              <th
                key={header.id}
                className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={`border-b border-ink-800 border-l-2 bg-ink-900/40 last:border-b-0 ${PRIORITY_RAIL[row.original.priority] || 'border-l-transparent'
                }`}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 align-top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
