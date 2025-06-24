import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
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

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 