import { useEffect, useState } from 'react';
import { getOrders } from '../../../api/backend';

interface OrderLineItem {
  productId: string;
  quantity: number;
}

interface Order {
  id: string;
  name: string;
  creationDate: string;
  purchaseDate: string;
  lineItems: OrderLineItem[];
}

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="order-list">
      <h2>Orders</h2>
      {orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <ul>
          {orders.map(o => (
            <li key={o.id} className="order-item">
              <div className="order-name">{o.name}</div>
              <div className="order-dates">
                Created: {new Date(o.creationDate).toLocaleDateString()}<br />
                Purchased: {new Date(o.purchaseDate).toLocaleDateString()}
              </div>
              <div className="order-lines">
                <strong>Line items:</strong>
                <ul>
                  {o.lineItems.map((li, idx) => (
                    <li key={idx} className="order-line-item">
                      Product ID: {li.productId}, Qty: {li.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
