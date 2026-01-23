// api/auth/proxy.ts
// ============================================================
// BlackBox Hub - BFF Auth Proxy (Vercel Serverless Function)
// ============================================================
// Place this file at: /api/auth/proxy.ts (Vercel)
//                  or /pages/api/auth/proxy.ts (Next.js Pages)
//                  or /app/api/auth/proxy/route.ts (Next.js App)
// 
// ✅ Tokens stored in HttpOnly Cookies (JavaScript can't access)
// ✅ Client ID & Secret hidden from browser
// ✅ CORS handled automatically
// ============================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Configuration - Set these in Vercel Environment Variables
const BBH_BASE_URL = process.env.BBH_BASE_URL || 'https://bbh.codex-th.com';
const BBH_CLIENT_ID = process.env.BBH_CLIENT_ID || 'client_umphfht9l38';
const BBH_CLIENT_SECRET = process.env.BBH_CLIENT_SECRET || '';
const COOKIE_NAME = 'bbh_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Start: Rate Limiting (In-Memory for Warm Instances)
// Note: For production with cold starts, use Redis (e.g., Upstash)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute
const rateLimitMap = new Map<string, { count: number, start: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return true;
  }

  if (now - record.start > RATE_LIMIT_WINDOW) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, start: now });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false; // Exceeded limit
  }

  record.count++;
  return true;
}
// End: Rate Limiting

// ============================================
// Cookie Helpers
// ============================================
function setCookie(res: VercelResponse, name: string, value: string, maxAge: number) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', 
    `${name}=${value}; Path=/; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax; Max-Age=${maxAge}`
  );
}

