import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, ScatterChartIcon, icons, AlertCircle } from 'lucide-react';
import type { Product, PurchaseHistory } from '../../api/backend';
import { getProducts, getPurchaseHistory, getPrediction } from '../../api/backend';
import PurchaseGraph from '../../components/Products/PurchaseGraph';
import { DetailPageLayout, DetailCard, SkeletonCard } from '../../components';
import { EditProductForm } from './components/EditProductForm';
import { PurchaseCalendar } from '../../components/Products/PurchaseCalendar';
import { formatDate } from '../../utils/dateFormatting';

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

      // First fetch product data
      const products = await getProducts();
      const productData = products.find(p => p.id === id);
      if (!productData) {
        throw new Error('Product not found');
      }
      setProduct(productData);

      try {
        // Try to fetch purchase history
        const historyData = await getPurchaseHistory(id);
        setPurchaseHistory(historyData);

        // Only try to get predictions if we have purchase history
        if (historyData.purchases.length > 0) {
          try {
            const predictionData = await getPrediction(id);
            setPredictedDates(predictionData.predictedPurchaseDates);
            setAverageFrequency(predictionData.averageFrequency);
          } catch (predErr) {
            console.log('No predictions available:', predErr);
            // Don't set error state, just leave predictions null
          }
        }
      } catch (historyErr) {
        console.log('No purchase history available:', historyErr);
        // Don't set error state, just leave history null
      }
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
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-violet-500/20 text-violet-400 rounded-lg">
                {React.createElement(ProductIcon, { size: 24 })}
              </div>
              <div>
                {product.description && (
                  <p className="text-base text-gray-300 mb-1">{product.description}</p>
                )}
                {product.price !== undefined && (
                  <p className="text-lg text-violet-400 font-medium">
                    €{product.price.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-8 text-sm text-gray-400 mt-4">
              <p>Created: {formatDate(product.createdAt)}</p>
              <p>Last Updated: {formatDate(product.updatedAt)}</p>
            </div>
          </DetailCard>

          {purchaseHistory?.purchases.length ? (
            <>
              <DetailCard
                title="Purchase Calendar"
                icon={Calendar}
                className="mb-8"
              >
                <PurchaseCalendar purchaseHistory={purchaseHistory} />
              </DetailCard>

              <DetailCard
                title="Purchase Heatmap & Prediction"
                icon={ScatterChartIcon}
              >
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
                    <p className="text-center mb-2">Next predicted purchase:</p>
                    <div className="flex flex-col gap-2">
                      {predictedDates
                        .filter(date => new Date(date).getFullYear() === new Date().getFullYear())
                        .map((date) => (
                          <p key={date} className="text-center">
                            {formatDate(date)}
                          </p>
                        ))[0]
                      }
                    </div>
                  </div>
                )}
              </DetailCard>
            </>
          ) : (
            <DetailCard className="mb-8">
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <AlertCircle size={32} className="mb-4 text-violet-400/50" />
                <p className="text-lg font-medium mb-2">No Purchase History</p>
                <p className="text-sm text-center">
                  This product hasn't been purchased yet. Purchase history and predictions will appear here once orders are made.
                </p>
              </div>
            </DetailCard>
          )}
        </>
      )}
    </DetailPageLayout>
  );
} 