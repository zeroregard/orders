import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation, GoogleSignInButton } from './components';
import { ProductsPage, ProductDetailPage, OrdersPage, OrderDetailPage } from './pages';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { apiClient } from './utils/apiClient';
import { useEffect } from 'react';
import './App.css';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';

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
      <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg py-2 px-4">
        <span className="text-red-400/90 text-sm">{error}</span>
        <button 
          onClick={clearError} 
          className="bg-transparent border-0 text-red-400/70 cursor-pointer text-xl p-1 rounded transition-all duration-200 hover:bg-red-500/20 hover:text-red-400"
        >
          ×
        </button>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <img 
          src={user.picture} 
          alt={user.name} 
          className="w-8 h-8 rounded-full border-2 border-white/20" 
        />
        <button 
          onClick={signOut} 
          className="bg-red-500/20 border border-red-500/40 text-white rounded-md py-1.5 px-3 text-xs cursor-pointer transition-all duration-200 hover:bg-red-500/30 hover:border-red-500/60"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <GoogleSignInButton size="medium" />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div 
          className="min-h-screen flex flex-col text-white dark-mode h-svh"
          style={{
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
            fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', 'Roboto', sans-serif"
          }}
        >
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
      <div 
        className="min-h-screen flex items-center justify-center text-white"
        style={{
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
        }}
      >
        <div className="text-center p-8">
          <div 
            className="w-10 h-10 border-4 border-white/30 rounded-full mx-auto mb-4"
            style={{
              borderTopColor: '#8b5cf6',
              animation: 'spin 1s linear infinite'
            }}
          ></div>
          <p className="text-white/80 text-base m-0">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-svh">
      <header 
        className="w-full shrink-0 py-4 border-b border-white/10 p-4"
        style={{
          background: 'rgba(15, 15, 35, 0.95)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="flex items-center gap-2 justify-between w-full">
          <Navigation />
          <AuthStatus />
        </div>
      </header>
      <main className="flex p-0 overflow-x-hidden overflow-y-auto grow shrink mb-8">
        <Routes>
          {/* Landing page - not protected */}
          <Route path="/" element={<ProductsPage />} />
          
          {/* Protected routes */}
          <Route path="/products" element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          } />
          <Route path="/products/:id" element={
            <ProtectedRoute>
              <ProductDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
};

export default App;
