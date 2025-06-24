import { Router } from 'express';
import crypto from 'crypto';
import { emailQueue } from '../../services/emailQueue';
import { validateEmailSender, generateEmailHash } from '../../middleware/emailSecurity';

const router = Router();

/**
 * @swagger
 * /api/webhooks/email:
 *   post:
 *     summary: Receive email webhook from Mailgun
 *     tags: [Webhooks]
 *     description: Processes incoming emails from Mailgun for order parsing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sender:
 *                 type: string
 *                 description: Email sender address
 *               subject:
 *                 type: string
 *                 description: Email subject
 *               body-plain:
 *                 type: string
 *                 description: Plain text email body
 *               body-html:
 *                 type: string
 *                 description: HTML email body
 *               timestamp:
 *                 type: string
 *                 description: Mailgun timestamp
 *               token:
 *                 type: string
 *                 description: Mailgun token
 *               signature:
 *                 type: string
 *                 description: Mailgun signature
 *     responses:
 *       200:
 *         description: Email queued for processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "queued"
 *                 emailHash:
 *                   type: string
 *                   description: Hash of email content for tracking
 *       401:
 *         description: Invalid Mailgun signature
 *       403:
 *         description: Sender not allowed
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/email', async (req, res) => {
  try {
    console.log('📧 Received email webhook:', {
      sender: req.body.sender,
      subject: req.body.subject,
      timestamp: req.body.timestamp
    });

    // Verify Mailgun signature if webhook secret is provided
    if (process.env.MAILGUN_WEBHOOK_SECRET) {
      const signature = crypto
        .createHmac('sha256', process.env.MAILGUN_WEBHOOK_SECRET)
        .update(req.body.timestamp + req.body.token)
        .digest('hex');

      if (signature !== req.body.signature) {
        console.error('❌ Invalid Mailgun signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Validate sender email
    const senderEmail = req.body.sender;
    if (!validateEmailSender(senderEmail)) {
      console.error('❌ Sender not allowed:', senderEmail);
      return res.status(403).json({ error: 'Sender not allowed' });
    }

    // Extract email content
    const emailContent = req.body['body-plain'] || req.body['body-html'] || '';
    const subject = req.body.subject || '';

    if (!emailContent.trim()) {
      console.error('❌ Empty email content');
      return res.status(400).json({ error: 'Empty email content' });
    }

    // Generate email hash for deduplication
    const emailHash = generateEmailHash(emailContent + subject + senderEmail);

    // Queue email for processing
    await emailQueue.queueEmail({
      emailHash,
      senderEmail,
      subject,
      content: emailContent,
      timestamp: req.body.timestamp,
      rawData: req.body
    });

    console.log('✅ Email queued for processing:', emailHash);
    
    res.status(200).json({ 
      status: 'queued',
      emailHash 
    });
  } catch (error) {
    console.error('❌ Error processing email webhook:', error);
    res.status(500).json({ error: 'Failed to process email' });
  }
});

export default router; 