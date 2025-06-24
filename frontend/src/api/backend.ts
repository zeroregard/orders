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
export async function getProducts(options?: { includeDrafts?: boolean; draftsOnly?: boolean }): Promise<Product[]> {
  const params = new URLSearchParams();
  
  if (options?.includeDrafts !== undefined) {
    params.append('includeDrafts', options.includeDrafts.toString());
  }
  
  if (options?.draftsOnly !== undefined) {
    params.append('draftsOnly', options.draftsOnly.toString());
  }
  
  const queryString = params.toString();
  const endpoint = queryString ? `/products?${queryString}` : '/products';
  
  return apiClient.get<Product[]>(endpoint);
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
export async function getOrders(options?: { includeDrafts?: boolean; draftsOnly?: boolean }): Promise<Order[]> {
  const params = new URLSearchParams();
  
  if (options?.includeDrafts !== undefined) {
    params.append('includeDrafts', options.includeDrafts.toString());
  }
  
  if (options?.draftsOnly !== undefined) {
    params.append('draftsOnly', options.draftsOnly.toString());
  }
  
  const queryString = params.toString();
  const endpoint = queryString ? `/orders?${queryString}` : '/orders';
  
  return apiClient.get<Order[]>(endpoint);
}

export async function createOrder(order: CreateOrderRequest): Promise<Order> {
  return apiClient.post<Order>('/orders', order);
}

export async function updateOrder(id: string, order: Partial<CreateOrderRequest>): Promise<Order> {
  return apiClient.put<Order>(`/orders/${id}`, order);
}

export async function deleteOrder(id: string): Promise<void> {
  return apiClient.delete<void>(`/orders/${id}`);
}

export async function approveOrder(id: string): Promise<Order> {
  return apiClient.post<Order>(`/orders/${id}/approve`, {});
}

export async function deleteDraftOrder(id: string): Promise<void> {
  return apiClient.delete<void>(`/orders/${id}/draft`);
}

// --- Predictions ---
export async function getPrediction(productId: string): Promise<PredictionResponse> {
  return apiClient.get<PredictionResponse>(`/predictions/${productId}`);
}

export interface PurchaseHistory {
  max: number;
  purchases: Array<{
    date: string;
    quantity: number;
  }>;
}

export async function getPurchaseHistory(productId: string): Promise<PurchaseHistory> {
  return apiClient.get<PurchaseHistory>(`/products/${productId}/purchase-history`);
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
