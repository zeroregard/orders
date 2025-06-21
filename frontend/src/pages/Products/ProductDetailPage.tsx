import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, icons } from 'lucide-react';
import type { Product, PurchaseHistory } from '../../api/backend';
import { getProducts, getPurchaseHistory, getPrediction } from '../../api/backend';
import PurchaseGraph from '../../components/Products/PurchaseGraph';
import { SkeletonCard } from '../../components';
import { EditProductForm } from './components/EditProductForm';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory | null>(null);
  const [predictedDates, setPredictedDates] = useState<string[] | null>(null);
  const [averageFrequency, setAverageFrequency] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [selectedIconId, setSelectedIconId] = useState<string>('');

  // Filter and sort icons based on search
  const filteredIcons = iconSearch
    ? Object.keys(icons)
        .filter(name => name.toLowerCase().includes(iconSearch.toLowerCase()))
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 20)
    : [];

  // Helper function to format ISO duration string
  const formatFrequency = (isoDuration: string) => {
    const weeks = isoDuration.match(/(\d+)W/)?.[1];
    const days = isoDuration.match(/(\d+)D/)?.[1];
    
    const parts = [];
    if (weeks) {
      parts.push(`${weeks} ${parseInt(weeks) === 1 ? 'week' : 'weeks'}`);
    }
    if (days) {
      parts.push(`${days} ${parseInt(days) === 1 ? 'day' : 'days'}`);
    }
    
    return parts.join(' and ');
  };

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [products, historyData, predictionData] = await Promise.all([
        getProducts(),
        getPurchaseHistory(id),
        getPrediction(id)
      ]);

      const productData = products.find(p => p.id === id);
      if (!productData) {
        throw new Error('Product not found');
      }

      setProduct(productData);
      setPurchaseHistory(historyData);
      setPredictedDates(predictionData.predictedPurchaseDates);
      setAverageFrequency(predictionData.averageFrequency);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (product) {
      setSelectedIconId(product.iconId || 'Package');
    }
  }, [product]);

  const handleProductUpdated = () => {
    setIsEditing(false);
    loadData();
  };

  if (loading) {
    return <SkeletonCard />;
  }

  if (error || !product) {
    return (
      <div className="p-8">
        <p className="text-red-500">{error || 'Product not found'}</p>
        <Link to="/products" className="text-violet-400 hover:text-violet-300">
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/products"
            className="flex items-center justify-center w-10 h-10 bg-white/5 border border-white/20 rounded-lg text-white/70 cursor-pointer transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white m-0">{product.name}</h1>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-violet-600/20 text-violet-400 rounded-lg hover:bg-violet-600/30 transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <EditProductForm
              product={product}
              onUpdated={handleProductUpdated}
              onCancel={() => setIsEditing(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="product-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white/5 border border-white/20 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-12 h-12 flex items-center justify-center bg-violet-500/20 text-violet-400 rounded-lg hover:bg-violet-500/30 transition-colors"
                  >
                    {icons[selectedIconId as keyof typeof icons] ? 
                      React.createElement(icons[selectedIconId as keyof typeof icons], { size: 24 }) : 
                      React.createElement(icons.Package, { size: 24 })}
                  </button>
                  
                  <AnimatePresence>
                    {showIconPicker && (
                      <motion.div
                        className="absolute top-full left-0 mt-2 p-4 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-50 w-[320px]"
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
                        
                        <div className="grid grid-cols-4 gap-2 max-h-[320px] overflow-y-auto">
                          {filteredIcons.map(iconName => {
                            const Icon = icons[iconName as keyof typeof icons];
                            return (
                              <button
                                key={iconName}
                                type="button"
                                onClick={() => {
                                  setSelectedIconId(iconName);
                                  setShowIconPicker(false);
                                  setIconSearch('');
                                }}
                                className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all duration-200 hover:bg-white/10 ${
                                  selectedIconId === iconName ? 'bg-violet-500/20 text-violet-400' : 'text-white/70'
                                }`}
                              >
                                <Icon size={20} />
                                <span className="text-xs truncate w-full text-center">{iconName}</span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <p className="text-lg text-gray-300">{product.description}</p>
                  {product.price !== undefined && (
                    <p className="text-2xl text-violet-400 font-bold">
                      ${product.price.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 md:gap-8 text-sm text-gray-400">
                <p>Created: {new Date(product.createdAt).toLocaleDateString()}</p>
                <p>Last Updated: {new Date(product.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-6">
                Purchase History & Prediction
              </h2>
              {purchaseHistory && (
                <>
                  <PurchaseGraph
                    purchaseHistory={purchaseHistory}
                    predictedDates={predictedDates || undefined}
                  />
                  {averageFrequency && (
                    <p className="mt-4 text-center text-violet-300">
                      Average purchase frequency: {formatFrequency(averageFrequency)}
                    </p>
                  )}
                  {predictedDates && predictedDates.length > 0 && (
                    <div className="mt-6 p-4 bg-violet-500/10 rounded-lg text-violet-400 font-medium">
                      <p className="text-center mb-2">Next predicted purchases:</p>
                      <div className="flex flex-col gap-2">
                        {predictedDates
                          .filter(date => new Date(date).getFullYear() === new Date().getFullYear())
                          .map((date, index) => (
                            <p key={date} className="text-center">
                              {index + 1}. {new Date(date).toLocaleDateString()}
                            </p>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 