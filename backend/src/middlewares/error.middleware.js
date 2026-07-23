import logger from "../utils/logger.js";
import { env } from "../config/env.js";

function notFoundHandler(req, res, next) {
  const ApiError = require('../utils/ApiError');
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let { statusCode, message, details } = err;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => e.message);
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field} already exists`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  statusCode = statusCode || 500;
  if (statusCode >= 500) {
    logger.error(err.stack || err.message);
  }

  res.status(statusCode).json({
    success: false,
    message: message || 'Internal server error',
    details: details || undefined,
    stack: env.nodeEnv === 'development' && statusCode >= 500 ? err.stack : undefined,
  });
}

export { notFoundHandler, errorHandler };
