import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
  const { isLoading, googleReady } = useAuth();
  const [buttonRendered, setButtonRendered] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const renderButton = () => {
      if (!buttonRef.current || isLoading || !googleReady || !window.google) {
        console.log('🔄 Button render conditions not met:', {
          hasButtonRef: !!buttonRef.current,
          isLoading,
          googleReady,
          hasGoogleWindow: !!window.google
        });
        return false;
      }

      try {
        console.log('🎯 Rendering Google Sign-In button...');
        // Clear any existing button content
        buttonRef.current.innerHTML = '';
        
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme,
          size,
          text,
          shape,
          width,
        });
        
        setButtonRendered(true);
        console.log('✅ Google Sign-In button rendered successfully');
        return true;
      } catch (error) {
        console.error('❌ Failed to render Google Sign-In button:', error);
        setButtonRendered(false);
        return false;
      }
    };

    // Reset button rendered state when conditions change
    if (isLoading || !googleReady) {
      setButtonRendered(false);
    }

    // Try to render the button
    if (!buttonRendered && googleReady && !isLoading) {
      const success = renderButton();
      
      // If rendering failed and we haven't retried too many times, try again after a delay
      if (!success && retryCount < 3) {
        const timer = setTimeout(() => {
          console.log(`🔄 Retrying button render (attempt ${retryCount + 1}/3)...`);
          setRetryCount(prev => prev + 1);
        }, 1000 + retryCount * 500); // Increasing delay: 1s, 1.5s, 2s
        
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, googleReady, theme, size, text, shape, width, buttonRendered, retryCount]);

  // Reset retry count when conditions change
  useEffect(() => {
    setRetryCount(0);
  }, [isLoading, googleReady]);

  if (isLoading) {
    return (
      <div className="google-signin-loading">
        <div className="loading-spinner"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (!googleReady) {
    return (
      <div className="google-signin-loading">
        <span>Initializing Google Sign-In...</span>
      </div>
    );
  }

  return (
    <div className="google-signin-container">
      <div ref={buttonRef} className="google-signin-button" />
      {!buttonRendered && retryCount >= 3 && (
        <div className="google-signin-error">
          <p>Unable to load Google Sign-In button.</p>
          <button 
            onClick={() => {
              setRetryCount(0);
              setButtonRendered(false);
            }}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}; 