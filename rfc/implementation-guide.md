# Email Order Parsing System - Implementation Guide

**Status:** Active Implementation  
**RFC Reference:** [email-order-parsing-system.md](./email-order-parsing-system.md)  
**Created:** January 2025  

## Overview

This document provides a step-by-step implementation guide for the email-based order parsing system. We'll work through this together - LLM handling code changes, human providing guidance and testing.

## Phase 1: Basic Infrastructure (Weeks 1-2)

### Step 1: Database Schema Updates ✅ **READY TO START**

**Goal:** Add draft support to the existing Order model and create email processing tracking.

**LLM Tasks:**
1. Update Prisma schema to add:
   - `isDraft` field to Order model (default: true)
   - `source` field to Order model (MANUAL, EMAIL, API)
   - `originalEmailHash` field to Order model
   - New `EmailProcessingLog` model
2. Generate and run migration
3. Update existing orders to be non-draft

**Human Tasks:**
- Review schema changes
- Test database migration in development
- Verify existing orders are preserved

**Files to Modify:**
- `backend/prisma/schema.prisma`
- Create new migration file
- Update TypeScript types

---

### Step 2: Frontend Draft Order Support ✅ **AFTER STEP 1**

**Goal:** Update the frontend to handle draft orders with visual indicators and approval workflow.

**LLM Tasks:**
1. Update Order types to include `isDraft`, `source`, `originalEmailHash`
2. Add draft indicators to order list
3. Create draft approval buttons/workflow
4. Filter options for draft vs regular orders
5. Update OrderForm to support draft creation

**Human Tasks:**
- Review UI/UX changes
- Test draft order workflow
- Provide feedback on visual design

**Files to Modify:**
- `frontend/src/types/Order.ts`
- `frontend/src/pages/Orders/OrderList.tsx`
- `frontend/src/pages/Orders/components/OrderForm.tsx`
- `frontend/src/pages/Orders/components/OrderCard.tsx`

---

### Step 3: Backend API Updates ✅ **AFTER STEP 2**

**Goal:** Extend backend APIs to support draft orders and approval workflow.

**LLM Tasks:**
1. Update order routes to handle draft filtering
2. Add draft approval endpoint (`POST /api/orders/:id/approve`)
3. Add draft deletion endpoint (`DELETE /api/orders/:id/draft`)
4. Update order creation to support draft parameter
5. Add validation for draft-specific operations

**Human Tasks:**
- Test API endpoints with Postman/curl
- Verify draft workflow works end-to-end
- Check error handling

**Files to Modify:**
- `backend/src/routes/orders.ts`
- `backend/src/models/Order.ts`
- `backend/src/types/order.ts`

---

### Step 4: Basic Email Webhook Infrastructure ✅ **AFTER STEP 3**

**Goal:** Set up basic webhook endpoint to receive emails (no processing yet).

**LLM Tasks:**
1. Create webhook route (`POST /api/webhooks/email`)
2. Add basic email validation (sender whitelist)
3. Create email processing queue structure
4. Add logging for received emails
5. Return appropriate HTTP responses

**Human Tasks:**
- Set up Mailgun account and domain
- Configure webhook URL
- Test webhook with sample emails
- Verify security validation works

**Files to Create:**
- `backend/src/routes/webhooks/email.ts`
- `backend/src/middleware/emailSecurity.ts`
- `backend/src/services/emailQueue.ts`

---

## Phase 2: LLM Integration (Weeks 3-4)

### Step 5: Google Gemini Integration ⏳ **AFTER STEP 4**

**Goal:** Set up Google Gemini API and basic receipt parsing.

**LLM Tasks:**
1. Install Google AI SDK
2. Create LLM service with Gemini Flash 2.0
3. Implement receipt parsing prompt
4. Add error handling and retry logic
5. Create structured response validation

**Human Tasks:**
- Set up Google AI API key
- Test LLM responses with sample receipts
- Provide sample receipt data for testing

---

### Step 6: Product Matching Engine ⏳ **AFTER STEP 5**

**Goal:** Implement intelligent product matching and creation.

**LLM Tasks:**
1. Create product matching algorithm
2. Implement similarity scoring
3. Add new product creation workflow
4. Handle product variations and duplicates

**Human Tasks:**
- Review product matching accuracy
- Test with real product data
- Provide feedback on matching logic

---

### Step 7: Complete Email Processing Pipeline ⏳ **AFTER STEP 6**

**Goal:** Connect all pieces into working email-to-draft-order pipeline.

**LLM Tasks:**
1. Integrate email parsing with LLM service
2. Connect product matching to order creation
3. Implement deduplication logic
4. Add comprehensive error handling

**Human Tasks:**
- Test complete workflow with real emails
- Verify draft orders are created correctly
- Test edge cases and error scenarios

---

## Phase 3: Polish & Production (Weeks 5-6)

### Step 8: Testing & Monitoring ⏳ **AFTER STEP 7**

**Goal:** Add comprehensive testing and monitoring.

### Step 9: Documentation & Deployment ⏳ **AFTER STEP 8**

**Goal:** Prepare for production deployment.

---

## Current Status: Ready for Step 1

### Next Actions:
1. **LLM:** Update Prisma schema for draft order support
2. **Human:** Review and test database changes
3. **LLM:** Update frontend to show draft indicators
4. **Human:** Test UI changes and provide feedback

### Prerequisites Checklist:
- [x] RFC approved
- [x] Implementation guide created
- [ ] Development environment ready
- [ ] Database backup created (recommended)

### Environment Setup Needed:
- Google AI API key (for later steps)
- Mailgun account (for later steps)
- Railway deployment access (for later steps)

---

## Notes for Collaboration

**LLM Responsibilities:**
- Code implementation
- File modifications
- Technical problem solving
- Error handling implementation

**Human Responsibilities:**
- Testing and validation
- UI/UX feedback
- Business logic verification
- External service setup (API keys, etc.)

**Communication:**
- Human provides feedback after each step
- LLM explains changes and asks for clarification when needed
- We iterate on each step before moving to the next

---

**Ready to start with Step 1? Let me know and I'll begin updating the Prisma schema!** 