import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ShoppingCart, CheckCircle, Trash2 } from 'lucide-react';
import { getOrders, approveOrder, deleteDraftOrder } from '../../api/backend';
import type { Order } from '../../types/backendSchemas';
import { PageLayout, DraftBadge } from '../../components';
import { SearchBar, type SortOption } from '../../components/Search/SearchBar';
import { formatDate } from '../../utils/dateFormatting';

const sortOptions: SortOption[] = [
  { value: 'purchaseDate', label: 'Purchase Date' },
  { value: 'name', label: 'Name' },
];

export function DraftsPage() {
  const [draftOrders, setDraftOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('purchaseDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());

  const fetchDraftOrders = async () => {
    try {
      setLoading(true);
      // Fetch only draft orders
      const data = await getOrders({ draftsOnly: true });
      setDraftOrders(data as Order[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch draft orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraftOrders();
  }, []);

  const handleApprove = async (orderId: string, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent Link navigation
    event.stopPropagation();
    
    try {
      setProcessingOrders(prev => new Set(prev).add(orderId));
      await approveOrder(orderId);
      // Refresh the list to remove the approved order
      await fetchDraftOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve order');
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleDelete = async (orderId: string, orderName: string, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent Link navigation
    event.stopPropagation();
    
    const confirmed = window.confirm(
      `Are you sure you want to delete the draft order "${orderName}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      setProcessingOrders(prev => new Set(prev).add(orderId));
      await deleteDraftOrder(orderId);
      // Refresh the list to remove the deleted order
      await fetchDraftOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete draft order');
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = draftOrders.filter(order =>
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
  }, [draftOrders, searchQuery, sortBy, sortOrder]);

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
            <h1 className="text-white">Draft Orders</h1>
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
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400 text-lg">{error}</div>
        </div>
      </PageLayout>
    );
  }

  if (!draftOrders?.length) {
    return (
      <PageLayout>
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-white">Draft Orders</h1>
        </motion.div>
        
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Draft Orders</h3>
            <p className="text-gray-400">
              No draft orders found. Draft orders are created automatically when receipts are processed via email.
            </p>
          </div>
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
          <div>
            <h1 className="text-white">Draft Orders</h1>
            <p className="text-gray-400 mt-1">
              Review and approve orders created from email receipts
            </p>
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {filteredAndSortedOrders.map((order, index) => (
          <motion.div
            key={order.id}
            className="bg-gray-800 border border-amber-500/30 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            whileHover={{ y: -4 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <Link
                  to={`/drafts/${order.id}`}
                  className="text-xl font-semibold text-white hover:text-amber-400 transition-colors"
                >
                  {order.name}
                </Link>
                <div className="ml-auto">
                  <DraftBadge />
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                <Calendar size={16} />
                <span>{formatDate(order.purchaseDate)}</span>
              </div>

              {order.source && order.source !== 'MANUAL' && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                    {order.source === 'EMAIL' ? '📧 Email Receipt' : order.source}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="space-y-2">
                  {order.lineItems?.slice(0, 3).map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300 truncate">
                        {item.product?.name || `Item ${itemIndex + 1}`}
                        {item.product?.isDraft && (
                          <span className="ml-1 text-xs text-amber-400">(new)</span>
                        )}
                      </span>
                      <span className="text-gray-400 flex-shrink-0">×{item.quantity}</span>
                    </div>
                  ))}
                  {order.lineItems && order.lineItems.length > 3 && (
                    <div className="text-xs text-gray-500 text-center pt-2">
                      +{order.lineItems.length - 3} more items
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={(e) => handleApprove(order.id, e)}
                  disabled={processingOrders.has(order.id)}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  {processingOrders.has(order.id) ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={(e) => handleDelete(order.id, order.name, e)}
                  disabled={processingOrders.has(order.id)}
                  className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 rounded-lg text-sm transition-colors"
                  title="Delete draft"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </PageLayout>
  );
} 