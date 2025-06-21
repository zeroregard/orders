import { Router } from 'express';
import { prisma } from '../services/database';
import { productSchema } from '../schemas/productSchema';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the product
 *         name:
 *           type: string
 *           description: Name of the product
 *         description:
 *           type: string
 *           description: Optional description of the product
 *         price:
 *           type: number
 *           description: Optional price of the product
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         name: "Coffee Beans"
 *         description: "Premium Arabica coffee beans"
 *         price: 15.99
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', async (_req, res) => {
  try {
    console.log('Attempting to fetch products...');
    
    // Test database connection first
    await prisma.$connect();
    console.log('Database connection successful');
    
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Successfully fetched ${products.length} products`);
    res.json(products);
  } catch (error: any) {
    console.error('Detailed error fetching products:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    console.error('Stack trace:', error.stack);
    
    // Provide specific error messages based on error type
    let errorMessage = 'Failed to fetch products';
    let statusCode = 500;
    
    if (error.code === 'P1001') {
      errorMessage = 'Database connection failed: Cannot reach the database server';
      statusCode = 503;
    } else if (error.code === 'P1003') {
      errorMessage = 'Database connection failed: Database does not exist';
      statusCode = 503;
    } else if (error.code === 'P1008') {
      errorMessage = 'Database connection failed: Operation timed out';
      statusCode = 503;
    } else if (error.code === 'P1017') {
      errorMessage = 'Database connection failed: Server has closed the connection';
      statusCode = 503;
    } else if (error.message.includes('SQLITE_CANTOPEN')) {
      errorMessage = 'Database connection failed: Cannot open SQLite database file. Check file permissions and path.';
      statusCode = 503;
    } else if (error.message.includes('does not exist')) {
      errorMessage = 'Database schema error: Table does not exist. Please run database migrations.';
      statusCode = 503;
    } else if (error.message.includes('no such table')) {
      errorMessage = 'Database schema error: Products table does not exist. Please run database migrations.';
      statusCode = 503;
    } else if (error.name === 'PrismaClientInitializationError') {
      errorMessage = `Prisma client initialization failed: ${error.message}`;
      statusCode = 503;
    } else if (error.name === 'PrismaClientUnknownRequestError') {
      errorMessage = `Database request error: ${error.message}`;
      statusCode = 503;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
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
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *             example:
 *               name: "Coffee Beans"
 *               description: "Premium Arabica coffee beans"
 *               price: 15.99
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: array
 */
router.post('/', async (req, res) => {
  try {
    const parseResult = productSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid product data', details: parseResult.error.errors });
    }
    
    const { name, description, price } = parseResult.data;
    const product = await prisma.product.create({
      data: { name, description, price }
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *             example:
 *               name: "Updated Coffee Beans"
 *               description: "Updated premium Arabica coffee beans"
 *               price: 18.99
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price })
      }
    });
    
    res.json(product);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

/**
 * @swagger
 * /api/products/{id}/purchase-history:
 *   get:
 *     summary: Get purchase history for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Purchase history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 max:
 *                   type: number
 *                   description: Maximum quantity purchased on any single date
 *                 purchases:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       quantity:
 *                         type: number
 *       404:
 *         description: Product not found
 */
router.get('/:id/purchase-history', async (req, res) => {
  try {
    const { id } = req.params;

    // First check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get all orders containing this product
    const orders = await prisma.orderLineItem.findMany({
      where: {
        productId: id
      },
      include: {
        order: true
      }
    });

    // Group purchases by date and sum quantities
    const purchasesByDate = orders.reduce((acc, item) => {
      const date = item.order.purchaseDate.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array format and find max
    const purchases = Object.entries(purchasesByDate).map(([date, quantity]) => ({
      date,
      quantity
    }));

    const max = Math.max(...Object.values(purchasesByDate), 0);

    res.json({
      max,
      purchases
    });
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    res.status(500).json({ error: 'Failed to fetch purchase history' });
  }
});

/**
 * @swagger
 * /api/products/{id}/purchase-history:
 *   get:
 *     summary: Get purchase history for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Purchase history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 max:
 *                   type: number
 *                   description: Maximum quantity purchased on any single date
 *                 purchases:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       quantity:
 *                         type: number
 *       404:
 *         description: Product not found
 */
router.get('/:id/purchase-history', async (req, res) => {
  try {
    const { id } = req.params;

    // First check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get all orders containing this product
    const orders = await prisma.orderLineItem.findMany({
      where: {
        productId: id
      },
      include: {
        order: true
      }
    });

    // Group purchases by date and sum quantities
    const purchasesByDate = orders.reduce((acc, item) => {
      const date = item.order.purchaseDate.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array format and find max
    const purchases = Object.entries(purchasesByDate).map(([date, quantity]) => ({
      date,
      quantity
    }));

    const max = Math.max(...Object.values(purchasesByDate), 0);

    res.json({
      max,
      purchases
    });
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    res.status(500).json({ error: 'Failed to fetch purchase history' });
  }
});

export default router;
