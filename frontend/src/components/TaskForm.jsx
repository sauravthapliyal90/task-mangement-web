import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskFormSchema } from '../lib/schemas';
import { useCreateTask } from '../hooks/useTasks.js';
import FormField from './FormField.jsx';

export default function TaskForm() {
  const createTask = useCreateTask();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { title: '', description: '', dueDate: '', priority: 'medium' },
  });

  const onSubmit = async (values) => {
    await createTask.mutateAsync({
      ...values,
      dueDate: values.dueDate || undefined,
      description: values.description || undefined,
    });
    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-6 w-full rounded-xl border border-dashed border-ink-600 py-3 text-sm font-medium text-slate-400 transition hover:border-signal-500/50 hover:text-signal-400"
      >
        + New task
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-6 rounded-xl border border-ink-700 bg-ink-900 p-5"
      noValidate
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-slate-100">New task</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-slate-500 hover:text-slate-300"
        >
          Cancel
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField
            label="Title"
            error={errors.title?.message}
            inputProps={{ ...register('title'), placeholder: 'What needs doing?' }}
          />
        </div>
        <div className="sm:col-span-2">
          <FormField
            label="Description"
            error={errors.description?.message}
            as="textarea"
            inputProps={{ ...register('description'), rows: 2, placeholder: 'Optional details' }}
          />
        </div>
        <FormField
          label="Due date"
          error={errors.dueDate?.message}
          inputProps={{ ...register('dueDate'), type: 'date' }}
        />
        <FormField label="Priority" error={errors.priority?.message} as="select" inputProps={{ ...register('priority') }}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </FormField>
      </div>
      {createTask.isError && (
        <p className="mt-3 text-sm text-coral-400">{createTask.error.message}</p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 rounded-lg bg-signal-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-signal-400 disabled:opacity-60"
      >
        {isSubmitting ? 'Creating…' : 'Create task'}
      </button>
    </form>
  );
}
