import  { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { GOOGLE_CLIENT_ID } from '../config/auth';
import { STORAGE_KEYS } from '../constants/auth';

// Types for Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleConfig) => void;
          renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
          prompt: () => void;
          revoke: (hint: string, callback: () => void) => void;
        };
      };
    };
  }
}

interface GoogleConfig {
  client_id?: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  ux_mode?: 'popup' | 'redirect';
}

interface GoogleButtonOptions {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string;
  locale?: string;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface User {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (credential: string) => Promise<void>;
  signOut: () => void;
  clearError: () => void;
}

// Create context with a default value that matches the shape
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  signIn: async () => {},
  signOut: () => {},
  clearError: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

interface JwtPayload {
  email?: string;
  name?: string;
  picture?: string;
  sub?: string;
  exp?: number;
  [key: string]: unknown;
}

// JWT decode function (simple implementation for ID token)
function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

// Storage keys for persistence
const storage = {
  setAuthData: (token: string, user: User, expiresAt: number) => {
    try {
      console.log('🔐 SAVING auth data to localStorage:', {
        userEmail: user.email,
        expiresAt: new Date(expiresAt * 1000).toISOString(),
        timeUntilExpiry: Math.round((expiresAt * 1000 - Date.now()) / (1000 * 60)) + ' minutes'
      });
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
      console.log('✅ Auth data saved successfully');
    } catch (error) {
      console.warn('❌ Failed to save auth data to localStorage:', error);
    }
  },
  
  getAuthData: (): { token: string; user: User; expiresAt: number } | null => {
    try {
      console.log('🔍 LOADING auth data from localStorage...');
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      const expiresAtStr = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
      
      console.log('📋 Raw localStorage data:', {
        hasToken: !!token,
        hasUser: !!userStr, 
        hasExpiresAt: !!expiresAtStr,
        tokenLength: token?.length,
        expiresAtValue: expiresAtStr
      });
      
      if (!token || !userStr || !expiresAtStr) {
        console.log('❌ Missing auth data in localStorage');
        return null;
      }
      
      const user = JSON.parse(userStr) as User;
      const expiresAt = parseInt(expiresAtStr, 10);
      
      console.log('✅ Successfully loaded auth data:', {
        userEmail: user.email,
        expiresAt: new Date(expiresAt * 1000).toISOString(),
        timeUntilExpiry: Math.round((expiresAt * 1000 - Date.now()) / (1000 * 60)) + ' minutes'
      });
      
      return { token, user, expiresAt };
    } catch (error) {
      console.warn('❌ Failed to load auth data from localStorage:', error);
      return null;
    }
  },
  
  clearAuthData: () => {
    try {
      console.log('🗑️ CLEARING auth data from localStorage');
      console.trace('Stack trace for clearAuthData call:');
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
      console.log('✅ Auth data cleared successfully');
    } catch (error) {
      console.warn('❌ Failed to clear auth data from localStorage:', error);
    }
  },
  
  isTokenValid: (expiresAt: number): boolean => {
    // Add 30 minutes buffer before actual expiration
    const bufferTime = 30 * 60 * 1000; // 30 minutes in milliseconds
    const isValid = Date.now() < (expiresAt * 1000 - bufferTime);
    const timeUntilExpiry = Math.round((expiresAt * 1000 - Date.now()) / (1000 * 60));
    
    console.log('⏱️ Token validation:', {
      isValid,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      timeUntilExpiry: timeUntilExpiry + ' minutes',
      currentTime: new Date().toISOString()
    });
    
    return isValid;
  },
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && !!token;

  // Restore authentication state from localStorage on app load
  useEffect(() => {
    const restoreAuthState = () => {
      console.log('🚀 STARTING authentication state restoration...');
      
      const storedAuthData = storage.getAuthData();
      if (!storedAuthData) {
        console.log('❌ No stored auth data found, user needs to sign in');
        setIsLoading(false);
        return;
      }
      
      const { token: storedToken, user: storedUser, expiresAt } = storedAuthData;
      
      // Check if token is still valid
      if (!storage.isTokenValid(expiresAt)) {
        console.log('⏰ Stored token has expired, clearing auth data');
        storage.clearAuthData();
        setIsLoading(false);
        return;
      }
      
      // Restore auth state
      console.log('✅ Restoring valid auth session for user:', storedUser.email);
      setToken(storedToken);
      setUser(storedUser);
      setIsLoading(false);
    };
    
    restoreAuthState();
  }, []);

  // Memoize the credential response handler
  const handleCredentialResponse = useCallback(async (response: GoogleCredentialResponse) => {
    try {
      await signIn(response.credential);
    } catch (error) {
      console.error('Failed to handle credential response:', error);
      setError('Failed to sign in with Google');
    }
  }, []);

  // Memoize the Google Auth initialization
  const initializeGoogleAuth = useCallback(() => {
    if (!window.google?.accounts?.id) {
      console.warn('Google Identity Services not loaded');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }, [handleCredentialResponse]);

  useEffect(() => {
    const loadGoogleScript = () => {
      // If Google is already loaded, initialize immediately
      if (window.google) {
        initializeGoogleAuth();
        return;
      }

      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google Identity Services script loaded');
        initializeGoogleAuth();
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google Identity Services script');
        setError('Failed to load Google Sign-In');
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, [initializeGoogleAuth]);

  const signIn = async (credential: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Parse the ID token to get user info
      const payload = parseJwt(credential);
      if (!payload) {
        throw new Error('Invalid token format');
      }

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        throw new Error('Token has expired');
      }

      // Extract user information
      const userData: User = {
        email: payload.email || '',
        name: payload.name || '',
        picture: payload.picture || '',
        sub: payload.sub || '',
      };

      // Store token and user info in state and localStorage
      setToken(credential);
      setUser(userData);
      
      // Persist to localStorage with expiration time
      if (payload.exp) {
        storage.setAuthData(credential, userData, payload.exp);
        console.log('Auth session saved. Token expires at:', new Date(payload.exp * 1000).toISOString());
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      setError(error instanceof Error ? error.message : 'Sign-in failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = useCallback(() => {
    console.log('🚪 SIGN OUT called for user:', user?.email || 'no user');
    console.trace('Stack trace for signOut call:');
    
    // Clear token and user info from state
    setToken(null);
    setUser(null);
    setError(null);
    
    // Clear persisted auth data
    storage.clearAuthData();

    // Revoke Google token if available
    if (window.google && user?.email) {
      window.google.accounts.id.revoke(user.email, () => {
        console.log('✅ Google token revoked');
      });
    }
  }, [user?.email]);

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 