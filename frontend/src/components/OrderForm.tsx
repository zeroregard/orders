import { useEffect, useState } from 'react';
import { X, Plus, Trash2, ShoppingCart, Calendar, Package } from 'lucide-react';
import { useProducts, useCreateOrder } from '../hooks/useApi';
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
  const [lineItems, setLineItems] = useState<LineItemForm[]>([]);

  // Use React Query hooks
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const createOrderMutation = useCreateOrder();

  useEffect(() => {
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    setCreationDate(today);
    setPurchaseDate(today);

    // Initialize with first product if available
    if (products.length > 0 && lineItems.length === 0) {
      setLineItems([{ productId: products[0].id, quantity: 1 }]);
    }
  }, [products, lineItems.length]);

  const addLineItem = () => {
    if (products.length > 0) {
      setLineItems([...lineItems, { productId: products[0].id, quantity: 1 }]);
    }
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
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        name,
        creationDate,
        purchaseDate,
        lineItems,
      });

      // Reset form
      setName('');
      const today = new Date().toISOString().split('T')[0];
      setCreationDate(today);
      setPurchaseDate(today);
      setLineItems(products.length > 0 ? [{ productId: products[0].id, quantity: 1 }] : []);
      
      if (onCreated) onCreated();
    } catch (err) {
      // Error is handled by React Query and available via createOrderMutation.error
      console.error('Failed to create order:', err);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  const isLoading = productsLoading || createOrderMutation.isPending;
  const error = createOrderMutation.error;

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div className="form-title">
          <ShoppingCart size={24} />
          <h3>Create New Order</h3>
        </div>
        {onCancel && (
          <button
            type="button"
            className="close-button"
            onClick={handleCancel}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error instanceof Error ? error.message : 'Failed to create order'}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="orderName">Order Name</label>
        <input
          id="orderName"
          type="text"
          className="form-input"
          placeholder="Enter order name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="creationDate">Creation Date</label>
        <div className="date-input-container">
          <Calendar size={16} className="date-icon" />
          <input
            id="creationDate"
            type="date"
            className="form-input date-input"
            value={creationDate}
            onChange={(e) => setCreationDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="purchaseDate">Purchase Date</label>
        <div className="date-input-container">
          <Calendar size={16} className="date-icon" />
          <input
            id="purchaseDate"
            type="date"
            className="form-input date-input"
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
            disabled={products.length === 0}
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
              disabled={products.length === 0}
            >
              <Plus size={16} />
              Add First Item
            </button>
          </div>
        ) : (
          <div className="line-items-list">
            {lineItems.map((item, index) => (
              <div key={index} className="line-item-form">
                <div className="line-item-content">
                  <div className="form-row">
                    <div className="form-col">
                      <label htmlFor={`product-${index}`}>Product</label>
                      <select
                        id={`product-${index}`}
                        className="form-input"
                        value={item.productId}
                        onChange={(e) => updateLineItem(index, 'productId', e.target.value)}
                        required
                      >
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-col quantity-col">
                      <label htmlFor={`quantity-${index}`}>Quantity</label>
                      <input
                        id={`quantity-${index}`}
                        type="number"
                        className="form-input"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  className="remove-line-item-button"
                  onClick={() => removeLineItem(index)}
                  disabled={lineItems.length === 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {productsLoading && (
          <div className="loading-message">
            <p>Loading products...</p>
          </div>
        )}

        {!productsLoading && products.length === 0 && (
          <div className="no-products-message">
            <p>No products available. Please create some products first.</p>
          </div>
        )}
      </div>

      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || products.length === 0 || lineItems.length === 0}
        >
          {createOrderMutation.isPending ? 'Creating Order...' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}
