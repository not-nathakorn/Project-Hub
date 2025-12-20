// src/contexts/AuthContext.tsx
// --------------------------------------------------------
// BlackBox Auth Provider - SECURE VERSION
// ✅ Uses server-side session verification
// --------------------------------------------------------
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, checkAuth, logout as authLogout } from "../utils/auth";

interface AuthContextType {
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  login: () => void;
  loginWithRole: (role: "admin" | "client" | "all", returnTo?: string) => void;
  loginForAdmins: () => void;
  loginForUsers: () => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const AUTH_URL = import.meta.env.VITE_BLACKBOX_AUTH_URL || "https://bbh.codex-th.com";
  const CLIENT_ID = import.meta.env.VITE_BLACKBOX_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_BLACKBOX_REDIRECT_URI || window.location.origin + "/callback";

  // ✅ Verify session with server on mount (No local cache)
  // Skip on callback page to prevent race condition with code exchange
  const initAuth = useCallback(async () => {
    // Check if we're on callback page with auth code (code exchange in progress)
    const currentPath = window.location.pathname;
    const hasAuthCode = new URLSearchParams(window.location.search).has('code');
    
    // Skip auth check on callback pages when code is present
    // This prevents race condition where checkAuth runs before token exchange
    if ((currentPath === '/callback' || currentPath === '/admin/callback') && hasAuthCode) {
      console.log('🔐 Skipping auth check on callback page (code exchange in progress)');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Always fetch fresh data from server (HttpOnly Cookie)
      const serverUser = await checkAuth(); 
      if (serverUser) {
        setUser(serverUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    initAuth(); 
  }, [initAuth]);

  const refreshAuth = useCallback(async () => {
    const serverUser = await checkAuth();
    setUser(serverUser);
  }, []);

  // ✅ Login with role indicator (shows badge on login page)
  // required_role: "admin" | "client" | "all"
  // - "admin" = Admin Only (shows amber badge)
  // - "client" = Users Only (shows blue badge)
  // - "all" = All Users (shows green badge)
  const loginWithRole = useCallback((requiredRole: "admin" | "client" | "all" = "all", returnTo?: string) => {
    if (!CLIENT_ID) {
      console.error("VITE_BLACKBOX_CLIENT_ID missing");
      return;
    }
    // Use returnTo param, current path, or default to "/"
    const state = returnTo || window.location.pathname || "/";
    window.location.href = `${AUTH_URL}/login?client_id=${CLIENT_ID}&required_role=${requiredRole}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${encodeURIComponent(state)}`;
  }, [AUTH_URL, CLIENT_ID, REDIRECT_URI]);

  // Shortcut for admin-only pages
  const loginForAdmins = useCallback(() => loginWithRole("admin"), [loginWithRole]);

  // Shortcut for user-only pages  
  const loginForUsers = useCallback(() => loginWithRole("client"), [loginWithRole]);

  // Default login (all roles)
  const login = useCallback(() => loginWithRole("all"), [loginWithRole]);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: user?.role || null,
      isAuthenticated: !!user, 
      login,
      loginWithRole,
      loginForAdmins,
      loginForUsers,
      logout,
      refreshAuth,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
