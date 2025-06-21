import express from 'express';
import cors from 'cors';
import { setupSwagger } from './swagger';
import { verifyGoogleToken } from './middleware/auth';
import { prisma } from './services/database';
import router from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/**
 * @swagger
 * /api/health/db:
 *   get:
 *     summary: Database health check endpoint
 *     tags: [Health]
 *     description: Check if the database connection is working properly
 *     responses:
 *       200:
 *         description: Database connection is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 message:
 *                   type: string
 *                   example: "Database connection is healthy"
 *                 details:
 *                   type: object
 *       503:
 *         description: Database connection failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Database connection failed"
 */
// Database health endpoint
app.get('/api/health/db', async (_req, res) => {
  try {
    console.log('Testing database connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database query successful:', result);
    
    // Test if products table exists
    const tableInfo = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='products'`;
    console.log('Products table check:', tableInfo);
    
    res.json({ 
      status: 'ok', 
      message: 'Database connection is healthy',
      details: {
        connection: 'successful',
        queryTest: 'successful',
        productsTable: Array.isArray(tableInfo) && tableInfo.length > 0 ? 'exists' : 'missing'
      }
    });
  } catch (error: any) {
    console.error('Database health check failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    
    res.status(503).json({ 
      status: 'error', 
      message: 'Database connection failed',
      details: {
        errorName: error.name,
        errorCode: error.code,
        originalMessage: error.message
      }
    });
  }
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: Check if the API server is running and healthy
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 message:
 *                   type: string
 *                   example: "Server is running"
 */
// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Use the routes index
app.use('/api', router);

setupSwagger(app);

// Only start the server if this file is run directly (not imported for tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api/docs`);
  });
}

export default app;
