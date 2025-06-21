import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Navigation } from './components/Navigation';
import { ProductsPage } from './components/ProductsPage';
import { OrdersPage } from './components/OrdersPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { OrderDetailPage } from './components/OrderDetailPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { apiClient } from './utils/apiClient';
import { useEffect } from 'react';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: unknown) => {
        // Don't retry on auth errors
        if (error && typeof error === 'object' && 'status' in error) {
          const statusError = error as { status: number };
          if (statusError.status === 401 || statusError.status === 403) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

// Component to initialize API client with auth
const AppInitializer = () => {
  const { token, signOut, isAuthenticated } = useAuth();

  useEffect(() => {
    // Configure API client with token getter and auth error handler
    apiClient.setTokenGetter(() => token);
    apiClient.setAuthErrorHandler(() => signOut());
  }, [token, signOut]);

  // Invalidate all queries when user signs in to refetch fresh data
  useEffect(() => {
    if (isAuthenticated) {
      queryClient.invalidateQueries();
    }
  }, [isAuthenticated]);

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
      <div className="auth-status authenticated">
        <img src={user.picture} alt={user.name} className="user-avatar" />
        <span className="user-name">{user.name}</span>
        <button onClick={signOut} className="sign-out-btn">Sign Out</button>
      </div>
    );
  }

  return (
    <div className="auth-status unauthenticated">
      <GoogleSignInButton size="medium" />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="app dark-mode">
            <AppInitializer />
            <AppContent />
                      </div>
          </Router>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
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
          <h1>Auto-Order System</h1>
          <div className="header-nav">
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
