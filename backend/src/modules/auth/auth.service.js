import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../users/user.model.js";
import ApiError from "../../utils/ApiError.js";
import tokenBlacklist from "../../utils/tokenBlacklist.js";
import { env } from "../../config/env.js";

function signToken(user) {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { sub: user._id.toString(), roles: user.roles, jti },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
  return { token, jti };
}

async function register({ username, email, password }) {
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw ApiError.conflict('Username or email is already registered');
  }

  const user = await User.create({ username, email, password });

  // Optional per the assignment: sending a real confirmation email
  // requires an SMTP/provider integration (e.g. SendGrid, SES). That's
  // out of scope for this environment, so we log intent instead - the
  // hook is here (sendConfirmationEmail) so it's a one-function swap
  // to wire up a real provider later.
  // eslint-disable-next-line no-console
  console.log(`[email] Would send confirmation email to ${user.email}`);

  return user;
}

async function login({ identifier, password }) {
  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
  }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid credentials');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated');
  }

  const { token } = signToken(user);
  return { user, token };
}

async function logout(tokenPayload) {
  const expiresAtMs = tokenPayload.exp * 1000;
  tokenBlacklist.add(tokenPayload.jti, expiresAtMs);
}

export default { register, login, logout };
