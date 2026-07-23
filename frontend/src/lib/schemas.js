import { z } from 'zod';

// Mirrors backend/src/modules/auth/auth.validation.js so the form
// rejects bad input before it ever hits the network.
export const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Needs an uppercase letter')
  .regex(/[a-z]/, 'Needs a lowercase letter')
  .regex(/\d/, 'Needs a number')
  .regex(/[^A-Za-z0-9]/, 'Needs a special character');

export const registerSchema = z.object({
  username: z.string().trim().min(3, '3-30 characters').max(30, '3-30 characters'),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: passwordSchema,
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Mirrors backend/src/modules/tasks/task.validation.js
export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
});

export const assignTaskSchema = z.object({
  assignedTo: z.string().min(1, 'Choose a team member'),
});
