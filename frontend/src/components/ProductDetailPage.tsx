import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProducts, getPrediction } from '../api/backend';
import type { Product, PredictionResponse } from '../types/backendSchemas';
import './ProductDetailPage.css';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const products = await getProducts();
        const foundProduct = products.find(p => p.id === id);
        
        if (!foundProduct) {
          setError('Product not found');
          return;
        }
        
        setProduct(foundProduct);
      } catch (err) {
        setError('Failed to fetch product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleGetPrediction = async () => {
    if (!product) return;
    
    try {
      setPredictionLoading(true);
      const predictionData = await getPrediction(product.id);
      setPrediction(predictionData);
    } catch (err) {
      console.error('Error fetching prediction:', err);
      // Don't set error for prediction failure, just log it
    } finally {
      setPredictionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container">
        <div className="error">{error || 'Product not found'}</div>
        <Link to="/products">
          <button>Back to Products</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="product-detail">
        <div className="product-detail-header">
          <h1>{product.name}</h1>
          <Link to="/products">
            <button>Back to Products</button>
          </Link>
        </div>
        
        <div className="product-detail-content">
          <div className="product-info">
            <div className="info-item">
              <label>Name:</label>
              <span>{product.name}</span>
            </div>
            
            {product.description && (
              <div className="info-item">
                <label>Description:</label>
                <span>{product.description}</span>
              </div>
            )}
            
            {product.price && (
              <div className="info-item">
                <label>Price:</label>
                <span>${product.price.toFixed(2)}</span>
              </div>
            )}
            
            <div className="info-item">
              <label>Created:</label>
              <span>{new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className="info-item">
              <label>Updated:</label>
              <span>{new Date(product.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="prediction-section">
            <h3>Purchase Prediction</h3>
            <p>Get AI-powered prediction for when you might need to purchase this product again.</p>
            
            <button 
              onClick={handleGetPrediction}
              disabled={predictionLoading}
            >
              {predictionLoading ? 'Analyzing...' : 'Get Prediction'}
            </button>
            
            {prediction && (
              <div className="prediction-result">
                <h4>Prediction Result</h4>
                <p>
                  <strong>Next purchase date:</strong>{' '}
                  {new Date(prediction.predictedNextPurchaseDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 