function clearCookie(res: VercelResponse, name: string) {
  res.setHeader('Set-Cookie', 
    `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
  );
}

function getCookie(req: VercelRequest, name: string): string | null {
// Manual parsing to avoid RegExp security warnings
  const cookies = req.headers.cookie || '';
  const cookieArr = cookies.split(';');
  for (const c of cookieArr) {
    const trimmed = c.trim();
    if (trimmed.startsWith(name + '=')) {
      return trimmed.substring(name.length + 1);
    }
  }
  return null;
}

// ============================================
// Security Headers
// ============================================
function setSecurityHeaders(res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
}

function getSafeRedirect(url: string | undefined): string {
  if (!url) return '/';
  // Allow relative paths only (starts with / but not //)
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }
  return '/';
}

// ============================================
// Main Handler
// ============================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);
  
  // Rate Limiting Check
  const ip = (Array.isArray(req.headers['x-forwarded-for']) 
    ? req.headers['x-forwarded-for'][0] 
    : req.headers['x-forwarded-for']) || 'unknown';
    
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too Many Requests' });
  }
  
  const action = req.query.action as string;

  switch (action) {
    // ========== LOGIN ==========
    case 'login': {
      const redirectAfterLogin = getSafeRedirect(req.query.redirect as string);
      const loginUrl = `${BBH_BASE_URL}/oauth/authorize?` + new URLSearchParams({
        response_type: 'code',
        client_id: BBH_CLIENT_ID,
        redirect_uri: `https://${req.headers.host}/api/auth/proxy?action=callback`,
        state: encodeURIComponent(redirectAfterLogin as string)
      }).toString();
      return res.redirect(loginUrl);
    }
      
    // ========== CALLBACK ==========
    case 'callback': {
      const code = req.query.code as string;
      if (!code) {
        return res.status(400).json({ error: 'Missing authorization code' });
      }
      
      try {
        const tokenRes = await fetch(`${BBH_BASE_URL}/api/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            code,
            client_id: BBH_CLIENT_ID,
            client_secret: BBH_CLIENT_SECRET,
            redirect_uri: `https://${req.headers.host}/api/auth/proxy?action=callback`
          })
        });
        
        if (!tokenRes.ok) {
          const error = await tokenRes.text();
          console.error('Token exchange failed:', error);
          return res.redirect('/login?error=auth_failed');
        }
        
        const tokens = await tokenRes.json();
        
        // Store tokens in HttpOnly cookie
        const session = Buffer.from(JSON.stringify({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Date.now() + (tokens.expires_in * 1000),
          user: tokens.user
        })).toString('base64');
        
        setCookie(res, COOKIE_NAME, session, COOKIE_MAX_AGE);
        
        const stateRedirect = decodeURIComponent(req.query.state as string || '/');
        const redirectTo = getSafeRedirect(stateRedirect);
        return res.redirect(redirectTo);
      } catch (err) {
        console.error('Callback error:', err);
        return res.redirect('/login?error=callback_failed');
      }
    }
      
    // ========== LOGOUT ==========
    case 'logout': {
      clearCookie(res, COOKIE_NAME);
      
      // Also logout from BlackBox Hub
      const redirectAfterLogout = getSafeRedirect(req.query.redirect as string);
      
      // WARNING: Redirecting to API endpoint can be flaky if server returns HTML error.
      // Recommended: Handle logout on client-side via fetch(logoutUrl, { method: 'POST' })
      return res.redirect(`${BBH_BASE_URL}/api/auth/logout?redirect=${encodeURIComponent(redirectAfterLogout)}`);
    }
      
    // ========== GET CURRENT USER ==========
    case 'me': {
      const sessionCookie = getCookie(req, COOKIE_NAME);
      if (!sessionCookie) {
        return res.status(200).json({ user: null, authenticated: false });
      }
      
      try {
        const session = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
        
        // Check if session expired
        if (session.expires_at && Date.now() > session.expires_at) {
          // Try to refresh
          if (session.refresh_token) {
            const refreshRes = await fetch(`${BBH_BASE_URL}/api/user/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                refresh_token: session.refresh_token
              })
            });
            
            if (refreshRes.ok) {
              const newTokens = await refreshRes.json();
              const newSession = Buffer.from(JSON.stringify({
                access_token: newTokens.access_token,
                refresh_token: newTokens.refresh_token || session.refresh_token,
                expires_at: Date.now() + (newTokens.expires_in * 1000),
                user: newTokens.user || session.user
              })).toString('base64');
              
              setCookie(res, COOKIE_NAME, newSession, COOKIE_MAX_AGE);
              return res.status(200).json({ 
                user: newTokens.user || session.user, 
                authenticated: true 
              });
            }
          }
          
          // Refresh failed - clear session
          clearCookie(res, COOKIE_NAME);
          return res.status(200).json({ user: null, authenticated: false });
        }
        
        return res.status(200).json({ user: session.user, authenticated: true });
      } catch {
        clearCookie(res, COOKIE_NAME);
        return res.status(200).json({ user: null, authenticated: false });
      }
    }
      
    // ========== API PROXY (New) ==========
    case 'api': {
      const sessionCookie = getCookie(req, COOKIE_NAME);
      if (!sessionCookie) return res.status(401).json({ error: 'Unauthorized' });
      
      const session = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
      const path = req.query.path as string;
      
      if (!path) return res.status(400).json({ error: 'Missing path parameter' });
      
      try {
        const apiRes = await fetch(`${BBH_BASE_URL}${path}`, {
          method: req.method,
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });
        
        // Handle 401 (Token Expired) - Simple pass-through
        // Frontend should handle re-login/refresh if this happens
        if (apiRes.status === 401) {
           return res.status(401).json({ error: 'Unauthorized from Upstream' });
        }

        const data = await apiRes.json().catch(() => ({}));
        return res.status(apiRes.status).json(data);
      } catch (err) {
        console.error('API Proxy Error:', err);
        return res.status(502).json({ error: 'Bad Gateway' });
      }
    }

    default:
      return res.status(400).json({ error: 'Invalid action. Use: login, logout, callback, me, or api' });
  }
}
