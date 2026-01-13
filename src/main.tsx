import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// import "virtual:pwa-register" is handled by vite-plugin-pwa but explicit usage enables prompts
import { registerSW } from 'virtual:pwa-register';

console.log("Environment:", import.meta.env.MODE);
console.log("✅ Codebase Updated: 2026-01-13");

// Auto-update PWA logic
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

createRoot(document.getElementById("root")!).render(<App />);
