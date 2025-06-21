import express from 'express';
import { verifyGoogleToken } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/auth/protected-test:
 *   get:
 *     summary: Protected test endpoint for manual frontend testing
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: Test endpoint to verify authentication is working
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authentication successful"
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     picture:
 *                       type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - valid token but unauthorized email
 */
router.get('/protected-test', verifyGoogleToken, (req, res) => {
  res.json({
    message: 'Authentication successful',
    user: req.user,
  });
});

export default router; 