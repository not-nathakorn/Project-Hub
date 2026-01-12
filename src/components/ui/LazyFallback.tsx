import React from "react";
import { Skeleton } from "./skeleton";

interface LazyFallbackProps {
  message?: string;
}

const LazyFallback: React.FC<LazyFallbackProps> = ({
  message = "กำลังโหลด...",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:bg-none dark:bg-black transition-colors duration-500">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Main loading card with glass effect */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/20 p-8 animate-pulse-glow">
          <div className="space-y-6">
            {/* Header skeleton with avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 animate-pulse"></div>
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>

            {/* Content skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Enhanced progress indicator */}
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-10 animate-pulse"></div>
              </div>
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>

            {/* Loading message */}
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 animate-pulse">
                {message}
              </p>
              <div className="mt-2 w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LazyFallback;
