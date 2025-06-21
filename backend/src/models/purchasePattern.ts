export interface PurchasePattern {
  id: string;
  userId: string;
  productId: string;
  intervalDays: number;
  notify: boolean;
  notifyDaysBefore: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreatePurchasePatternRequest {
  productId: string;
  intervalDays: number;
  notify?: boolean;
  notifyDaysBefore?: number;
}

export interface UpdatePurchasePatternRequest {
  intervalDays?: number;
  notify?: boolean;
  notifyDaysBefore?: number;
} 