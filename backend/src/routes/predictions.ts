import { Router } from 'express';
import { prisma } from '../services/database';
import { calculateAverageQuantityAndConsumption } from '../models/prediction';

const router = Router();

/**
 * @swagger
 * /api/predictions/{productId}:
 *   get:
 *     summary: Predict next purchase date and recommended quantity for a product
 *     tags: [Predictions]
 *     description: Analyzes past orders to predict when a product will likely be purchased again and in what quantity. Requires at least 2 previous orders containing the product.
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to predict next purchase for
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Prediction calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productId:
 *                   type: string
 *                   description: The product ID
 *                 predictedPurchaseDates:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: date
 *                     description: Predicted date for next purchase (YYYY-MM-DD format)
 *                 averageFrequency:
 *                   type: string
 *                   description: Average frequency of purchases
 *                 recommendedQuantity:
 *                   type: number
 *                   description: Recommended quantity to purchase based on past orders
 *                 monthlyConsumption:
 *                   type: number
 *                   description: Estimated monthly consumption rate
 *               example:
 *                 productId: "123e4567-e89b-12d3-a456-426614174000"
 *                 predictedPurchaseDates: ["2025-07-15", "2025-08-15", "2025-09-15"]
 *                 averageFrequency: "P1W"
 *                 recommendedQuantity: 2
 *                 monthlyConsumption: 4.5
 *       404:
 *         description: Not enough data to make a prediction (requires at least 2 orders)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: "Not enough data to predict next purchase"
 */
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find all orders containing the product with their quantities
    const relevantOrders = await prisma.orderLineItem.findMany({
      where: {
        productId: productId
      },
      include: {
        order: true
      },
      orderBy: {
        order: {
          purchaseDate: 'asc'
        }
      }
    });

    if (relevantOrders.length < 2) {
      return res.status(404).json({ error: 'Not enough data to predict next purchase' });
    }

    // Transform orders for consumption analysis
    const ordersWithQuantity = relevantOrders.map(item => ({
      purchaseDate: item.order.purchaseDate,
      quantity: item.quantity
    }));

    // Calculate quantity-based metrics
    const { recommendedQuantity, monthlyConsumption } = calculateAverageQuantityAndConsumption(ordersWithQuantity);

    // Calculate intervals between purchases
    const purchaseDates = relevantOrders.map(item => new Date(item.order.purchaseDate));
    const intervals: number[] = [];
    for (let i = 1; i < purchaseDates.length; i++) {
      intervals.push(purchaseDates[i].getTime() - purchaseDates[i - 1].getTime());
    }
    const avgIntervalMs = intervals.reduce((sum, v) => sum + v, 0) / intervals.length;
    const lastPurchaseDate = purchaseDates[purchaseDates.length - 1];
    
    // Calculate next 3 predictions and filter for current year
    const currentYear = new Date().getFullYear();
    const predictions = Array.from({ length: 3 }, (_, i) => {
      const predictedDate = new Date(lastPurchaseDate.getTime() + avgIntervalMs * (i + 1));
      return predictedDate.toISOString().slice(0, 10);
    }).filter(date => new Date(date).getFullYear() === currentYear);

    // Convert average interval to ISO Duration string
    const avgIntervalDays = Math.round(avgIntervalMs / (1000 * 60 * 60 * 24));
    const avgIntervalWeeks = Math.floor(avgIntervalDays / 7);
    const remainingDays = avgIntervalDays % 7;
    
    let averageFrequency = 'P';
    if (avgIntervalWeeks > 0) {
      averageFrequency += `${avgIntervalWeeks}W`;
    }
    if (remainingDays > 0) {
      averageFrequency += `${remainingDays}D`;
    }

    res.json({
      productId,
      predictedPurchaseDates: predictions,
      averageFrequency,
      recommendedQuantity,
      monthlyConsumption
    });
  } catch (error) {
    console.error('Error predicting next purchase:', error);
    res.status(500).json({ error: 'Failed to predict next purchase' });
  }
});

export default router;
