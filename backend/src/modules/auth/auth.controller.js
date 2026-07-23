import authService from "./auth.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  new ApiResponse(201, { user }, 'User registered successfully').send(res);
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  new ApiResponse(200, { user, token }, 'Login successful').send(res);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.tokenPayload);
  new ApiResponse(200, null, 'Logged out successfully').send(res);
});

const me = asyncHandler(async (req, res) => {
  new ApiResponse(200, { user: req.user }, 'Profile retrieved').send(res);
});

export default { register, login, logout, me };
