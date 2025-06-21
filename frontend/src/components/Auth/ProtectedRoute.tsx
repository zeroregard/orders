import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[200px]">
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

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px] text-center">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-white/90">Sign in Required</h2>
          <p className="text-white/70 text-sm mb-6">
            Please sign in with your Google account to access this page.
          </p>
          <GoogleSignInButton />
        </div>
        <p className="text-white/50 text-xs">
          You were trying to access: {location.pathname}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}; 