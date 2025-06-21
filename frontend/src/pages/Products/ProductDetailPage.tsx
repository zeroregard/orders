import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Package, icons } from 'lucide-react';
import type { Product, PurchaseHistory } from '../../api/backend';
import { getProducts, getPurchaseHistory, getPrediction } from '../../api/backend';
import PurchaseGraph from '../../components/Products/PurchaseGraph';
import { DetailPageLayout, DetailCard, SkeletonCard } from '../../components';
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

  const handleProductUpdated = () => {
    setIsEditing(false);
    loadData();
  };

  if (loading) {
    return <SkeletonCard />;
  }

  if (error || !product) {
    return (
      <DetailCard className="p-8">
        <p className="text-red-500">{error || 'Product not found'}</p>
      </DetailCard>
    );
  }

  // Get the icon component from the product's iconId
  const ProductIcon = product.iconId ? icons[product.iconId as keyof typeof icons] : icons.Package;

  return (
    <DetailPageLayout
      title={product.name}
      backTo="/products"
      isEditing={isEditing}
      onEditToggle={() => setIsEditing(!isEditing)}
    >
      {isEditing ? (
        <EditProductForm
          product={product}
          onUpdated={handleProductUpdated}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <DetailCard className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-violet-500/20 text-violet-400 rounded-lg">
                {React.createElement(ProductIcon, { size: 24 })}
              </div>
              <div>
                <p className="text-lg text-gray-300">{product.description}</p>
                {product.price !== undefined && (
                  <p className="text-2xl text-violet-400 font-bold">
                    €{product.price.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-8 text-sm text-gray-400">
              <p>Created: {new Date(product.createdAt).toLocaleDateString()}</p>
              <p>Last Updated: {new Date(product.updatedAt).toLocaleDateString()}</p>
            </div>
          </DetailCard>

          <DetailCard
            title="Purchase History & Prediction"
            icon={Package}
          >
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
          </DetailCard>
        </>
      )}
    </DetailPageLayout>
  );
} 