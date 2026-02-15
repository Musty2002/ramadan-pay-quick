import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    // Target older Android WebViews (Android 7+ = Chrome 51+)
    target: "es2017",
    // Ensure compatibility with older browsers
    cssTarget: "chrome61",
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevent duplicate React instances that cause "dispatcher is null" crashes on Android
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
}));
