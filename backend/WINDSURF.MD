## Backend-Only Project Setup for SWE-1 (Windsurf Agent)

### Personal Purchase Tracker — Backend Setup

---

## Tech Stack

* **Backend:** Node.js (TypeScript), Fastify (preferred for simplicity, unless Windsurf suggests better)
* **Validation:** Zod
* **Testing:** Vitest (unit, integration, E2E)
* **API Docs:** OpenAPI (auto-generated if possible)
* **CI/CD:** GitHub Workflows

---

## Required Backend Domain Structure

### Core Entities:

* **Product**

```ts
interface Product {
  id: string;
  name: string;
}
```

* **Order**

```ts
interface Order {
  id: string;
  purchaseDate: string; // ISO Date
  lineItems: Array<{ productId: string; quantity: number }>;
}
```

* **Prediction** (calculated, not stored)

```ts
interface Prediction {
  productId: string;
  predictedNextPurchaseDate: string; // ISO Date
}
```

---

## API Endpoints

### Product Endpoints:

* **POST /products** — Create Product
* **GET /products** — List Products

### Order Endpoints:

* **POST /orders** — Create Order (must reference existing products)
* **GET /orders** — List Orders

### Prediction Endpoint:

* **GET /predictions/\:productId** — Get predicted next purchase date for a specific Product based on past orders.

---

## Prediction Logic

For a given product:

1. Find all related `Order.lineItems`.
2. Sort by `purchaseDate`.
3. If fewer than 2 orders: Return no prediction.
4. If 2+ orders:

   * Calculate average interval between purchases.
   * Predict: `lastPurchaseDate + averageInterval`.

---

## E2E Test (Gherkin Style)

```gherkin
Feature: Predicting Next Purchase Date for Cat Food

  Scenario: User purchases cat food twice
    Given a Product "Cat Food" exists
    And an Order was placed for 2x "Cat Food" on 2024-01-01
    And another Order was placed for 2x "Cat Food" on 2024-02-01
    When requesting prediction for "Cat Food"
    Then the system should return a predicted next purchase date of 2024-03-02 (30 days after last order)
```

### Notes for E2E Implementation:

* Must spin up real app instance on a separate port.
* Use clean, isolated database (in-memory or temp SQLite).
* Perform blackbox HTTP calls (e.g., with supertest or undici).
* Do **not** affect dev or prod DB.

---

## Testing Requirements

* **Unit Tests** — All service logic
* **Integration Tests** — API layer
* **E2E Test** — As per Gherkin scenario

---

## GitHub Workflow Requirements

* Backend-only CI pipeline:

  * Install deps
  * Typecheck
  * Lint
  * Run all tests (unit + integration + E2E)

---

## Deliverables

* Full backend implementation: API + prediction logic
* Unit, integration, and E2E tests (as described)
* OpenAPI spec (auto if Fastify plugin is used)
* GitHub Actions pipeline for backend
* `/README.md` with setup and usage instructions

---

## Mathias Must Do (To Unblock SWE-1)

1. ✅ Provide repository access
2. ✅ Confirm Fastify as backend framework
3. ✅ Confirm in-memory DB acceptable (v0)
4. ✅ Decide no frontend tasks for this agent run

---

## Notes

* No database persistence beyond memory (for now)
* Future feature: SQLite/PostgreSQL storage (not in scope)
* Frontend development is manual (handled separately via Cursor)

---

## File Location: `/backend/WINDSURF.md`
