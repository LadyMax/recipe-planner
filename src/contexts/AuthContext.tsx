import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext, type AuthContextType } from './AuthContextDefinition';
import type { AuthState, LoginCredentials } from '../types/user';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check authentication status from backend only (proper security)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/login', {
          method: 'GET',
          credentials: 'include', // Include HttpOnly cookies
        });

        if (response.ok) {
          const user = await response.json();
          // Check if the response contains user data (not an error message)
          if (user && user.id && !user.error) {
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }
        }
      } catch (error) {
        // Only log actual network errors, not "no user logged in" responses
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.warn('Network error during auth check:', error);
        }
      }
      
      // No valid session - this is normal, not an error
      setAuthState(prev => ({ ...prev, isLoading: false }));
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include', // Include cookies for session
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const user = await response.json();
      
      // No need to store user info in frontend - backend session handles this
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await fetch('/api/login', {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
    
    // No need to clear frontend storage - backend session is cleared
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

