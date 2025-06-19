// This file re-exports Zod schemas and types from the backend for use in the frontend.
// It assumes the backend is available as a sibling project (monorepo style).
// If the frontend is built separately, consider generating types via zod-to-ts or similar tools.

// @ts-ignore: Allow import from outside root for monorepo
export { productSchema } from '../../../backend/src/schemas/productSchema';
export { orderSchema } from '../../../backend/src/schemas/orderSchema';

// Typescript types for Product and Order
export type Product = import('../../../backend/src/models/product').Product;
export type Order = import('../../../backend/src/models/order').Order;
