// src/components/AuthGuard.tsx
// ============================================================
// Route Protection Component
// ============================================================
// Wrap any route with this to require authentication
// Works with: useBBHAuth hook
// ============================================================

import { ReactNode } from 'react';
import { useBBHAuth } from '../hooks/useBBHAuth';
import LazyFallback from './LazyFallback';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;  // Custom loading component
  loginRedirect?: string; // Where to redirect after login
}

export function AuthGuard({ 
  children, 
  fallback,
  loginRedirect 
}: AuthGuardProps) {
  const { user, isLoading, login } = useBBHAuth();



  // Show loading state
  if (isLoading) {
    return fallback || <LazyFallback message="กำลังยืนยันตัวตน..." />;
  }

  // Not authenticated - redirect to login
  if (!user) {
    // Use setTimeout to avoid React state update during render
    setTimeout(() => {
      login(loginRedirect || window.location.pathname);
    }, 0);
    
    return fallback || <LazyFallback message="กำลังพาท่านไปหน้าเข้าสู่ระบบ..." />;
  }

  // Authenticated - render children

  return <>{children}</>;
}
