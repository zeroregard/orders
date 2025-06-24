export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  iconId?: string;
  isDraft?: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastOrdered?: Date;
}
