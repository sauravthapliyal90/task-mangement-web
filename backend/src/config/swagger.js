import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description:
        "A RESTful API for a task management system with JWT authentication, role-based access control, task assignment, and analytics.",
    },
    servers: [
      {
        url: "/api/v1",
        description: "Base API path",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    tags: [
      { name: "Auth", description: "Registration, login, logout, profile" },
      { name: "Users", description: "User management (admin/manager)" },
      { name: "Tasks", description: "Task CRUD, assignment, analytics" },
    ],
  },
  apis: [path.join(__dirname, "../modules/**/*.routes.js")],
};

export default swaggerJsdoc(options);