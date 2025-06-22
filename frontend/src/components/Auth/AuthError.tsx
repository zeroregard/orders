import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import './AuthError.css';

interface AuthErrorProps {
  message: string;
  onClose?: () => void;
  className?: string;
}

export function AuthError({
  message,
  onClose,
  className = ''
}: AuthErrorProps) {
  return (
    <div className={`auth-error ${className}`}>
      <div className="auth-error-content">
        <AlertCircle className="auth-error-icon" size={20} />
        <span className="auth-error-message">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="auth-error-close"
            aria-label="Close error"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
} 