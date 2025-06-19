# Auto-Order Backend

A modern, modular Node.js (TypeScript) backend for personal purchase tracking, including product, order, and prediction APIs.

## Features
- RESTful API for products and orders
- Predicts next purchase date for products
- PostgreSQL database support via Prisma ORM
- Zod-based request validation and schema generation
- OpenAPI/Swagger documentation at `/api/docs`
- Modular code structure with proper separation of concerns
- Unit, integration, and E2E tests (Jest + Supertest)
- GitHub Actions CI pipeline

## Quick Start

1. **Install dependencies:**
   ```sh
   pnpm install
   ```

2. **Run the server:**
   ```sh
   pnpm dev
   ```
   The server runs on [http://localhost:3001](http://localhost:3001)

3. **View API docs:**
   [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

4. **Run tests:**
   ```sh
   pnpm test
   ```

## Project Structure

```
backend/
  src/
    models/         # TypeScript domain models
    schemas/        # Zod schemas for validation
    routes/         # Express route modules
    tests/          # Jest/Supertest tests
    prisma/         # Prisma ORM schema and migrations
    swagger.ts      # Swagger/OpenAPI setup
    index.ts        # App entrypoint
  package.json
  jest.config.js
  tsconfig.json
  README.md
```

## API Endpoints
- `POST /api/products` — Create Product
- `GET /api/products` — List Products
- `POST /api/orders` — Create Order
- `GET /api/orders` — List Orders
- `GET /api/predictions/:productId` — Predict next purchase date

See `/api/docs` for full OpenAPI documentation.

## CI/CD
- All pushes/PRs run lint, typecheck, and tests via GitHub Actions.

---

**Future:** SQLite/PostgreSQL support, Fastify migration, production deployment.
