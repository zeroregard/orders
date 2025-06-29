import { useEffect, useState } from 'react';
import { X, Plus, Trash2, ShoppingCart, Calendar, Package } from 'lucide-react';
import { getProducts, createOrder } from '../../../api/backend';
import type { Product } from '../../../types/backendSchemas';
import { ProductSelector } from '../../../components/Products/ProductSelector';
import './OrderForm.css';

interface OrderFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

interface LineItemForm {
  productId: string;
  quantity: number;
}

export function OrderForm({ onCreated, onCancel }: OrderFormProps) {
  const [name, setName] = useState('');
  const [creationDate, setCreationDate] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [lineItems, setLineItems] = useState<LineItemForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
        if (productsData.length > 0) {
          setLineItems([{ productId: productsData[0].id, quantity: 1 }]);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      }
    };

    fetchProducts();

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    setCreationDate(today);
    setPurchaseDate(today);
  }, []);

  const addLineItem = () => {
    // Always add a line item, even if there are no products
    setLineItems([...lineItems, { productId: products[0]?.id || '', quantity: 1 }]);
  };

  const updateLineItem = (index: number, field: keyof LineItemForm, value: string | number) => {
    setLineItems(items => 
      items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeLineItem = (index: number) => {
    setLineItems(items => items.filter((_, i) => i !== index));
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
      await createOrder({
        name,
        creationDate,
        purchaseDate,
        lineItems,
      });

      // Reset form
      setName('');
      setCreationDate('');
      setPurchaseDate('');
      setLineItems([]);
      
      if (onCreated) onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
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
    <form className="w-full max-w-none" onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <ShoppingCart size={24} className="text-violet-400" />
          <h3 className="m-0 text-white text-xl font-semibold">Create New Order</h3>
        </div>
        {onCancel && (
          <button
            type="button"
            className="flex items-center justify-center w-9 h-9 bg-white/10 border border-white/20 rounded-lg text-white/70 cursor-pointer transition-all duration-200 flex-shrink-0 hover:bg-white/20 hover:text-white"
            onClick={handleCancel}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-400/90 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="orderName" className="block mb-2 text-white/80 font-medium text-sm">Order Name</label>
        <input
          id="orderName"
          type="text"
          className="w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10 placeholder:text-white/40"
          placeholder="Enter order name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="creationDate" className="block mb-2 text-white/80 font-medium text-sm">Creation Date</label>
        <div className="relative flex items-center">
          <Calendar size={16} className="absolute left-3 text-white/60 z-10" />
          <input
            id="creationDate"
            type="date"
            className="w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10 pl-10"
            value={creationDate}
            onChange={(e) => setCreationDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="purchaseDate" className="block mb-2 text-white/80 font-medium text-sm">Purchase Date</label>
        <div className="relative flex items-center">
          <Calendar size={16} className="absolute left-3 text-white/60 z-10" />
          <input
            id="purchaseDate"
            type="date"
            className="w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10 pl-10"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <div className="line-items-header">
          <label>Line Items</label>
          <button
            type="button"
            className="add-line-item-button"
            onClick={addLineItem}
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        {lineItems.length === 0 ? (
          <div className="empty-line-items">
            <Package size={32} />
            <p>No line items added yet</p>
            <button
              type="button"
              className="add-first-item-button"
              onClick={addLineItem}
            >
              <Plus size={16} />
              Add First Item
            </button>
          </div>
        ) : (
          <div className="line-items-list">
            {lineItems.map((item, index) => (
              <div key={index} className="line-item">
                <div className="flex-1">
                  <ProductSelector
                    products={products}
                    selectedProductId={item.productId}
                    onProductSelected={(productId) => updateLineItem(index, 'productId', productId)}
                    onProductCreated={handleProductCreated}
                  />
                </div>
                <div className="quantity-input">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value, 10))}
                    className="w-24 py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>
                <button
                  type="button"
                  className="remove-line-item"
                  onClick={() => removeLineItem(index)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-8 justify-end flex-wrap">
        {onCancel && (
          <button
            type="button"
            className="py-3 px-6 bg-white/10 border border-white/20 rounded-lg text-white/80 font-medium cursor-pointer transition-all duration-200 min-w-30 hover:bg-white/15 hover:text-white"
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !name.trim() || lineItems.length === 0}
          className="py-3 px-6 border-0 rounded-lg text-white font-semibold cursor-pointer transition-all duration-200 min-w-36 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)'
          }}
        >
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}
