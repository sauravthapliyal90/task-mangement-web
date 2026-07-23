import Task from "./task.model.js";
import User from "../users/user.model.js";
import ApiError from "../../utils/ApiError.js";

// Builds the base visibility filter for a requester according to RBAC:
// - admin: everything
// - manager: tasks they created, tasks assigned within their team, or
//   tasks belonging to their team
// - user: only tasks they created or that are assigned to them
function scopeFilterFor(user) {
  if (user.roles.includes('admin')) return {};
  if (user.roles.includes('manager')) {
    return { $or: [{ team: user._id }, { createdBy: user._id }, { assignedTo: user._id }] };
  }
  return { $or: [{ createdBy: user._id }, { assignedTo: user._id }] };
}

async function createTask(payload, requester) {
  const task = await Task.create({
    ...payload,
    createdBy: requester._id,
    // A manager's tasks are scoped to their own team by default;
    // a plain user's tasks have no team (personal tasks).
    team: requester.roles.includes('manager') ? requester._id : payload.team || null,
  });
  return task;
}

async function listTasks(query, requester) {
  const {
    status,
    priority,
    search,
    dueBefore,
    dueAfter,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = query;

  const filter = { ...scopeFilterFor(requester) };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (dueBefore || dueAfter) {
    filter.dueDate = {};
    if (dueBefore) filter.dueDate.$lte = new Date(dueBefore);
    if (dueAfter) filter.dueDate.$gte = new Date(dueAfter);
  }
  if (search) {
    // Uses the text index defined on the Task model for efficient search
    // across title + description, per the "Search and Filtering" bonus spec.
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', 'username email')
      .populate('createdBy', 'username email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Task.countDocuments(filter),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}

async function getTaskById(id, requester) {
  const task = await Task.findOne({ _id: id, ...scopeFilterFor(requester) })
    .populate('assignedTo', 'username email')
    .populate('createdBy', 'username email');
  if (!task) throw ApiError.notFound('Task not found');
  return task;
}

async function updateTask(id, updates, requester) {
  const task = await Task.findOne({ _id: id, ...scopeFilterFor(requester) });
  if (!task) throw ApiError.notFound('Task not found');

  // Plain users may only edit tasks they own or are assigned to, and may
  // not change ownership fields.
  if (!requester.roles.includes('admin') && !requester.roles.includes('manager')) {
    delete updates.assignedTo;
    delete updates.team;
  }

  Object.assign(task, updates);
  await task.save();
  return task;
}

async function deleteTask(id, requester) {
  const task = await Task.findOne({ _id: id, ...scopeFilterFor(requester) });
  if (!task) throw ApiError.notFound('Task not found');

  // Only the creator, their manager, or an admin can delete - not just
  // anyone the task happens to be assigned to.
  const canDelete =
    requester.roles.includes('admin') ||
    requester.roles.includes('manager') ||
    task.createdBy.toString() === requester._id.toString();
  if (!canDelete) throw ApiError.forbidden('You cannot delete this task');

  await task.deleteOne();
}

async function assignTask(id, assignedTo, requester) {
  const task = await Task.findOne({ _id: id, ...scopeFilterFor(requester) });
  if (!task) throw ApiError.notFound('Task not found');

  const assignee = await User.findById(assignedTo);
  if (!assignee) throw ApiError.badRequest('Assignee not found');

  // A manager may only assign tasks to members of their own team.
  if (requester.roles.includes('manager') && !requester.roles.includes('admin')) {
    const isOwnTeamMember =
      assignee.team?.toString() === requester._id.toString() ||
      assignee._id.toString() === requester._id.toString();
    if (!isOwnTeamMember) {
      throw ApiError.forbidden('You can only assign tasks to your own team members');
    }
  }

  task.assignedTo = assignee._id;
  await task.save();
  return task;
}

async function getAssignedTasks(requester, query) {
  const { page = 1, limit = 20 } = query;
  // Strictly "assigned to me", still bounded by the requester's RBAC scope.
  const filter = { ...scopeFilterFor(requester), assignedTo: requester._id };
  const [items, total] = await Promise.all([
    Task.find(filter)
      .populate('createdBy', 'username email')
      .sort({ dueDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Task.countDocuments(filter),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
}

// Bonus: Analytics - counts by status/overdue, scoped to what the
// requester is allowed to see (admin: all, manager: team, user: own).
async function getAnalytics(requester) {
  const filter = scopeFilterFor(requester);
  const now = new Date();

  const [completed, pending, inProgress, overdue, byUser] = await Promise.all([
    Task.countDocuments({ ...filter, status: 'completed' }),
    Task.countDocuments({ ...filter, status: 'pending' }),
    Task.countDocuments({ ...filter, status: 'in-progress' }),
    Task.countDocuments({ ...filter, status: { $ne: 'completed' }, dueDate: { $lt: now } }),
    Task.aggregate([
      { $match: filter },
      { $group: { _id: '$assignedTo', total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
      { $sort: { total: -1 } },
      { $limit: 20 },
    ]),
  ]);

  return { completed, pending, inProgress, overdue, byUser };
}

export default {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  getAssignedTasks,
  getAnalytics,
};
