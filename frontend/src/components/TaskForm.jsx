import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskFormSchema } from '../lib/schemas';
import { useCreateTask, useUpdateTask } from '../hooks/useTasks.js';
import FormField from './FormField.jsx';

export default function TaskForm({ open, onClose, task }) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  console.log("TaskForm task:", task);
  console.log("open:", open);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
    },
  });

  useEffect(() => {
    if (!open) return;

    if (task) {
      reset({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : '',
        priority: task.priority || 'medium',
      });
    } else {
      reset({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
      });
    }
  }, [task, open, reset]);

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      description: values.description || undefined,
      dueDate: values.dueDate || undefined,
    };

    try {
      if (task) {
        await updateTask.mutateAsync({
          id: task._id,
          ...payload,
        });
      } else {
        await createTask.mutateAsync(payload);
      }

      reset();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-ink-700 bg-ink-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl"
          noValidate
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-slate-100">
              {task ? 'Edit Task' : 'New Task'}
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="text-sm text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField
                label="Title"
                error={errors.title?.message}
                inputProps={{
                  ...register('title'),
                  placeholder: 'What needs doing?',
                }}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                label="Description"
                as="textarea"
                error={errors.description?.message}
                inputProps={{
                  ...register('description'),
                  rows: 3,
                  placeholder: 'Optional details',
                }}
              />
            </div>

            <FormField
              label="Due Date"
              error={errors.dueDate?.message}
              inputProps={{
                ...register('dueDate'),
                type: 'date',
              }}
            />

            <FormField
              label="Priority"
              as="select"
              error={errors.priority?.message}
              inputProps={{
                ...register('priority'),
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </FormField>
          </div>

          {(createTask.isError || updateTask.isError) && (
            <p className="mt-3 text-sm text-red-400">
              {createTask.error?.message ||
                updateTask.error?.message ||
                'Something went wrong'}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-ink-600 px-4 py-2 text-sm text-slate-300 hover:bg-ink-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-signal-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-signal-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? task
                  ? 'Updating...'
                  : 'Creating...'
                : task
                  ? 'Update Task'
                  : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}