import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { getProducts, updateOrder } from '../../../api/backend';
import type { Product, Order } from '../../../types/backendSchemas';
import { ProductSelector } from '../../../components/Products/ProductSelector';

interface EditOrderFormProps {
  order: Order;
  onUpdated?: () => void;
  onCancel?: () => void;
}

interface LineItemForm {
  productId: string;
  quantity: number;
}

export function EditOrderForm({ order, onUpdated, onCancel }: EditOrderFormProps) {
  const [name, setName] = useState(order.name);
  const [creationDate, setCreationDate] = useState(order.creationDate.split('T')[0]);
  const [purchaseDate, setPurchaseDate] = useState(order.purchaseDate.split('T')[0]);
  const [lineItems, setLineItems] = useState<LineItemForm[]>(
    order.lineItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }))
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to fetch products');
      }
    };

    fetchProducts();
  }, []);

  const addLineItem = () => {
    if (products.length === 0) {
      setError('Please create a product first');
      return;
    }

    setLineItems([
      ...lineItems,
      { productId: products[0].id, quantity: 1 }
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(items => items.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItemForm, value: string | number) => {
    setLineItems(items =>
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lineItems.length === 0) {
      setError('Please add at least one line item');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateOrder(order.id, {
        name,
        creationDate,
        purchaseDate,
        lineItems,
      });

      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  const handleProductCreated = async () => {
    try {
      const productsData = await getProducts();
      setProducts(productsData);
      
      // Update any empty product IDs with the first product
      if (productsData.length > 0) {
        setLineItems(items => 
          items.map(item => ({
            ...item,
            productId: item.productId || productsData[0].id
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  return (
    <motion.div
      className="edit-order-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-200">
            Order Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="creationDate" className="block text-sm font-medium text-gray-200">
              Creation Date
            </label>
            <input
              type="date"
              id="creationDate"
              value={creationDate}
              onChange={(e) => setCreationDate(e.target.value)}
              required
              className="mt-1 w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>

          <div>
            <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-200">
              Purchase Date
            </label>
            <input
              type="date"
              id="purchaseDate"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
              className="mt-1 w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-200">
              Line Items
            </label>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600/20 text-violet-400 rounded-lg hover:bg-violet-600/30 transition-colors"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1">
                  <ProductSelector
                    products={products}
                    selectedProductId={item.productId}
                    onProductSelected={(productId) => updateLineItem(index, 'productId', productId)}
                    onProductCreated={handleProductCreated}
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value, 10))}
                    className="w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/70 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-lg font-medium hover:from-violet-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Order'}
          </button>
        </div>
      </form>
    </motion.div>
  );
} 