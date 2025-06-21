import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from '../hooks/useApi';
import './OrderDetailPage.css';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: orders = [], isLoading, error } = useOrders();

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading order...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">Error loading order: {error.message}</div>
        <Link to="/orders">
          <button>Back to Orders</button>
        </Link>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="container">
        <div className="error">No order ID provided</div>
        <Link to="/orders">
          <button>Back to Orders</button>
        </Link>
      </div>
    );
  }

  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="container">
        <div className="error">Order not found</div>
        <Link to="/orders">
          <button>Back to Orders</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>{order.name}</h1>
        <Link to="/orders">
          <button>Back to Orders</button>
        </Link>
      </div>

      <div className="order-info">
        <p><strong>Creation Date:</strong> {new Date(order.creationDate).toLocaleDateString()}</p>
        <p><strong>Purchase Date:</strong> {new Date(order.purchaseDate).toLocaleDateString()}</p>
      </div>

      <div className="line-items">
        <h3>Line Items ({order.lineItems.length})</h3>
        {order.lineItems.length === 0 ? (
          <p>No line items</p>
        ) : (
          <ul>
            {order.lineItems.map((item, index) => (
              <li key={index} className="line-item">
                <strong>Product ID:</strong> {item.productId} <br />
                <strong>Quantity:</strong> {item.quantity}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}; 