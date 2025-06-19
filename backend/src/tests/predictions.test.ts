import request from 'supertest';
import app from '../index';

describe('Predictions API', () => {
  it('should return 404 if not enough data', async () => {
    const productRes = await request(app)
      .post('/api/products')
      .send({ name: 'Predict Product' });
    const productId = productRes.body.id;
    const res = await request(app).get(`/api/predictions/${productId}`);
    expect(res.statusCode).toBe(404);
  });

  it('should predict next purchase date with 2+ orders', async () => {
    const productRes = await request(app)
      .post('/api/products')
      .send({ name: 'Cat Food' });
    const productId = productRes.body.id;
    // Place two orders
    await request(app).post('/api/orders').send({
      name: 'Order1',
      creationDate: '2024-01-01',
      purchaseDate: '2024-01-01',
      lineItems: [{ productId, quantity: 2 }],
    });
    await request(app).post('/api/orders').send({
      name: 'Order2',
      creationDate: '2024-02-01',
      purchaseDate: '2024-02-01',
      lineItems: [{ productId, quantity: 2 }],
    });
    const res = await request(app).get(`/api/predictions/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('predictedNextPurchaseDate');
    expect(res.body.predictedNextPurchaseDate).toBe('2024-03-02');
  });
});
