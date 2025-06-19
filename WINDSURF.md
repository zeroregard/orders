## Project Setup for SWE-1 (Windsurf Agent)

### Simple Personal Purchase Tracker

---

## Session Progress & Decisions (2025-06-18)

- **Vite proxy issue resolved:** The frontend Vite proxy was misrouting /api requests due to a rewrite config. Removing the rewrite fixed proxying to the backend.
- **Backend/Frontend integration verified:** The React frontend now successfully fetches backend status from the Express API via the Vite proxy.
- **Project structure:**
  - Backend: Express + TypeScript, pnpm, nodemon, in-memory storage
  - Frontend: React 19 + Vite + TypeScript, CSS modules, mobile-first, dark-only
- **MVP requirements updated:**
  - Full CRUD for Product and Order entities (Order has creation date, purchase date, line items with product/quantity, both have names)
  - If a product does not exist when creating an order, the backend should support creating it on-the-fly
  - Frontend must provide tabs for viewing/creating products and orders, mobile-first, responsive, dark mode only
- **Environment:** Node.js v22.16.0, pnpm, Windows
- **Troubleshooting:**
  - Fixed missing node_modules issues in both frontend and backend
  - Confirmed backend and frontend dev servers run and communicate as intended

---

## Tech Stack

* **Backend:** Node.js (TypeScript), modern lightweight framework (tRPC or Fastify — agent to choose based on LEAN principle)
* **Frontend:** React 19 + Vite + React Router + React Query + TailwindCSS + Radix UI Components
* **Tests:**

  * Frontend: Vitest + React Testing Library
  * Backend: Vitest or Jest
* **CI/CD:** GitHub Workflows for build, lint, unit tests (frontend & backend)
* **Deployment Ready for:** Remote secure server (Raspberry Pi or cloud) — assume remote for now

---

## SWE-1 Task List

### 1. Backend Setup (Node.js + TypeScript)

1. Initialize Node.js project (prefer `pnpm`, fallback to npm/yarn).
2. Install dependencies:

   * Fastify (or tRPC)
   * TypeScript
   * Zod (validation)
   * tsx/nodemon (dev)
   * Vitest or Jest (testing)
3. Create model:

```ts
interface Purchase {
  id: string;
  itemName: string;
  purchaseDate: string; // ISO
}
```

4. Implement endpoints:

   * POST /purchase — add purchase (allow purchaseDate override or use Date.now)
   * GET /purchases — return all purchases
5. In-memory storage (no database).
6. Unit tests:

   * POST + GET valid/invalid data
7. If tRPC: generate type-safe hooks for frontend.
8. ESLint + Prettier config (shared with frontend).
9. GitHub Workflow for backend:

   * Install, lint, typecheck, test

### 2. Frontend Setup (React 19 + Vite)

1. Create Vite + React 19 + TypeScript app.
2. Install dependencies:

   * React Router
   * React Query
   * TailwindCSS
   * Radix UI
   * Axios/fetch wrapper
   * Vitest + React Testing Library
3. Implement Pages:

   * `/add`: Form for item + optional purchase date
   * `/list`: Fetch & display purchases
4. React Query setup for API calls.
5. Tailwind for styling.
6. Unit tests:

   * Form input + submit
   * API fetch + render list
7. ESLint + Prettier config (shared).
8. GitHub Workflow for frontend:

   * Install, lint, typecheck, test

### 3. Connect Frontend & Backend

1. API client uses VITE\_API\_URL (for dev/prod).
2. Document local dev setup (`pnpm dev`).
3. (Optional) Docker-compose for both services.
4. Deployment preparation instructions.

### 4. GitHub Automation (CI/CD)

1. Separate workflows:

   * Frontend: lint, typecheck, unit tests
   * Backend: lint, typecheck, unit tests
2. PR auto-labeling (`frontend`, `backend`, `ci`) (optional).
3. (Optional) Docker build verification.

### 5. Documentation

1. README.md with:

   * Running instructions
   * Testing guide
   * Deployment guide
   * API URL override note
   * Tech choice summary

---

## Human operator Must Do (To Unblock SWE-1)

1. ✅ Create GitHub repo (private/public) & give SWE-1 access.
2. ✅ Confirm backend preference: Fastify or tRPC. (**tRPC strongly recommended for type safety & lean dev**)
3. ✅ Decide on hosting (Raspberry Pi/Fly.io/etc.) for deploy setup (or confirm "deployment later").
4. ✅ Confirm UI: "default functional" or provide custom design/assets.
5. ✅ Setup Netlify/Vercel (frontend) & Railway/Fly.io (backend) accounts (if deploy automation wanted now).
6. ✅ Provide env secrets if needed (`VITE_API_URL`).

---

## Important Notes

* ⚠️ Raspberry Pi deploy = ARM Docker required — agent must adjust later.
* ⚠️ Fastify = manual API typing; tRPC = auto sync (strongly recommended).
* ⚠️ Real DB (SQLite or other) possible future task — in-memory fine for v0.

---

## Expected Deliverables

* ✅ Functional frontend + backend
* ✅ Fully typed (if tRPC)
* ✅ Local dev ready (`pnpm dev`)
* ✅ Unit tests passing in CI (GitHub Actions)
* ✅ Minimal Docker (if provided)
* ✅ README covering all basics
* ✅ GitHub automation in place
