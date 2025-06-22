import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components';
import { ProductsPage, ProductDetailPage, OrdersPage, OrderDetailPage } from './pages';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { apiClient } from './utils/apiClient';
import { useEffect } from 'react';
import './App.css';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LoginPage } from './pages/Auth/LoginPage';

// Component to initialize API client with auth
const AppInitializer = () => {
  const auth = useAuth();

  useEffect(() => {
    // Configure API client with token getter and auth error handler
    apiClient.setTokenGetter(() => auth.token);
    apiClient.setAuthErrorHandler(() => auth.signOut());
  }, [auth.token, auth.signOut]);

  return null;
};

// Component to show authentication status in header
const AuthStatus = () => {
  const auth = useAuth();

  if (!auth.isAuthenticated || !auth.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <img
          src={auth.user.picture}
          alt={auth.user.name}
          className="w-8 h-8 rounded-full border border-white/10"
        />
      </div>
      <button
        onClick={auth.signOut}
        className="hidden px-3 py-1.5 text-sm text-white/70 hover:text-white/90 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
};

const AppContent = () => {
  const auth = useAuth();

  // Show loading state while checking auth
  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div 
            className="w-8 h-8 border-4 border-white/30 rounded-full mx-auto mb-4"
            style={{
              borderTopColor: '#8b5cf6',
              animation: 'spin 1s linear infinite'
            }}
          ></div>
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-svh">
      {auth.isAuthenticated && (
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
      )}
      <main className={`flex p-0 overflow-x-hidden overflow-y-auto grow shrink bg-gray-900`}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/products" replace />
            </ProtectedRoute>
          } />
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
          
          {/* Catch all route - redirect to login if not authenticated, otherwise to products */}
          <Route path="*" element={
            auth.isAuthenticated ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppInitializer />
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
