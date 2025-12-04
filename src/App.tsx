import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NavigationDock } from "@/components/NavigationDock";
import Index from "./pages/Index";
import { AdminLayout } from "./pages/AdminLayout";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import NotFound from "./pages/NotFound";
import { useAnalytics } from "@/hooks/useAnalytics";

const queryClient = new QueryClient();

// Component แยกเพื่อใช้ hook ภายใน Router context
const AnalyticsTracker = () => {
  useAnalytics();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AnalyticsTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<AdminLayout />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <NavigationDock />
          </BrowserRouter>
          <Analytics />
          <SpeedInsights />
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
