import express from "express";
import controller from "./user.controller.js";
import authenticate from "../../middlewares/auth.middleware.js";
import authorize from "../../middlewares/rbac.middleware.js";

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List users (admin sees all/filterable, manager sees own team)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: team
 *         schema: { type: string }
 *       - in: query
 *         name: role
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of users }
 */
router.get('/', authorize('admin', 'manager'), controller.listUsers);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a single user by id
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User found }
 *       404: { description: User not found }
 *   patch:
 *     summary: Update a user (role/team changes require admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User updated }
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User deleted }
 */
router.get('/:id', authorize('admin', 'manager'), controller.getUser);
router.patch('/:id', authorize('admin', 'manager'), controller.updateUser);
router.delete('/:id', authorize('admin'), controller.deleteUser);

export default  router;
