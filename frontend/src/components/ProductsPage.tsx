import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Search, Trash2, Edit } from 'lucide-react';
import { useProducts, useDeleteProduct } from '../hooks/useApi';
import { ProductForm } from './ProductForm';
import './ProductsPage.css';

export function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products = [], isLoading, error } = useProducts();
  const deleteProductMutation = useDeleteProduct();

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProductMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete product:', error);
        // Error handling is already done by React Query
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="products-page">
        <div className="loading-container">
          <Package size={48} />
          <h2>Loading products...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="error-container">
          <h2>Error loading products</h2>
          <p>{error instanceof Error ? error.message : 'Failed to load products'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="header-content">
          <div className="title-section">
            <Package size={32} />
            <h1>Products</h1>
          </div>
          <button
            className="add-product-button"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        <div className="search-section">
          <div className="search-input-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProductForm
              onCreated={() => {
                setShowForm(false);
                // No need to manually refetch - React Query will handle it
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      <div className="products-content">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <Package size={64} />
            <h2>
              {searchTerm 
                ? `No products found matching "${searchTerm}"`
                : 'No products yet'
              }
            </h2>
            <p>
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Get started by adding your first product'
              }
            </p>
            {!searchTerm && (
              <button
                className="add-first-product-button"
                onClick={() => setShowForm(true)}
              >
                <Plus size={20} />
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-header">
                  <Link to={`/products/${product.id}`} className="product-name-link">
                    <h3 className="product-name">{product.name}</h3>
                  </Link>
                  <div className="product-actions">
                    <button
                      className="action-button edit"
                      onClick={() => {/* TODO: Implement edit */}}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={deleteProductMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {product.description && (
                  <p className="product-description">{product.description}</p>
                )}
                
                {product.price !== undefined && (
                  <div className="product-price">${product.price.toFixed(2)}</div>
                )}
                
                <div className="product-footer">
                  <Link to={`/products/${product.id}`} className="view-details-btn">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 