import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { getSocket } from '../lib/socket';

export function useTasks(filters) {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v)); //convering object into array and filtering out falsy values and converting back to object
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: async () => client.get('/tasks', { params }),
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => client.get('/tasks/analytics'),
  });
}

export function useTeamOptions(enabled) {
  return useQuery({
    queryKey: ['users', 'team-options'],
    queryFn: async () => client.get('/users'),
    enabled,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => client.post('/tasks', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => client.put(`/tasks/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => client.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useAssignTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assignedTo }) => client.patch(`/tasks/${id}/assign`, { assignedTo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Subscribes to the backend's Socket.io task events (see
// backend/src/realtime.js + task.controller.js) and invalidates the
// relevant queries so every open tab reflects changes without polling.
export function useRealtimeTasks() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    };
    socket.on('task:created', invalidate);
    socket.on('task:updated', invalidate);
    socket.on('task:deleted', invalidate);
    socket.on('task:assigned', invalidate);
    return () => {
      socket.off('task:created', invalidate);
      socket.off('task:updated', invalidate);
      socket.off('task:deleted', invalidate);
      socket.off('task:assigned', invalidate);
    };
  }, [queryClient]);
}
