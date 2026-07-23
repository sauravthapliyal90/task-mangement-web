import winston from "winston";
import { env } from "../config/env.js";

// A structured logger (instead of console.log) is what lets this
// scale into a real deployment: JSON logs can be shipped to
// CloudWatch/ELK, and log level can be tuned per environment.
const logger = winston.createLogger({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.nodeEnv === 'production' ? winston.format.json() : winston.format.simple()
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
