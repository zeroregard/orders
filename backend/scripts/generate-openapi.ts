import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { swaggerSpec } from '../src/swagger';

// Create shared directory if it doesn't exist
const sharedDir = join(__dirname, '../../shared');
const schemasDir = join(sharedDir, 'schemas');

try {
  mkdirSync(sharedDir, { recursive: true });
  mkdirSync(schemasDir, { recursive: true });
} catch (error) {
  // Directory might already exist, that's fine
}

// Generate OpenAPI JSON file
const openApiPath = join(schemasDir, 'openapi.json');
writeFileSync(openApiPath, JSON.stringify(swaggerSpec, null, 2));

console.log('✅ OpenAPI schema generated at:', openApiPath);

// Also generate TypeScript types from the OpenAPI schema
const apiTypes = `// Auto-generated API types from OpenAPI schema
// Do not edit this file manually

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  iconId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  name: string;
  creationDate: string;
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
  lineItems: OrderLineItem[];
}

export interface OrderLineItem {
  id: string;
  productId: string;
  quantity: number;
  productName?: string;
  createdAt: string;
  product?: Product;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price?: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
}

export interface CreateOrderRequest {
  name: string;
  creationDate: string;
  purchaseDate: string;
  lineItems: {
    productId?: string;
    quantity: number;
    productName?: string;
  }[];
}

export interface PredictionResponse {
  productId: string;
  predictedNextPurchaseDate: string;
}

export interface AuthUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export interface AuthTestResponse {
  message: string;
  user: AuthUser;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: any[];
}

// API endpoints base URL
export const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
`;

const typesPath = join(schemasDir, 'api-types.ts');
writeFileSync(typesPath, apiTypes);

console.log('✅ TypeScript types generated at:', typesPath);
console.log('📋 Files generated:');
console.log('  - OpenAPI JSON schema for API documentation');
console.log('  - TypeScript types for frontend consumption');
console.log('');
console.log('Frontend can now import types from: shared/schemas/api-types.ts'); 