import request from 'supertest';
import app from '../index';

describe('Orders API', () => {
  it('should create an order for an existing product', async () => {
    // Create a product first
    const productRes = await request(app)
      .post('/api/products')
      .send({ name: 'Order Product' });
    const productId = productRes.body.id;

    const res = await request(app)
      .post('/api/orders')
      .send({
        name: 'Order1',
        creationDate: '2024-01-01',
        purchaseDate: '2024-01-01',
        lineItems: [{ productId, quantity: 2 }],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.lineItems[0].productId).toBe(productId);
  });

  it('should not create an order with missing fields', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ name: 'Order2' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
