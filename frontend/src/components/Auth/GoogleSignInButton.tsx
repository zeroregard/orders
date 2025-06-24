import { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface GoogleSignInButtonProps {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: string;
}

export function GoogleSignInButton({
  theme = 'outline',
  size = 'large',
  text = 'signin_with',
  shape = 'rectangular',
  width = '280',
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { isLoading } = useAuth();

  useEffect(() => {
    const renderButton = () => {
      if (!window.google || !buttonRef.current) return;
      
      // Clear any existing button
      buttonRef.current.innerHTML = '';
      
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme,
        size,
        text,
        shape,
        width,
      });
    };

    // If not loading and we have the ref, render immediately
    if (!isLoading) {
      renderButton();
    }

    // Also set up an interval to try rendering if the button didn't appear
    const interval = setInterval(() => {
      if (buttonRef.current?.innerHTML === '') {
        renderButton();
      } else {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading, theme, size, text, shape, width]);

  return (
    <div className="flex justify-center items-center min-h-[40px]">
      <div ref={buttonRef} className="google-signin-button" />
    </div>
  );
} 