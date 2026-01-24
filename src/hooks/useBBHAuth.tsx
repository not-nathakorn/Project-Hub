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
        // Check if response is actually JSON (to avoid crashing on local dev fetching source files)
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           // This usually happens when running 'npm run dev' (Vite) which serves the ts file itself instead of executing it
           console.warn("⚠️ Local Dev Warning: Auth API not running. Session check skipped.");
           setUser(null);
           return;
        }

        const data = await res.json();
        console.log('BBH Auth Payload:', data);
        
        let userData = data.authenticated ? data.user : null;

        // Fallback: If authenticated but no role (or just 'authenticated'), check against personal_info email
        // This grants admin access if the email matches the portfolio owner's email
        if (userData && (!userData.role || userData.role === 'authenticated') && userData.email) {
            try {
                // Dynamic import to avoid circular dependencies if any
                const { supabase } = await import('@/lib/supabase');
                const { data: info } = await supabase
                    .from('personal_info')
                    .select('email') // Select email to compare
                    .limit(1)
                    .maybeSingle();
                
                // If the logged in email matches the personal_info email, they are the admin
                // 2024-01-24: Make comparison case-insensitive and safer
                if (info && info.email && userData.email && info.email.toLowerCase() === userData.email.toLowerCase()) {
                    console.log('Assigning Admin Role based on personal_info match');
                    userData = { ...userData, role: 'admin' };
                } else {
                    console.log('Admin check failed:', { 
                        params_email: userData?.email, 
                        stored_email: info?.email 
                    });
                }
            } catch (err) {
                console.warn('Role fallback check failed:', err);
            }
        }

        setUser(userData);
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

  // Login - Direct Redirect to Provider (Optimized for Speed)
  // Skip the /api/auth/proxy?action=login hop to avoid Vercel cold starts
  const login = useCallback((redirectTo?: string) => {
    const currentPath = redirectTo || window.location.pathname;
    
    // 1. Determine base URL and Client ID (Sync with proxy.ts)
    const baseUrl = import.meta.env.VITE_BBH_BASE_URL || 'https://bbh.codex-th.com';
    const clientId = import.meta.env.VITE_BBH_CLIENT_ID || 'client_umphfht9l38';
    
    // 2. Construct Callback URL (Must match what the Proxy expects)
    const callbackUrl = `${window.location.origin}/api/auth/proxy?action=callback`;
    
    // 3. Build Auth URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: callbackUrl,
      state: encodeURIComponent(currentPath)
    });
    
    const loginUrl = `${baseUrl}/oauth/authorize?${params.toString()}`;
    
    // 4. Redirect immediately
    window.location.href = loginUrl;
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
