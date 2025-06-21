import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';
import type { AuthenticationError, AuthorizationError } from '../../utils/apiClient';
import './AuthError.css';

interface AuthErrorProps {
  error: AuthenticationError | AuthorizationError | null;
  onRetry?: () => void;
  showSignInButton?: boolean;
}

export const AuthError: React.FC<AuthErrorProps> = ({ 
  error, 
  onRetry,
  showSignInButton = true 
}) => {
  const { user, signOut } = useAuth();

  if (!error) return null;

  const isAuthenticationError = error.status === 401;
  const isAuthorizationError = error.status === 403;

  const handleSignOut = () => {
    signOut();
    onRetry?.();
  };

  return (
    <div className="auth-error-container">
      <div className="auth-error-card">
        <div className="auth-error-icon">
          {isAuthenticationError ? '🔐' : '🚫'}
        </div>
        
        <h2 className="auth-error-title">
          {isAuthenticationError ? 'Authentication Required' : 'Access Denied'}
        </h2>
        
        <p className="auth-error-message">
          {error.message}
        </p>
        
        {isAuthenticationError && (
          <div className="auth-error-content">
            <p className="auth-error-description">
              Please sign in with your Google account to access this feature.
            </p>
            {showSignInButton && (
              <div className="auth-error-signin">
                <GoogleSignInButton />
              </div>
            )}
          </div>
        )}
        
        {isAuthorizationError && (
          <div className="auth-error-content">
            <p className="auth-error-description">
              Your account doesn't have permission to access this resource.
            </p>
            {user && (
              <div className="auth-error-user-info">
                <p>Currently signed in as: <strong>{user.email}</strong></p>
                <button 
                  className="auth-error-signout-btn"
                  onClick={handleSignOut}
                >
                  Sign out and try different account
                </button>
              </div>
            )}
          </div>
        )}
        
        {onRetry && (
          <button 
            className="auth-error-retry-btn"
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}; 