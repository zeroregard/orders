import express from 'express';
import { verifyGoogleToken, generateCustomToken } from '../middleware/auth';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const client = new OAuth2Client();

const ALLOWED_EMAILS = ['mathiassiig@gmail.com', 'ajprameswari@gmail.com'];

/**
 * @swagger
 * /api/auth/exchange-token:
 *   post:
 *     summary: Exchange Google ID token for custom JWT token with longer expiration
 *     tags: [Auth]
 *     description: Accepts a Google ID token and returns a custom JWT token that lasts 7 days
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - googleToken
 *             properties:
 *               googleToken:
 *                 type: string
 *                 description: Google ID token from Google Sign-In
 *     responses:
 *       200:
 *         description: Token exchange successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Custom JWT token with 7-day expiration
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     picture:
 *                       type: string
 *                     sub:
 *                       type: string
 *                 expiresIn:
 *                   type: string
 *                   description: Token expiration duration
 *       400:
 *         description: Bad request - missing or invalid Google token
 *       401:
 *         description: Unauthorized - invalid Google token
 *       403:
 *         description: Forbidden - valid Google token but unauthorized email
 */
router.post('/exchange-token', async (req, res) => {
  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Google token is required'
      });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      // Add your Google Client ID here if you have one specific to your app
      // audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid Google token payload' 
      });
    }

    // Check if email is in allowed list
    if (!ALLOWED_EMAILS.includes(payload.email)) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Unauthorized user - access denied' 
      });
    }

    // Create user object
    const user = {
      email: payload.email,
      name: payload.name || '',
      picture: payload.picture || '',
      sub: payload.sub || '',
    };

    // Generate custom JWT token
    const customToken = generateCustomToken(user);

    res.json({
      token: customToken,
      user,
      expiresIn: '7d'
    });

  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid or expired Google token' 
    });
  }
});

/**
 * @swagger
 * /api/auth/protected-test:
 *   get:
 *     summary: Protected test endpoint for manual frontend testing
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: Test endpoint to verify authentication is working (accepts both Google ID tokens and custom JWT tokens)
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