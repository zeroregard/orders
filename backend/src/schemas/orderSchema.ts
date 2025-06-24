import { z } from 'zod';

export const orderLineItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  productName: z.string().optional(),
});

export const orderSchema = z.object({
  name: z.string().min(1, 'Order name is required'),
  creationDate: z.string().min(1, 'Creation date is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  lineItems: z.array(orderLineItemSchema).min(1, 'At least one line item is required'),
  isDraft: z.boolean().optional(),
  source: z.enum(['MANUAL', 'EMAIL', 'API']).optional(),
  originalEmailHash: z.string().optional(),
});
