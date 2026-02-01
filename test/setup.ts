/**
 * Global Test Setup
 * Runs before all test suites using Vitest globals
 */

import { vi } from "vitest";
import dotenv from "dotenv";

// Load .dev.vars for test environment
dotenv.config({ path: ".dev.vars" });

// Set test environment
process.env.NODE_ENV = "test";

// Spy on console methods to reduce noise in tests (but keep functionality)
const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
const consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
const consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

beforeAll(() => {
  // Global setup before all tests
});

afterAll(() => {
  // Restore console methods after all tests
  consoleLogSpy.mockRestore();
  consoleDebugSpy.mockRestore();
  consoleInfoSpy.mockRestore();
  consoleWarnSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});
