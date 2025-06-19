import { Product } from '../../models/product';

describe('Product Model', () => {
  it('should create a product object with required fields', () => {
    const product: Product = { id: '1', name: 'Test', description: 'desc', price: 5 };
    expect(product.id).toBe('1');
    expect(product.name).toBe('Test');
    expect(product.description).toBe('desc');
    expect(product.price).toBe(5);
  });

  it('should allow optional fields to be undefined', () => {
    const product: Product = { id: '2', name: 'Test2' };
    expect(product.description).toBeUndefined();
    expect(product.price).toBeUndefined();
  });
});
