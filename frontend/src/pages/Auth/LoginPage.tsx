import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleSignInButton } from '../../components/Auth';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from the navigation state
  const from = location.state?.from?.pathname || '/products';

  // Handle redirect after successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  return (
    <div className="page flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
        <h1 className="text-center mb-2">Log in</h1>
        <p className="text-white/70 text-center mb-8">Sign in via Google to continue</p>
        <div className="flex justify-center">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
} 