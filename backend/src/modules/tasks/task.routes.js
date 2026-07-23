import express from "express";
import controller from "./task.controller.js";
import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  listTasksQuerySchema,
} from "./task.validation.js";
import validate from "../../middlewares/validate.middleware.js";
import authenticate from "../../middlewares/auth.middleware.js";
import authorize from "../../middlewares/rbac.middleware.js";

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               dueDate: { type: string, format: date-time }
 *               priority: { type: string, enum: [low, medium, high] }
 *               status: { type: string, enum: [pending, in-progress, completed] }
 *               assignedTo: { type: string, description: User id }
 *     responses:
 *       201: { description: Task created }
 *   get:
 *     summary: List tasks with filtering, search, sorting and pagination
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, in-progress, completed] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Full-text search across title/description
 *       - in: query
 *         name: dueBefore
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dueAfter
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: createdAt }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Paginated list of tasks visible to the requester }
 */
router.post('/', validate(createTaskSchema), controller.createTask);
router.get('/', validate(listTasksQuerySchema, 'query'), controller.listTasks);

/**
 * @openapi
 * /tasks/assigned/me:
 *   get:
 *     summary: List tasks assigned to the current user
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Tasks assigned to the requester }
 */
router.get('/assigned/me', controller.myAssignedTasks);

/**
 * @openapi
 * /tasks/analytics:
 *   get:
 *     summary: Task completion/pending/overdue statistics (bonus)
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Aggregated statistics scoped to the requester's visibility }
 */
router.get('/analytics', controller.analytics);

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by id
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task found }
 *       404: { description: Task not found }
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Task updated }
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Task deleted }
 */
router.get('/:id', controller.getTask);
router.put('/:id', validate(updateTaskSchema), controller.updateTask);
router.delete('/:id', controller.deleteTask);

/**
 * @openapi
 * /tasks/{id}/assign:
 *   patch:
 *     summary: Assign a task to a user (managers limited to their own team)
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignedTo]
 *             properties:
 *               assignedTo: { type: string }
 *     responses:
 *       200: { description: Task assigned }
 */
router.patch(
  '/:id/assign',
  authorize('admin', 'manager'),
  validate(assignTaskSchema),
  controller.assignTask
);

export default router;
