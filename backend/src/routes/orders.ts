import { Router } from 'express';
import { prisma } from '../services/database';
import { orderSchema } from '../schemas/orderSchema';
import { pushNotificationService } from '../services/pushNotificationService';
import { purchasePatternService } from '../services/purchasePatternService';
import { Order, OrderLineItem, Product } from '@prisma/client';
import { Prisma } from '@prisma/client';

interface OrderWithLineItems extends Order {
  lineItems: (OrderLineItem & { product: Product })[];
}

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderLineItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *           description: ID of the product
 *         quantity:
 *           type: number
 *           description: Quantity of the product
 *         productName:
 *           type: string
 *           description: Optional name of the product (for on-the-fly creation)
 *       example:
 *         productId: "123e4567-e89b-12d3-a456-426614174000"
 *         quantity: 2
 *         productName: "Coffee Beans"
 *     Order:
 *       type: object
 *       required:
 *         - name
 *         - creationDate
 *         - purchaseDate
 *         - lineItems
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the order
 *         name:
 *           type: string
 *           description: Name of the order
 *         creationDate:
 *           type: string
 *           format: date
 *           description: Date when the order was created (ISO format)
 *         purchaseDate:
 *           type: string
 *           format: date
 *           description: Date when the order was/will be purchased (ISO format)
 *         lineItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderLineItem'
 *           description: List of items in the order
 *       example:
 *         id: "456e7890-e89b-12d3-a456-426614174001"
 *         name: "Weekly Grocery Order"
 *         creationDate: "2025-06-19"
 *         purchaseDate: "2025-06-20"
 *         lineItems:
 *           - productId: "123e4567-e89b-12d3-a456-426614174000"
 *             quantity: 2
 *             productName: "Coffee Beans"
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: includeDrafts
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Whether to include draft orders
 *       - in: query
 *         name: draftsOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to return only draft orders
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/', async (req, res) => {
  try {
    const { includeDrafts = 'true', draftsOnly = 'false' } = req.query;
    
    let where: any = {};
    
    if (draftsOnly === 'true') {
      where.isDraft = true;
    } else if (includeDrafts === 'false') {
      where.isDraft = false;
    }
    // If includeDrafts is true (default), we don't filter by isDraft
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        lineItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     description: Create a new order. If a product doesn't exist in lineItems and productName is provided, it will be created automatically.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - creationDate
 *               - purchaseDate
 *               - lineItems
 *             properties:
 *               name:
 *                 type: string
 *               creationDate:
 *                 type: string
 *                 format: date
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *               lineItems:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OrderLineItem'
 *             example:
 *               name: "Weekly Grocery Order"
 *               creationDate: "2025-06-19"
 *               purchaseDate: "2025-06-20"
 *               lineItems:
 *                 - productId: "123e4567-e89b-12d3-a456-426614174000"
 *                   quantity: 2
 *                 - productName: "New Product"
 *                   quantity: 1
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid order data or product not found
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
    console.log('Received order creation request:', JSON.stringify(req.body, null, 2));
    
    const parseResult = orderSchema.safeParse(req.body);
    if (!parseResult.success) {
      console.log('Validation failed:', parseResult.error.errors);
      return res.status(400).json({ 
        error: 'Invalid order data', 
        details: parseResult.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    const { name, creationDate, purchaseDate, lineItems, isDraft = false, source = 'MANUAL', originalEmailHash } = parseResult.data;
    console.log('Parsed data:', { name, creationDate, purchaseDate, lineItems, isDraft, source, originalEmailHash });
    
    // Use a transaction for the entire order creation process
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Process line items and create products on-the-fly if needed
        const processedLineItems = [];
        for (const item of lineItems) {
          let productId = item.productId;
          
          // Create product on-the-fly if productName is provided but no productId
          if (!productId && item.productName) {
            const newProduct = await tx.product.create({
              data: { 
                name: item.productName,
                isDraft: isDraft // If the order is draft, mark the new product as draft too
              }
            });
            productId = newProduct.id;
          }
          
          // Verify product exists
          if (!productId) {
            throw new Error('Product ID or productName is required for each line item');
          }
          
          console.log('Verifying product exists:', productId);
          const product = await tx.product.findUnique({ where: { id: productId } });
          if (!product) {
            throw new Error(`Product with id ${productId} not found`);
          }
          
          processedLineItems.push({
            productId,
            quantity: item.quantity
          });
        }
        
        console.log('Processed line items:', processedLineItems);
        
        // Create the order with line items
        console.log('Creating order with data:', {
          name,
          creationDate: new Date(creationDate),
          purchaseDate: new Date(purchaseDate),
          isDraft,
          source,
          originalEmailHash,
          lineItems: processedLineItems
        });
        
        try {
          const order = await tx.order.create({
            data: {
              name,
              creationDate: new Date(creationDate),
              purchaseDate: new Date(purchaseDate),
              isDraft,
              source,
              originalEmailHash,
              lineItems: {
                create: processedLineItems
              }
            },
            include: {
              lineItems: {
                include: {
                  product: true
                }
              }
            }
          });
          console.log('Order created in transaction:', order);
          return order;
        } catch (createError) {
          console.error('Error in create operation:', createError);
          throw createError;
        }
      });

      console.log('Order created successfully:', result);
      res.status(201).json(result);
    } catch (txError) {
      console.error('Transaction error:', txError);
      throw txError;
    }
  } catch (error) {
    console.error('Error processing order:', {
      error,
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
      meta: error instanceof Prisma.PrismaClientKnownRequestError ? error.meta : undefined
    });
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code);
      console.error('Prisma error meta:', error.meta);
      
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Unique constraint violation', details: error.meta });
      } else if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Foreign key constraint violation', details: error.meta });
      }
      
      return res.status(400).json({ 
        error: 'Database error', 
        code: error.code,
        details: error.meta 
      });
    }
    
    // Handle custom errors thrown in the transaction
    if (error instanceof Error) {
      return res.status(400).json({ 
        error: error.message,
        details: {
          name: error.name,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      });
    }
    
    // Handle unknown errors
    res.status(500).json({ 
      error: 'Failed to create order',
      details: 'An unexpected error occurred'
    });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               creationDate:
 *                 type: string
 *                 format: date
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *               lineItems:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OrderLineItem'
 *             example:
 *               name: "Updated Weekly Grocery Order"
 *               creationDate: "2025-06-19"
 *               purchaseDate: "2025-06-21"
 *               lineItems:
 *                 - productId: "123e4567-e89b-12d3-a456-426614174000"
 *                   quantity: 3
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, creationDate, purchaseDate, lineItems } = req.body;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (creationDate) updateData.creationDate = new Date(creationDate);
    if (purchaseDate) updateData.purchaseDate = new Date(purchaseDate);
    
    // If line items are provided, replace them
    if (Array.isArray(lineItems)) {
      updateData.lineItems = {
        deleteMany: {},
        create: lineItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          productName: item.productName
        }))
      };
    }
    
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        lineItems: {
          include: {
            product: true
          }
        }
      }
    });
    
    res.json(order);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       204:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

