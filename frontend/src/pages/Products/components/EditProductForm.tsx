import { useState } from 'react';
import { motion } from 'framer-motion';
import { updateProduct } from '../../../api/backend';
import type { Product, UpdateProductRequest } from '../../../types/backendSchemas';
import { IconPicker } from '../../../components/Products/IconPicker';

interface EditProductFormProps {
  product: Product;
  onUpdated?: () => void;
  onCancel?: () => void;
}

export function EditProductForm({ product, onUpdated, onCancel }: EditProductFormProps) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState(product.price?.toString() || '');
  const [iconId, setIconId] = useState(product.iconId || 'Package');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const productData: UpdateProductRequest = {
        name,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        iconId,
      };
      
      await updateProduct(product.id, productData);
      
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
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
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Edit Product</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block mb-2 text-white/80 font-medium text-sm">Icon</label>
          <IconPicker selectedIcon={iconId} onIconSelect={setIconId} />
        </div>

        <div className="mb-6">
          <label htmlFor="product-name" className="block mb-2 text-white/80 font-medium text-sm">Product Name *</label>
          <input
            id="product-name"
            type="text"
            placeholder="Enter product name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10 placeholder:text-white/40"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="product-description" className="block mb-2 text-white/80 font-medium text-sm">Description</label>
          <textarea
            id="product-description"
            placeholder="Enter product description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10 placeholder:text-white/40 min-h-[100px]"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="product-price" className="block mb-2 text-white/80 font-medium text-sm">Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">€</span>
            <input
              id="product-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full py-3 pl-10 pr-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10 placeholder:text-white/40"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8 justify-end flex-wrap">
          {onCancel && (
            <motion.button
              type="button"
              className="py-3 px-6 bg-white/10 border border-white/20 rounded-lg text-white/80 font-medium cursor-pointer transition-all duration-200 min-w-30 hover:bg-white/15 hover:text-white"
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
            className="py-3 px-6 border-0 rounded-lg text-white font-semibold cursor-pointer transition-all duration-200 min-w-36 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Updating...' : 'Update Product'}
          </motion.button>
        </div>
      </form>
    </div>
  );
} 