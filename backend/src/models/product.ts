export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  iconId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastOrdered?: Date;
}
