import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().optional(),
  iconId: z.string().optional(),
  isDraft: z.boolean().optional(),
});
