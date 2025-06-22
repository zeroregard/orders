import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Calendar, icons } from 'lucide-react';
import { getProducts } from '../../api/backend';
import type { Product } from '../../types/backendSchemas';
import { ProductForm } from './components/ProductForm';
import { SkeletonCard, PageLayout } from '../../components';
import React from 'react';
import { formatDate } from '../../utils/dateFormatting';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'price'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data as Product[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [products, searchQuery, sortBy, sortOrder]);

  const handleCreate = async () => {
    await fetchProducts();
    setShowForm(false);
  };

  if (loading) {
    return (
      <PageLayout>
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-white">Products</h1>
            <div className="w-36 h-12 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </motion.div>

        <motion.div
          className="mb-8 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="relative flex-1">
            <div className="w-full h-12 bg-white/5 rounded-lg animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="w-32 h-12 bg-white/5 rounded-lg animate-pulse" />
            <div className="w-12 h-12 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <SkeletonCard variant="list" count={6} />
        </motion.div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400 text-lg">{error}</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center">
          <h1 className="text-white">Products</h1>
          <div className="flex gap-4">
            <motion.button
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-colors"
              onClick={() => setShowForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={20} />
              Add Product
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="mb-8 flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'price')}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <AnimatePresence mode="popLayout">
          {filteredAndSortedProducts.map((product) => (
            <motion.div
              key={product.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-colors"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)' }}
            >
              <div className="flex justify-between items-center">
                <Link 
                  to={`/products/${product.id}`} 
                  className="flex mb-2 items-center gap-3 text-xl font-semibold text-white hover:text-purple-400 transition-colors"
                >
                  {React.createElement(icons[product.iconId as keyof typeof icons] || icons.Package, { 
                    size: 24,
                    className: "text-purple-400"
                  })}
                  <span className="mb-1">{product.name}</span>

                </Link>
              </div>

              <div className="flex flex-col gap-2">
                {product.lastOrdered ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={16} />
                    <span className="text-sm">Last ordered: {formatDate(product.lastOrdered)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={16} />
                    <span className="text-sm">Never ordered</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredAndSortedProducts.length === 0 && !loading && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-gray-400 text-lg mb-4">No products found.</p>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="text-purple-400 hover:text-purple-300 underline transition-colors"
            >
              Clear search
            </button>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-screen overflow-y-auto"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ProductForm
                onCreated={handleCreate}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
} 