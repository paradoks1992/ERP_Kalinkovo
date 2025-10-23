import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    open: false
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  fs: {
    strict: false,
    allow: [
      path.resolve(__dirname, "./src"),
      path.resolve(__dirname, "./public")
    ]
  },
  optimizeDeps: { entries: ["./src/main.jsx"] },
  build: { outDir: "dist", emptyOutDir: true, sourcemap: false },
  logLevel: "info"
});
