import { z } from "zod";

// Shared password rule so backend and frontend can eventually import
// the exact same schema shape (see frontend/src/lib/schemas.js which
// mirrors this).
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/\d/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be between 3 and 30 characters')
    .max(30, 'Username must be between 3 and 30 characters'),
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: passwordSchema,
});

const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export { registerSchema, loginSchema, passwordSchema };
