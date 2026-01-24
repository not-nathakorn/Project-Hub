// src/components/AuthGuard.tsx
// ============================================================
// Route Protection Component
// ============================================================
// Wrap any route with this to require authentication
// Works with: useBBHAuth hook
// ============================================================

import { ReactNode, useEffect } from 'react';
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



  // Handle redirect side effect
  useEffect(() => {
    if (!isLoading && !user) {
      login(loginRedirect || window.location.pathname);
    }
  }, [isLoading, user, login, loginRedirect]);

  // Show loading state (checking session)
  if (isLoading) {
    return fallback || <LazyFallback message="กำลังตรวจสอบสิทธิ์..." />;
  }

  // Not authenticated - Show redirecting state while browser navigates
  if (!user) {
    return fallback || (
      <div className="fixed inset-0 z-[50] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
         <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin mb-6" />
         <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">กำลังเข้าสู่ระบบที่ปลอดภัย</h2>
         <p className="text-slate-500 dark:text-slate-400 text-sm">กรุณารอสักครู่...</p>
      </div>
    );
  }

  // Authenticated - render children

  return <>{children}</>;
}
