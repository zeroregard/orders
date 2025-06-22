import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, icons } from 'lucide-react';
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
    : iconNames.slice(0, 20);

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
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Create Product</h2>
        <button
          onClick={handleCancel}
          className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label className="block mb-2 text-white/80 font-medium text-sm">Icon</label>
          <button
            type="button"
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10 flex items-center gap-3"
          >
            <SelectedIcon size={20} />
            <span>{iconId}</span>
          </button>

          <AnimatePresence>
            {showIconPicker && (
              <motion.div
                className="fixed inset-x-4 bottom-4 sm:absolute sm:inset-auto sm:top-full sm:left-0 sm:right-0 sm:mt-2 p-4 bg-gray-900/95 border border-white/20 rounded-lg shadow-xl backdrop-blur-sm z-50 max-h-[80vh] sm:max-h-[320px] overflow-y-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="sticky top-0 bg-gray-900/95 pb-4 backdrop-blur-sm">
                  <input
                    type="text"
                    placeholder="Search icons..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <div className="grow shrink overflow-clip">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-y-auto">
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
                          <span className="text-xs text-center break-all line-clamp-2 px-1">{iconName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {filteredIcons.length === 0 && (
                  <p className="text-center text-white/40 py-4">
                    No icons found. Try a different search.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
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

        <div>
          <label htmlFor="product-description" className="block mb-2 text-white/80 font-medium text-sm">Description</label>
          <textarea
            id="product-description"
            placeholder="Enter product description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10 placeholder:text-white/40"
          />
        </div>

        <div>
          <label htmlFor="product-price" className="block mb-2 text-white/80 font-medium text-sm">Price</label>
          <input
            id="product-price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter price"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10 placeholder:text-white/40"
          />
        </div>

        <div className="flex gap-4 justify-end pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/20 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
