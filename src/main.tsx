import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ========== Polyfills for older Android WebViews ==========

// globalThis polyfill (missing on Android 7 / Chrome < 71)
if (typeof globalThis === "undefined") {
  (window as any).globalThis = window;
}

// ResizeObserver polyfill guard — prevents crashes on Android < 64
if (typeof window.ResizeObserver === "undefined") {
  (window as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// queueMicrotask polyfill (Android < 71)
if (typeof queueMicrotask !== "function") {
  (window as any).queueMicrotask = (cb: () => void) => {
    Promise.resolve().then(cb).catch((e) => setTimeout(() => { throw e; }));
  };
}

// AbortController polyfill guard (Android < 66)
if (typeof AbortController === "undefined") {
  (window as any).AbortController = class AbortController {
    signal = { aborted: false, addEventListener() {}, removeEventListener() {} };
    abort() {
      (this.signal as any).aborted = true;
    }
  };
}

// structuredClone polyfill (Android < 98)
if (typeof structuredClone === "undefined") {
  (window as any).structuredClone = (obj: any) => {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return obj;
    }
  };
}

// ========== Global error handlers ==========

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

// ========== App initialization ==========

try {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(<App />);
  } else {
    console.error("Root element not found");
  }
} catch (err) {
  console.error("[Fatal] Failed to initialize app:", err);
  // Show a basic fallback UI
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:24px;font-family:sans-serif;text-align:center;">
        <h1 style="font-size:20px;margin-bottom:12px;">Something went wrong</h1>
        <p style="color:#666;margin-bottom:24px;">The app failed to load. Please try again.</p>
        <button onclick="location.reload()" style="padding:12px 24px;background:#0ea5e9;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer;">
          Reload App
        </button>
      </div>
    `;
  }
}
