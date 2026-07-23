# Task Management Frontend

A Vite + React frontend for the [Task Management API](../backend). No CDN
script tags, no build-free React - this is a proper bundled app.

## Stack

- **Vite** - dev server & bundler
- **React 18** + **react-router-dom** - routing
- **@tanstack/react-query** - server state, caching, and refetching
- **@tanstack/react-table** - the task list
- **react-hook-form** + **@hookform/resolvers** + **zod** - forms and validation
  (schemas in `src/lib/schemas.js` mirror the backend's Zod schemas)
- **axios** - HTTP client (`src/api/client.js`)
- **socket.io-client** - realtime task updates, invalidates React Query caches
  on `task:created` / `task:updated` / `task:deleted` / `task:assigned`
- **Tailwind CSS** - styling, no component library

## Running in development

```bash
npm install
npm run dev
```

This starts the Vite dev server on **http://localhost:5173**. It proxies
`/api/*` and `/socket.io/*` to `http://localhost:5000` (see `vite.config.js`),
so make sure the backend is running there too - and set the backend's
`CLIENT_ORIGIN=http://localhost:5173` in `backend/.env` so CORS allows it.

## Building for production

```bash
npm run build
```

Outputs to `dist/`. The backend (`backend/src/app.js`) will serve this
directory directly if it exists at `../frontend/dist` relative to the
backend, so you can run the whole thing as one origin without nginx if
you'd rather not run two containers. The provided `Dockerfile` + `nginx.conf`
here are for running frontend and backend as separate containers instead
(see the root `docker-compose.yml`).

## Folder structure

```
frontend/
├── src/
│   ├── api/client.js         # axios instance, auth header + response unwrapping
│   ├── lib/schemas.js        # zod schemas (mirrors backend validation)
│   ├── lib/socket.js         # socket.io-client singleton
│   ├── hooks/useAuth.jsx     # auth context: token, current user, login/register/logout
│   ├── hooks/useTasks.js     # react-query hooks: list/create/update/delete/assign/analytics
│   ├── components/           # Layout, forms, table, filters, analytics strip
│   ├── routes/                # LoginPage, RegisterPage, DashboardPage
│   ├── App.jsx                # route definitions + auth guard
│   └── main.jsx               # providers: QueryClient, BrowserRouter, AuthProvider
├── vite.config.js
├── tailwind.config.js
└── index.html
```
