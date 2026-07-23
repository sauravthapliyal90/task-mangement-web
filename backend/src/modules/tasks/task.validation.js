import { z } from "zod";
import { PRIORITIES, STATUSES } from "./task.model.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'must be a valid id');

const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.coerce.date({ invalid_type_error: 'dueDate must be a valid date' }).optional(),
  priority: z.enum(PRIORITIES).optional(),
  status: z.enum(STATUSES).optional(),
  assignedTo: objectId.optional(),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  dueDate: z.coerce.date().optional(),
  priority: z.enum(PRIORITIES).optional(),
  status: z.enum(STATUSES).optional(),
});

const assignTaskSchema = z.object({
  assignedTo: objectId,
});

// Query params arrive as strings, so numeric fields are coerced;
// z.coerce.number handles "1" -> 1 the same way express-validator's
// isInt used to, just with a parsed value on the other side too.
const listTasksQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  search: z.string().optional(),
  dueBefore: z.string().optional(),
  dueAfter: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  listTasksQuerySchema,
};
