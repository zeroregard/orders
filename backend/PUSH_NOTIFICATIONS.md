# 📱 Push Notifications Implementation

This document describes the backend push notification system that sends notifications to all app users when a new Order is created.

## 🏗️ Architecture

The push notification system consists of:

1. **VAPID Key Management** - Server identification for push services
2. **Subscription Storage** - Database storage for client push subscriptions
3. **Notification Service** - Core service for sending push notifications
4. **API Endpoints** - RESTful endpoints for managing subscriptions
5. **Order Integration** - Automatic notifications on order creation

## 📋 Features

- ✅ **VAPID Key Generation** - Automatic generation and management of VAPID keys
- ✅ **Subscription Management** - Store and manage push subscriptions in database
- ✅ **Automatic Notifications** - Send notifications when new orders are created
- ✅ **Error Handling** - Graceful handling of failed notifications and cleanup of invalid subscriptions
- ✅ **Test Endpoints** - Developer-friendly testing endpoints
- ✅ **OpenAPI Documentation** - Complete Swagger documentation

## 🗄️ Database Schema

### PushSubscription Model

```prisma
model PushSubscription {
  id        String   @id @default(uuid())
  endpoint  String   @unique
  p256dh    String   // public key
  auth      String   // auth secret
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("push_subscriptions")
}
```

## 🚀 API Endpoints

### Get VAPID Public Key
```http
GET /api/push/vapid-key
```
Returns the VAPID public key needed for client-side subscription.

### Subscribe to Notifications
```http
POST /api/push/subscribe
Content-Type: application/json

{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "BHVd8w...",
    "auth": "xyz123..."
  }
}
```

### Unsubscribe from Notifications
```http
POST /api/push/unsubscribe
Content-Type: application/json

{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

### Send Test Notification
```http
POST /api/push/test
Content-Type: application/json

{
  "title": "Test Notification",
  "body": "This is a test message"
}
```

## 🔧 Environment Variables

For production deployment, set these environment variables:

```bash
# VAPID Keys (generate once and store securely)
VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here

# Contact email for VAPID
VAPID_EMAIL=your-email@example.com
```

## 🔑 VAPID Key Generation

VAPID keys are automatically generated on first run if not provided via environment variables. 

**Production Setup:**
1. Run the server locally once to generate keys
2. Copy the generated keys from console output
3. Set them as environment variables in your production environment
4. Restart the server

## 📱 Notification Flow

### When a New Order is Created:

1. **Order Creation** - User creates an order via `POST /api/orders`
2. **Database Storage** - Order is saved to database
3. **Notification Trigger** - `pushNotificationService.sendNewOrderNotification()` is called
4. **Subscription Retrieval** - All stored push subscriptions are fetched
5. **Notification Sending** - Push notifications are sent to all subscribers
6. **Error Handling** - Invalid subscriptions are automatically cleaned up

### Notification Payload:

```json
{
  "title": "📦 New Order Created!",
  "body": "Order \"Weekly Grocery Order\" with 3 item(s) has been created.",
  "icon": "/icons/icon-192x192.png",
  "badge": "/icons/badge-72x72.png",
  "data": {
    "type": "new-order",
    "orderId": "order-uuid-here",
    "url": "/orders/order-uuid-here"
  }
}
```

## 🧪 Testing

### Using the Test Script:
```bash
# Install axios for testing
npm install axios

# Run the test script
node test-push-notifications.js
```

### Manual Testing with curl:
```bash
# Get VAPID public key
curl http://localhost:3001/api/push/vapid-key

# Subscribe to notifications
curl -X POST http://localhost:3001/api/push/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/fcm/send/test-endpoint",
    "keys": {
      "p256dh": "BHVd8wAyJaJ8TmDyqJFJqYa9Z1234567890abcdef",
      "auth": "xyz123auth-secret-key"
    }
  }'

# Send test notification
curl -X POST http://localhost:3001/api/push/test \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "body": "Test notification"}'
```

## 🔧 Service Architecture

### PushNotificationService Class

**Key Methods:**
- `getPublicVapidKey()` - Get VAPID public key for clients
- `subscribe(subscriptionData)` - Save push subscription to database
- `unsubscribe(endpoint)` - Remove push subscription from database
- `sendNotificationToAll(payload)` - Send notification to all subscribers
- `sendNewOrderNotification(orderData)` - Send order-specific notification

**Error Handling:**
- Invalid subscriptions (410 Gone, 404 Not Found) are automatically removed
- Notification failures don't affect order creation process
- Comprehensive logging for debugging

## 🚀 Frontend Integration

To integrate with a frontend application:

1. **Request Notification Permission**
```javascript
const permission = await Notification.requestPermission();
```

2. **Get VAPID Public Key**
```javascript
const response = await fetch('/api/push/vapid-key');
const { publicKey } = await response.json();
```

3. **Subscribe to Push Notifications**
```javascript
const registration = await navigator.serviceWorker.register('/sw.js');
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: publicKey
});

await fetch('/api/push/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(subscription)
});
```

4. **Handle Push Events in Service Worker** (`sw.js`)
```javascript
self.addEventListener('push', event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: data.data
  });
});
```

## 📊 Production Considerations

### Performance
- Notifications are sent asynchronously to avoid blocking order creation
- Failed notifications are logged but don't affect the main flow
- Automatic cleanup of invalid subscriptions

### Security
- VAPID keys should be stored securely in environment variables
- Consider rate limiting on subscription endpoints
- Validate subscription data before storing

### Scalability
- For high-volume applications, consider using a queue system (Redis, Bull)
- Batch notifications for better performance
- Monitor notification delivery rates

### Monitoring
- Log notification success/failure rates
- Track subscription counts
- Monitor for unusual subscription patterns

## 🔄 Deployment

1. **Database Migration**
```bash
npx prisma migrate deploy
```

2. **Environment Variables** - Set VAPID keys in production

3. **Build and Deploy**
```bash
pnpm build
pnpm start
```

4. **Verify** - Check that VAPID keys are properly configured and notifications work

## 📚 Resources

- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [VAPID Specification](https://tools.ietf.org/html/rfc8292)
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) 