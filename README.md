# Dashboard Builder POC

A scalable dashboard builder demonstrating a dynamic widget registry, typed
data pipeline, and drag/resize persisted layout.

## Structure

```
backend/    Express + TypeScript API — Zod-validated mock data engine
frontend/   React + TypeScript — Vite, Zustand, react-grid-layout, Recharts
```

## Running locally

```bash
# Terminal 1
cd backend
npm install
npm run dev        # http://localhost:4000

# Terminal 2
cd frontend
npm install
npm run dev         # http://localhost:3000
```

## Tests

```bash
cd backend && npm test     # Jest — generator schema conformance + API integration
cd frontend && npm test    # Vitest — registry, config panel, and payload-validation tests
```

- [`ADR.md`](./ADR.md) — state management + charting library decisions
- [`DATA_DRIFT.md`](./DATA_DRIFT.md) — handling schema drift against a live
  production stream
