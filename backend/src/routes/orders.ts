import { Router } from 'express';
import { prisma } from '../services/database';
import { orderSchema } from '../schemas/orderSchema';
import { pushNotificationService } from '../services/pushNotificationService';
import { purchasePatternService } from '../services/purchasePatternService';
import { Order, OrderLineItem, Product } from '@prisma/client';

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
router.get('/', async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
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
    const parseResult = orderSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid order data', details: parseResult.error.errors });
    }
    
    const { name, creationDate, purchaseDate, lineItems } = parseResult.data;
    
    // Process line items and create products on-the-fly if needed
    const processedLineItems = [];
    for (const item of lineItems) {
      let productId = item.productId;
      
      // Create product on-the-fly if productName is provided but no productId
      if (!productId && item.productName) {
        const newProduct = await prisma.product.create({
          data: { name: item.productName }
        });
        productId = newProduct.id;
      }
      
      // Verify product exists
      if (!productId) {
        return res.status(400).json({ error: 'Product ID or productName is required for each line item' });
      }
      
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return res.status(400).json({ error: `Product with id ${productId} not found` });
      }
      
      processedLineItems.push({
        productId,
        quantity: item.quantity,
        productName: item.productName || product.name
      });
    }
    
    // Create order with line items using raw SQL to handle userId
    const order = await prisma.$queryRaw<OrderWithLineItems[]>`
      WITH new_order AS (
        INSERT INTO orders (id, name, creation_date, purchase_date, user_id, created_at, updated_at)
        VALUES (gen_random_uuid(), ${name}, ${new Date(creationDate)}, ${new Date(purchaseDate)}, ${req.user!.sub}, NOW(), NOW())
        RETURNING *
      ),
      new_line_items AS (
        INSERT INTO order_line_items (id, order_id, product_id, quantity, product_name, created_at)
        SELECT 
          gen_random_uuid(),
          (SELECT id FROM new_order),
          item.product_id,
          item.quantity::integer,
          item.product_name,
          NOW()
        FROM json_array_elements(${JSON.stringify(processedLineItems)}::json) AS item
        RETURNING *
      )
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id', li.id,
            'orderId', li.order_id,
            'productId', li.product_id,
            'quantity', li.quantity,
            'productName', li.product_name,
            'createdAt', li.created_at,
            'product', json_build_object(
              'id', p.id,
              'name', p.name,
              'description', p.description,
              'price', p.price,
              'iconId', p.icon_id,
              'createdAt', p.created_at,
              'updatedAt', p.updated_at
            )
          )
        ) as "lineItems"
      FROM new_order o
      LEFT JOIN new_line_items li ON true
      LEFT JOIN products p ON li.product_id = p.id
      GROUP BY o.id
    `;
    
    if (!order || order.length === 0) {
      throw new Error('Failed to create order');
    }

    const createdOrder = order[0];
    
    // Send push notification to all subscribers
    try {
      await pushNotificationService.sendNewOrderNotification({
        id: createdOrder.id,
        name: createdOrder.name,
        itemCount: createdOrder.lineItems.length,
      });
      console.log(`📱 Push notification sent for new order: ${createdOrder.name}`);
    } catch (notificationError) {
      // Don't fail the order creation if notifications fail
      console.error('❌ Failed to send push notification for new order:', notificationError);
    }

    // Try to create purchase patterns for each product in the order
    try {
      for (const item of createdOrder.lineItems) {
        await purchasePatternService.createPatternFromOrders({
          userId: req.user!.sub,
          productId: item.productId
        });
      }
    } catch (patternError) {
      // Don't fail the order creation if pattern creation fails
      console.error('❌ Failed to create purchase patterns:', patternError);
    }
    
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
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

export default router;
