import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/RapiComidas_SpiderFood/",
  server: {
    proxy: {
      "/api/translate": {
        target: "https://api-free.deepl.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/translate/, "/v2/translate"),
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", () => {
            console.log("Sending Request to DeepL API...");
          });
          proxy.on("proxyRes", (proxyRes) => {
            console.log("Received Response from DeepL:", proxyRes.statusCode);
          });
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/__tests__/setup.ts",
    // Silenciar warnings de console en tests
    silent: false,
    mockReset: true,
  },
});
