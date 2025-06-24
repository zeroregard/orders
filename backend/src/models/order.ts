export interface OrderLineItem {
  productId: string;
  quantity: number;
  productName?: string;
}

export interface Order {
  id: string;
  name: string;
  creationDate: string; // ISO
  purchaseDate: string; // ISO
  lineItems: OrderLineItem[];
  isDraft?: boolean;
  source?: OrderSource;
  originalEmailHash?: string;
}

export enum OrderSource {
  MANUAL = 'MANUAL',
  EMAIL = 'EMAIL',
  API = 'API'
}
