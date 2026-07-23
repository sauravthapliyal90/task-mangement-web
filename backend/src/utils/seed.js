/* Run with: npm run seed
 * Creates one admin, one manager, one regular user (on the manager's
 * team), and a couple of sample tasks - so the API/frontend has
 * something to look at immediately after setup.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import User from "../modules/users/user.model.js";
import Task from "../modules/tasks/task.model.js";
import logger from "./logger.js";

async function seed() {
  await mongoose.connect(env.mongoUri);
  logger.info('Connected for seeding...');

  await Promise.all([User.deleteMany({}), Task.deleteMany({})]);

  const admin = await User.create({
    username: 'admin',
    email: 'admin@example.com',
    password: 'Admin@1234',
    roles: ['admin'],
  });

  const manager = await User.create({
    username: 'manager1',
    email: 'manager1@example.com',
    password: 'Manager@1234',
    roles: ['manager'],
  });

  const member = await User.create({
    username: 'member1',
    email: 'member1@example.com',
    password: 'Member@1234',
    roles: ['user'],
    team: manager._id,
  });

  await Task.create([
    {
      title: 'Set up CI pipeline',
      description: 'Configure GitHub Actions for lint/test/build',
      priority: 'high',
      status: 'in-progress',
      createdBy: manager._id,
      assignedTo: member._id,
      team: manager._id,
    },
    {
      title: 'Write onboarding docs',
      description: 'Doc for new engineers',
      priority: 'medium',
      status: 'pending',
      createdBy: manager._id,
      team: manager._id,
    },
  ]);

  logger.info('Seed complete. Login with:');
  logger.info('  admin@example.com / Admin@1234');
  logger.info('  manager1@example.com / Manager@1234');
  logger.info('  member1@example.com / Member@1234');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  logger.error(err);
  process.exit(1);
});
