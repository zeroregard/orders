import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Product, PurchaseHistory } from '../../api/backend';
import { getProducts, getPurchaseHistory, getPrediction } from '../../api/backend';
import PurchaseGraph from '../../components/Products/PurchaseGraph';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory | null>(null);
  const [predictedDate, setPredictedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
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
        setPredictedDate(predictionData.predictedNextPurchaseDate);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] text-lg text-gray-400">
        Loading...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="text-lg text-red-500 text-center">
          {error || 'Product not found'}
        </div>
        <Link to="/products">
          <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
            Back to Products
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white m-0">{product.name}</h1>
        <Link to="/products">
          <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
            Back to Products
          </button>
        </Link>
      </div>

      <div className="bg-white/5 border border-white/20 rounded-2xl p-6 mb-8">
        <p className="text-lg text-gray-300 mb-4">{product.description}</p>
        {product.price !== undefined && (
          <p className="text-2xl text-violet-400 font-bold mb-4">
            ${product.price.toFixed(2)}
          </p>
        )}
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
              predictedDate={predictedDate || undefined}
            />
            {predictedDate && (
              <p className="mt-6 p-4 bg-violet-500/10 rounded-lg text-violet-400 font-medium text-center">
                Next predicted purchase: {new Date(predictedDate).toLocaleDateString()}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
} 