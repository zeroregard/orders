import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { icons } from 'lucide-react';
import { getProducts } from '../../../api/backend';
import type { Product } from '../../../types/backendSchemas';

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.length === 0 ? (
        <div className="col-span-full text-center text-gray-400 py-8">
          No products found.
        </div>
      ) : (
        products.map(product => {
          const Icon = icons[product.iconId as keyof typeof icons] || icons.Package;
          return (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="block"
            >
              <motion.div
                className="bg-white/5 border border-white/20 rounded-lg p-6 hover:bg-white/8 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-violet-500/20 text-violet-400 rounded-lg">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">{product.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  {product.price !== undefined && (
                    <p className="text-lg font-semibold text-violet-400">
                      ${product.price.toFixed(2)}
                    </p>
                  )}
                  <p className="text-sm text-gray-400">
                    Added {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            </Link>
          );
        })
      )}
    </div>
  );
}
