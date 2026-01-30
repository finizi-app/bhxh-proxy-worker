import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node", // Use Node environment for unit tests
    globals: true,
    testTimeout: 15000, // 15 second timeout for async tests
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
