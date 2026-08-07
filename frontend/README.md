# Djezzy Data Nexus Frontend

React/Vite frontend for the Djezzy Data Nexus telecom operations platform.

## Development

From the repository root:

```bash
npm run frontend:dev
```

Or from this folder:

```bash
npm install
npm run dev
```

The app expects the backend API on port `4000` by default. To override it:

```bash
cp .env.example .env.local
```

Then set:

```text
VITE_API_URL=http://localhost:4000
```

## Build

```bash
npm run build
```

The production build is written to `dist/`.

## Main Areas

- Login and role-aware navigation.
- National operations dashboard.
- Site dashboard for MSC10 Blida and other seeded sites.
- Digital twin and power-flow views.
- Incident diagnosis center.
- Ticket kanban board.
- Maintenance calendar and history.
- Knowledge base, notifications, reports, and settings.

## Source Layout

```text
src/components/  Reusable UI, layout, maintenance, and twin components
src/hooks/       API and state-oriented React hooks
src/lib/         Shared frontend utilities
src/pages/       Routed application screens
src/store/       Zustand application stores
public/          Static assets served by Vite
```
