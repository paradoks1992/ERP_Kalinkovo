import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Включаем логирование всех импортов для поиска проблемного файла
const logImportsPlugin = () => ({
  name: "log-imports",
  async transform(code, id) {
    if (id.includes("node_modules")) return null;
    console.log("📦 Importing:", id);
    return null;
  }
});

export default defineConfig({
  plugins: [react(), logImportsPlugin()],
  root: __dirname,
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    open: true
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
  optimizeDeps: {
    entries: ["./src/main.jsx"]
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false
  },
  logLevel: "info"
});
