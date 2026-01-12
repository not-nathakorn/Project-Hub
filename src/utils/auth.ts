// src/utils/auth.ts
// --------------------------------------------------------
// BlackBox Auth Utility - PRODUCTION SECURE VERSION
// ✅ Token expiry enforced by BlackBox Hub server
// ✅ All API calls validated against server
// ✅ Cross-domain compatible (works when cookies blocked)
// ✅ Auto-logout on session expiry
// --------------------------------------------------------

const AUTH_HUB = "https://bbh.codex-th.com";

export interface User {
  id: string;
  username?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: "client" | "admin" | "end_user" | "child_web_admin";
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // seconds
  expires_at: number; // timestamp (ms)
}

// ============================================
// TOKEN STORAGE (Memory-only for security)
// ============================================
let _tokens: AuthTokens | null = null;
let _user: User | null = null;

export const setTokens = (tokens: AuthTokens, user?: User) => {
  _tokens = {
    ...tokens,
    expires_at: Date.now() + (tokens.expires_in * 1000)
  };
  if (user) _user = user;
  
  // Cache user for page refresh (NOT tokens!)
  if (user) {
    localStorage.setItem("bb_user_cache", JSON.stringify({
      ...user,
      expires_at: _tokens.expires_at,
      cached_at: Date.now()
    }));
  }
};

export const getTokens = () => _tokens;
export const getUser = () => _user;

export const clearAuth = () => {
  _tokens = null;
  _user = null;
  localStorage.removeItem("bb_user_cache");
};

// ============================================
// TOKEN VALIDATION (Checks expiry)
// ============================================
export const isTokenValid = (): boolean => {
  if (!_tokens) return false;
  // Add 30 second buffer before expiry
  return Date.now() < (_tokens.expires_at - 30000);
};

// ============================================
// API CALL HELPER (Auto-adds Authorization)
// ============================================
export const authenticatedFetch = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  // First try with token
  if (_tokens && isTokenValid()) {
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${_tokens.access_token}`);
    headers.set("Content-Type", "application/json");
    
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include"
    });
    
    if (response.status !== 401) return response;
  }
  
  // Token expired or invalid - try with cookie
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  
  // If still 401, session truly expired
  if (response.status === 401) {
    console.log("🔒 Session expired - clearing auth");
    clearAuth();
  }
  
  return response;
};

// ============================================
// CHECK AUTH (Validates session with server)
// ============================================
export const checkAuth = async (): Promise<User | null> => {
  try {
    // First check local token validity
    if (_user && isTokenValid()) {
      return _user;
    }
    
    // Try to restore from cache
    const cached = localStorage.getItem("bb_user_cache");
    if (cached) {
      try {
        const data = JSON.parse(cached);
        // Cache valid for same duration as token
        if (data.expires_at && Date.now() < data.expires_at) {
          _user = data;
          return _user;
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
    
    // Validate with server
    const response = await fetch(`${AUTH_HUB}/api/user/profile`, {
      method: "GET",
      credentials: "include",
      headers: _tokens ? { 
        "Authorization": `Bearer ${_tokens.access_token}`,
        "Content-Type": "application/json"
      } : { "Content-Type": "application/json" }
    });
    
    if (response.ok) {
      const data = await response.json();
      _user = data.user;
      return data.user;
    }
    
    // Server says not authenticated
    clearAuth();
    return null;
  } catch (error) {
    console.error("Auth check failed:", error);
    return null;
  }
};

// ============================================
// LOGOUT (Server + Local)
// ============================================
export const logout = async (): Promise<void> => {
  try {
    await fetch(`${AUTH_HUB}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: _tokens ? { 
        "Authorization": `Bearer ${_tokens.access_token}` 
      } : {}
    });
  } finally {
    clearAuth();
    window.location.href = "/";
  }
};

// ============================================
// AUTHENTICATED API CALLS
// ============================================
export const updateProfile = async (
  data: { username?: string; phone?: string }
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response = await authenticatedFetch(`${AUTH_HUB}/api/user/profile`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.error };
    return { success: true, user: result.user };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await authenticatedFetch(`${AUTH_HUB}/api/user/password`, {
      method: "POST",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error };
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
};

// ============================================
// SESSION EXPIRY HELPERS
// ============================================
export const getSessionExpiresAt = (): Date | null => {
  if (!_tokens) return null;
  return new Date(_tokens.expires_at);
};

export const getSessionRemainingSeconds = (): number => {
  if (!_tokens) return 0;
  return Math.max(0, Math.floor((_tokens.expires_at - Date.now()) / 1000));
};
