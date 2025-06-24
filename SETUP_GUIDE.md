# Email Order Parsing System - Setup Guide

**Status:** Production Ready  
**RFC Reference:** [email-order-parsing-system.md](./rfc/email-order-parsing-system.md)  
**Implementation Guide:** [implementation-guide.md](./rfc/implementation-guide.md)  
**Created:** January 2025  

## Overview

This guide walks you through setting up the complete email-based order parsing system. The system automatically processes receipt emails forwarded to a dedicated email address using AI to extract order information and create draft orders for user review.

## Architecture Overview

```
Email Provider (Mailgun) → Email Webhook → Email Queue → Receipt Parsing → Product Matching → Draft Order Creation → Frontend Management
```

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Google AI API key (for Gemini)
- Mailgun account (for email processing)
- Railway account (for deployment)

## Step 1: Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/auto_order"

# Google AI (Gemini)
GOOGLE_AI_API_KEY="your_google_ai_api_key_here"

# Mailgun (for email webhooks)
MAILGUN_WEBHOOK_SECRET="your_mailgun_webhook_secret"

# JWT (if using authentication)
JWT_SECRET="your_jwt_secret_here"

# Environment
NODE_ENV="production"
PORT="3001"
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
# API URL
VITE_API_URL="http://localhost:3001/api"

# For production deployment
VITE_API_URL="https://your-railway-app.railway.app/api"
```

## Step 2: Google AI API Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Generative AI API**
   - Navigate to APIs & Services > Library
   - Search for "Generative Language API"
   - Click "Enable"

3. **Create API Key**
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "API Key"
   - Copy the API key and add to your `.env` file

4. **Test API Connection**
   ```bash
   cd backend
   npm run test -- --testNamePattern="gemini"
   ```

## Step 3: Database Setup

### Local Development

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql

   # Ubuntu
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Create Database**
   ```bash
   createdb auto_order
   ```

3. **Run Migrations**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```

### Production (Railway)

1. **Add PostgreSQL Service**
   - In Railway dashboard, click "New" > "Database" > "PostgreSQL"
   - Copy the connection string to your environment variables

2. **Deploy Database Schema**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

## Step 4: Mailgun Configuration

### Setup Mailgun Account