/**
 * @swagger
 * /api/orders/drafts:
 *   get:
 *     summary: Get all draft orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of all draft orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/drafts', async (_req, res) => {
  try {
    const draftOrders = await prisma.order.findMany({
      where: { isDraft: true },
      include: {
        lineItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(draftOrders);
  } catch (error) {
    console.error('Error fetching draft orders:', error);
    res.status(500).json({ error: 'Failed to fetch draft orders' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/approve:
 *   post:
 *     summary: Approve a draft order (convert to regular order)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       400:
 *         description: Order is not a draft
 */
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if the order exists and is a draft
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        lineItems: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (!existingOrder.isDraft) {
      return res.status(400).json({ error: 'Order is not a draft' });
    }
    
    // Use transaction to approve order and its draft products
    const result = await prisma.$transaction(async (tx: any) => {
      // Get all draft products used in this order
      const draftProductIds = existingOrder.lineItems
        .filter(item => item.product.isDraft)
        .map(item => item.productId);
      
      // Approve draft products
      if (draftProductIds.length > 0) {
        await tx.product.updateMany({
          where: {
            id: { in: draftProductIds }
          },
          data: {
            isDraft: false
          }
        });
      }
      
      // Approve the order
      const approvedOrder = await tx.order.update({
        where: { id },
        data: { isDraft: false },
        include: {
          lineItems: {
            include: {
              product: true
            }
          }
        }
      });
      
      return approvedOrder;
    });
    
    res.json(result);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }
    console.error('Error approving order:', error);
    res.status(500).json({ error: 'Failed to approve order' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/draft:
 *   delete:
 *     summary: Delete a draft order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       204:
 *         description: Draft order deleted successfully
 *       404:
 *         description: Order not found
 *       400:
 *         description: Order is not a draft
 */
router.delete('/:id/draft', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if the order exists and is a draft
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        lineItems: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (!existingOrder.isDraft) {
      return res.status(400).json({ error: 'Order is not a draft' });
    }
    
    // Use transaction to delete order and cleanup orphaned draft products
    await prisma.$transaction(async (tx: any) => {
      // Get draft products used only in this order
      const draftProductIds = existingOrder.lineItems
        .filter(item => item.product.isDraft)
        .map(item => item.productId);
      
      // Delete the order first
      await tx.order.delete({
        where: { id }
      });
      
      // Check if any draft products are now orphaned (not used in any other orders)
      if (draftProductIds.length > 0) {
        for (const productId of draftProductIds) {
          const otherOrdersCount = await tx.orderLineItem.count({
            where: { 
              productId,
              order: {
                id: { not: id } // Exclude the deleted order
              }
            }
          });
          
          // If this draft product isn't used in any other orders, delete it
          if (otherOrdersCount === 0) {
            await tx.product.delete({
              where: { id: productId }
            });
          }
        }
      }
    });
    
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }
    console.error('Error deleting draft order:', error);
    res.status(500).json({ error: 'Failed to delete draft order' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/draft:
 *   put:
 *     summary: Update a draft order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               creationDate:
 *                 type: string
 *                 format: date
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *               lineItems:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OrderLineItem'
 *     responses:
 *       200:
 *         description: Draft order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       400:
 *         description: Order is not a draft
 */
router.put('/:id/draft', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, creationDate, purchaseDate, lineItems } = req.body;
    
    // First check if the order exists and is a draft
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });
    
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (!existingOrder.isDraft) {
      return res.status(400).json({ error: 'Order is not a draft' });
    }
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (creationDate) updateData.creationDate = new Date(creationDate);
    if (purchaseDate) updateData.purchaseDate = new Date(purchaseDate);
    
    // If line items are provided, replace them (create draft products as needed)
    if (Array.isArray(lineItems)) {
      const result = await prisma.$transaction(async (tx: any) => {
        // Process line items and create draft products on-the-fly if needed
        const processedLineItems = [];
        for (const item of lineItems) {
          let productId = item.productId;
          
          // Create draft product on-the-fly if productName is provided but no productId
          if (!productId && item.productName) {
            const newProduct = await tx.product.create({
              data: { 
                name: item.productName,
                isDraft: true // Products created for draft orders are also draft
              }
            });
            productId = newProduct.id;
          }
          
          // Verify product exists
          if (!productId) {
            throw new Error('Product ID or productName is required for each line item');
          }
          
          const product = await tx.product.findUnique({ where: { id: productId } });
          if (!product) {
            throw new Error(`Product with id ${productId} not found`);
          }
          
          processedLineItems.push({
            productId,
            quantity: item.quantity
          });
        }
        
        updateData.lineItems = {
          deleteMany: {},
          create: processedLineItems
        };
        
        return await tx.order.update({
          where: { id },
          data: updateData,
          include: {
            lineItems: {
              include: {
                product: true
              }
            }
          }
        });
      });
      
      res.json(result);
    } else {
      const order = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          lineItems: {
            include: {
              product: true
            }
          }
        }
      });
      
      res.json(order);
    }
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }
    console.error('Error updating draft order:', error);
    res.status(500).json({ error: 'Failed to update draft order' });
  }
});

export default router;
