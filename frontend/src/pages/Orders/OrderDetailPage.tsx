import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ShoppingCart, Package, Trash2 } from 'lucide-react';
import { getOrders, deleteOrder } from '../../api/backend';
import type { Order } from '../../types/backendSchemas';
import { EditOrderForm } from './components/EditOrderForm';
import { DetailPageLayout, DetailCard, SkeletonCard, Button, DraftBadge } from '../../components';

interface OrderDetailPageProps {
  isDraft?: boolean;
}

export function OrderDetailPage({ isDraft = false }: OrderDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrder = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const getTotalItems = (order: Order) => {
    return order.lineItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleOrderUpdated = () => {
    setIsEditing(false);
    fetchOrder();
  };

  const handleDelete = async () => {
    if (!order || !id) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete the order "${order.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      setIsDeleting(true);
      await deleteOrder(id);
      navigate('/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    } finally {
      setIsDeleting(false);
    }
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
      title={
        <div className="flex items-center gap-3">
          {order.name}
          {(isDraft || order.isDraft) && <DraftBadge />}
        </div>
      }
      backTo={isDraft ? "/drafts" : "/orders"}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(!isEditing)}
      actionButtons={
        <Button
          variant="danger"
          icon={Trash2}
          onClick={handleDelete}
          disabled={isDeleting}
          size="sm"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      }
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-violet-400" />
                <div>
                  <p className="text-sm text-gray-400">Created</p>
                  <p className="text-base text-white">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-violet-400" />
                <div>
                  <p className="text-sm text-gray-400">Purchase Date</p>
                  <p className="text-base text-white">
                    {new Date(order.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package size={16} className="text-violet-400" />
                <div>
                  <p className="text-sm text-gray-400">Total Items</p>
                  <p className="text-base text-white">{getTotalItems(order)}</p>
                </div>
              </div>
            </div>
          </DetailCard>

          <DetailCard
            title="Order Items"
            icon={Package}
          >
            <div className="space-y-3">
              {order.lineItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-violet-500/20 text-violet-400 rounded-lg">
                      <Package size={16} />
                    </div>
                    <div>
                      <p className="text-base text-white font-medium">
                        {item.product?.name || `Product ${item.productId}`}
                      </p>
                      <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  {item.product?.price && (
                    <p className="text-base text-violet-400 font-medium">
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