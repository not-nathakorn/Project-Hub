// src/components/RoleGuard.tsx
// ============================================================
// Role-Based Access Control Component
// ============================================================
// Only allows users with specific roles to access content
// Premium UI design with animations
// ============================================================

import { ReactNode } from 'react';
import { useBBHAuth } from '../hooks/useBBHAuth';
import LazyFallback from './LazyFallback';
import { ShieldX, User, Mail, BadgeCheck, Lock, ArrowLeft, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export function RoleGuard({ 
  children, 
  allowedRoles,
  fallback 
}: RoleGuardProps) {
  const { user, isLoading, logout } = useBBHAuth();
  const navigate = useNavigate();

  // Still loading
  if (isLoading) {
    return <LazyFallback message="กำลังตรวจสอบสิทธิ์..." />;
  }

  // Not authenticated
  if (!user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้</p>
        </div>
      </div>
    );
  }

  // Check role
  if (!allowedRoles.includes(user.role || '')) {
    return fallback || (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-red-500/20 rounded-full"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Glass Card */}
          <div className="bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden">
            
            {/* Header with Icon */}
            <div className="relative px-8 pt-10 pb-6 text-center">
              {/* Shield Icon with Glow */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative inline-block mb-6"
              >
                <div className="absolute inset-0 bg-red-500/30 blur-2xl rounded-full scale-150" />
                <div className="relative bg-gradient-to-br from-red-500 to-red-700 p-4 rounded-2xl shadow-lg">
                  <ShieldX className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white mb-2"
              >
                ไม่มีสิทธิ์เข้าถึง
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/60 text-sm"
              >
                คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้
              </motion.p>
            </div>

            {/* User Info Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="px-8 pb-6"
            >
              <div className="bg-white/5 rounded-2xl p-5 space-y-4 border border-white/10">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                  ข้อมูลผู้ใช้
                </h3>
                
                {/* User ID */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/40">ID</p>
                    <p className="text-sm text-white/80 font-mono truncate">
                      {user.blackbox_id || user.id.substring(0, 12) + '...'}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/40">อีเมล</p>
                    <p className="text-sm text-white/80 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <BadgeCheck className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/40">สิทธิ์ปัจจุบัน</p>
                    <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-medium rounded-full border border-amber-500/30">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                      {user.role || 'ไม่มี'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Required Roles */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="px-8 pb-6"
            >
              <div className="bg-red-500/10 rounded-2xl p-5 border border-red-500/20">
                <h3 className="text-xs font-semibold text-red-300/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  สิทธิ์ที่ต้องการ
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allowedRoles.map(role => (
                    <span 
                      key={role} 
                      className="px-3 py-1.5 bg-red-500/20 text-red-300 text-sm font-medium rounded-lg border border-red-500/30"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="px-8 pb-8 flex gap-3"
            >
              <button
                onClick={() => navigate(-1)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">ย้อนกลับ</span>
              </button>
              <button
                onClick={() => logout('/')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">ออกจากระบบ</span>
              </button>
            </motion.div>
          </div>

          {/* Bottom hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-white/30 text-xs mt-6"
          >
            หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Role allowed - render children
  return <>{children}</>;
}
