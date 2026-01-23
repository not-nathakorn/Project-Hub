import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { BBHAuthProvider } from "@/hooks/useBBHAuth";
import { NavigationDock } from "@/components/NavigationDock";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useAnalytics } from "@/hooks/useAnalytics";
import React from "react";
import { ThemeColorManager } from "@/components/ThemeColorManager";
import { LiquidBackground } from "@/components/effects/LiquidBackground";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";
import { AppRoutes } from "./AppRoutes";

const queryClient = new QueryClient();

// Component แยกเพื่อใช้ hook ภายใน Router context
const AnalyticsTracker = () => {
  useAnalytics();
  return null;
};



const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_relativeSplatPath: true,
              v7_startTransition: true,
            }}
          >
            <BBHAuthProvider>
              <ThemeColorManager />
              <LiquidBackground />
              <AnalyticsTracker />
              <MaintenanceGuard>
                <AppRoutes />
                <NavigationDock />
              </MaintenanceGuard>
            </BBHAuthProvider>
          </BrowserRouter>
          <Analytics />
          <SpeedInsights />
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
