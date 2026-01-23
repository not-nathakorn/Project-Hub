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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-destructive mb-2">Access Denied</h3>
        <p className="text-muted-foreground mb-4">
          You don&apos;t have permission to access this content.
        </p>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl text-left text-sm font-mono border border-slate-200 dark:border-slate-800 max-w-md w-full relative z-[101]">
          <p className="mb-2 pb-2 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-slate-100">
            Your Status
          </p>
          <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
            <p className="flex justify-between">
              <span>ID:</span> 
              <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {user.blackbox_id || user.id.substring(0, 8) + '***'}

              </span>
            </p>
            <p className="flex justify-between">
              <span>Email:</span> 
              <span>{user.email}</span>
            </p>
            <p className="flex justify-between items-center">
              <span>Role:</span>
              <span className={user.role === 'admin' ? "text-green-600 font-bold bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full text-xs" : "text-red-500 font-bold bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full text-xs"}>
                {user.role || 'undefined'}
              </span>
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="mb-2 font-semibold text-slate-900 dark:text-slate-100">Required Roles</p>
            <div className="flex gap-2">
              {allowedRoles.map(role => (
                <span key={role} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-md font-medium border border-slate-200 dark:border-slate-700">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Role allowed - render children

  return <>{children}</>;
}
