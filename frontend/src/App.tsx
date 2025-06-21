import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation, GoogleSignInButton } from './components';
import { ProductsPage, ProductDetailPage, OrdersPage, OrderDetailPage } from './pages';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { apiClient } from './utils/apiClient';
import { useEffect } from 'react';
import './App.css';

// Component to initialize API client with auth
const AppInitializer = () => {
  const { token, signOut } = useAuth();

  useEffect(() => {
    // Configure API client with token getter and auth error handler
    apiClient.setTokenGetter(() => token);
    apiClient.setAuthErrorHandler(() => signOut());
  }, [token, signOut]);

  return null;
};

// Component to show authentication status in header
const AuthStatus = () => {
  const { user, isAuthenticated, signOut, error, clearError } = useAuth();

  if (error) {
    return (
      <div className="auth-status error">
        <span className="error-message">{error}</span>
        <button onClick={clearError} className="clear-error-btn">×</button>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="auth-status">
        <img src={user.picture} alt={user.name} className="user-avatar" />
        <button onClick={signOut} className="sign-out-btn">Sign Out</button>
      </div>
    );
  }

  return (
    <div className="auth-status">
      <GoogleSignInButton size="medium" />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app dark-mode">
          <AppInitializer />
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Separate component to handle loading state
const AppContent = () => {
  const { isLoading } = useAuth();

  // Show loading screen while auth is being restored
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="header-nav flex justify-between w-full">
            <Navigation />
            <AuthStatus />
          </div>
        </div>
      </header>
      <main className="app-content">
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <p>Auto-Order System &copy; {new Date().getFullYear()}</p>
      </footer>
    </>
  );
};

export default App;
