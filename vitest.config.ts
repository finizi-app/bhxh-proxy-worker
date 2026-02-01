import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
    environment: "node",
    globals: true,
    testTimeout: 30000, // 30 second timeout for real API calls
    hookTimeout: 30000, // 30 second timeout for setup hooks
    fileParallelism: false, // Run test files sequentially to avoid session cache conflicts
    maxConcurrency: 1, // Run tests sequentially to avoid session cache conflicts
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "test/**",
        "*.config.ts",
        "scripts/**",
        "src/generated/**",
      ],
    },
  },
});
