import { Router, Request, Response } from 'express';
import { geminiService } from '../services/geminiService';

const router = Router();

/**
 * @swagger
 * /api/gemini/test:
 *   get:
 *     summary: Test Gemini API connection
 *     tags: [Gemini]
 *     responses:
 *       200:
 *         description: Connection test successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       503:
 *         description: Service unavailable - Gemini API connection failed
 */
router.get('/test', async (req: Request, res: Response) => {
  try {
    const isConnected = await geminiService.testConnection();
    
    if (isConnected) {
      res.json({
        success: true,
        message: 'Gemini API connection successful'
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Gemini API connection failed'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error testing Gemini API connection',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/gemini/config:
 *   get:
 *     summary: Get current Gemini service configuration
 *     tags: [Gemini]
 *     responses:
 *       200:
 *         description: Current configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 model:
 *                   type: string
 *                 temperature:
 *                   type: number
 *                 maxOutputTokens:
 *                   type: number
 *                 topK:
 *                   type: number
 *                 topP:
 *                   type: number
 */
router.get('/config', (req: Request, res: Response) => {
  try {
    const config = geminiService.getConfig();
    res.json(config);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving Gemini configuration',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/gemini/generate:
 *   post:
 *     summary: Generate content using Gemini API
 *     tags: [Gemini]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt to send to Gemini
 *               config:
 *                 type: object
 *                 properties:
 *                   temperature:
 *                     type: number
 *                   maxOutputTokens:
 *                     type: number
 *                   topK:
 *                     type: number
 *                   topP:
 *                     type: number
 *     responses:
 *       200:
 *         description: Generated content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                 tokenCount:
 *                   type: object
 *                   properties:
 *                     promptTokens:
 *                       type: number
 *                     candidatesTokens:
 *                       type: number
 *                     totalTokens:
 *                       type: number
 *       400:
 *         description: Bad request - missing prompt
 *       500:
 *         description: Internal server error
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, config } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required and must be a string'
      });
    }
    
    const response = await geminiService.generateContent(prompt, config);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error generating content',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/gemini/generate-json:
 *   post:
 *     summary: Generate and parse JSON content using Gemini API
 *     tags: [Gemini]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt to send to Gemini (should request JSON response)
 *               config:
 *                 type: object
 *                 properties:
 *                   temperature:
 *                     type: number
 *                   maxOutputTokens:
 *                     type: number
 *                   topK:
 *                     type: number
 *                   topP:
 *                     type: number
 *     responses:
 *       200:
 *         description: Parsed JSON content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request - missing prompt
 *       500:
 *         description: Internal server error
 */
router.post('/generate-json', async (req: Request, res: Response) => {
  try {
    const { prompt, config } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required and must be a string'
      });
    }
    
    const response = await geminiService.generateJSON(prompt, config);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error generating JSON content',
      error: error.message
    });
  }
});

export default router; 