// middleware/withAuth.ts
// ============================================================
// Reusable Auth Middleware for Vercel Serverless Functions
// ============================================================
// SECURITY: This middleware verifies roles from HttpOnly cookies,
// NOT from client-sent data. The role in the cookie is trusted
// because we set it ourselves in /api/auth/proxy.ts
// ============================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const COOKIE_NAME = 'bbh_session';

// Supabase client for server-side admin verification
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

interface AuthOptions {
  roles?: string[];  // Allowed roles (empty = any authenticated user)
  allowAdminFallback?: boolean; // If true, check personal_info email for admin access
}

interface SessionUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  blackbox_id?: string;
}

interface Session {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: SessionUser;
}

// Helper: Get session from cookie
function getSession(req: VercelRequest): Session | null {
  const cookies = req.headers.cookie || '';
  const match = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  
  if (!match) return null;
  
  try {
    return JSON.parse(Buffer.from(match[1], 'base64').toString());
  } catch {
    return null;
  }
}

// Helper: Check if user email matches personal_info (portfolio owner)
async function isPortfolioOwner(email: string): Promise<boolean> {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase not configured for admin fallback check');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data } = await supabase
      .from('personal_info')
      .select('email')
      .limit(1)
      .maybeSingle();
    
    return data?.email === email;
  } catch (err) {
    console.error('Admin fallback check failed:', err);
    return false;
  }
}

// Middleware HOC
type VercelApiHandler = (req: VercelRequest, res: VercelResponse) => Promise<unknown>;

export function withAuth(handler: VercelApiHandler, options: AuthOptions = {}) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const session = getSession(req);
    
    // Check authentication
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Check expiration
    if (session.expires_at && Date.now() > session.expires_at) {
      return res.status(401).json({ error: 'Session expired' });
    }
    
    // Determine effective role
    let effectiveRole = session.user.role;
    
    // Admin Fallback: Check personal_info email if role is missing/basic
    // This is the SERVER-SIDE equivalent of the client-side fallback
    if (options.allowAdminFallback !== false) {  // Default: enabled
      if ((!effectiveRole || effectiveRole === 'authenticated') && session.user.email) {
        const isOwner = await isPortfolioOwner(session.user.email);
        if (isOwner) {
          effectiveRole = 'admin';
          console.log(`[withAuth] Admin fallback granted for: ${session.user.email}`);
        }
      }
    }
    
    // Check roles (using effective role)
    if (options.roles && options.roles.length > 0) {
      if (!effectiveRole || !options.roles.includes(effectiveRole)) {
        return res.status(403).json({ 
          error: 'Access denied',
          required_roles: options.roles,
          your_role: effectiveRole || 'none'
        });
      }
    }
    
    // Attach user to request (with effective role)
    const userWithEffectiveRole = { ...session.user, role: effectiveRole };
    Object.assign(req, {
      user: userWithEffectiveRole,
      accessToken: session.access_token
    });
    
    return handler(req, res);
  };
}

// Export types for use in handlers
export type { Session, SessionUser, AuthOptions };
