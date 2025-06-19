import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { products } from '../data/store';
import { Product } from '../models/product';
import { productSchema } from '../schemas/productSchema';

const router = Router();

router.get('/', (_req, res) => {
  res.json(products);
});

router.post('/', (req, res) => {
  const parseResult = productSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid product data', details: parseResult.error.errors });
  }
  const { name, description, price } = parseResult.data;
  const product: Product = { id: uuidv4(), name, description, price };
  products.push(product);
  res.status(201).json(product);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (name) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  res.json(product);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  products.splice(idx, 1);
  res.status(204).send();
});

export default router;
