// Frontend API logic for CRUD to backend endpoints
// Uses fetch API and types from backendSchemas
import type { Product, Order } from '../types/backendSchemas';

const BASE_URL = 'http://localhost:3001/api';

// --- Products ---
export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products`);
  const data = await res.json();
  return data as Product[]; // Backend now returns complete objects with IDs
}

export async function createProduct(input: Omit<Product, 'id'>): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create product');
  return data as Product;
}

export async function updateProduct(id: string, input: Partial<Omit<Product, 'id'>>): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update product');
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete product');
  }
}

// --- Orders ---
export async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/orders`);
  const data = await res.json();
  return data as Order[];
}

export async function createOrder(input: Omit<Order, 'id'>): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create order');
  return data as Order;
}

export async function updateOrder(id: string, input: Partial<Omit<Order, 'id'>>): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update order');
  return data as Order;
}

export async function deleteOrder(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/orders/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete order');
  }
}

// --- Predictions ---
export interface PredictionResponse {
  productId: string;
  predictedNextPurchaseDate: string;
}

export async function getPrediction(productId: string): Promise<PredictionResponse> {
  const res = await fetch(`${BASE_URL}/predictions/${productId}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to get prediction');
  }
  return data;
}
