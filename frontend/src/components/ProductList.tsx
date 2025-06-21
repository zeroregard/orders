import { useProducts } from '../hooks/useApi';

export function ProductList() {
  const { data: products = [], isLoading, error } = useProducts();

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div className="error">
    {error instanceof Error ? error.message : 'Failed to fetch products'}
  </div>;

  return (
    <div className="product-list">
      <h2>Products</h2>
      {products.length === 0 ? (
        <div>No products found.</div>
      ) : (
        <ul>
          {products.map(p => (
            <li key={p.id} className="product-item">
              <div className="product-name">{p.name}</div>
              {p.description && <div className="product-desc">{p.description}</div>}
              {p.price !== undefined && <div className="product-price">${p.price}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
