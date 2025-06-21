import { useOrders } from '../hooks/useApi';

export function OrderList() {
  const { data: orders = [], isLoading, error } = useOrders();

  if (isLoading) return <div>Loading orders...</div>;
  if (error) return <div className="error">
    {error instanceof Error ? error.message : 'Failed to fetch orders'}
  </div>;

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
