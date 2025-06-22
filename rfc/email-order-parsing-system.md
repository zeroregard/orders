# RFC: Email-Based Order Parsing System

**Status:** Draft  
**Author:** Auto-Order Team  
**Created:** January 2025  
**Last Updated:** January 2025  

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
   - Accept emails from specific sender addresses only
   - Process various email formats (HTML, plain text, with attachments)
   - Extract receipt content from email body and attachments

2. **Order Parsing**
   - Extract order information (date, store, items, quantities, prices)
   - Handle various receipt formats and layouts
   - Support multiple languages (initially English)

3. **Product Management**
   - Match parsed items to existing products
   - Create new products when no match is found
   - Handle product variations and similar names

4. **Draft Order System**
   - Create orders in "draft" status by default
   - Allow users to review and approve drafts
   - Prevent automatic creation of non-draft orders

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
Email Provider (Railway/Vercel) → Email Webhook → Processing Service → LLM API → Database
                                       ↓
                                  Email Storage
                                       ↓
                              Deduplication Check
                                       ↓
                              Content Extraction
                                       ↓
                              LLM Processing
                                       ↓
                              Product Matching
                                       ↓
                              Draft Order Creation
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
   - Interfaces with chosen LLM provider
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
   - Add `isDraft` field to Order model
   - Create `EmailProcessingLog` table
   - Add `source` and `originalEmailHash` fields to Order

2. **Email Service Integration**
   - Research and implement Railway/Vercel email handling
   - Set up webhook endpoint
   - Implement basic email parsing

3. **Basic Processing Pipeline**
   - Create email processing job queue
   - Implement deduplication logic
   - Set up error handling and logging

### Phase 2: LLM Integration (Week 3-4)

1. **LLM Provider Selection and Setup**
   - Implement OpenAI GPT-4o-mini integration (most cost-effective)
   - Create prompt templates for order parsing
   - Implement response validation

2. **Product Matching Engine**
   - Implement fuzzy matching algorithms
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

## API Endpoints

### New Endpoints

```typescript
// Email webhook endpoint
POST /api/webhooks/email
// Processes incoming emails from email service

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
// Add query parameter: ?includeDrafts=true

POST /api/orders
// Add optional isDraft parameter
```

## Email Service Integration

### Research Findings

After researching Railway and Vercel capabilities:

#### Railway Email Handling
- **Railway Email Agent Template**: Available template for email processing
- **Webhook Support**: Can receive email webhooks via HTTP endpoints
- **Cost**: Function-based pricing, pay per execution
- **Setup**: Requires external email service integration (e.g., SendGrid, Mailgun)

#### Vercel Email Handling
- **Serverless Functions**: Can process email webhooks
- **No Native Email**: Requires third-party email service
- **Integration Options**: SendGrid, Mailgun, Postmark webhooks
- **Cost**: Function execution time based

### Recommended Approach: Railway + Mailgun

**Rationale:**
1. Railway has better webhook handling for background jobs
2. Mailgun provides reliable email parsing and routing
3. Cost-effective for expected volume
4. Good documentation and community support

**Setup Process:**
1. Configure Mailgun subdomain: `orders.yourdomain.com`
2. Set up email routing to Railway webhook
3. Configure sender allowlist
4. Implement webhook validation

## LLM Integration

### Provider Analysis

Based on cost research, here are the most cost-effective options for receipt parsing:

| Provider | Model | Input ($/1M tokens) | Output ($/1M tokens) | Best For |
|----------|-------|-------------------|---------------------|-----------|
| OpenAI | GPT-4o-mini | $0.15 | $0.60 | General parsing |
| Google | Gemini Flash 2.0 | $0.075 | $0.30 | Cost optimization |
| Anthropic | Claude 3.5 Haiku | $0.80 | $4.00 | Accuracy critical |
| DeepSeek | DeepSeek-V3 | $0.27 | $1.10 | Good balance |

### Recommended Choice: Google Gemini Flash 2.0

**Reasoning:**
- Lowest cost per token
- 1M context window (handles long receipts)
- Good performance for structured data extraction
- 50-75% cost savings vs GPT-4o-mini

**Estimated Costs:**
- Average receipt: ~1,000 input tokens, ~200 output tokens
- Cost per receipt: ~$0.00015 (vs $0.00027 for GPT-4o-mini)
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
5. If information is unclear, mark fields as null

EXISTING PRODUCTS:
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

Respond ONLY with valid JSON. No additional text or explanation.
`;
```

### Product Matching Logic

```typescript
interface ProductMatchingService {
  async matchProducts(items: ParsedItem[], existingProducts: Product[]): Promise<MatchResult[]>;
}

interface MatchResult {
  parsedItem: ParsedItem;
  matchedProduct?: Product;
  confidence: number;
  shouldCreateNew: boolean;
  suggestedProduct?: Partial<Product>;
}

// Matching algorithm:
// 1. Exact name match (confidence: 1.0)
// 2. Fuzzy string matching (confidence: 0.7-0.9)
// 3. Keyword extraction and matching (confidence: 0.5-0.7)
// 4. LLM-suggested match validation (confidence: based on LLM)
// 5. Create new product if confidence < 0.6
```

## Cost Analysis

