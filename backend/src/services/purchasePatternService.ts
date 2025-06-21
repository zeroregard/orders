import { prisma } from './database';
import { pushNotificationService } from './pushNotificationService';
import { Order, OrderLineItem, Product } from '@prisma/client';

interface CreatePatternFromOrdersParams {
  userId: string;
  productId: string;
}

interface ScheduleNotificationParams {
  patternId: string;
  userId: string;
  productId: string;
  intervalDays: number;
  notifyDaysBefore: number;
}

interface OrderWithLineItems extends Order {
  lineItems: (OrderLineItem & { product: Product })[];
}

interface PurchasePattern {
  id: string;
  user_id: string;
  product_id: string;
  interval_days: number;
  notify: boolean;
  notify_days_before: number;
  created_at: Date;
  updated_at: Date;
}

export class PurchasePatternService {
  /**
   * Automatically creates a purchase pattern when a user has 2+ orders with the same product
   */
  async createPatternFromOrders({ userId, productId }: CreatePatternFromOrdersParams) {
    try {
      // Check if pattern already exists
      const existingPattern = await prisma.$queryRaw<PurchasePattern[]>`
        SELECT * FROM purchase_patterns 
        WHERE user_id = ${userId} AND product_id = ${productId}
      `;

      if (existingPattern && existingPattern.length > 0) {
        return existingPattern[0]; // Pattern already exists, don't create a new one
      }

      // Get orders for this user and product, ordered by purchase date
      const orders = await prisma.$queryRaw<Order[]>`
        SELECT o.* FROM orders o
        JOIN order_line_items oli ON o.id = oli.order_id
        WHERE o.user_id = ${userId} AND oli.product_id = ${productId}
        ORDER BY o.purchase_date DESC
        LIMIT 2
      `;

      // Need at least 2 orders to calculate interval
      if (orders.length < 2) {
        return null;
      }

      // Calculate interval between the two most recent orders
      const [mostRecent, secondMostRecent] = orders;
      const intervalMs = mostRecent.purchaseDate.getTime() - secondMostRecent.purchaseDate.getTime();
      const intervalDays = Math.round(intervalMs / (1000 * 60 * 60 * 24));

      // Create the purchase pattern
      const pattern = await prisma.$queryRaw<PurchasePattern[]>`
        INSERT INTO purchase_patterns (id, user_id, product_id, interval_days, notify, notify_days_before, created_at, updated_at)
        VALUES (gen_random_uuid(), ${userId}, ${productId}, ${intervalDays}, true, 3, NOW(), NOW())
        RETURNING *
      `;

      // Schedule push notification
      await this.scheduleNotification({
        patternId: pattern[0].id,
        userId,
        productId,
        intervalDays,
        notifyDaysBefore: 3
      });

      console.log(`📊 Created purchase pattern for user ${userId} and product ${productId} with ${intervalDays} day interval`);
      return pattern[0];

    } catch (error) {
      console.error('Error creating purchase pattern from orders:', error);
      throw error;
    }
  }

  /**
   * Schedules a push notification for a purchase pattern
   */
  async scheduleNotification({ patternId, userId, productId, intervalDays, notifyDaysBefore }: ScheduleNotificationParams) {
    try {
      // Get the most recent order for this user and product
      const mostRecentOrder = await prisma.$queryRaw<OrderWithLineItems[]>`
        SELECT o.*, 
          json_agg(json_build_object(
            'id', oli.id,
            'quantity', oli.quantity,
            'productId', oli.product_id,
            'product', json_build_object(
              'id', p.id,
              'name', p.name
            )
          )) as "lineItems"
        FROM orders o
        JOIN order_line_items oli ON o.id = oli.order_id
        JOIN products p ON oli.product_id = p.id
        WHERE o.user_id = ${userId} AND oli.product_id = ${productId}
        GROUP BY o.id
        ORDER BY o.purchase_date DESC
        LIMIT 1
      `;

      if (!mostRecentOrder || mostRecentOrder.length === 0) {
        console.warn(`No orders found for user ${userId} and product ${productId}`);
        return;
      }

      const order = mostRecentOrder[0];

      // Calculate next notification date: lastPurchaseDate + intervalDays - notifyDaysBefore
      const nextPurchaseDate = new Date(order.purchaseDate);
      nextPurchaseDate.setDate(nextPurchaseDate.getDate() + intervalDays);
      
      const notificationDate = new Date(nextPurchaseDate);
      notificationDate.setDate(notificationDate.getDate() - notifyDaysBefore);

      // Only schedule if the notification date is in the future
      if (notificationDate > new Date()) {
        const product = order.lineItems[0]?.product;
        if (product) {
          // For now, we'll just log the scheduled notification
          // In a real implementation, you'd use a job queue like Bull or Agenda
          console.log(`📅 Scheduled notification for pattern ${patternId} on ${notificationDate.toISOString()} for product: ${product.name}`);
          
          // Here you would typically:
          // 1. Store the scheduled notification in a job queue
          // 2. Set up a cron job or scheduler to send the notification
          // 3. Send a push notification when the time comes
          
          // For demonstration, we'll prepare the notification data
          const notificationData = {
            patternId,
            userId,
            productId,
            productName: product.name,
            scheduledFor: notificationDate,
            message: `Time to reorder ${product.name}! Based on your pattern, you usually purchase this every ${intervalDays} days.`
          };
          
          console.log('📱 Notification data prepared:', notificationData);
        }
      } else {
        console.log(`⏰ Notification date ${notificationDate.toISOString()} is in the past, not scheduling`);
      }

    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Gets the next predicted purchase date for a pattern
   */
  async getNextPurchaseDate(patternId: string): Promise<Date | null> {
    try {
      const pattern = await prisma.$queryRaw<PurchasePattern[]>`
        SELECT * FROM purchase_patterns WHERE id = ${patternId}
      `;

      if (!pattern || pattern.length === 0) {
        return null;
      }

      // Get the most recent order for this user and product
      const mostRecentOrder = await prisma.$queryRaw<Order[]>`
        SELECT o.* FROM orders o
        JOIN order_line_items oli ON o.id = oli.order_id
        WHERE o.user_id = ${pattern[0].user_id} AND oli.product_id = ${pattern[0].product_id}
        ORDER BY o.purchase_date DESC
        LIMIT 1
      `;

      if (!mostRecentOrder || mostRecentOrder.length === 0) {
        return null;
      }

      // Calculate next purchase date
      const nextPurchaseDate = new Date(mostRecentOrder[0].purchaseDate);
      nextPurchaseDate.setDate(nextPurchaseDate.getDate() + pattern[0].interval_days);

      return nextPurchaseDate;
    } catch (error) {
      console.error('Error getting next purchase date:', error);
      return null;
    }
  }
}

export const purchasePatternService = new PurchasePatternService(); 