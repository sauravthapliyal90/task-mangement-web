import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import tokenBlacklist from "../utils/tokenBlacklist.js";
import User from "../modules/users/user.model.js";

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication token missing');
  }

  const token = header.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, env.jwt.secret);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  if (tokenBlacklist.isBlacklisted(payload.jti)) {
    throw ApiError.unauthorized('Token has been revoked, please log in again');
  }

  const user = await User.findById(payload.sub).select('-password');
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User no longer exists or is deactivated');
  }

  req.user = user;
  req.tokenPayload = payload;
  next();
});

export default authenticate;
