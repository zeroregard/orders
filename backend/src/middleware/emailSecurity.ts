import crypto from 'crypto';

// Allowed sender emails as per RFC
const ALLOWED_SENDERS = [
  'ajprameswari@gmail.com',
  'mathiasxaj@gmail.com',
  'mathiassiig@gmail.com',
  'mathias_sn@hotmail.com'
] as const;

/**
 * Validate if the sender email is in the allowed list
 */
export function validateEmailSender(senderEmail: string): boolean {
  if (!senderEmail) return false;
  
  // Normalize email to lowercase for comparison
  const normalizedEmail = senderEmail.toLowerCase().trim();
  
  return ALLOWED_SENDERS.includes(normalizedEmail as any);
}

/**
 * Generate SHA-256 hash of email content for deduplication
 */
export function generateEmailHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Sanitize email content by removing HTML tags and normalizing whitespace
 */
export function sanitizeEmailContent(content: string): string {
  if (!content) return '';
  
  // Remove HTML tags
  const withoutHtml = content.replace(/<[^>]*>/g, ' ');
  
  // Normalize whitespace
  const normalized = withoutHtml.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Extract plain text from HTML email content
 */
export function extractTextFromHtml(htmlContent: string): string {
  if (!htmlContent) return '';
  
  // Simple HTML to text conversion
  return htmlContent
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Rate limiting for email processing per sender
 */
const emailRateLimit = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(senderEmail: string, maxEmails = 10, windowMs = 60 * 60 * 1000): boolean {
  const now = Date.now();
  const normalizedEmail = senderEmail.toLowerCase().trim();
  
  const current = emailRateLimit.get(normalizedEmail);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize rate limit
    emailRateLimit.set(normalizedEmail, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (current.count >= maxEmails) {
    return false; // Rate limit exceeded
  }
  
  // Increment count
  current.count++;
  return true;
} 