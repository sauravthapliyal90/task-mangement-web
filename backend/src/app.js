import express from "express";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

import { env } from "./config/env.js";
import swaggerSpec from "./config/swagger.js";
import apiRoutes from "./routes/index.js";
import { generalLimiter } from "./middlewares/rateLimiter.middleware.js";
import {
  notFoundHandler,
  errorHandler,
} from "./middlewares/error.middleware.js";
import logger from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Performance & core middleware, applied globally so every route
// benefits without each module remembering to add it individually.
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // strips $ / . operators from user input to prevent NoSQL injection
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));
app.use(generalLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.use('/api/v1', apiRoutes);

// The frontend now lives in a separate Vite project (../frontend).
// In development it runs on its own dev server and proxies /api
// requests here. In production, build it (npm run build in
// frontend/) and this serves the compiled static bundle.
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get(/^(?!\/api|\/api-docs|\/health).*/, (req, res, next) => {
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) next();
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
