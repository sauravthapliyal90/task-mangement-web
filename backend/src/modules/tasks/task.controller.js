import taskService from "./task.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { getIO } from "../../realtime.js";

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body, req.user);
  getIO()?.emit('task:created', task);
  new ApiResponse(201, { task }, 'Task created').send(res);
});

const listTasks = asyncHandler(async (req, res) => {
  const result = await taskService.listTasks(req.query, req.user);
  new ApiResponse(200, result.items, 'Tasks retrieved', {
    total: result.total,
    page: result.page,
    limit: result.limit,
  }).send(res);
});

const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user);
  new ApiResponse(200, { task }, 'Task retrieved').send(res);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user);
  getIO()?.emit('task:updated', task);
  new ApiResponse(200, { task }, 'Task updated').send(res);
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id, req.user);
  getIO()?.emit('task:deleted', { id: req.params.id });
  new ApiResponse(200, null, 'Task deleted').send(res);
});

const assignTask = asyncHandler(async (req, res) => {
  const task = await taskService.assignTask(req.params.id, req.body.assignedTo, req.user);
  getIO()?.emit('task:assigned', task);
  new ApiResponse(200, { task }, 'Task assigned').send(res);
});

const myAssignedTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getAssignedTasks(req.user, req.query);
  new ApiResponse(200, result.items, 'Assigned tasks retrieved', {
    total: result.total,
    page: result.page,
    limit: result.limit,
  }).send(res);
});

const analytics = asyncHandler(async (req, res) => {
  const stats = await taskService.getAnalytics(req.user);
  new ApiResponse(200, stats, 'Analytics retrieved').send(res);
});

export default {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
  assignTask,
  myAssignedTasks,
  analytics,
};
