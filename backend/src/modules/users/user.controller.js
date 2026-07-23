import userService from "./user.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, team, role } = req.query;
  const result = await userService.listUsers({ page, limit, team, role, requester: req.user });
  new ApiResponse(200, result.items, 'Users retrieved', {
    total: result.total,
    page: result.page,
    limit: result.limit,
  }).send(res);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  new ApiResponse(200, { user }, 'User retrieved').send(res);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user);
  new ApiResponse(200, { user }, 'User updated').send(res);
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  new ApiResponse(200, null, 'User deleted').send(res);
});

export default { listUsers, getUser, updateUser, deleteUser };
