import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global unhandled promise rejection handler — prevents crashes on older Android
window.addEventListener("unhandledrejection", (event) => {
  console.error("[Global] Unhandled promise rejection:", event.reason);
  // Prevent the default browser behavior (which can crash the WebView)
  event.preventDefault();
});

// Global error handler — catches uncaught synchronous errors
window.addEventListener("error", (event) => {
  console.error("[Global] Uncaught error:", event.error);
  // Don't prevent default here — React ErrorBoundary should handle rendering errors
});

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found");
}
