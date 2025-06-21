import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, ShoppingCart, Package } from 'lucide-react';
import { getOrders } from '../../api/backend';
import type { Order } from '../../types/backendSchemas';
import { EditOrderForm } from './components/EditOrderForm';
import { DetailPageLayout, DetailCard, SkeletonCard } from '../../components';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchOrder = async () => {
    if (!id) {
      setError('Order ID not provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const orders = await getOrders();
      const foundOrder = orders.find(o => o.id === id) as Order;
      
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

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const getTotalItems = (order: Order) => {
    return order.lineItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleOrderUpdated = () => {
    setIsEditing(false);
    fetchOrder();
  };

  if (loading) {
    return <SkeletonCard />;
  }

  if (error || !order) {
    return (
      <DetailCard className="p-8">
        <p className="text-red-500">{error || 'Order not found'}</p>
      </DetailCard>
    );
  }

  return (
    <DetailPageLayout
      title={order.name}
      backTo="/orders"
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(!isEditing)}
    >
      {isEditing ? (
        <EditOrderForm
          order={order}
          onUpdated={handleOrderUpdated}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <DetailCard
            icon={ShoppingCart}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-violet-400" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Created</p>
                  <p className="text-lg text-white">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-violet-400" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Purchase Date</p>
                  <p className="text-lg text-white">
                    {new Date(order.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package size={20} className="text-violet-400" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Items</p>
                  <p className="text-lg text-white">{getTotalItems(order)}</p>
                </div>
              </div>
            </div>
          </DetailCard>

          <DetailCard
            title="Order Items"
            icon={Package}
          >
            <div className="space-y-4">
              {order.lineItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-violet-500/20 text-violet-400 rounded-lg">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {item.product?.name || `Product ${item.productId}`}
                      </p>
                      <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  {item.product?.price && (
                    <p className="text-lg font-semibold text-violet-400">
                      €{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </DetailCard>
        </>
      )}
    </DetailPageLayout>
  );
} 