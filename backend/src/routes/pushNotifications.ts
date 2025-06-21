import { Router } from 'express';
import { pushNotificationService, PushSubscriptionData } from '../services/pushNotificationService';

const router = Router();

/**
 * @swagger
 * /api/push/vapid-key:
 *   get:
 *     summary: Get VAPID public key
 *     tags: [Push Notifications]
 *     description: Returns the VAPID public key needed for client-side push notification subscription
 *     responses:
 *       200:
 *         description: VAPID public key retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publicKey:
 *                   type: string
 *                   description: VAPID public key for client-side subscription
 *               example:
 *                 publicKey: "BFbSfAHU7gK8uJb9mXWtQCJ..."
 */
router.get('/vapid-key', (req, res) => {
  try {
    const publicKey = pushNotificationService.getPublicVapidKey();
    res.json({ publicKey });
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    res.status(500).json({ error: 'Failed to get VAPID public key' });
  }
});

/**
 * @swagger
 * /api/push/subscribe:
 *   post:
 *     summary: Subscribe to push notifications
 *     tags: [Push Notifications]
 *     description: Save a push subscription for the client to receive notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endpoint
 *               - keys
 *             properties:
 *               endpoint:
 *                 type: string
 *                 description: Push service endpoint URL
 *               keys:
 *                 type: object
 *                 required:
 *                   - p256dh
 *                   - auth
 *                 properties:
 *                   p256dh:
 *                     type: string
 *                     description: P256DH public key
 *                   auth:
 *                     type: string
 *                     description: Authentication secret
 *           example:
 *             endpoint: "https://fcm.googleapis.com/fcm/send/..."
 *             keys:
 *               p256dh: "BHVd8w..."
 *               auth: "xyz123..."
 *     responses:
 *       200:
 *         description: Subscription saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Subscription saved successfully"
 *       400:
 *         description: Invalid subscription data
 *       500:
 *         description: Internal server error
 */
router.post('/subscribe', async (req, res) => {
  try {
    const subscriptionData: PushSubscriptionData = req.body;

    // Validate required fields
    if (!subscriptionData.endpoint || !subscriptionData.keys?.p256dh || !subscriptionData.keys?.auth) {
      return res.status(400).json({ 
        error: 'Missing required fields: endpoint, keys.p256dh, and keys.auth are required' 
      });
    }

    await pushNotificationService.subscribe(subscriptionData);
    
    res.json({ message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

/**
 * @swagger
 * /api/push/unsubscribe:
 *   post:
 *     summary: Unsubscribe from push notifications
 *     tags: [Push Notifications]
 *     description: Remove a push subscription to stop receiving notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endpoint
 *             properties:
 *               endpoint:
 *                 type: string
 *                 description: Push service endpoint URL to remove
 *           example:
 *             endpoint: "https://fcm.googleapis.com/fcm/send/..."
 *     responses:
 *       200:
 *         description: Subscription removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Subscription removed successfully"
 *       400:
 *         description: Missing endpoint
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    await pushNotificationService.unsubscribe(endpoint);
    
    res.json({ message: 'Subscription removed successfully' });
  } catch (error: any) {
    console.error('Error removing push subscription:', error);
    
    if (error.code === 'P2002') {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
});

/**
 * @swagger
 * /api/push/test:
 *   post:
 *     summary: Send test notification
 *     tags: [Push Notifications]
 *     description: Send a test push notification to all subscribers (for development/testing)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 default: "Test Notification"
 *               body:
 *                 type: string
 *                 default: "This is a test push notification"
 *           example:
 *             title: "Test Notification"
 *             body: "This is a test push notification"
 *     responses:
 *       200:
 *         description: Test notification sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 *                   properties:
 *                     sent:
 *                       type: number
 *                     failed:
 *                       type: number
 *                     total:
 *                       type: number
 *               example:
 *                 message: "Test notification sent"
 *                 results:
 *                   sent: 3
 *                   failed: 0
 *                   total: 3
 *       500:
 *         description: Failed to send test notification
 */
router.post('/test', async (req, res) => {
  try {
    const { title = 'Test Notification', body = 'This is a test push notification' } = req.body;

    const results = await pushNotificationService.sendNotificationToAll({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    });

    res.json({
      message: 'Test notification sent',
      results,
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

export default router; 