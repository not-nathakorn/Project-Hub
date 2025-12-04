import { useEffect } from 'react';

/**
 * Security Headers Component
 * Sets up Content Security Policy and other security headers
 */
export const SecurityHeaders = () => {
  useEffect(() => {
    // Set Content Security Policy via meta tag
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co https://vercel.live https://va.vercel-scripts.com wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
    
    // Only add if not already present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      document.head.appendChild(cspMeta);
    }

    // Set X-Frame-Options
    const frameMeta = document.createElement('meta');
    frameMeta.httpEquiv = 'X-Frame-Options';
    frameMeta.content = 'DENY';
    if (!document.querySelector('meta[http-equiv="X-Frame-Options"]')) {
      document.head.appendChild(frameMeta);
    }

    // Set X-Content-Type-Options
    const contentTypeMeta = document.createElement('meta');
    contentTypeMeta.httpEquiv = 'X-Content-Type-Options';
    contentTypeMeta.content = 'nosniff';
    if (!document.querySelector('meta[http-equiv="X-Content-Type-Options"]')) {
      document.head.appendChild(contentTypeMeta);
    }

    // Set Referrer-Policy
    const referrerMeta = document.createElement('meta');
    referrerMeta.name = 'referrer';
    referrerMeta.content = 'strict-origin-when-cross-origin';
    if (!document.querySelector('meta[name="referrer"]')) {
      document.head.appendChild(referrerMeta);
    }

    // Set Permissions-Policy
    const permissionsMeta = document.createElement('meta');
    permissionsMeta.httpEquiv = 'Permissions-Policy';
    permissionsMeta.content = 'geolocation=(), microphone=(), camera=()';
    if (!document.querySelector('meta[http-equiv="Permissions-Policy"]')) {
      document.head.appendChild(permissionsMeta);
    }

    return () => {
      // Cleanup on unmount
      document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.remove();
      document.querySelector('meta[http-equiv="X-Frame-Options"]')?.remove();
      document.querySelector('meta[http-equiv="X-Content-Type-Options"]')?.remove();
      document.querySelector('meta[name="referrer"]')?.remove();
      document.querySelector('meta[http-equiv="Permissions-Policy"]')?.remove();
    };
  }, []);

  return null;
};
