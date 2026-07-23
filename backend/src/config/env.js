import dotenv from "dotenv";

dotenv.config();

// Centralizing env access means the rest of the app never touches
// process.env directly -> easier to validate, mock in tests, and
// swap config sources (e.g. AWS Secrets Manager) later without
// touching business logic.
const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URI'];

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,
  },
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
};

function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length && env.nodeEnv !== 'test') {
    // Fail fast on boot rather than mysteriously failing on first request.
    // eslint-disable-next-line no-console
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

export { env, validateEnv };