### Initial Setup Costs
- Mailgun account: $0-35/month (based on volume)
- Railway hosting: $5-20/month
- Development time: ~3-4 weeks

### Ongoing Operational Costs

**Email Processing (100 emails/day):**
- Mailgun: $0-5/month
- Railway functions: $2-5/month
- LLM processing: $5.50/year (Gemini Flash)

**Total Monthly Cost: $7-45**

### Cost Optimization Strategies
1. **Caching**: Cache product lists to reduce LLM context size
2. **Batch Processing**: Process multiple emails together
3. **Smart Parsing**: Only use LLM for complex receipts
4. **Fallback Models**: Use cheaper models for simple receipts

## Security Considerations

### Email Security
- **Sender Validation**: Only accept emails from allowlisted addresses
- **Content Sanitization**: Strip potentially malicious content
- **Rate Limiting**: Prevent spam and abuse
- **Webhook Validation**: Verify webhook signatures

### Data Security
- **PII Handling**: Minimize storage of personal information
- **Encryption**: Encrypt email content at rest
- **Access Control**: Restrict access to email processing logs
- **Audit Trail**: Log all processing activities

### API Security
- **Authentication**: Require user authentication for all endpoints
- **Authorization**: Ensure users can only access their own data
- **Input Validation**: Validate all API inputs
- **Rate Limiting**: Prevent API abuse

## Testing Strategy

### Unit Tests
- Email parsing and validation
- LLM response processing
- Product matching algorithms
- Order creation logic

### Integration Tests
- End-to-end email processing
- LLM API integration
- Database operations
- Webhook handling

### Manual Testing
- Various receipt formats
- Edge cases and error scenarios
- User workflow validation
- Performance testing

### Test Data
- Sample receipts from major retailers
- Edge cases (unclear text, missing information)
- Multiple languages and formats
- Large receipts with many items

## Rollout Plan

### Phase 1: Limited Beta (Week 7)
- Deploy to staging environment
- Test with 2-3 power users
- Process 5-10 emails/day
- Gather feedback and iterate

### Phase 2: Expanded Beta (Week 8-9)
- Invite 10-15 beta users
- Process 20-50 emails/day
- Monitor performance and costs
- Refine product matching

### Phase 3: General Availability (Week 10)
- Full rollout to all users
- Documentation and tutorials
- Monitor scaling and performance
- Support 100+ emails/day

### Rollback Plan
- Feature flags for easy disable
- Manual processing fallback
- Data export capabilities
- Clear communication plan

## Future Considerations

### Short-term Enhancements (3-6 months)
- **OCR Integration**: Process image-based receipts
- **Mobile App**: Direct photo capture and processing
- **Better Product Matching**: Machine learning models
- **Multi-language Support**: Support for more languages

### Long-term Vision (6-12 months)
- **Receipt Categorization**: Automatic expense categorization
- **Budget Integration**: Link with budgeting features
- **Vendor API Integration**: Direct integration with retailers
- **Smart Predictions**: Predict future purchases

### Scaling Considerations
- **Horizontal Scaling**: Multiple processing workers
- **Database Optimization**: Indexing and caching strategies
- **CDN Integration**: Faster email content delivery
- **Monitoring**: Advanced metrics and alerting

## Appendix

### A. Sample Receipt Formats

**Amazon Email Receipt:**
```
Your order of January 15, 2025

Items Ordered:
1. Coffee Beans - Premium Roast - $12.99
2. Milk - Organic Whole Milk - $4.49
   Quantity: 2

Subtotal: $21.97
Tax: $1.98
Total: $23.95
```

**Grocery Store Receipt:**
```
WHOLE FOODS MARKET
Order #: 12345
Date: 01/15/2025

COFFEE BEANS ORGANIC    $12.99
MILK WHOLE ORGANIC QTY:2 $8.98
BREAD SOURDOUGH         $3.49

SUBTOTAL               $25.46
TAX                     $2.29
TOTAL                  $27.75
```

### B. Email Service Provider Comparison

| Provider | Email Parsing | Webhook Support | Cost | Reliability |
|----------|---------------|-----------------|------|-------------|
| Mailgun | Excellent | Yes | Low-Medium | High |
| SendGrid | Good | Yes | Medium | High |
| Postmark | Good | Yes | Medium-High | High |
| AWS SES | Basic | Limited | Low | Medium |

### C. Error Handling Matrix

| Error Type | Detection | Recovery | User Impact |
|------------|-----------|----------|-------------|
| Invalid Email | Immediate | Log & notify | None |
| LLM Timeout | 30s timeout | Retry 3x | Delayed processing |
| Parse Failure | Validation | Manual queue | Review required |
| Duplicate Email | Hash check | Skip processing | None |
| Database Error | Exception | Retry & alert | Temporary delay |

### D. Monitoring Metrics

**Key Performance Indicators:**
- Email processing success rate (target: >95%)
- Average processing time (target: <2 minutes)
- LLM accuracy rate (target: >90%)
- User approval rate for drafts (target: >80%)
- Cost per processed email (target: <$0.01)

**Alerting Thresholds:**
- Processing failure rate >10%
- Processing time >5 minutes
- LLM error rate >20%
- Daily email volume >150

---

*This RFC is a living document and will be updated as implementation progresses and requirements evolve.* 