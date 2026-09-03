# Djezzy Data Nexus

Djezzy Data Nexus (DDN) is a full-stack decision-support platform for telecom infrastructure operations. It gives operations teams one web console for site health monitoring, digital-twin views, incident diagnosis, ticket workflows, maintenance planning, notifications, knowledge-base content, and French-localized reporting.

The demo data focuses on Djezzy telecom facilities in Algeria, especially the MSC10 Blida site.

## Main Features

- Role-based login for Super Admin, Engineer, and Site Operator users.
- National operations dashboard with fleet-level KPIs.
- Site dashboard for health, alarms, equipment status, and telemetry.
- Digital twin and power-flow views for infrastructure inspection.
- Incident diagnosis center backed by expert-system knowledge.
- Kanban-style ticket lifecycle with assignments and reports.
- Maintenance calendar, schedule management, and maintenance history.
- Notifications and operational knowledge base.
- Python SCADA expert system with deterministic rule tests and replay support.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Query, Zustand, Socket.IO client.
- Backend: Node.js, Express, Socket.IO, Prisma, PostgreSQL.
- Expert system: Python 3 standard library.
- Local services: PostgreSQL through Docker Compose.

## Prerequisites

- Node.js 22 or newer.
- npm 11 or newer.
- Python 3.10 or newer.
- Docker and Docker Compose.

The project was verified locally with Node.js `v24.16.0`, npm `11.13.0`, Python `3.12.3`, and Docker `29.6.2`.

## Quick Start

Install all JavaScript dependencies:

```bash
npm run install:all
```

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Start PostgreSQL:

```bash
npm run db:up
```

Create the database schema and seed demo data:

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

Open the Vite URL, usually:

```text
http://localhost:5173
```

The API runs on:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/api/health
```

## Demo Accounts

All seeded users use this password:

```text
admin123
```

Available accounts:

| Email | Role | Default Landing Area |
| --- | --- | --- |
| `admin@djezzy.dz` | Super Admin | National operations dashboard |
| `engineer@djezzy.dz` | Engineer | MSC10 Blida site dashboard |
| `operator@djezzy.dz` | Site Operator | MSC10 Blida incidents |

## Environment

The backend reads its local environment from `backend/.env`. Copy the example file to get started:

```bash
cp backend/.env.example backend/.env
```

Configure your `DATABASE_URL` and `JWT_SECRET` in the new `.env` file. The default password for the local Docker Compose database is `postgres`.

Frontend configuration is optional. By default the frontend infers the API as `http://<current-host>:4000`.

To override it:

```bash
cp frontend/.env.example frontend/.env.local
```

Then edit:

```text
VITE_API_URL=http://localhost:4000
```

## Useful Commands

```bash
npm run install:all       # install backend and frontend dependencies
npm run db:up             # start local PostgreSQL
npm run db:push           # sync Prisma schema to PostgreSQL
npm run db:seed           # seed roles, users, sites, equipment, rules, tickets, and content
npm run backend:dev       # start Express API with Socket.IO and telemetry simulation
npm run frontend:dev      # start Vite dev server
npm run frontend:build    # typecheck and build the frontend
npm run backend:typecheck # typecheck backend TypeScript
npm run frontend:lint     # run frontend lint checks
npm run scada:test        # run deterministic SCADA expert-system tests
npm run check             # backend typecheck + frontend lint + frontend production build
npm run verify            # full project verification, including SCADA tests
```

Run only the SCADA expert-system checks:

```bash
cd scada_expert_system
python3 test_rules.py
```

## Project Layout

```text
backend/              Express API, Prisma schema, seed data, domain services
frontend/             React/Vite web application
scada_expert_system/  Python SCADA diagnostic rules engine and tests
data/                 Simulated telecom telemetry CSV data
docs/                 Product, UX, data, and design documentation
docker-compose.yml    Local PostgreSQL service
package.json          Root scripts for setup, development, and verification
```

## Backend Notes

- The API starts the telemetry simulator automatically when the backend process starts.
- Socket.IO broadcasts live updates to the frontend.
- Prisma uses PostgreSQL through the `@prisma/adapter-pg` adapter.
- CORS accepts configured `FRONTEND_URL` values. Without that setting, local network origins are allowed for easier demos.
- The seeded MVP authentication intentionally accepts `admin123` for all seeded users.

## Frontend Notes

- The application is protected by a login route and role-aware route boundaries.
- The default API URL is inferred from the browser host and port `4000`.
- Static visual assets are stored in `frontend/public` and `frontend/src/assets`.
- Production output is generated in `frontend/dist` and is not needed in the source archive.

## SCADA Expert System

The Python expert system in `scada_expert_system/` implements SCADA diagnostic rules for telecom data-center operations. It can run in two modes:

```bash
cd scada_expert_system
python3 main.py
```

Runs the real-time simulator and writes diagnostic events to a local JSONL log.

```bash
cd scada_expert_system
python3 replay.py path/to/ALARMES_SCADA_2022_enriched.csv
```

Replays a historical SCADA alarm CSV through the rules engine.

## Verification

Before packaging, the project was verified with:

```bash
npm run verify
```

Result:

- Backend TypeScript typecheck passed.
- Frontend TypeScript build and Vite production build passed.
- Frontend lint passed with no warnings.
- SCADA expert-system script tests passed: 12 OK / 0 failures.
- Vite reported one large JavaScript bundle warning, but the build completed successfully.

## Submission Archive

The judge submission archive should include source code, lockfiles, documentation, data, and configuration templates.

It should exclude:

- `node_modules/`
- `frontend/dist/`
- `.git/`
- local `.env` files
- local database files such as `*.db`
- Python `__pycache__/`
- generated `diagnostics_log*.jsonl`
- previous zip archives

The prepared archive is:

```text
djezzy-data-nexus-judge-submission.zip
```

## Documentation

Additional project material is available in `docs/`, including product vision, UX strategy, screen-by-screen UI notes, data description, design system, and agent guide.
