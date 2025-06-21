import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Calendar, ShoppingCart, Package } from 'lucide-react';
import { getOrders, deleteOrder } from '../../api/backend';
import type { Order } from '../../types/backendSchemas';
import { OrderForm } from './components/OrderForm';
import { SkeletonCard } from '../../components';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'purchaseDate'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showForm, setShowForm] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data as Order[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = orders.filter(order =>
      order.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || a.creationDate || 0).getTime();
          bValue = new Date(b.createdAt || b.creationDate || 0).getTime();
          break;
        case 'purchaseDate':
          aValue = new Date(a.purchaseDate || 0).getTime();
          bValue = new Date(b.purchaseDate || 0).getTime();
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
  }, [orders, searchQuery, sortBy, sortOrder]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
      await deleteOrder(id);
      await fetchOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete order');
    }
  };

  const handleCreate = async () => {
    await fetchOrders();
    setShowForm(false);
  };

  const getTotalItems = (order: Order) => {
    return order.lineItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="page">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Orders</h1>
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
            <div className="w-48 h-12 bg-white/5 rounded-lg animate-pulse" />
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400 text-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <div className="flex gap-4">
            <motion.button
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-colors"
              onClick={() => setShowForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={20} />
              Add Order
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
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'purchaseDate')}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="createdAt">Sort by Creation Date</option>
            <option value="purchaseDate">Sort by Purchase Date</option>
            <option value="name">Sort by Name</option>
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
          {filteredAndSortedOrders.map((order) => (
            <motion.div
              key={order.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-colors"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)' }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <ShoppingCart size={20} className="text-purple-400" />
                  <Link 
                    to={`/orders/${order.id}`} 
                    className="text-xl font-semibold text-white hover:text-purple-400 transition-colors"
                  >
                    {order.name}
                  </Link>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => handleDelete(order.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={16} />
                  <span className="text-sm">Created:</span>
                  <span className="text-sm text-white">
                    {new Date(order.createdAt || order.creationDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={16} />
                  <span className="text-sm">Purchase:</span>
                  <span className="text-sm text-white">
                    {new Date(order.purchaseDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <Package size={16} />
                  <span className="text-sm">Items:</span>
                  <span className="text-sm text-white">
                    {getTotalItems(order)} items ({order.lineItems.length} products)
                  </span>
                </div>
              </div>

              {order.lineItems.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Line Items</h4>
                  <div className="space-y-2">
                    {order.lineItems.slice(0, 3).map((item, index) => (
                      <motion.div
                        key={`${item.productId}-${index}`}
                        className="flex justify-between items-center text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Link 
                          to={`/products/${item.productId}`}
                          className="text-purple-400 hover:text-purple-300 transition-colors flex-1 truncate"
                        >
                          {item.product?.name || item.productName || `Product ${item.productId}`}
                        </Link>
                        <span className="text-gray-400 ml-2">×{item.quantity}</span>
                      </motion.div>
                    ))}
                    {order.lineItems.length > 3 && (
                      <div className="text-sm">
                        <Link 
                          to={`/orders/${order.id}`} 
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          +{order.lineItems.length - 3} more items
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredAndSortedOrders.length === 0 && !loading && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-gray-400 text-lg mb-4">No orders found.</p>
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
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.30)',
              backdropFilter: 'blur(3px)',
            }}
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
              <OrderForm
                onCreated={handleCreate}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 