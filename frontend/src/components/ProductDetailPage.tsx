import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts, usePrediction } from '../hooks/useApi';
import './ProductDetailPage.css';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showPrediction, setShowPrediction] = useState(false);

  const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts();
  const { data: prediction, isLoading: predictionLoading, error: predictionError } = usePrediction(
    id || '', 
    showPrediction && !!id
  );

  if (productsLoading) {
    return (
      <div className="container">
        <div className="loading">Loading product...</div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="container">
        <div className="error">Error loading product: {productsError.message}</div>
        <Link to="/products">
          <button>Back to Products</button>
        </Link>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="container">
        <div className="error">No product ID provided</div>
        <Link to="/products">
          <button>Back to Products</button>
        </Link>
      </div>
    );
  }

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="container">
        <div className="error">Product not found</div>
        <Link to="/products">
          <button>Back to Products</button>
        </Link>
      </div>
    );
  }

  const handleGetPrediction = () => {
    setShowPrediction(true);
  };

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
              {predictionLoading ? 'Getting Prediction...' : 'Get Prediction'}
            </button>
            
            {predictionError && (
              <div className="error">
                Error getting prediction: {predictionError.message}
              </div>
            )}
            
            {prediction && (
              <div className="prediction-result">
                <h4>Prediction Result</h4>
                <pre>{JSON.stringify(prediction, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 