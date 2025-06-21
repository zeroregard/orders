import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Calendar, ShoppingCart, Package } from 'lucide-react';
import { getOrders, deleteOrder } from '../api/backend';
import type { Order } from '../types/backendSchemas';
import { OrderForm } from './OrderForm';

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
      <div className="orders-page">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="header-content">
          <h1>Orders</h1>
          <div className="header-actions">
            <motion.button
              className="add-button"
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
        className="filters-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-container">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'purchaseDate')}
            className="sort-select"
          >
            <option value="createdAt">Sort by Creation Date</option>
            <option value="purchaseDate">Sort by Purchase Date</option>
            <option value="name">Sort by Name</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-button"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </motion.div>

      <motion.div
        className="orders-grid"
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <AnimatePresence mode="popLayout">
          {filteredAndSortedOrders.map((order) => (
            <motion.div
              key={order.id}
              className="order-card"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)' }}
            >
              <div className="card-header">
                <div className="order-title">
                  <ShoppingCart size={20} className="title-icon" />
                  <Link to={`/orders/${order.id}`} className="order-name">
                    {order.name}
                  </Link>
                </div>
                <div className="card-actions">
                  <motion.button
                    className="action-button delete"
                    onClick={() => handleDelete(order.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>

              <div className="order-meta">
                <div className="meta-row">
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span className="meta-label">Created:</span>
                    <span className="meta-value">
                      {new Date(order.createdAt || order.creationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="meta-row">
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span className="meta-label">Purchase:</span>
                    <span className="meta-value">
                      {new Date(order.purchaseDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="meta-row">
                  <div className="meta-item">
                    <Package size={16} />
                    <span className="meta-label">Items:</span>
                    <span className="meta-value">
                      {getTotalItems(order)} items ({order.lineItems.length} products)
                    </span>
                  </div>
                </div>
              </div>

              {order.lineItems.length > 0 && (
                <div className="line-items">
                  <h4>Line Items</h4>
                  <div className="line-items-list">
                    {order.lineItems.slice(0, 3).map((item, index) => (
                      <motion.div
                        key={`${item.productId}-${index}`}
                        className="line-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Link 
                          to={`/products/${item.productId}`}
                          className="item-name item-link"
                        >
                          {item.productName || `Product ${item.productId}`}
                        </Link>
                        <span className="item-quantity">×{item.quantity}</span>
                      </motion.div>
                    ))}
                    {order.lineItems.length > 3 && (
                      <div className="line-item more-items">
                        <Link to={`/orders/${order.id}`} className="view-more-link">
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
          className="empty-state"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p>No orders found.</p>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="clear-search">
              Clear search
            </button>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="modal-content"
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