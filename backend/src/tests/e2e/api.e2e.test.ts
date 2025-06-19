import request from 'supertest';
import app from '../../index';

describe('E2E: Product and Order API', () => {
  let productId: string;

  it('should create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'E2E Product', price: 99 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    productId = res.body.id;
  });

  it('should create an order for product', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        name: 'E2E Order',
        creationDate: '2025-06-19',
        purchaseDate: '2025-06-19',
        lineItems: [{ productId, quantity: 2 }],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.lineItems[0].productId).toBe(productId);
  });

  it('should get all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get all orders', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should predict next purchase date (404 if not enough data)', async () => {
    const res = await request(app).get(`/api/predictions/${productId}`);
    expect([200,404]).toContain(res.statusCode);
  });
});
