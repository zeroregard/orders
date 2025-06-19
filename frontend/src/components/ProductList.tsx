import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
}

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(setProducts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

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
