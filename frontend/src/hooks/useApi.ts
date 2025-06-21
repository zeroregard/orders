import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getOrders,
  createOrder,
  deleteOrder,
  getPrediction,
  type CreateProductRequest,
  type UpdateProductRequest,
  type CreateOrderRequest
} from '../api/backend';

// Product hooks
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productData: CreateProductRequest) => createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Order hooks
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders(),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: CreateOrderRequest) => createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// Prediction hook
export const usePrediction = (productId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['prediction', productId],
    queryFn: () => getPrediction(productId),
    enabled: enabled && !!productId,
  });
}; 