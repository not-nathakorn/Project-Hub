/**
 * Security Utility Functions
 * Separated from components for better code organization
 */

/**
 * Rate Limiter
 * Prevents abuse by limiting function calls
 */
export class RateLimiter {
  private calls: Map<string, number[]> = new Map();
  private limit: number;
  private windowMs: number;

  constructor(limit: number = 5, windowMs: number = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  checkLimit(key: string): boolean {
    const now = Date.now();
    const timestamps = this.calls.get(key) || [];
    
    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(t => now - t < this.windowMs);
    
    if (validTimestamps.length >= this.limit) {
      return false; // Rate limit exceeded
    }
    
    validTimestamps.push(now);
    this.calls.set(key, validTimestamps);
    return true;
  }

  reset(key?: string) {
    if (key) {
      this.calls.delete(key);
    } else {
      this.calls.clear();
    }
  }
}

/**
 * Input Sanitization
 * Prevents XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validate URL
 * Prevents open redirect vulnerabilities
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Validate Email
 * Basic email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate CSRF Token
 * For form protection
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate CSRF Token
 */
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && token.length === 64;
};
