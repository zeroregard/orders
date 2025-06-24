export interface EmailProcessingLog {
  id: string;
  emailHash: string;
  senderEmail: string;
  subject?: string;
  rawContent: string;
  status: ProcessingStatus;
  errorMessage?: string;
  orderId?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DUPLICATE = 'DUPLICATE'
} 