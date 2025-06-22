// This file re-exports types from the shared schemas for use in the frontend.
// These types are generated from the backend OpenAPI specification and don't require Zod.

export type {
  Product,
  Order,
  OrderLineItem,
  CreateProductRequest,
  UpdateProductRequest,
  CreateOrderRequest,
  PredictionResponse,
  AuthUser,
  AuthTestResponse,
  ApiError
} from '../../../shared/schemas/api-types';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  iconId?: string;
  createdAt: string;
  updatedAt: string;
  lastOrdered?: string;
}
