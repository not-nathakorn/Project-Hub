// src/components/RoleGuard.tsx
// ============================================================
// Role-Based Access Control Component
// ============================================================
// Only allows users with specific roles to access content
// ============================================================

import { ReactNode } from 'react';
import { useBBHAuth } from '../hooks/useBBHAuth';
import LazyFallback from './LazyFallback';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;  // What to show if role not allowed
}

export function RoleGuard({ 
  children, 
  allowedRoles,
  fallback 
}: RoleGuardProps) {
  const { user, isLoading } = useBBHAuth();



  // Still loading
  if (isLoading) {
    return <LazyFallback message="กำลังตรวจสอบสิทธิ์..." />;
  }

  // Not authenticated
  if (!user) {
    return fallback || (
      <div className="p-4 text-center text-muted-foreground">
        Please login to access this content.
      </div>
    );
  }

  // Check role
  if (!allowedRoles.includes(user.role || '')) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <h3 className="text-xl font-bold text-destructive mb-2">Access Denied</h3>
        <p className="text-muted-foreground mb-4">
          You don&apos;t have permission to access this content.
        </p>
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-left text-sm font-mono border border-slate-200 dark:border-slate-700">
          <p className="mb-1"><strong>Your Status:</strong></p>
          <p>ID: {user.id}</p>
          <p>Email: {user.email}</p>
          <p className={user.role === 'admin' ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
            Role: {user.role || 'undefined'}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-300 dark:border-slate-600">
            <p><strong>Required Roles:</strong></p>
            <p>{allowedRoles.join(', ')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Role allowed - render children

  return <>{children}</>;
}
