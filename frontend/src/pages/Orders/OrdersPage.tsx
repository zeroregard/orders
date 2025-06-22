import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, ShoppingCart } from 'lucide-react';
import { getOrders } from '../../api/backend';
import type { Order } from '../../types/backendSchemas';
import { OrderForm } from './components/OrderForm';
import { PageLayout } from '../../components';
import { SearchBar, type SortOption } from '../../components/Search/SearchBar';
import { formatDate } from '../../utils/dateFormatting';

const sortOptions: SortOption[] = [
  { value: 'purchaseDate', label: 'Purchase Date' },
  { value: 'name', label: 'Name' },
];

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('purchaseDate');
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

  const handleCreate = async () => {
    await fetchOrders();
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
            <h1 className="text-white">Orders</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-white/5 rounded animate-pulse" />
                <div className="h-7 w-48 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-white/5 rounded animate-pulse" />
                <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="space-y-2">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
                      <div className="h-5 w-8 bg-white/5 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageLayout>
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

  if (!orders?.length) {
    return (
      <div className="text-gray-400 text-center py-8">
        No orders found. Create your first order to get started!
      </div>
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
          <h1 className="text-white">Orders</h1>
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
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          sortOptions={sortOptions}
        />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {filteredAndSortedOrders.map((order) => (
          <motion.div
            key={order.id}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)' }}
          >
            <div className="flex justify-between items-center mb-4">
              <Link 
                to={`/orders/${order.id}`} 
                className="flex items-center gap-3 text-xl font-semibold text-white hover:text-purple-400 transition-colors"
              >
                <ShoppingCart size={24} className="text-purple-400" />
                <span className="mb-1">{order.name}</span>
              </Link>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <Calendar size={16} className="mb-[1px]" />
              <span className="text-sm">
                {formatDate(order.purchaseDate)}
              </span>
            </div>

            {order.lineItems.length > 0 && (
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="space-y-2">
                  {order.lineItems.slice(0, 3).map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex justify-between items-center text-sm"
                    >
                      <Link 
                        to={`/products/${item.productId}`}
                        className="text-purple-400 hover:text-purple-300 transition-colors flex-1 truncate"
                      >
                        {item.product?.name || item.productName || `Product ${item.productId}`}
                      </Link>
                      <span className="text-gray-400 ml-2">×{item.quantity}</span>
                    </div>
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
    </PageLayout>
  );
} 