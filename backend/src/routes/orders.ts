import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { products, orders } from '../data/store';
import { Product } from '../models/product';
import { Order } from '../models/order';
import { orderSchema } from '../schemas/orderSchema';

const router = Router();

router.get('/', (_req, res) => {
  res.json(orders);
});

router.post('/', (req, res) => {
  const parseResult = orderSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid order data', details: parseResult.error.errors });
  }
  const { name, creationDate, purchaseDate, lineItems } = parseResult.data;
  // Create products on-the-fly if needed
  for (const item of lineItems) {
    if (!item.productId && item.productName) {
      const newProduct: Product = { id: uuidv4(), name: item.productName };
      products.push(newProduct);
      item.productId = newProduct.id;
    }
    if (!products.find(p => p.id === item.productId)) {
      return res.status(400).json({ error: `Product with id ${item.productId} not found` });
    }
  }
  const order: Order = {
    id: uuidv4(),
    name,
    creationDate,
    purchaseDate,
    lineItems: lineItems.map((item: any) => ({ productId: item.productId, quantity: item.quantity, productName: item.productName })),
  };
  orders.push(order);
  res.status(201).json(order);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, creationDate, purchaseDate, lineItems } = req.body;
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (name) order.name = name;
  if (creationDate) order.creationDate = creationDate;
  if (purchaseDate) order.purchaseDate = purchaseDate;
  if (Array.isArray(lineItems)) order.lineItems = lineItems;
  res.json(order);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  orders.splice(idx, 1);
  res.status(204).send();
});

export default router;
