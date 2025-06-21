# Auto-Order Backend

A modern, modular Node.js (TypeScript) backend for personal purchase tracking, including product, order, and prediction APIs.

This backend is designed to work with Railway.app for production deployment while maintaining local development capabilities.

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

## Database Configuration

### Development (Local)
For local development, create a `.env` file with:
```
DATABASE_URL="file:./dev.db"
NODE_ENV=development
PORT=3001
```

### Production (Railway)
Railway automatically provides the `DATABASE_URL` environment variable when you add a PostgreSQL database service.

## Railway Deployment Setup

### 1. Initial Setup
1. Connect your GitHub repository to Railway
2. Add a PostgreSQL database service to your Railway project
3. The `DATABASE_URL` will be automatically set by Railway

### 2. Environment Variables
Railway will automatically set:
- `DATABASE_URL` (PostgreSQL connection string)
- `PORT` (Railway assigns this)

### 3. Database Migrations
Migrations are not handled automatically yet, this needs to be done soon.

## Definition of Done for an endpoint
1. Is able to return 200.
2. Will show the full error in case of 5** and any 4** that is not 401.
3. Has associated schema available with description

## Verification Steps

### 1. Database Persistence Test
To verify your database persists between deployments:

1. **Add test data:**
   ```bash
   # Via API or Railway console
   railway connect
   npx prisma studio
   ```

2. **Deploy changes:**
   - Make a code change (not database schema)
   - Push to main branch
   - Wait for deployment

3. **Verify data persists:**
   - Check your data is still there via API or Prisma Studio

### 2. Health Check Verification
Your deployment has health endpoints:
- `/api/health` - Basic health check
- `/api/health/db` - Database connectivity check

### 3. Migration Verification
- Migrations are applied automatically
- Check Railway logs for migration output
- Verify schema changes without data loss

## Scripts

- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run dev` - Start development server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run migrations (development)

## Important Notes

- **NEVER** run `npm run db:reset` in production
- Use `prisma migrate deploy` for production deployments
- Local development uses SQLite, production uses PostgreSQL
- Database persists between deployments on Railway

---

**Future:** SQLite/PostgreSQL support, Fastify migration, production deployment.
