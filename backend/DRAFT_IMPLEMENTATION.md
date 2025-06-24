# Draft Order and Product Implementation

## Overview

This document describes the implementation of the draft functionality for orders and products in the auto-order system. This feature is designed to support the email-based order parsing system where a bot will parse receipts and create draft entities that can be reviewed and approved by users.

## Database Schema Changes

### Orders Table

Added the following fields to the `Order` model:

- `isDraft` (Boolean, default: true) - Indicates if the order is a draft
- `source` (OrderSource enum, default: 'MANUAL') - Source of the order
- `originalEmailHash` (String, optional) - Hash of the original email for deduplication

### Products Table

Added the following field to the `Product` model:

- `isDraft` (Boolean, default: false) - Indicates if the product is a draft

### New Models

#### EmailProcessingLog

Tracks email processing for deduplication and monitoring:

```typescript
model EmailProcessingLog {
  id           String           @id @default(uuid())
  emailHash    String           @unique
  senderEmail  String
  subject      String?
  rawContent   String
  status       ProcessingStatus
  errorMessage String?
  orderId      String?
  processedAt  DateTime?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}
```

#### Enums

```typescript
enum OrderSource {
  MANUAL
  EMAIL
  API
}

enum ProcessingStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  DUPLICATE
}
```

## API Endpoints

### Order Endpoints

#### GET /api/orders
Enhanced with query parameters:
- `includeDrafts` (boolean, default: true) - Whether to include draft orders
- `draftsOnly` (boolean, default: false) - Whether to return only draft orders

#### POST /api/orders
Enhanced to support draft creation:
- `isDraft` (boolean, optional) - Create as draft order
- `source` (string, optional) - Source of the order
- `originalEmailHash` (string, optional) - Email hash for deduplication

#### GET /api/orders/drafts
Returns all draft orders with their line items and products.

#### POST /api/orders/:id/approve
Converts a draft order to a regular order. Also converts any draft products used in the order to regular products.

#### DELETE /api/orders/:id/draft
Deletes a draft order (only works if the order is actually a draft).

#### PUT /api/orders/:id/draft
Updates a draft order. Can create new draft products on-the-fly if `productName` is provided without `productId`.

### Product Endpoints

#### GET /api/products
Enhanced with query parameters:
- `includeDrafts` (boolean, default: true) - Whether to include draft products
- `draftsOnly` (boolean, default: false) - Whether to return only draft products

#### POST /api/products
Enhanced to support draft creation:
- `isDraft` (boolean, optional) - Create as draft product

## Draft Workflow

### Email Processing Flow

1. **Email Received**: Email is received and hash is generated for deduplication
2. **LLM Processing**: Email content is parsed using LLM to extract order information
3. **Product Matching**: System attempts to match parsed items to existing products
4. **Draft Creation**: Creates draft order with draft products for unmatched items
5. **User Review**: User reviews draft order and can modify it
6. **Approval**: User approves draft, converting order and products to regular status

### Draft Order States

- **Draft**: Order is in draft state, can be edited or deleted
- **Approved**: Order is converted to regular order, becomes part of purchase history

### Draft Product States

- **Draft**: Product is in draft state, created from email parsing
- **Approved**: Product is converted to regular product when parent order is approved

## Business Logic

### Draft Product Creation

When processing draft orders, products are created as drafts if:
1. Product name is provided but no matching product ID
2. The order itself is a draft order
3. The product is being created during email processing

### Draft Product Approval

When a draft order is approved:
1. All draft products used in the order are converted to regular products
2. The order itself is converted to a regular order
3. This ensures data consistency and prevents orphaned draft products

### Deduplication

Email processing uses SHA-256 hash of email content to prevent duplicate processing:
1. Hash is generated from email content
2. Hash is checked against `EmailProcessingLog`
3. If hash exists, processing is skipped with `DUPLICATE` status

## Example Usage

### Creating a Draft Order via API

```json
POST /api/orders
{
  "name": "Email Receipt - Grocery Store",
  "creationDate": "2024-06-23",
  "purchaseDate": "2024-06-23",
  "isDraft": true,
  "source": "EMAIL",
  "originalEmailHash": "abc123...",
  "lineItems": [
    {
      "productName": "Coffee Beans",
      "quantity": 2
    }
  ]
}
```

### Approving a Draft Order

```json
POST /api/orders/{orderId}/approve
```

### Querying Draft Orders Only

```
GET /api/orders?draftsOnly=true
```

### Querying Products Excluding Drafts

```
GET /api/products?includeDrafts=false
```

## Testing

Test data can be created using the provided script:

```bash
npx ts-node scripts/create-test-draft-order.ts
```

This creates:
- Two draft products
- One draft order with the draft products
- One regular order with a regular product

## Migration Notes

Existing orders and products are automatically set to non-draft status:
- Existing orders: `isDraft: false`, `source: 'MANUAL'`
- Existing products: `isDraft: false`

This ensures backward compatibility with existing data.

## Security Considerations

1. **Email Validation**: Only emails from whitelisted senders are processed
2. **Draft Cleanup**: Consider implementing cleanup for old draft orders
3. **User Permissions**: Ensure users can only access their own draft orders (when user authentication is implemented)

## Future Enhancements

1. **Batch Processing**: Support for processing multiple emails in batches
2. **Smart Matching**: Improved product matching using fuzzy matching
3. **Auto-Approval**: Rules for automatically approving certain types of orders
4. **Draft Expiration**: Automatic cleanup of old draft orders
5. **Audit Trail**: Track all changes to draft orders for compliance

## Monitoring

Key metrics to monitor:
- Draft order creation rate
- Draft approval rate
- Draft product creation rate
- Email processing success rate
- Average time from draft creation to approval 