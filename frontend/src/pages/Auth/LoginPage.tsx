import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleSignInButton } from '../../components/Auth';
import { useAuth } from '../../contexts/AuthContext';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Only handle redirect after successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/products');
    }
  }, [isAuthenticated, navigate]);

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