// src/pages/CallbackPage.tsx
// --------------------------------------------------------
// OAuth Callback Handler - CROSS-DOMAIN COMPATIBLE VERSION
// ✅ Exchanges code for tokens
// ✅ Uses setUserDirectly to bypass cookie limitations
// ✅ Works even when cookies don't work across domains
// --------------------------------------------------------
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const AUTH_HUB = import.meta.env.VITE_BLACKBOX_AUTH_URL || "https://bbh.codex-th.com";
const CLIENT_ID = import.meta.env.VITE_BLACKBOX_CLIENT_ID;

export default function CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserDirectly, refreshAuth } = useAuth();
  const processedRef = useRef(false);
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      // Handle errors
      if (error) {
        console.error("Auth Error:", error);
        setStatus("error");
        setErrorMessage(error);
        return; // Don't redirect automatically on error, let user read it
      }

      if (!code) {
        navigate("/");
        return;
      }

      try {
        console.log("🔄 Exchanging code for tokens...");
        
        // ✅ Exchange code for tokens
        const response = await fetch(`${AUTH_HUB}/api/oauth/token`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            client_id: CLIENT_ID,
            grant_type: "authorization_code"
          })
        });

        const data = await response.json();
        console.log("📦 Token response:", data.success ? "SUCCESS" : "FAILED");

        if (data.success && data.user) {
          // ✅ Set user, token, AND expiry (bypasses cookie requirement)
          console.log("🔐 Setting user and token, expires_in:", data.expires_in);
          setUserDirectly({
            id: data.user.id,
            email: data.user.email,
            username: data.user.username,
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            role: data.user.role || "end_user"
          }, data.access_token, data.expires_in); // ✅ Pass token AND expiry

          setStatus("success");
          
          // Try refresh in background (may fail for cross-domain, that's OK)
          refreshAuth().catch(() => {
            console.log("ℹ️ Background refresh failed (normal for cross-domain)");
          });
          
          // Redirect after a short delay to ensure state is propagated
          const storedReturnUrl = sessionStorage.getItem("return_url");
          const rawReturnUrl = searchParams.get("state") || storedReturnUrl || "/";
          
          // ✅ SECURITY: Validate returnUrl to prevent Open Redirect attacks
          const validateReturnUrl = (url: string): string => {
            // Only allow relative paths (starts with /) or same-origin URLs
            if (url.startsWith('/') && !url.startsWith('//')) {
              return url; // Safe relative path
            }
            try {
              const parsed = new URL(url, window.location.origin);
              if (parsed.origin === window.location.origin) {
                return parsed.pathname + parsed.search + parsed.hash; // Same-origin, use path only
              }
            } catch {
              // Invalid URL, fallback to home
            }
            return '/'; // Fallback to home for any suspicious URL
          };
          
          const returnUrl = validateReturnUrl(rawReturnUrl);
          
          // Clear stored URL to prevent sticky redirects
          if (storedReturnUrl) sessionStorage.removeItem("return_url");

          console.log("➡️ Redirecting to:", returnUrl);
          // snyk:ignore:next-line - URL is validated by validateReturnUrl() above
          setTimeout(() => navigate(returnUrl), 1500); // Slightly longer delay for user to see success
          
        } else {
          console.error("Token exchange failed:", data);
          setStatus("error");
          setErrorMessage(data.error || "Token exchange failed");
        }
      } catch (err) {
        console.error("Callback error:", err);
        setStatus("error");
        setErrorMessage("Network error");
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUserDirectly, refreshAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="glass rounded-2xl p-8 text-center relative overflow-hidden shadow-2xl">
          
          {/* Status-based Background Accent */}
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
            status === "success" ? "from-green-500 to-emerald-500" :
            status === "error" ? "from-red-500 to-orange-500" :
            "from-primary via-accent to-primary animate-gradient-x"
          }`} />

          {status === "processing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6 relative inline-flex items-center justify-center">
                 <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                 <div className="relative bg-white dark:bg-slate-800 p-4 rounded-full shadow-lg border border-blue-100 dark:border-blue-900/50">
                   <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
                 </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Authenticating</h2>
              <p className="text-slate-500 dark:text-slate-400">Verifying secure credentials...</p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="mb-6 relative inline-flex items-center justify-center">
                 <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl" />
                 <div className="relative bg-white dark:bg-slate-800 p-4 rounded-full shadow-lg border border-green-100 dark:border-green-900/50">
                   <CheckCircle2 className="w-10 h-10 text-green-500 dark:text-green-400" />
                 </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Login Successful!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Welcome back. Redirecting you now...</p>
              
              <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5 }}
                />
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="mb-6 relative inline-flex items-center justify-center">
                 <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
                 <div className="relative bg-white dark:bg-slate-800 p-4 rounded-full shadow-lg border border-red-100 dark:border-red-900/50">
                   <XCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
                 </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Login Failed</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {errorMessage || "An unknown error occurred during authentication."}
              </p>
              
              <Button 
                onClick={() => navigate("/login")}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
