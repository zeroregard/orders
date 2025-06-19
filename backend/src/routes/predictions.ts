import { Router } from 'express';
import { orders } from '../data/store';

const router = Router();

router.get('/:productId', (req, res) => {
  const { productId } = req.params;
  // Find all orders containing the product
  const relevantOrders = orders
    .filter(order => order.lineItems.some(item => item.productId === productId))
    .sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());

  if (relevantOrders.length < 2) {
    return res.status(404).json({ error: 'Not enough data to predict next purchase' });
  }

  // Calculate intervals between purchases
  const purchaseDates = relevantOrders.map(order => new Date(order.purchaseDate));
  const intervals: number[] = [];
  for (let i = 1; i < purchaseDates.length; i++) {
    intervals.push(purchaseDates[i].getTime() - purchaseDates[i - 1].getTime());
  }
  const avgIntervalMs = intervals.reduce((sum, v) => sum + v, 0) / intervals.length;
  const lastPurchaseDate = purchaseDates[purchaseDates.length - 1];
  const predictedDate = new Date(lastPurchaseDate.getTime() + avgIntervalMs);

  res.json({
    productId,
    predictedNextPurchaseDate: predictedDate.toISOString().slice(0, 10)
  });
});

export default router;
