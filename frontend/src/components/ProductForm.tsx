import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Package } from 'lucide-react';
import { createProduct } from '../api/backend';
import type { Product } from '../types/backendSchemas';

interface ProductFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ onCreated, onCancel }: ProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const productData: Omit<Product, 'id'> = {
        name,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
      };
      
      await createProduct(productData);
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      
      if (onCreated) onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <motion.div
      className="product-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="form-header">
        <div className="form-title">
          <Package size={24} />
          <h3>Add New Product</h3>
        </div>
        {onCancel && (
          <motion.button
            type="button"
            className="close-button"
            onClick={handleCancel}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} />
          </motion.button>
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

        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.div>
        )}

        <div className="form-actions">
          {onCancel && (
            <motion.button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
          )}
          <motion.button
            type="submit"
            disabled={loading || !name.trim()}
            className="submit-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Creating...' : 'Create Product'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
