// API Client utility for handling authenticated requests
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  error?: string;
}

export class AuthenticationError extends Error {
  public status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = status;
  }
}

export class AuthorizationError extends Error {
  public status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthorizationError';
    this.status = status;
  }
}

// Type for the auth token getter function
type TokenGetter = () => string | null;

class ApiClient {
  private getToken: TokenGetter | null = null;
  private onAuthError: (() => void) | null = null;

  // Set the token getter function
  setTokenGetter(getter: TokenGetter) {
    this.getToken = getter;
  }

  // Set callback for auth errors (to trigger logout)
  setAuthErrorHandler(handler: () => void) {
    this.onAuthError = handler;
  }

  // Exchange Google ID token for custom JWT token
  async exchangeGoogleToken(googleToken: string): Promise<{
    token: string;
    user: {
      email: string;
      name: string;
      picture: string;
      sub: string;
    };
    expiresIn: string;
  }> {
    return this.makeRequest('/auth/exchange-token', {
      method: 'POST',
      body: JSON.stringify({ googleToken }),
    });
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token is available
    const token = this.getToken?.();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle authentication/authorization errors
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        const error = new AuthenticationError(
          errorData.message || 'Not signed in',
          401
        );
        
        // Trigger logout if callback is set
        this.onAuthError?.();
        throw error;
      }

      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const error = new AuthorizationError(
          errorData.message || 'Unauthorized user',
          403
        );
        throw error;
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return (await response.text()) as unknown as T;
    } catch (error) {
      // Re-throw our custom errors
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error - please check your connection');
      }
      
      throw error;
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export type guard functions
export const isAuthenticationError = (error: unknown): error is AuthenticationError => {
  return error instanceof AuthenticationError;
};

export const isAuthorizationError = (error: unknown): error is AuthorizationError => {
  return error instanceof AuthorizationError;
};

export const isAuthError = (error: unknown): error is AuthenticationError | AuthorizationError => {
  return isAuthenticationError(error) || isAuthorizationError(error);
}; 