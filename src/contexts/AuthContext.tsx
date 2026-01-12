// src/contexts/AuthContext.tsx
// --------------------------------------------------------
// BlackBox Auth Provider - PRODUCTION SECURE VERSION
// ✅ Cross-domain compatible (works when cookies are blocked)
// ✅ Stores access_token in memory for API calls
// ✅ User data cached in localStorage for persistence
// --------------------------------------------------------
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { User, checkAuth, logout as authLogout } from "../utils/auth";

interface AuthContextType {
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  login: () => void;
  loginWithRole: (role: "admin" | "client" | "all") => void;
  loginForAdmins: () => void;
  loginForUsers: () => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  setUserDirectly: (user: User, accessToken?: string, expiresIn?: number) => void;
  getAccessToken: () => string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔐 SECURITY: Store access_token in memory (not localStorage!)
  const accessTokenRef = useRef<string | null>(null);
  const expiresAtRef = useRef<number | null>(null);

  const AUTH_URL = import.meta.env.VITE_BLACKBOX_AUTH_URL || "https://bbh.codex-th.com";
  const CLIENT_ID = import.meta.env.VITE_BLACKBOX_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_BLACKBOX_REDIRECT_URI || window.location.origin + "/callback";

  useEffect(() => { 
    // Skip auth check on callback page (prevents race condition)
    if (window.location.pathname === "/callback") {
      setIsLoading(false);
      return;
    }
    initAuth(); 
  }, []);

  const initAuth = async () => {
    // Try to restore from localStorage cache first (for page refresh)
    const cached = localStorage.getItem("bb_user_cache");
    if (cached) {
      try {
        const data = JSON.parse(cached);
        // Check if session is still valid (using BlackBox's expiry time)
        if (data.expires_at && Date.now() < data.expires_at) {
          setUser(data);
          expiresAtRef.current = data.expires_at;
          setIsLoading(false);
          console.log("✅ Session restored from cache, expires:", new Date(data.expires_at));
          return;
        } else {
          // Session expired, clear cache
          console.log("⏰ Cached session expired");
          localStorage.removeItem("bb_user_cache");
        }
      } catch (e) {
        localStorage.removeItem("bb_user_cache");
      }
    }
    
    // Try server auth check (for cookie-based auth)
    try {
      const serverUser = await checkAuth(); 
      if (serverUser) {
        setUser(serverUser);
      }
    } catch {
      // Normal for cross-domain
    }
    setIsLoading(false);
  };

  const refreshAuth = async () => {
    try {
      const serverUser = await checkAuth();
      if (serverUser) setUser(serverUser);
    } catch {
      // Ignore refresh errors
    }
  };

  // ✅ Set user and token directly from callback
  // expiresIn is in SECONDS (from BlackBox response)
  const setUserDirectly = useCallback((
    userData: User, 
    accessToken?: string,
    expiresIn?: number  // seconds
  ) => {
    console.log("🔐 setUserDirectly:", userData?.email, "expires_in:", expiresIn);
    setUser(userData);
    setIsLoading(false);
    
    // Store token in memory for API calls
    if (accessToken) {
      accessTokenRef.current = accessToken;
    }
    
    // Calculate expiry timestamp (default 24 hours if not provided)
    const expiresAt = Date.now() + ((expiresIn || 86400) * 1000);
    expiresAtRef.current = expiresAt;
    
    // Cache user data WITH expiry for page refresh persistence
    if (userData) {
      localStorage.setItem("bb_user_cache", JSON.stringify({
        ...userData,
        expires_at: expiresAt,  // ✅ Key fix: store expiry time!
        cached_at: Date.now()
      }));
      console.log("💾 Session cached, expires:", new Date(expiresAt));
    }
  }, []);

  // ✅ Get access token for API calls
  const getAccessToken = useCallback(() => {
    // Check if token is still valid
    if (expiresAtRef.current && Date.now() >= expiresAtRef.current) {
      console.log("⏰ Token expired");
      return null;
    }
    return accessTokenRef.current;
  }, []);

  const login = () => {
    if (!CLIENT_ID) return console.error("VITE_BLACKBOX_CLIENT_ID missing");
    window.location.href = `${AUTH_URL}/login?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  };
  
  const loginWithRole = (requiredRole: "admin" | "client" | "all") => {
    if (!CLIENT_ID) return console.error("VITE_BLACKBOX_CLIENT_ID missing");
    window.location.href = `${AUTH_URL}/login?client_id=${CLIENT_ID}&required_role=${requiredRole}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  };

  const loginForAdmins = () => loginWithRole("admin");
  const loginForUsers = () => loginWithRole("client");

  const logout = () => {
    authLogout();
    setUser(null);
    accessTokenRef.current = null; // Clear token
    localStorage.removeItem("bb_user_cache");
    window.location.href = "/";
  };

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
      setUserDirectly,
      getAccessToken, // NEW
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
