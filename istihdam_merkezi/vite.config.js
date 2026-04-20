import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { compression } from "vite-plugin-compression2";

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: "gzip" }),
    compression({ algorithm: "brotliCompress" }),
  ],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // TipTap + prosemirror — lazy loaded, sadece ilan oluşturma/düzenlemede
          if (
            id.includes("node_modules/@tiptap") ||
            id.includes("node_modules/prosemirror") ||
            id.includes("node_modules/@prosemirror")
          ) {
            return "editor-vendor";
          }

          // React Router — react'ten ÖNCE kontrol edilmeli
          if (id.includes("node_modules/react-router")) {
            return "router-vendor";
          }

          // React core + scheduler (React'ın runtime bağımlılığı)
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "react-vendor";
          }

          if (id.includes("node_modules/lucide-react")) {
            return "icons-vendor";
          }

          if (
            id.includes("node_modules/zustand") ||
            id.includes("node_modules/date-fns")
          ) {
            return "utils-vendor";
          }

          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