1. **Create Mailgun Account**
   - Go to [Mailgun](https://www.mailgun.com/)
   - Sign up for an account
   - Verify your domain (or use sandbox for testing)

2. **Configure Domain**
   - Add your domain (e.g., `orders.yourdomain.com`)
   - Follow DNS configuration instructions
   - Verify domain setup

3. **Create Route**
   - Go to Receiving > Routes
   - Click "Create Route"
   - **Match Recipient:** `receipts@orders.yourdomain.com`
   - **Actions:** Forward to webhook URL
   - **Webhook URL:** `https://your-railway-app.railway.app/api/webhooks/email`

4. **Generate Webhook Secret**
   - Go to Settings > Webhooks
   - Generate a signing key
   - Add to your environment variables as `MAILGUN_WEBHOOK_SECRET`

### Test Email Processing

Send a test email to `receipts@orders.yourdomain.com`:

```
Subject: Test Receipt

Amazon Order Receipt

Coffee Beans - Organic Dark Roast
Quantity: 2
Price: $12.99 each

Order Date: 2025-01-15
Total: $25.98
```

## Step 5: Railway Deployment

### Backend Deployment

1. **Connect Repository**
   - Go to [Railway](https://railway.app/)
   - Click "New Project" > "Deploy from GitHub repo"
   - Select your repository

2. **Configure Build**
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`

3. **Set Environment Variables**
   - Add all environment variables from Step 1
   - Use Railway-provided `DATABASE_URL`

4. **Deploy**
   - Push to main branch
   - Railway will automatically deploy

### Frontend Deployment

1. **Configure Frontend Service**
   - Add new service to Railway project
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run preview`

2. **Set Environment Variables**
   - `VITE_API_URL`: Your backend Railway URL + `/api`

3. **Custom Domain (Optional)**
   - Go to Settings > Domains
   - Add your custom domain

## Step 6: Testing the Complete System

### 1. Test API Endpoints

```bash
# Test draft orders endpoint
curl https://your-backend-url.railway.app/api/orders/drafts

# Test email processing status
curl https://your-backend-url.railway.app/api/email-processing/status
```

### 2. Test Email Processing

1. **Send Test Email**
   - Forward a receipt email to your configured address
   - Check Railway logs for processing status

2. **Verify Draft Order Creation**
   - Check the frontend drafts page
   - Verify draft order appears with parsed items

3. **Test Approval Workflow**
   - Approve the draft order
   - Verify it moves to regular orders

### 3. Monitor Processing

Check processing logs:
```bash
# Railway CLI
railway logs --service backend

# Or check processing status via API
curl https://your-backend-url.railway.app/api/email-processing/{email-hash}
```

## Step 7: User Instructions

### For End Users

1. **Forward Receipt Emails**
   - Forward any receipt email to: `receipts@orders.yourdomain.com`
   - Supported senders: ajprameswari@gmail.com, mathiasxaj@gmail.com, mathiassiig@gmail.com, mathias_sn@hotmail.com

2. **Review Draft Orders**
   - Go to the "Drafts" page in the app
   - Review automatically created orders
   - Edit items or quantities if needed

3. **Approve Orders**
   - Click "Approve" to convert draft to regular order
   - Draft products become permanent products

## Monitoring and Maintenance

### Key Metrics to Monitor

- **Email Processing Success Rate:** Should be >95%
- **Average Processing Time:** Should be <2 minutes
- **LLM Accuracy:** Monitor draft approval rates
- **API Response Times:** Monitor performance
- **Error Rates:** Track failed processing

### Monitoring Endpoints

```bash
# Queue status
GET /api/email-processing/status

# Processing logs
GET /api/email-processing/logs

# System health
GET /api/health
```

### Common Issues

1. **Email Not Processing**
   - Check Mailgun webhook configuration
   - Verify sender is whitelisted
   - Check Railway logs for errors

2. **LLM Parsing Errors**
   - Verify Google AI API key is valid
   - Check API quotas and billing
   - Review parsing prompts

3. **Product Matching Issues**
   - Review product matching confidence thresholds
   - Check for duplicate products being created

### Cost Optimization

1. **Google AI Usage**
   - Monitor token usage in Google Cloud Console
   - Optimize prompts to reduce token count
   - Consider caching for similar receipts

2. **Database Optimization**
   - Regular cleanup of old processing logs
   - Index optimization for large datasets

3. **Railway Resources**
   - Monitor memory and CPU usage
   - Scale services based on email volume

## Security Considerations

1. **Email Validation**
   - Only whitelisted senders are processed
   - Email content is sanitized before processing

2. **API Security**
   - Implement rate limiting
   - Use HTTPS for all communications
   - Validate webhook signatures

3. **Data Privacy**
   - Email content is stored temporarily
   - Consider implementing data retention policies
   - Encrypt sensitive data at rest

## Backup and Recovery

1. **Database Backups**
   ```bash
   # Create backup
   pg_dump $DATABASE_URL > backup.sql

   # Restore backup
   psql $DATABASE_URL < backup.sql
   ```

2. **Configuration Backup**
   - Export environment variables
   - Document Mailgun route configurations
   - Save API keys securely

## Troubleshooting

### Debug Commands

```bash
# Check email processing queue
curl https://your-backend-url.railway.app/api/email-processing/queue

# Retry failed processing
curl -X POST https://your-backend-url.railway.app/api/email-processing/{hash}/retry

# Test Gemini API
curl https://your-backend-url.railway.app/api/gemini/test
```

### Log Analysis

```bash
# Filter email processing logs
railway logs --service backend | grep "📧"

# Filter errors
railway logs --service backend | grep "❌"

# Filter successful processing
railway logs --service backend | grep "✅"
```

## Support

For issues or questions:
1. Check Railway deployment logs
2. Verify environment variables
3. Test individual components (Gemini API, database connection)
4. Review Mailgun webhook delivery logs

## Next Steps

Once the system is running:
1. Monitor initial email processing for accuracy
2. Gather user feedback on draft order quality
3. Optimize LLM prompts based on real receipts
4. Consider implementing auto-approval rules
5. Add analytics and reporting features

---

**System Status:** ✅ Production Ready  
**Last Updated:** January 2025  
**Version:** 1.0.0 