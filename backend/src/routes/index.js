import express from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import taskRoutes from "../modules/tasks/task.routes.js";

const router = express.Router();

// Feature-based mounting: each module owns its own routes/controller/
// service/model, so adding a new resource (e.g. "projects") later is
// just a new folder under modules/ plus one line here.
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);

export default router;
