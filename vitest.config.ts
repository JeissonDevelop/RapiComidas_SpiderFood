import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/RapiComidas_SpiderFood/",
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
  },
});
