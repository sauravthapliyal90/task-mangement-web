import User from "./user.model.js";
import ApiError from "../../utils/ApiError.js";

async function listUsers({ page = 1, limit = 20, team, role, requester }) {
  const filter = {};

  // Managers only ever see their own team; only admins can see everyone
  // or filter arbitrarily. This is RBAC enforced at the data-access layer,
  // not just the route layer, so a manager can never widen the query.
  if (requester.roles.includes('admin')) {
    if (team) filter.team = team;
    if (role) filter.roles = role;
  } else {
    filter.$or = [{ team: requester._id }, { _id: requester._id }];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}

async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

async function updateUser(id, updates, requester) {
  // Only admins may change roles or reassign a user to a different team.
  if (!requester.roles.includes('admin')) {
    delete updates.roles;
    delete updates.team;
    delete updates.isActive;
  }
  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

async function deleteUser(id) {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export default { listUsers, getUserById, updateUser, deleteUser };
