import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface GoogleSignInButtonProps {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  theme = 'outline',
  size = 'large',
  text = 'signin_with',
  shape = 'rectangular',
  width = '280',
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { isLoading } = useAuth();

  useEffect(() => {
    // Render the Google Sign-In button when the component mounts
    if (window.google && buttonRef.current && !isLoading) {
      // Clear any existing button
      buttonRef.current.innerHTML = '';
      
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme,
        size,
        text,
        shape,
        width,
      });
    }
  }, [isLoading, theme, size, text, shape, width]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-3 px-6 text-white/70 text-sm">
        <div className="relative">Loading Google Sign-In...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center">
      <div ref={buttonRef} className="google-signin-button" />
    </div>
  );
}; 