// src/hooks/useBBHAuth.tsx
// ============================================================
// BlackBox Hub - React Auth Hook (BFF Pattern)
// ============================================================
// Works with: /api/auth/proxy.ts
// 
// ✅ No tokens stored in browser (uses HttpOnly cookies)
// ✅ Automatic session checking
// ✅ TypeScript support
// ============================================================

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

// Types
interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  blackbox_id?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (redirectTo?: string) => void;
  logout: (redirectTo?: string) => void;
  refreshUser: () => Promise<void>;
  fetchApi: (path: string, options?: RequestInit) => Promise<Response>;
}

// Context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider Component
export function BBHAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check session on mount
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/proxy?action=me', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('BBH Auth Payload:', data);
        setUser(data.authenticated ? data.user : null);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Session check failed:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Login - Redirect to BFF proxy
  const login = useCallback((redirectTo?: string) => {
    const currentPath = redirectTo || window.location.pathname;
    window.location.href = `/api/auth/proxy?action=login&redirect=${encodeURIComponent(currentPath)}`;
  }, []);

  // Logout - Clear session via BFF proxy
  const logout = useCallback((redirectTo?: string) => {
    const redirect = redirectTo || '/';
    window.location.href = `/api/auth/proxy?action=logout&redirect=${encodeURIComponent(redirect)}`;
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  // Secure API Call Helper
  const fetchApi = useCallback(async (path: string, options?: RequestInit) => {
    const queryParams = new URLSearchParams({ 
      action: 'api',
      path: path 
    });

    return fetch(`/api/auth/proxy?${queryParams}`, {
      ...options,
      method: options?.method || 'GET',
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
      fetchApi
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export function useBBHAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useBBHAuth must be used within BBHAuthProvider');
  }
  return context;
}
