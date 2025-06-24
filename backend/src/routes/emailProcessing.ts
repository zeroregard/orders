import { Router } from 'express';
import { emailQueue } from '../services/emailQueue';
import { prisma } from '../services/database';

const router = Router();

/**
 * @swagger
 * /api/email-processing/{hash}:
 *   get:
 *     summary: Get email processing status
 *     tags: [Email Processing]
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Email hash
 *     responses:
 *       200:
 *         description: Processing status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 emailHash:
 *                   type: string
 *                 senderEmail:
 *                   type: string
 *                 subject:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [PENDING, PROCESSING, COMPLETED, FAILED, DUPLICATE]
 *                 errorMessage:
 *                   type: string
 *                 orderId:
 *                   type: string
 *                 processedAt:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *       404:
 *         description: Email processing log not found
 */
router.get('/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    const processingLog = await emailQueue.getProcessingStatus(hash);
    
    if (!processingLog) {
      return res.status(404).json({ error: 'Email processing log not found' });
    }
    
    // Don't return raw email content for security
    const { rawContent, ...safeLog } = processingLog;
    
    res.json(safeLog);
  } catch (error) {
    console.error('Error fetching processing status:', error);
    res.status(500).json({ error: 'Failed to fetch processing status' });
  }
});

/**
 * @swagger
 * /api/email-processing/{hash}/retry:
 *   post:
 *     summary: Retry processing a failed email
 *     tags: [Email Processing]
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Email hash
 *     responses:
 *       200:
 *         description: Email queued for retry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email queued for retry"
 *       400:
 *         description: Email is not in failed state
 *       404:
 *         description: Email processing log not found
 */
router.post('/:hash/retry', async (req, res) => {
  try {
    const { hash } = req.params;
    
    await emailQueue.retryProcessing(hash);
    
    res.json({ message: 'Email queued for retry' });
  } catch (error: any) {
    console.error('Error retrying email processing:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Email processing log not found' });
    }
    
    if (error.message.includes('not in failed state')) {
      return res.status(400).json({ error: 'Email is not in failed state' });
    }
    
    res.status(500).json({ error: 'Failed to retry email processing' });
  }
});

/**
 * @swagger
 * /api/email-processing/queue/status:
 *   get:
 *     summary: Get email processing queue status
 *     tags: [Email Processing]
 *     responses:
 *       200:
 *         description: Queue status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 queueLength:
 *                   type: number
 *                   description: Number of emails in queue
 *                 isProcessing:
 *                   type: boolean
 *                   description: Whether queue is currently processing
 */
router.get('/queue/status', (req, res) => {
  try {
    const status = emailQueue.getQueueStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting queue status:', error);
    res.status(500).json({ error: 'Failed to get queue status' });
  }
});

/**
 * @swagger
 * /api/email-processing/logs:
 *   get:
 *     summary: Get recent email processing logs
 *     tags: [Email Processing]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of logs to retrieve
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, COMPLETED, FAILED, DUPLICATE]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Processing logs retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   emailHash:
 *                     type: string
 *                   senderEmail:
 *                     type: string
 *                   subject:
 *                     type: string
 *                   status:
 *                     type: string
 *                   errorMessage:
 *                     type: string
 *                   orderId:
 *                     type: string
 *                   processedAt:
 *                     type: string
 *                   createdAt:
 *                     type: string
 */
router.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const status = req.query.status as string;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }
    
    const logs = await prisma.emailProcessingLog.findMany({
      where,
      select: {
        id: true,
        emailHash: true,
        senderEmail: true,
        subject: true,
        status: true,
        errorMessage: true,
        orderId: true,
        processedAt: true,
        createdAt: true,
        updatedAt: true
        // Exclude rawContent for security
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching processing logs:', error);
    res.status(500).json({ error: 'Failed to fetch processing logs' });
  }
});

export default router; 