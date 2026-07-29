# Djezzy Data Nexus

Djezzy Data Nexus (DDN) is a full-stack decision-support platform for telecom infrastructure operations. It combines site health monitoring, a digital twin, incident diagnosis, ticket workflows, maintenance planning, notifications, and French-localized operational dashboards.

## Tech Stack

- Backend: Node.js, Express, Socket.IO, Prisma, PostgreSQL
- Frontend: React, TypeScript, Vite, Tailwind CSS, React Query
- Local database: PostgreSQL via Docker Compose

## Prerequisites

- Node.js 22 or newer
- npm
- Docker and Docker Compose

## Quick Start

Start the PostgreSQL database:

```bash
docker compose up -d db
```

Install dependencies:

```bash
npm run install:all
```

Prepare and seed the database:

```bash
npm run db:push
npm run db:seed
```

Start the backend API:

```bash
npm run backend:dev
```

In another terminal, start the frontend:

```bash
npm run frontend:dev
```

Open the frontend URL printed by Vite, usually:

```text
http://localhost:5173
```

The API runs on:

```text
http://localhost:4000
```

## Demo Accounts

All seeded users use the password:

```text
admin123
```

Available accounts:

- `admin@djezzy.dz` - Super administrator
- `engineer@djezzy.dz` - Engineer
- `operator@djezzy.dz` - Site operator

## Environment

The backend reads its local environment from [backend/.env](backend/.env). The committed file is configured for the Docker Compose database:

```text
DATABASE_URL="postgresql://admin:password123@localhost:5432/djezzy_ssop?schema=public"
PORT=4000
```

Optional frontend override:

```bash
cp frontend/.env.example frontend/.env.local
```

## Useful Commands

```bash
npm run install:all       # install backend and frontend dependencies
npm run db:up             # start local PostgreSQL
npm run db:push           # sync Prisma schema to PostgreSQL
npm run db:seed           # seed demo users, sites, equipment, rules, and tickets
npm run backend:dev       # start Express API with telemetry simulation
npm run frontend:dev      # start Vite dev server
npm run check             # backend typecheck + frontend production build
```

## Project Layout

```text
backend/        Express API, Prisma schema, seed data, domain services
frontend/       React/Vite application
docs/           Product and agent reference documentation
docker-compose.yml
```

## Notes

- The backend starts telemetry simulation automatically.
- CORS allows local network origins by default; set `FRONTEND_URL` in `backend/.env` for stricter origin control.
- The original product/agent guide lives in [docs/AGENT_GUIDE.md](docs/AGENT_GUIDE.md).
