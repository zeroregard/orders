import { useState } from 'react';
import type { Product } from '../../types/backendSchemas';
import { Plus } from 'lucide-react';

interface ProductSelectorProps {
  products: Product[];
  selectedProductId: string;
  onProductSelected: (productId: string) => void;
  onProductCreated: () => void;
}

export function ProductSelector({ products, selectedProductId, onProductSelected, onProductCreated }: ProductSelectorProps) {
  const [showNewProductForm, setShowNewProductForm] = useState(false);

  // If no product is selected and there are products available, select the first one
  if (!selectedProductId && products.length > 0) {
    onProductSelected(products[0].id);
  }

  return (
    <div className="relative">
      <select
        value={selectedProductId}
        onChange={(e) => {
          if (e.target.value === 'new') {
            setShowNewProductForm(true);
          } else {
            onProductSelected(e.target.value);
          }
        }}
        className="w-full py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-2 focus:ring-violet-500/10"
      >
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} {product.price != null && `- $${product.price.toFixed(2)}`}
          </option>
        ))}
        <option value="new" className="text-violet-400">
          New product...
        </option>
      </select>

      {showNewProductForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-white">Create New Product</h2>
            <button
              onClick={() => {
                onProductCreated();
                setShowNewProductForm(false);
              }}
              className="w-full py-3 px-4 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={18} />
              Create Product
            </button>
            <button
              onClick={() => setShowNewProductForm(false)}
              className="w-full mt-2 py-3 px-4 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 