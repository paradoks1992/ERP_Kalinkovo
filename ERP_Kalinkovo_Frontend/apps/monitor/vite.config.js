import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Р В Р’В Р РЋРІвЂћСћР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎвЂєР В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚вЂњР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљР’В Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ Vite
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
  }
});
