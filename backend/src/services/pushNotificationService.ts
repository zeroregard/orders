import webpush from 'web-push';
import { prisma } from './database';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

class PushNotificationService {
  private vapidKeys: webpush.VapidKeys | null = null;

  constructor() {
    this.initializeVapidKeys();
  }

  private initializeVapidKeys() {
    // In production, you should store these keys securely (environment variables)
    // For development, we'll generate them once and store them
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (publicKey && privateKey) {
      this.vapidKeys = {
        publicKey,
        privateKey
      };
    } else {
      // Generate new VAPID keys if not provided
      this.vapidKeys = webpush.generateVAPIDKeys();
      console.log('🔑 Generated VAPID Keys:');
      console.log('Public Key:', this.vapidKeys.publicKey);
      console.log('Private Key:', this.vapidKeys.privateKey);
      console.log('⚠️  Store these keys in your environment variables for production!');
    }

    // Set VAPID details
    webpush.setVapidDetails(
      'mailto:your-email@example.com', // Contact email
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey
    );
  }

  /**
   * Get the public VAPID key for client-side subscription
   */
  getPublicVapidKey(): string {
    if (!this.vapidKeys) {
      throw new Error('VAPID keys not initialized');
    }
    return this.vapidKeys.publicKey;
  }

  /**
   * Save a push subscription to the database
   */
  async subscribe(subscriptionData: PushSubscriptionData): Promise<void> {
    try {
      await prisma.pushSubscription.upsert({
        where: {
          endpoint: subscriptionData.endpoint,
        },
        update: {
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
          updatedAt: new Date(),
        },
        create: {
          endpoint: subscriptionData.endpoint,
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
        },
      });
      console.log('✅ Push subscription saved successfully');
    } catch (error) {
      console.error('❌ Error saving push subscription:', error);
      throw error;
    }
  }

  /**
   * Remove a push subscription from the database
   */
  async unsubscribe(endpoint: string): Promise<void> {
    try {
      await prisma.pushSubscription.delete({
        where: {
          endpoint,
        },
      });
      console.log('✅ Push subscription removed successfully');
    } catch (error) {
      console.error('❌ Error removing push subscription:', error);
      throw error;
    }
  }

  /**
   * Send notification to a single subscription
   */
  private async sendNotificationToSubscription(
    subscription: { endpoint: string; p256dh: string; auth: string },
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      };

      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload)
      );
      return true;
    } catch (error: any) {
      console.error(`❌ Failed to send notification to ${subscription.endpoint}:`, error.message);
      
      // Remove invalid subscriptions (410 Gone or 404 Not Found)
      if (error.statusCode === 410 || error.statusCode === 404) {
        await this.unsubscribe(subscription.endpoint);
        console.log(`🧹 Cleaned up invalid subscription: ${subscription.endpoint}`);
      }
      return false;
    }
  }

  /**
   * Send notification to all subscribed users
   */
  async sendNotificationToAll(payload: NotificationPayload): Promise<{
    sent: number;
    failed: number;
    total: number;
  }> {
    try {
      const subscriptions = await prisma.pushSubscription.findMany();
      
      if (subscriptions.length === 0) {
        console.log('📭 No push subscriptions found');
        return { sent: 0, failed: 0, total: 0 };
      }

      console.log(`📤 Sending notification to ${subscriptions.length} subscribers...`);

      const results = await Promise.allSettled(
        subscriptions.map((subscription: any) =>
          this.sendNotificationToSubscription(subscription, payload)
        )
      );

      const sent = results.filter((result: any) => 
        result.status === 'fulfilled' && result.value === true
      ).length;
      const failed = results.length - sent;

      console.log(`📊 Notification results: ${sent} sent, ${failed} failed, ${subscriptions.length} total`);

      return {
        sent,
        failed,
        total: subscriptions.length,
      };
    } catch (error) {
      console.error('❌ Error sending notifications to all subscribers:', error);
      throw error;
    }
  }

  /**
   * Send a notification when a new order is created
   */
  async sendNewOrderNotification(orderData: {
    id: string;
    name: string;
    itemCount: number;
  }): Promise<void> {
    const payload: NotificationPayload = {
      title: '📦 New Order Created!',
      body: `Order "${orderData.name}" with ${orderData.itemCount} item(s) has been created.`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        type: 'new-order',
        orderId: orderData.id,
        url: `/orders/${orderData.id}`,
      },
    };

    await this.sendNotificationToAll(payload);
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService(); 