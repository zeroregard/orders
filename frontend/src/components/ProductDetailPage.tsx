import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, DollarSign, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { getProducts, getPrediction } from '../api/backend';
import type { Product } from '../types/backendSchemas';
import type { PredictionResponse } from '../api/backend';
import './ProductDetailPage.css';

// Extended Product interface to handle database fields
interface ExtendedProduct extends Product {
  createdAt?: string;
  updatedAt?: string;
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const products = await getProducts();
        const foundProduct = products.find(p => p.id === id) as ExtendedProduct;
        
        if (!foundProduct) {
          setError('Product not found');
          setLoading(false);
          return;
        }

        setProduct(foundProduct);
        setError(null);
        
        // Fetch prediction
        setPredictionLoading(true);
        try {
          const predictionData = await getPrediction(id);
          setPrediction(predictionData);
          setPredictionError(null);
        } catch (predErr) {
          setPredictionError(predErr instanceof Error ? predErr.message : 'Failed to get prediction');
        } finally {
          setPredictionLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading">Loading product...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-page">
        <div className="error">
          <AlertCircle size={48} />
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/products')} className="back-button">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="error">
          <AlertCircle size={48} />
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/products')} className="back-button">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link to="/products" className="back-link">
          <ArrowLeft size={20} />
          Back to Products
        </Link>
      </motion.div>

      <motion.div
        className="product-detail-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="product-info-card">
          <div className="product-header">
            <h1>{product.name}</h1>
            {product.description && (
              <p className="product-description">{product.description}</p>
            )}
          </div>

          <div className="product-meta-grid">
            {product.price !== undefined && (
              <div className="meta-card">
                <div className="meta-icon">
                  <DollarSign size={24} />
                </div>
                <div className="meta-content">
                  <span className="meta-label">Price</span>
                  <span className="meta-value">${product.price.toFixed(2)}</span>
                </div>
              </div>
            )}

            {product.createdAt && (
              <div className="meta-card">
                <div className="meta-icon">
                  <Calendar size={24} />
                </div>
                <div className="meta-content">
                  <span className="meta-label">Created</span>
                  <span className="meta-value">
                    {new Date(product.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}

            {product.updatedAt && (
              <div className="meta-card">
                <div className="meta-icon">
                  <Clock size={24} />
                </div>
                <div className="meta-content">
                  <span className="meta-label">Last Updated</span>
                  <span className="meta-value">
                    {new Date(product.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <motion.div
          className="prediction-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="prediction-header">
            <div className="prediction-icon">
              <TrendingUp size={28} />
            </div>
            <div>
              <h2>Purchase Prediction</h2>
              <p>Based on historical order data</p>
            </div>
          </div>

          <div className="prediction-content">
            {predictionLoading ? (
              <div className="prediction-loading">
                <div className="spinner"></div>
                <span>Analyzing purchase patterns...</span>
              </div>
            ) : predictionError ? (
              <div className="prediction-error">
                <AlertCircle size={24} />
                <span>{predictionError}</span>
              </div>
            ) : prediction ? (
              <div className="prediction-result">
                <div className="prediction-date">
                  <Calendar size={32} />
                  <div>
                    <span className="date-label">Next Purchase Date</span>
                    <span className="date-value">
                      {new Date(prediction.predictedNextPurchaseDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="prediction-meta">
                  <span className="prediction-note">
                    Prediction based on previous order patterns
                  </span>
                </div>
              </div>
            ) : (
              <div className="prediction-empty">
                <AlertCircle size={24} />
                <span>No prediction available</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 