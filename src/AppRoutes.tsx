import { Routes, Route, useLocation } from "react-router-dom";
import React from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { RoleGuard } from "@/components/RoleGuard";
import { PageTransition } from "@/components/PageTransition";
import LazyFallback from "@/components/LazyFallback";

// Lazy load pages
import Index from "./pages/Index";
const AdminLayout = React.lazy(() => import("./pages/AdminLayout").then(module => ({ default: module.AdminLayout })));
const CallbackPage = React.lazy(() => import("./pages/CallbackPage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

export const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <PageTransition>
      <React.Suspense fallback={<LazyFallback message="กำลังโหลดเนื้อหา..." />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          
          {/* Callback - OAuth redirect handler */}
          <Route path="/callback" element={<CallbackPage />} />
          
          {/* Admin Route - Protected */}
          <Route path="/admin" element={
            <AuthGuard>
              <RoleGuard allowedRoles={['admin']}>
                <AdminLayout />
              </RoleGuard>
            </AuthGuard>
          } />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </PageTransition>
  );
};
