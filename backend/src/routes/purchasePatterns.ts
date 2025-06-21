import { Router } from 'express';
import { verifyGoogleToken } from '../middleware/auth';
import { createPurchasePatternSchema, updatePurchasePatternSchema } from '../schemas/purchasePatternSchema';
import { purchasePatternService } from '../services/purchasePatternService';
import { prisma } from '../services/database';
import { Prisma } from '@prisma/client';

const router = Router();

// Apply auth middleware to all routes
router.use(verifyGoogleToken);

/**
 * @swagger
 * /api/purchase-patterns:
 *   get:
 *     summary: Get all purchase patterns for the logged-in user
 *     tags: [PurchasePatterns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of purchase patterns
 */
router.get('/', async (req, res) => {
  try {
    const patterns = await prisma.$queryRaw<any[]>`
      SELECT pp.*, p.name as product_name
      FROM purchase_patterns pp
      JOIN products p ON pp.product_id = p.id
      WHERE pp.user_id = ${req.user!.sub}
      ORDER BY pp.created_at DESC
    `;
    res.json(patterns);
  } catch (error) {
    console.error('Error fetching purchase patterns:', error);
    res.status(500).json({ error: 'Failed to fetch purchase patterns' });
  }
});

/**
 * @swagger
 * /api/purchase-patterns/{id}:
 *   get:
 *     summary: Get a single purchase pattern
 *     tags: [PurchasePatterns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase pattern details
 *       404:
 *         description: Pattern not found or not owned by user
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pattern = await prisma.$queryRaw<any[]>`
      SELECT pp.*, p.name as product_name
      FROM purchase_patterns pp
      JOIN products p ON pp.product_id = p.id
      WHERE pp.id = ${id} AND pp.user_id = ${req.user!.sub}
    `;

    if (!pattern || pattern.length === 0) {
      return res.status(404).json({ error: 'Purchase pattern not found' });
    }

    res.json(pattern[0]);
  } catch (error) {
    console.error('Error fetching purchase pattern:', error);
    res.status(500).json({ error: 'Failed to fetch purchase pattern' });
  }
});

/**
 * @swagger
 * /api/purchase-patterns:
 *   post:
 *     summary: Create a purchase pattern manually
 *     tags: [PurchasePatterns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - intervalDays
 *             properties:
 *               productId:
 *                 type: string
 *               intervalDays:
 *                 type: number
 *               notify:
 *                 type: boolean
 *               notifyDaysBefore:
 *                 type: number
 *     responses:
 *       201:
 *         description: Purchase pattern created
 *       400:
 *         description: Invalid request data
 */
router.post('/', async (req, res) => {
  try {
    const parseResult = createPurchasePatternSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request data', details: parseResult.error.errors });
    }

    const { productId, intervalDays, notify = true, notifyDaysBefore = 3 } = parseResult.data;

    // Check if pattern already exists
    const existingPattern = await prisma.$queryRaw<any[]>`
      SELECT * FROM purchase_patterns 
      WHERE user_id = ${req.user!.sub} AND product_id = ${productId}
    `;

    if (existingPattern && existingPattern.length > 0) {
      return res.status(400).json({ error: 'Purchase pattern already exists for this product' });
    }

    // Create pattern
    const pattern = await prisma.$queryRaw<any[]>`
      INSERT INTO purchase_patterns (id, user_id, product_id, interval_days, notify, notify_days_before, created_at, updated_at)
      VALUES (gen_random_uuid(), ${req.user!.sub}, ${productId}, ${intervalDays}, ${notify}, ${notifyDaysBefore}, NOW(), NOW())
      RETURNING *
    `;

    // Schedule notification if enabled
    if (notify) {
      await purchasePatternService.scheduleNotification({
        patternId: pattern[0].id,
        userId: req.user!.sub,
        productId,
        intervalDays,
        notifyDaysBefore
      });
    }

    res.status(201).json(pattern[0]);
  } catch (error) {
    console.error('Error creating purchase pattern:', error);
    res.status(500).json({ error: 'Failed to create purchase pattern' });
  }
});

/**
 * @swagger
 * /api/purchase-patterns/{id}:
 *   patch:
 *     summary: Update a purchase pattern
 *     tags: [PurchasePatterns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               intervalDays:
 *                 type: number
 *               notify:
 *                 type: boolean
 *               notifyDaysBefore:
 *                 type: number
 *     responses:
 *       200:
 *         description: Purchase pattern updated
 *       404:
 *         description: Pattern not found or not owned by user
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parseResult = updatePurchasePatternSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request data', details: parseResult.error.errors });
    }

    const { intervalDays, notify, notifyDaysBefore } = parseResult.data;

    // Build update query dynamically based on provided fields
    let updateFields = [];
    let updateValues = [];
    
    if (intervalDays !== undefined) {
      updateFields.push('interval_days = ?');
      updateValues.push(intervalDays);
    }
    if (notify !== undefined) {
      updateFields.push('notify = ?');
      updateValues.push(notify);
    }
    if (notifyDaysBefore !== undefined) {
      updateFields.push('notify_days_before = ?');
      updateValues.push(notifyDaysBefore);
    }
    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Update pattern
    const pattern = await prisma.$queryRaw<any[]>`
      UPDATE purchase_patterns
      SET ${Prisma.raw(updateFields.join(', '))}
      WHERE id = ${id} AND user_id = ${req.user!.sub}
      RETURNING *
    `;

    if (!pattern || pattern.length === 0) {
      return res.status(404).json({ error: 'Purchase pattern not found' });
    }

    // Reschedule notification if notify settings changed
    if (pattern[0].notify && (notify !== undefined || notifyDaysBefore !== undefined || intervalDays !== undefined)) {
      await purchasePatternService.scheduleNotification({
        patternId: pattern[0].id,
        userId: req.user!.sub,
        productId: pattern[0].product_id,
        intervalDays: intervalDays ?? pattern[0].interval_days,
        notifyDaysBefore: notifyDaysBefore ?? pattern[0].notify_days_before
      });
    }

    res.json(pattern[0]);
  } catch (error) {
    console.error('Error updating purchase pattern:', error);
    res.status(500).json({ error: 'Failed to update purchase pattern' });
  }
});

/**
 * @swagger
 * /api/purchase-patterns/{id}:
 *   delete:
 *     summary: Delete a purchase pattern
 *     tags: [PurchasePatterns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Purchase pattern deleted
 *       404:
 *         description: Pattern not found or not owned by user
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await prisma.$executeRaw`
      DELETE FROM purchase_patterns
      WHERE id = ${id} AND user_id = ${req.user!.sub}
    `;

    if (!result) {
      return res.status(404).json({ error: 'Purchase pattern not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting purchase pattern:', error);
    res.status(500).json({ error: 'Failed to delete purchase pattern' });
  }
});

export default router; 