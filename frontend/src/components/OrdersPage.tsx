import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Calendar, ShoppingCart, Search } from 'lucide-react';
import { useOrders, useDeleteOrder } from '../hooks/useApi';
import { OrderForm } from './OrderForm';
import './OrdersPage.css';

export function OrdersPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: orders = [], isLoading, error } = useOrders();
  const deleteOrderMutation = useDeleteOrder();

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrderMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete order:', error);
        // Error handling is already done by React Query
      }
    }
  };

  const filteredOrders = orders.filter(order =>
    order.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="orders-page">
        <div className="loading-container">
          <ShoppingCart size={48} />
          <h2>Loading orders...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="error-container">
          <h2>Error loading orders</h2>
          <p>{error instanceof Error ? error.message : 'Failed to load orders'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div className="header-content">
          <div className="title-section">
            <ShoppingCart size={32} />
            <h1>Orders</h1>
          </div>
          <button
            className="add-order-button"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Add Order
          </button>
        </div>

        <div className="search-section">
          <div className="search-input-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <OrderForm
              onCreated={() => {
                setShowForm(false);
                // No need to manually refetch - React Query will handle it
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      <div className="orders-content">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={64} />
            <h2>
              {searchTerm 
                ? `No orders found matching "${searchTerm}"`
                : 'No orders yet'
              }
            </h2>
            <p>
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Get started by creating your first order'
              }
            </p>
            {!searchTerm && (
              <button
                className="add-first-order-button"
                onClick={() => setShowForm(true)}
              >
                <Plus size={20} />
                Create Your First Order
              </button>
            )}
          </div>
        ) : (
          <div className="orders-grid">
                         {filteredOrders.map((order) => (
               <div key={order.id} className="order-card">
                 <div className="order-header">
                   <Link to={`/orders/${order.id}`} className="order-name-link">
                     <h3 className="order-name">{order.name}</h3>
                   </Link>
                   <button
                     className="action-button delete"
                     onClick={() => handleDeleteOrder(order.id)}
                     disabled={deleteOrderMutation.isPending}
                   >
                     <Trash2 size={16} />
                   </button>
                 </div>
                 
                 <div className="order-dates">
                   <div className="date-item">
                     <Calendar size={16} />
                     <span>Created: {new Date(order.creationDate).toLocaleDateString()}</span>
                   </div>
                   <div className="date-item">
                     <Calendar size={16} />
                     <span>Purchase: {new Date(order.purchaseDate).toLocaleDateString()}</span>
                   </div>
                 </div>
                 
                 <div className="order-items">
                   <h4>Items ({order.lineItems.length})</h4>
                   <ul>
                     {order.lineItems.map((item, idx) => (
                       <li key={idx} className="line-item">
                         Product: {item.productId} × {item.quantity}
                       </li>
                     ))}
                   </ul>
                 </div>
                 
                 <div className="order-footer">
                   <Link to={`/orders/${order.id}`} className="view-details-btn">
                     View Details
                   </Link>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
} 