import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, ShoppingCart, Package, ExternalLink, AlertCircle } from 'lucide-react';
import { getOrders } from '../api/backend';
import type { Order } from '../types/backendSchemas';
import './OrderDetailPage.css';

// Extended Order interface to handle database fields
interface ExtendedOrder extends Order {
  createdAt?: string;
  updatedAt?: string;
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ExtendedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        setError('Order ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orders = await getOrders();
        const foundOrder = orders.find(o => o.id === id) as ExtendedOrder;
        
        if (!foundOrder) {
          setError('Order not found');
          setLoading(false);
          return;
        }

        setOrder(foundOrder);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const getTotalItems = (order: ExtendedOrder) => {
    return order.lineItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="loading">Loading order...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <div className="error">
          <AlertCircle size={48} />
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/orders')} className="back-button">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="error">
          <AlertCircle size={48} />
          <h2>Order Not Found</h2>
          <p>The order you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/orders')} className="back-button">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link to="/orders" className="back-link">
          <ArrowLeft size={20} />
          Back to Orders
        </Link>
      </motion.div>

      <motion.div
        className="order-detail-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="order-info-card">
          <div className="order-header">
            <div className="order-title">
              <ShoppingCart size={32} />
              <div>
                <h1>{order.name}</h1>
                <p className="order-subtitle">Order Details</p>
              </div>
            </div>
          </div>

          <div className="order-meta-grid">
            <div className="meta-card">
              <div className="meta-icon">
                <Calendar size={24} />
              </div>
              <div className="meta-content">
                <span className="meta-label">Created</span>
                <span className="meta-value">
                  {new Date(order.createdAt || order.creationDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-icon">
                <Calendar size={24} />
              </div>
              <div className="meta-content">
                <span className="meta-label">Purchase Date</span>
                <span className="meta-value">
                  {new Date(order.purchaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-icon">
                <Package size={24} />
              </div>
              <div className="meta-content">
                <span className="meta-label">Total Items</span>
                <span className="meta-value">
                  {getTotalItems(order)} items ({order.lineItems.length} products)
                </span>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="line-items-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="line-items-header">
            <div className="line-items-icon">
              <Package size={28} />
            </div>
            <div>
              <h2>Line Items</h2>
              <p>{order.lineItems.length} products in this order</p>
            </div>
          </div>

          <div className="line-items-content">
            {order.lineItems.length > 0 ? (
              <div className="line-items-list">
                {order.lineItems.map((item, index) => (
                  <motion.div
                    key={`${item.productId}-${index}`}
                    className="line-item-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="line-item-info">
                      <div className="line-item-header">
                        <h3 className="item-name">
                          {item.productName || `Product ${item.productId}`}
                        </h3>
                        <div className="item-quantity">
                          <Package size={16} />
                          <span>×{item.quantity}</span>
                        </div>
                      </div>
                      <div className="item-id">
                        Product ID: {item.productId}
                      </div>
                    </div>
                    <div className="line-item-actions">
                      <Link 
                        to={`/products/${item.productId}`}
                        className="view-product-link"
                      >
                        <ExternalLink size={16} />
                        View Product
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="empty-line-items">
                <Package size={48} />
                <p>No line items found</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 