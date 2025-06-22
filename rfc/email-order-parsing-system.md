# RFC: Email-Based Order Parsing System

**Status:** Accepted  
**Author:** Auto-Order Team  
**Created:** January 2025  
**Last Updated:** January 2025  
**Approved:** January 2025  

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Background](#background)
3. [Requirements](#requirements)
4. [System Architecture](#system-architecture)
5. [Implementation Plan](#implementation-plan)
6. [Database Schema Changes](#database-schema-changes)
7. [API Endpoints](#api-endpoints)
8. [Email Service Integration](#email-service-integration)
9. [LLM Integration](#llm-integration)
10. [Cost Analysis](#cost-analysis)
11. [Security Considerations](#security-considerations)
12. [Testing Strategy](#testing-strategy)
13. [Rollout Plan](#rollout-plan)
14. [Future Considerations](#future-considerations)
15. [Appendix](#appendix)

## Executive Summary

This RFC proposes implementing an email-based order parsing system that automatically processes receipt emails forwarded to a dedicated email address. The system will use Large Language Models (LLMs) to extract order information, match products to existing inventory, create new products when necessary, and generate draft orders for user review.

**Key Benefits:**
- Automates receipt processing from multiple sources
- Reduces manual data entry
- Maintains data integrity through draft approval workflow
- Leverages AI for intelligent product matching and creation

**Key Components:**
- Email ingestion service
- LLM-powered parsing engine
- Product matching and creation logic
- Draft order management system
- Deduplication mechanism

## Background

Currently, users must manually create orders and add products through the web interface. This proposal aims to streamline the process by allowing users to forward receipt emails to a dedicated address, which will automatically parse the content and create draft orders.

### Current System Analysis

**Existing Models:**
- `Order`: Contains order metadata and line items
- `Product`: Product catalog with name, description, price, and icons
- `OrderLineItem`: Links orders to products with quantities
- `PurchasePattern`: Tracks purchase patterns for predictions

**Current Limitations:**
- Manual order entry is time-consuming
- No automated receipt processing
- Product creation requires manual intervention

## Requirements

### Functional Requirements

1. **Email Ingestion**
   - Accept emails from specific sender addresses only:
     - ajprameswari@gmail.com
     - mathiasxaj@gmail.com
     - mathiassiig@gmail.com
     - mathias_sn@hotmail.com
   - Process various email formats (HTML, plain text, with attachments)
   - Extract receipt content from email body and attachments

2. **Order Parsing**
   - Extract order information (date, store, items, quantities, prices)
   - Handle various receipt formats and layouts
   - Support multiple languages (initially English)

3. **Product Management**
   - Match parsed items to existing products using LLM
   - Create new products when no match is found
   - Handle product variations and similar names

4. **Draft Order System**
   - Create orders in "draft" status by default
   - Allow users to review and approve drafts
   - Convert existing orders to non-draft (isDraft: false)

5. **Deduplication**
   - Use email content hash as unique identifier
   - Prevent processing of duplicate emails
   - Handle forwarded emails and email chains

### Non-Functional Requirements

1. **Performance**
   - Process emails within 5 minutes of receipt
   - Support up to 100 emails per day initially
   - 99% uptime for email processing service

2. **Security**
   - Validate sender addresses
   - Secure email content storage
   - Audit trail for all actions

3. **Cost Efficiency**
   - Optimize LLM token usage
   - Use most cost-effective providers
   - Implement smart caching

## System Architecture

### High-Level Architecture

```
Email Provider → Email Webhook → Processing Service → LLM API → Database
     ↓               ↓                ↓               ↓         ↓
Mailgun/Railway  Railway Function  Email Storage  Gemini    PostgreSQL
```

### Component Breakdown

1. **Email Ingestion Service**
   - Webhook endpoint for email receipt
   - Email validation and security checks
   - Content extraction and preprocessing

2. **Processing Engine**
   - Orchestrates the entire parsing workflow
   - Handles errors and retries
   - Maintains processing state

3. **LLM Service**
   - Interfaces with Google Gemini Flash 2.0
   - Handles prompt engineering and response parsing
   - Manages token usage and costs

4. **Product Service**
   - Handles product matching logic
   - Creates new products when needed
   - Manages product variations

5. **Order Service**
   - Creates draft orders
   - Handles order approval workflow
   - Manages order state transitions

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1-2)

1. **Database Schema Updates**
   - Add `isDraft` field to Order model (default: true)
   - Create `EmailProcessingLog` table
   - Add `source` and `originalEmailHash` fields to Order
   - Migrate existing orders to isDraft: false

2. **Email Service Integration**
   - Set up Mailgun with Railway webhook
   - Create webhook endpoint
   - Implement basic email parsing

3. **Basic Processing Pipeline**
   - Create email processing job queue
   - Implement deduplication logic
   - Set up error handling and logging

### Phase 2: LLM Integration (Week 3-4)

1. **LLM Provider Setup**
   - Implement Google Gemini Flash 2.0 integration
   - Create prompt templates for order parsing
   - Implement response validation

2. **Product Matching Engine**
   - Implement LLM-based product matching
   - Create product similarity scoring
   - Handle product creation workflow

3. **Draft Order System**
   - Extend order creation to support draft status
   - Create approval workflow API endpoints
   - Update frontend to handle draft orders

### Phase 3: Polish and Optimization (Week 5-6)

1. **Error Handling and Recovery**
   - Implement retry mechanisms
   - Add manual review queue for failed parses
   - Create admin dashboard for monitoring

2. **Testing and Validation**
   - Create comprehensive test suite
   - Perform end-to-end testing
   - Validate with real receipt data

3. **Documentation and Deployment**
   - Create user documentation
   - Deploy to production environment
   - Monitor initial usage

## Database Schema Changes

### New Models

```typescript
// New model for tracking email processing
model EmailProcessingLog {
  id          String   @id @default(uuid())
  emailHash   String   @unique
  senderEmail String
  subject     String?
  rawContent  String
  status      ProcessingStatus
  errorMessage String?
  orderId     String?
  processedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("email_processing_logs")
}

enum ProcessingStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  DUPLICATE
}
```

### Modified Models

```typescript
// Add draft support to existing Order model
model Order {
  id           String          @id @default(uuid())
  name         String
  creationDate DateTime
  purchaseDate DateTime
  userId       String?
  isDraft      Boolean         @default(true)  // NEW FIELD
  source       OrderSource     @default(MANUAL) // NEW FIELD
  originalEmailHash String?    // NEW FIELD
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  lineItems    OrderLineItem[]

  @@map("orders")
}

enum OrderSource {
  MANUAL
  EMAIL
  API
}
```

### Migration Script

```sql
-- Add new fields to orders table
ALTER TABLE orders ADD COLUMN "isDraft" BOOLEAN DEFAULT true;
ALTER TABLE orders ADD COLUMN "source" TEXT DEFAULT 'MANUAL';
ALTER TABLE orders ADD COLUMN "originalEmailHash" TEXT;

-- Set existing orders to non-draft
UPDATE orders SET "isDraft" = false WHERE "createdAt" < NOW();

-- Create email processing logs table
CREATE TABLE email_processing_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "emailHash" TEXT UNIQUE NOT NULL,
  "senderEmail" TEXT NOT NULL,
  subject TEXT,
  "rawContent" TEXT NOT NULL,
  status TEXT NOT NULL,
  "errorMessage" TEXT,
  "orderId" TEXT,
  "processedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### New Endpoints

```typescript
// Email webhook endpoint
POST /api/webhooks/email
// Processes incoming emails from Mailgun

// Draft order management
GET /api/orders/drafts
// Returns all draft orders for the user

POST /api/orders/:id/approve
// Converts a draft order to a regular order

DELETE /api/orders/:id/draft
// Deletes a draft order

PUT /api/orders/:id/draft
// Updates a draft order

// Email processing status
GET /api/email-processing/:hash
// Returns processing status for an email

POST /api/email-processing/:hash/retry
// Retries processing for a failed email
```

### Modified Endpoints

```typescript
// Update existing order endpoints to handle drafts
GET /api/orders
// Add query parameter: ?includeDrafts=true&draftsOnly=false

POST /api/orders
// Add optional isDraft parameter (default: false for manual orders)
```

## Email Service Integration

### Recommended Approach: Railway + Mailgun

**Setup Process:**

1. **Mailgun Configuration**
   ```
   Domain: orders.yourdomain.com
   Route: Match recipient "receipts@orders.yourdomain.com"
   Action: Forward to webhook https://your-railway-app.railway.app/api/webhooks/email
   ```

2. **Railway Webhook Implementation**
   ```typescript
   // backend/src/routes/webhooks/email.ts
   import { Router } from 'express';
   import crypto from 'crypto';
   
   const router = Router();
   
   router.post('/email', async (req, res) => {
     // Verify Mailgun signature
     const signature = crypto
       .createHmac('sha256', process.env.MAILGUN_WEBHOOK_SECRET!)
       .update(req.body.timestamp + req.body.token)
       .digest('hex');
   
     if (signature !== req.body.signature) {
       return res.status(401).json({ error: 'Invalid signature' });
     }
   
     // Check sender whitelist
     const allowedSenders = [
       'ajprameswari@gmail.com',
       'mathiasxaj@gmail.com', 
       'mathiassiig@gmail.com',
       'mathias_sn@hotmail.com'
     ];
   
     if (!allowedSenders.includes(req.body.sender)) {
       return res.status(403).json({ error: 'Sender not allowed' });
     }
   
     // Queue email for processing
     await queueEmailProcessing(req.body);
     
     res.status(200).json({ status: 'queued' });
   });
   ```

3. **Cost Breakdown**
   - Mailgun: $0-35/month (0-50K emails)
   - Railway: $5-20/month (based on usage)
   - Total: $5-55/month

## LLM Integration

### Provider Selection: Google Gemini Flash 2.0

**Cost Analysis:**
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens  
- Context window: 1M tokens
- **Most cost-effective option** (50-75% cheaper than alternatives)

**Estimated Costs:**
- Average receipt: ~1,000 input tokens, ~200 output tokens
- Cost per receipt: ~$0.00015
- 100 receipts/day: ~$0.015/day (~$5.50/year)

### Prompt Engineering

```typescript
const RECEIPT_PARSING_PROMPT = `
You are an AI assistant that extracts order information from receipts. 
Analyze the following receipt content and extract structured data.

INSTRUCTIONS:
1. Extract all purchased items with quantities and prices
2. Identify the store/merchant name
3. Extract the purchase date
4. Return data in the specified JSON format
5. For product matching, consider existing products and suggest matches
6. If unsure about a match, suggest creating a new product

EXISTING PRODUCTS (for matching):
${JSON.stringify(existingProducts, null, 2)}

RECEIPT CONTENT:
${receiptContent}

REQUIRED OUTPUT FORMAT:
{
  "merchantName": "Store Name",
  "purchaseDate": "YYYY-MM-DD",
  "items": [
    {
      "description": "Product description as shown on receipt",
      "quantity": number,
      "unitPrice": number,
      "totalPrice": number,
      "suggestedProductMatch": "existing-product-id or null",
      "matchConfidence": 0.0-1.0,
      "suggestedNewProduct": {
        "name": "Cleaned product name",
        "description": "Product description"
      }
    }
  ],
  "subtotal": number,
  "tax": number,
  "total": number,
  "currency": "USD"
}

Respond ONLY with valid JSON. No additional text.
`;
```

### Implementation

```typescript
// backend/src/services/llmService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export class LLMService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  }

  async parseReceipt(emailContent: string, existingProducts: Product[]): Promise<ParsedReceipt> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = RECEIPT_PARSING_PROMPT
      .replace('${existingProducts}', JSON.stringify(existingProducts, null, 2))
      .replace('${receiptContent}', emailContent);

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error(`Invalid JSON response from LLM: ${response}`);
    }
  }
}
```

## Cost Analysis

### Initial Setup Costs
- Mailgun account setup: $0
- Railway hosting setup: $0
- Google AI API setup: $0
- Development time: ~3-4 weeks

### Monthly Operational Costs (100 emails/day)

| Component | Cost | Notes |
|-----------|------|-------|
| Mailgun | $0-35/month | Free tier: 5K emails |
| Railway Functions | $5-20/month | Based on execution time |
| Google Gemini API | $0.45/month | ~$5.50/year |
| **Total** | **$5-55/month** | Scales with volume |

### Cost Optimization Strategies

1. **Prompt Optimization**: Reduce token usage by 30-50%
2. **Product Caching**: Cache product lists, update daily
3. **Batch Processing**: Process multiple emails together
4. **Intelligent Routing**: Use simpler parsing for standard formats

## Security Considerations

### Email Security
- **Sender Validation**: Hardcoded allowlist of 4 email addresses
- **Signature Verification**: Validate Mailgun webhook signatures
- **Content Sanitization**: Strip HTML, validate content
- **Rate Limiting**: Max 10 emails per hour per sender

### Data Security
- **Email Storage**: Hash email content for deduplication
- **Encryption**: Encrypt stored email content
- **Access Control**: User-scoped data access
- **Audit Trail**: Log all processing activities

### Implementation

```typescript
// backend/src/middleware/emailSecurity.ts
const ALLOWED_SENDERS = [
  'ajprameswari@gmail.com',
  'mathiasxaj@gmail.com', 
  'mathiassiig@gmail.com',
  'mathias_sn@hotmail.com'
] as const;

export function validateEmailSender(senderEmail: string): boolean {
  return ALLOWED_SENDERS.includes(senderEmail as any);
}

export function generateEmailHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}
```

## Testing Strategy

### Test Data Requirements

1. **Sample Receipts**
   - Amazon order confirmations
   - Grocery store receipts
   - Restaurant receipts
   - Online shopping confirmations

2. **Edge Cases**
   - Receipts with unclear text
   - Multiple items with similar names
   - Foreign language receipts
   - Receipts with missing information

### Test Implementation

```typescript
// backend/src/tests/emailProcessing.test.ts
describe('Email Processing', () => {
  test('should parse Amazon receipt correctly', async () => {
    const sampleEmail = {
      sender: 'ajprameswari@gmail.com',
      body: 'Your Amazon order... Coffee Beans $12.99...'
    };
    
    const result = await processEmail(sampleEmail);
    
    expect(result.status).toBe('COMPLETED');
    expect(result.order.isDraft).toBe(true);
    expect(result.order.lineItems).toHaveLength(1);
  });

  test('should handle duplicate emails', async () => {
    const email = createSampleEmail();
    
    await processEmail(email);
    const result = await processEmail(email); // Duplicate
    
    expect(result.status).toBe('DUPLICATE');
  });
});
```

## Rollout Plan

### Phase 1: Internal Testing (Week 7)
- Deploy to staging environment
- Test with team members only
- Process 5-10 test emails
- Validate core functionality

### Phase 2: Limited Beta (Week 8)
- Invite 2-3 trusted users
- Process real receipts
- Monitor costs and performance
- Gather user feedback

### Phase 3: General Availability (Week 9)
- Full rollout to all users
- Create user documentation
- Monitor scaling and costs
- Provide user support

### Monitoring and Alerts

```typescript
// Key metrics to monitor
const MONITORING_METRICS = {
  emailProcessingRate: 'target: >95%',
  averageProcessingTime: 'target: <2 minutes', 
  llmAccuracy: 'target: >90%',
  userApprovalRate: 'target: >80%',
  costPerEmail: 'target: <$0.01'
};

// Alert thresholds
const ALERT_THRESHOLDS = {
  processingFailureRate: '>10%',
  processingTime: '>5 minutes',
  llmErrorRate: '>20%',
  dailyVolume: '>150 emails'
};
```

## Future Considerations

### Short-term Enhancements (3-6 months)
- **OCR Integration**: Process receipt images from photos
- **Mobile App**: Direct photo capture and processing  
- **Receipt Categories**: Automatic expense categorization
- **Multi-language Support**: Support for additional languages

### Long-term Vision (6-12 months)
- **Smart Predictions**: Predict future purchases based on patterns
- **Vendor API Integration**: Direct integration with major retailers
- **Advanced Analytics**: Shopping insights and recommendations
- **Budget Integration**: Link with personal budgeting features

### Scaling Considerations
- **Horizontal Scaling**: Multiple processing workers
- **Database Optimization**: Indexing and query optimization
- **CDN Integration**: Faster content delivery
- **Advanced Monitoring**: Real-time metrics and alerting

## Conclusion

This RFC outlines a comprehensive plan for implementing an email-based order parsing system that will significantly improve the user experience by automating receipt processing. The proposed solution balances functionality, cost-effectiveness, and security while providing a solid foundation for future enhancements.

**Key Success Metrics:**
- 95%+ email processing success rate
- <2 minute average processing time
- 90%+ LLM parsing accuracy
- 80%+ user approval rate for drafts
- <$0.01 cost per processed email

**Next Steps:**
1. Review and approve this RFC
2. Begin Phase 1 implementation
3. Set up monitoring and alerting
4. Create detailed user documentation
5. Plan beta testing program

---

*This RFC is a living document and will be updated as implementation progresses and requirements evolve.* 