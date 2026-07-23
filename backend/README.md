# Task Management API (backend)

A scalable RESTful API for a task management system built with **Node.js + Express +
MongoDB**, featuring JWT authentication, role-based access control (RBAC), task
CRUD & assignment, search/filtering, basic real-time updates, and full OpenAPI 3.0
documentation via Swagger UI.

Request validation is done with **Zod** (see `src/modules/*/*.validation.js`).

This is the API only. The frontend lives in the sibling `frontend/` directory
as its own Vite + React project - see the root `README.md` for how the two
run together, or `frontend/README.md` for frontend-specific instructions.

## Table of contents
- [Quick start](#quick-start)
- [Folder structure & why](#folder-structure--why)
- [Architecture & scalability decisions](#architecture--scalability-decisions)
- [Roles & permissions](#roles--permissions)
- [API overview](#api-overview)
- [Assumptions & design decisions](#assumptions--design-decisions)
- [What's implemented vs. stubbed](#whats-implemented-vs-stubbed)

---

## Quick start

### Prerequisites
- Node.js 18+
- MongoDB running locally or a connection string (Atlas, etc.)
- (Optional) Docker & Docker Compose, if you'd rather not install Mongo locally

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# then edit .env - at minimum set MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET
```

### 3. Run MongoDB
Either run your own local `mongod`, or use Docker Compose which starts Mongo for you:
```bash
docker compose up -d mongo
```

### 4. (Optional) Seed sample data
Creates an admin, a manager, a team member, and two sample tasks so the
frontend has data on first load:
```bash
npm run seed
```
Seeded logins:
| Role    | Email                  | Password       |
|---------|------------------------|----------------|
| admin   | admin@example.com      | Admin@1234     |
| manager | manager1@example.com   | Manager@1234   |
| user    | member1@example.com    | Member@1234    |

### 5. Start the server
```bash
npm run dev      # nodemon, auto-restart
# or
npm start        # plain node
```

The API is now available at:
- **Health check:** http://localhost:5000/health
- **Swagger UI (interactive docs):** http://localhost:5000/api-docs
- **Raw OpenAPI JSON:** http://localhost:5000/api-docs.json
- A static export also lives in [`docs/openapi.yaml`](docs/openapi.yaml) / `docs/openapi.json`
  for anyone who wants to import it into Postman/Insomnia without running the server.

To run the frontend against this API too, see the root-level `README.md`
(`docker compose up --build` from the repo root starts Mongo, this API, and
the built frontend together).

---

## Folder structure & why

```
backend/
├── src/
│   ├── config/            # env loading, DB connection, swagger spec generation
│   ├── modules/            <- feature-based, not layer-based
│   │   ├── auth/           #   auth.controller / .service / .routes / .validation (zod)
│   │   ├── users/          #   user.model / .controller / .service / .routes
│   │   └── tasks/          #   task.model / .controller / .service / .routes / .validation (zod)
│   ├── middlewares/        # auth, rbac, rate limiting, zod validation, central error handler
│   ├── routes/index.js     # mounts every module's router under /api/v1
│   ├── utils/              # ApiError, ApiResponse, asyncHandler, logger, tokenBlacklist, seed
│   ├── realtime.js         # Socket.io setup (bonus: real-time task events)
│   ├── app.js               # express app assembly (middleware pipeline, docs, static files)
│   └── server.js            # boot: connect DB, start HTTP+socket server, graceful shutdown
├── docs/                   # exported openapi.yaml / openapi.json
├── Dockerfile
└── .env.example
```

**Why feature-based ("module") folders instead of layer-based (`controllers/`,
`models/`, `routes/` at the top level)?** Once you have more than two or three
resources, layer-based structuring means every new feature touches four
different top-level folders and the files for one feature are scattered
across the repo. With a `modules/<feature>/` layout:

- Everything about "tasks" - model, validation, service, controller, routes -
  lives in one folder. New engineers can find (and safely modify) everything
  related to one resource without hunting across the tree.
- Adding a new resource (e.g. `projects`, `comments`) is "create a new folder
  under `modules/`, add one line to `routes/index.js`" - it doesn't require
  touching unrelated features.
- It scales better for a growing codebase and multiple engineers working in
  parallel: two people adding `modules/tasks` and `modules/notifications`
  rarely conflict, whereas both editing a shared `controllers/index.js` often do.
- `controller -> service -> model` inside each module keeps HTTP concerns
  (controllers), business logic (services), and persistence (models) cleanly
  separated, so business logic is unit-testable without spinning up Express.

---

## Architecture & scalability decisions

The assignment specifically asked to consider scalability & performance, so a
few decisions were made with that in mind:

1. **Stateless authentication (JWT).** No server-side session store is
   required to authenticate a request, so any number of API instances can sit
   behind a load balancer without sticky sessions. The one piece of
   server-side state - a logout/revocation blacklist - is implemented as an
   in-memory `Map` for this demo, but the interface (`add`, `isBlacklisted`)
   is intentionally tiny so it's a one-file swap to back it with **Redis**
   (`SETEX <jti> <ttl> 1`) once you run more than one instance, which is
   called out directly in `src/utils/tokenBlacklist.js`.

2. **Database indexing for the "search & filtering" requirement.** The
   `Task` model defines compound indexes on `(status, priority, dueDate)` and
   `(assignedTo, status)`, plus a **text index** on `title`+`description` so
   free-text search uses MongoDB's `$text` operator instead of a full
   collection scan with regex. `User` has indexes on `username`, `email`, and
   `team` since those are the fields queried on every login/RBAC check.

3. **Pagination everywhere.** Every list endpoint (`GET /tasks`,
   `GET /users`, `GET /tasks/assigned/me`) takes `page`/`limit` and returns
   `{ total, page, limit }` in the response meta - so a large dataset never
   gets returned in one unbounded payload.

4. **RBAC enforced at the data-access layer, not just the route layer.**
   `task.service.js` builds a MongoDB filter (`scopeFilterFor`) based on the
   requester's role before any query runs, so a manager's queries are
   *incapable* of returning another team's tasks, rather than relying on a
   controller-level check that a future refactor might accidentally remove.

5. **Centralized error handling & response shape.** One error middleware and
   two small response classes (`ApiError`, `ApiResponse`) keep every endpoint
   consistent (`{ success, message, data, meta }`), which matters as the API
   surface grows across many contributors.

6. **Connection pooling & compression.** Mongoose is configured with
   `maxPoolSize`/`minPoolSize` instead of the default, and `compression()`
   is applied globally to reduce payload size under load.

7. **Rate limiting tuned per endpoint sensitivity.** A relatively generous
   global limiter protects the whole API from abuse, while a much stricter
   limiter is applied specifically to `/auth/login` and `/auth/register` to
   blunt brute-force/credential-stuffing attempts, per the assignment's
   security requirement (bonus: "Configure rate limits based on user roles
   and endpoint sensitivity" - the hook is there in
   `middlewares/rateLimiter.middleware.js` to add role-aware tiers).

8. **Horizontal scaling path.** Because there's no in-process state beyond
   the (swappable) token blacklist and the Socket.io room membership,
   this API can run as multiple stateless containers behind a load balancer.
   For Socket.io specifically to scale past one instance, the standard next
   step is the `socket.io-redis` adapter so rooms/broadcasts are shared
   across instances - noted here rather than implemented, to keep the demo
   dependency footprint small.

9. **Structured logging (Winston).** JSON logs in production mode are
   ready to ship to a log aggregator (CloudWatch, ELK, Datadog) instead of
   plain `console.log`.

---

## Roles & permissions

| Action                              | admin | manager (own team) | user (self) |
|--------------------------------------|:-----:|:-------------------:|:------------:|
| Register / login / logout / own profile | ✅ | ✅ | ✅ |
| List/view any user                   | ✅    | team only            | self only |
| Update user roles/team/active status | ✅    | ❌                   | ❌ |
| Delete a user                        | ✅    | ❌                   | ❌ |
| Create a task                        | ✅    | ✅                   | ✅ (own) |
| View tasks                           | all   | team's tasks         | own/assigned |
| Update / delete a task               | ✅    | team's tasks         | own tasks |
| Assign a task to a user              | any user | own team only    | ❌ |
| View analytics                       | all   | team-scoped          | own-scoped |

A "team" is modeled simply: a manager's team = every `User` whose `team`
field points at that manager's `_id`.

---

## API overview

Full interactive documentation (with request/response schemas and a "Try it
out" button) is at **`/api-docs`** once the server is running. Summary:

### Auth (`/api/v1/auth`)
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register a new user | Public (rate-limited) |
| POST | `/login` | Log in, returns a JWT | Public (rate-limited) |
| POST | `/logout` | Invalidate the current JWT | Bearer token |
| GET  | `/me` | Get your own profile | Bearer token |

### Users (`/api/v1/users`) - admin/manager only
| Method | Path | Description |
|---|---|---|
| GET | `/` | List users (admin: all/filterable, manager: own team) |
| GET | `/:id` | Get a single user |
| PATCH | `/:id` | Update a user (role/team changes require admin) |
| DELETE | `/:id` | Delete a user (admin only) |

### Tasks (`/api/v1/tasks`)
| Method | Path | Description |
|---|---|---|
| POST | `/` | Create a task |
| GET | `/` | List tasks - filter by `status`, `priority`, `search`, `dueBefore`/`dueAfter`; sort via `sortBy`/`sortOrder`; paginate via `page`/`limit` |
| GET | `/assigned/me` | Tasks assigned to the current user |
| GET | `/analytics` | Completed/pending/in-progress/overdue counts, scoped to what the requester can see |
| GET | `/:id` | Get one task |
| PUT | `/:id` | Update a task |
| DELETE | `/:id` | Delete a task |
| PATCH | `/:id/assign` | Assign a task to a user (admin: anyone, manager: own team) |

All task/user endpoints require `Authorization: Bearer <token>`.

### Real-time (bonus)
Connect a Socket.io client with `auth: { token: '<JWT>' }`. You'll be joined
into a room for your user id and receive `task:created`, `task:updated`,
`task:deleted`, and `task:assigned` events as they happen.

---

## Assumptions & design decisions

- **Database:** MongoDB/Mongoose was chosen over a relational DB because the
  task schema is simple and document-shaped, and it keeps the assignment's
  setup to a single dependency. The service layer is thin enough that
  swapping to PostgreSQL/Prisma later wouldn't require touching controllers.
- **Team modeling:** a "team" is not a separate collection - it's modeled as
  `user.team = <manager's _id>` for simplicity, per the assignment's
  description of managers having a "team." A dedicated `Team` model would be
  a natural next step if teams needed their own metadata (name, description).
- **Email confirmation:** implemented as a logged hook rather than wired to a
  real provider (SendGrid/SES) since the assignment marks it optional and it
  requires third-party credentials this environment doesn't have.
- **Token revocation:** implemented in-memory for simplicity; explicitly
  documented above as the one piece of state to move to Redis for a true
  multi-instance deployment.
- **Validation:** `zod` schemas validate request shape (body/query) at the
  edge; Mongoose schema validation is the second line of defense at the
  data layer.
- **Password policy:** minimum 8 characters, must include upper/lowercase,
  a digit, and a special character (assignment says "enforce strong password
  criteria" without specifying exact rules).

## What's implemented vs. stubbed

| Feature | Status |
|---|---|
| Registration, login, logout, profile | ✅ Fully implemented |
| RBAC (admin/manager/user) | ✅ Fully implemented, enforced at route + data layer |
| Task CRUD + assignment | ✅ Fully implemented |
| OpenAPI docs (Swagger UI + static export) | ✅ Fully implemented |
| Rate limiting | ✅ Implemented (global + stricter auth limiter) |
| Search & filtering | ✅ Implemented (text index + status/priority/date filters + pagination) |
| Real-time updates (Socket.io) | ✅ Implemented (basic room-per-user broadcast) |
| Analytics | ✅ Implemented (status counts, overdue, per-assignee breakdown) |
| Redis caching | ⚠️ Not implemented - noted in code/README as the production upgrade path for the token blacklist; no cached endpoints were added since the assignment lists this as a bonus and the dataset sizes here don't need it to demonstrate the API |
| Email confirmation | ⚠️ Stubbed (logs intent instead of sending) - needs a real provider/API key |
| Deployment | Not deployed by default - see Dockerfile/docker-compose for a one-command local/cloud-ready setup; push the image to any container host (Render, Railway, ECS, etc.) and set the same env vars |

---

## Testing the flow quickly (curl)

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"Alice@1234"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"alice","password":"Alice@1234"}'
# -> copy the "token" from the response

# Create a task
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Write tests","priority":"high"}'

# List tasks with filters
curl "http://localhost:5000/api/v1/tasks?status=pending&priority=high&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

## Submission notes

Per the assignment's submission guidelines: fork this into your own GitHub
repository, commit with meaningful messages, and (optionally) deploy the
Docker image to a cloud provider - then link the deployed URL and the
`/api-docs` path in your submission.
