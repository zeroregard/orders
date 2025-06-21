import { z } from 'zod';

export const createPurchasePatternSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  intervalDays: z.number().int().positive('Interval days must be a positive integer'),
  notify: z.boolean().optional().default(true),
  notifyDaysBefore: z.number().int().min(0, 'Notify days before must be non-negative').optional().default(3),
});

export const updatePurchasePatternSchema = z.object({
  intervalDays: z.number().int().positive('Interval days must be a positive integer').optional(),
  notify: z.boolean().optional(),
  notifyDaysBefore: z.number().int().min(0, 'Notify days before must be non-negative').optional(),
});

export type CreatePurchasePatternSchema = z.infer<typeof createPurchasePatternSchema>;
export type UpdatePurchasePatternSchema = z.infer<typeof updatePurchasePatternSchema>; 