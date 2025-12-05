import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("Environment:", import.meta.env.MODE);
console.log("Client ID:", import.meta.env.VITE_CLIENT_ID);
console.log("Redirect URI:", import.meta.env.VITE_REDIRECT_URI);

createRoot(document.getElementById("root")!).render(<App />);
