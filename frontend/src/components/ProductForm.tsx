import { useState } from 'react';
import { X, Package } from 'lucide-react';
import { useCreateProduct } from '../hooks/useApi';

interface ProductFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ onCreated, onCancel }: ProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const createProductMutation = useCreateProduct();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createProductMutation.mutateAsync({
        name,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
      });
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      
      if (onCreated) onCreated();
    } catch (err) {
      // Error is handled by React Query and available via createProductMutation.error
      console.error('Failed to create product:', err);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="product-form">
      <div className="form-header">
        <div className="form-title">
          <Package size={24} />
          <h3>Add New Product</h3>
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

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="product-name">Product Name *</label>
          <input
            id="product-name"
            type="text"
            placeholder="Enter product name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="product-description">Description</label>
          <textarea
            id="product-description"
            placeholder="Enter product description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="form-input form-textarea"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="product-price">Price</label>
          <div className="price-input-container">
            <span className="price-symbol">$</span>
            <input
              id="product-price"
              type="number"
              placeholder="0.00"
              value={price}
              onChange={e => setPrice(e.target.value)}
              min="0"
              step="0.01"
              className="form-input price-input"
            />
          </div>
        </div>

        {createProductMutation.error && (
          <div className="error-message">
            {createProductMutation.error instanceof Error 
              ? createProductMutation.error.message 
              : 'Failed to create product'
            }
          </div>
        )}

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={createProductMutation.isPending}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={createProductMutation.isPending || !name.trim()}
            className="submit-button"
          >
            {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
