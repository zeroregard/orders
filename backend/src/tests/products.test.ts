import request from 'supertest';
import app from '../index';

describe('Products API', () => {
  it('should create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Test Product', price: 10 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Product');
  });

  it('should not create a product with missing name', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ price: 10 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
