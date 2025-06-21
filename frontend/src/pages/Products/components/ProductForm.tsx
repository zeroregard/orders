import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, icons } from 'lucide-react';
import { createProduct } from '../../../api/backend';
import type { CreateProductRequest } from '../../../types/backendSchemas';

interface ProductFormProps {
  onCreated?: () => void;
  onCancel?: () => void;
}

// Get all icon names from Lucide
const iconNames = Object.keys(icons).sort();

export function ProductForm({ onCreated, onCancel }: ProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [iconId, setIconId] = useState('Package');
  const [iconSearch, setIconSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Filter and sort icons based on search
  const filteredIcons = iconSearch
    ? Object.keys(icons)
        .filter(name => name.toLowerCase().includes(iconSearch.toLowerCase()))
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 20)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const productData: CreateProductRequest = {
        name,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        iconId,
      };
      
      await createProduct(productData);
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setIconId('Package');
      
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

  const SelectedIcon = icons[iconId as keyof typeof icons];

  return (
    <motion.div
      className="w-full max-w-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Package size={24} className="text-violet-400" />
          <h3 className="m-0 text-white text-xl font-semibold">Add New Product</h3>
        </div>
        {onCancel && (
          <motion.button
            type="button"
            className="flex items-center justify-center w-9 h-9 bg-white/10 border border-white/20 rounded-lg text-white/70 cursor-pointer transition-all duration-200 flex-shrink-0 hover:bg-white/20 hover:text-white"
            onClick={handleCancel}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} />
          </motion.button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="w-full p-4 bg-white/5 border border-white/20 rounded-lg text-white flex items-center gap-3 hover:bg-white/8 transition-all duration-200"
          >
            <SelectedIcon size={24} />
            <span className="flex-1 text-left">{iconId}</span>
          </button>

          <AnimatePresence>
            {showIconPicker && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-2 p-4 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search icons..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                
                {iconSearch ? (
                  <div className="grid grid-cols-4 gap-2">
                    {filteredIcons.map(iconName => {
                      const Icon = icons[iconName as keyof typeof icons];
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => {
                            setIconId(iconName);
                            setShowIconPicker(false);
                            setIconSearch('');
                          }}
                          className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all duration-200 hover:bg-white/10 ${
                            iconId === iconName ? 'bg-violet-500/20 text-violet-400' : 'text-white/70'
                          }`}
                        >
                          <Icon size={20} />
                          <span className="text-xs truncate w-full text-center">{iconName}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-white/40 py-4">
                    Type to search for icons...
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
            placeholder="Enter product description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10 placeholder:text-white/40 resize-y min-h-20"
            style={{ fontFamily: 'inherit' }}
            rows={3}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="product-price" className="block mb-2 text-white/80 font-medium text-sm">Price</label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-white/60 font-semibold pointer-events-none z-10">€</span>
            <input
              id="product-price"
              type="number"
              placeholder="0.00"
              value={price}
              onChange={e => setPrice(e.target.value)}
              min="0"
              step="0.01"
              className="w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10 placeholder:text-white/40 pl-10"
            />
          </div>
        </div>

        {error && (
          <motion.div
            className="text-red-400/90 text-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.div>
        )}

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
            {loading ? 'Creating...' : 'Create Product'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
