import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';
import type { 
  Product, 
  Order, 
  CreateProductRequest,
  UpdateProductRequest,
  CreateOrderRequest,
  PredictionResponse 
} from '../../../shared/schemas/api-types';

// Query Keys
export const queryKeys = {
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['orders', id] as const,
  prediction: (productId: string) => ['predictions', productId] as const,
};

// Products Hooks
export const useProducts = () => {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: async (): Promise<Product[]> => {
      return apiClient.get<Product[]>('/products');
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: CreateProductRequest): Promise<Product> => {
      return apiClient.post<Product>('/products', product);
    },
    onSuccess: () => {
      // Invalidate products query to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...product }: UpdateProductRequest & { id: string }): Promise<Product> => {
      return apiClient.put<Product>(`/products/${id}`, product);
    },
    onSuccess: (_, variables) => {
      // Invalidate products query and specific product query
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.product(variables.id) });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      return apiClient.delete<void>(`/products/${id}`);
    },
    onSuccess: () => {
      // Invalidate products query to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
};

// Orders Hooks
export const useOrders = () => {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: async (): Promise<Order[]> => {
      return apiClient.get<Order[]>('/orders');
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (order: CreateOrderRequest): Promise<Order> => {
      return apiClient.post<Order>('/orders', order);
    },
    onSuccess: () => {
      // Invalidate orders query to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      return apiClient.delete<void>(`/orders/${id}`);
    },
    onSuccess: () => {
      // Invalidate orders query to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
};

// Predictions Hook
export const usePrediction = (productId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.prediction(productId),
    queryFn: async (): Promise<PredictionResponse> => {
      return apiClient.get<PredictionResponse>(`/predictions/${productId}`);
    },
    enabled: enabled && !!productId,
    // Predictions are less critical, so we can have a longer stale time
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}; 