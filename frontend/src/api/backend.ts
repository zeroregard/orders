// Frontend API logic for CRUD to backend endpoints
// Uses apiClient with authentication support
import { apiClient } from '../utils/apiClient';
import type { 
  Product, 
  Order, 
  CreateProductRequest,
  UpdateProductRequest,
  CreateOrderRequest,
  PredictionResponse,
  ApiError 
} from '../../../shared/schemas/api-types';

// --- Products ---
export async function getProducts(): Promise<Product[]> {
  return apiClient.get<Product[]>('/products');
}

export async function createProduct(product: CreateProductRequest): Promise<Product> {
  return apiClient.post<Product>('/products', product);
}

export async function updateProduct(id: string, product: UpdateProductRequest): Promise<Product> {
  return apiClient.put<Product>(`/products/${id}`, product);
}

export async function deleteProduct(id: string): Promise<void> {
  return apiClient.delete<void>(`/products/${id}`);
}

// --- Orders ---
export async function getOrders(): Promise<Order[]> {
  return apiClient.get<Order[]>('/orders');
}

export async function createOrder(order: CreateOrderRequest): Promise<Order> {
  return apiClient.post<Order>('/orders', order);
}

export async function deleteOrder(id: string): Promise<void> {
  return apiClient.delete<void>(`/orders/${id}`);
}

// --- Predictions ---
export async function getPrediction(productId: string): Promise<PredictionResponse> {
  return apiClient.get<PredictionResponse>(`/predictions/${productId}`);
}

// Export types for convenience
export type { 
  Product, 
  Order, 
  CreateProductRequest,
  UpdateProductRequest,
  CreateOrderRequest,
  PredictionResponse,
  ApiError 
};
