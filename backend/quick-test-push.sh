#!/bin/bash

echo "🧪 Quick Push Notification API Test"
echo "====================================="

BASE_URL="http://localhost:3001/api"

# Test 1: Get VAPID public key
echo "1. Testing VAPID public key endpoint..."
curl -s "${BASE_URL}/push/vapid-key" | jq . || echo "Response received (jq not available)"
echo ""

# Test 2: Subscribe to push notifications
echo "2. Testing subscription endpoint..."
curl -s -X POST "${BASE_URL}/push/subscribe" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/fcm/send/test-endpoint-'$(date +%s)'",
    "keys": {
      "p256dh": "BHVd8wAyJaJ8TmDyqJFJqYa9Z1234567890abcdef",
      "auth": "xyz123auth-secret-key"
    }
  }' | jq . || echo "Response received (jq not available)"
echo ""

# Test 3: Send test notification
echo "3. Testing notification sending..."
curl -s -X POST "${BASE_URL}/push/test" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test from Script",
    "body": "This is a test push notification from curl script"
  }' | jq . || echo "Response received (jq not available)"
echo ""

echo "✅ All tests completed!"
echo "💡 Make sure your server is running on port 3001"
echo "💡 Run: pnpm dev" 