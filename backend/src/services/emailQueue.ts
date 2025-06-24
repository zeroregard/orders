import { prisma } from './database';
import { receiptParsingService } from './receiptParsingService';

// Define ProcessingStatus enum locally since it's not exported from Prisma client
enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DUPLICATE = 'DUPLICATE'
}

export interface QueuedEmail {
  emailHash: string;
  senderEmail: string;
  subject: string;
  content: string;
  timestamp: string;
  rawData: any;
}

class EmailQueue {
  private processingQueue: QueuedEmail[] = [];
  private isProcessing = false;

  /**
   * Queue an email for processing
   */
  async queueEmail(email: QueuedEmail): Promise<void> {
    try {
      // Check if email already exists in processing log
      const existingLog = await prisma.emailProcessingLog.findUnique({
        where: { emailHash: email.emailHash }
      });

      if (existingLog) {
        console.log('📧 Email already processed:', email.emailHash);
        return;
      }

      // Create processing log entry
      await prisma.emailProcessingLog.create({
        data: {
          emailHash: email.emailHash,
          senderEmail: email.senderEmail,
          subject: email.subject,
          rawContent: email.content,
          status: ProcessingStatus.PENDING
        }
      });

      // Add to processing queue
      this.processingQueue.push(email);
      
      console.log('📧 Email queued for processing:', email.emailHash);
      
      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue();
      }
    } catch (error) {
      console.error('❌ Error queuing email:', error);
      throw error;
    }
  }

  /**
   * Process the email queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      while (this.processingQueue.length > 0) {
        const email = this.processingQueue.shift();
        if (email) {
          await this.processEmail(email);
        }
      }
    } catch (error) {
      console.error('❌ Error processing email queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single email
   */
  private async processEmail(email: QueuedEmail): Promise<void> {
    try {
      console.log('🔄 Processing email:', email.emailHash);
      
      // Update status to processing
      await prisma.emailProcessingLog.update({
        where: { emailHash: email.emailHash },
        data: { status: ProcessingStatus.PROCESSING }
      });

      // Parse receipt content using LLM
      const parsedReceipt = await receiptParsingService.parseReceipt(email.content);
      
      // Create draft order from parsed receipt
      const draftOrder = await receiptParsingService.createDraftOrder(
        parsedReceipt,
        email.emailHash,
        email.senderEmail
      );

      // Update processing log with success
      await prisma.emailProcessingLog.update({
        where: { emailHash: email.emailHash },
        data: {
          status: ProcessingStatus.COMPLETED,
          orderId: draftOrder.id,
          processedAt: new Date()
        }
      });

      console.log('✅ Email processed successfully:', email.emailHash, 'Order:', draftOrder.id);
    } catch (error: any) {
      console.error('❌ Error processing email:', email.emailHash, error);
      
      // Update processing log with error
      await prisma.emailProcessingLog.update({
        where: { emailHash: email.emailHash },
        data: {
          status: ProcessingStatus.FAILED,
          errorMessage: error.message || 'Unknown error',
          processedAt: new Date()
        }
      });
    }
  }

  /**
   * Get processing status for an email
   */
  async getProcessingStatus(emailHash: string) {
    return await prisma.emailProcessingLog.findUnique({
      where: { emailHash }
    });
  }

  /**
   * Retry processing a failed email
   */
  async retryProcessing(emailHash: string): Promise<void> {
    const log = await prisma.emailProcessingLog.findUnique({
      where: { emailHash }
    });

    if (!log) {
      throw new Error('Email processing log not found');
    }

    if (log.status !== ProcessingStatus.FAILED) {
      throw new Error('Email is not in failed state');
    }

    // Reset status and requeue
    await prisma.emailProcessingLog.update({
      where: { emailHash },
      data: { 
        status: ProcessingStatus.PENDING,
        errorMessage: null 
      }
    });

    // Reconstruct email object and requeue
    const email: QueuedEmail = {
      emailHash: log.emailHash,
      senderEmail: log.senderEmail,
      subject: log.subject || '',
      content: log.rawContent,
      timestamp: log.createdAt.toISOString(),
      rawData: {}
    };

    this.processingQueue.push(email);
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      queueLength: this.processingQueue.length,
      isProcessing: this.isProcessing
    };
  }
}

export const emailQueue = new EmailQueue(); 