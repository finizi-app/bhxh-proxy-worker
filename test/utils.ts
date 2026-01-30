/**
 * Test utilities and mocks for BHXH Worker
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally
globalThis.fetch = vi.fn();

export function createMockSession(overrides = {}) {
  return {
    token: "test-token",
    xClient: "test-xclient",
    currentDonVi: {
      Ma: "TZH490L",
      Ten: "Test Unit",
      MaCoquan: "test-coquan",
    },
    expiresAt: Date.now() + 3600000,
    ...overrides,
  };
}

export function createMockEnv(overrides = {}) {
  return {
    BHXH_SESSION: {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    BHXH_BASE_URL: "https://test.example.com",
    BHXH_USERNAME: "testuser",
    BHXH_PASSWORD: "testpass",
    BHXH_ENCRYPTION_KEY: "test-encryption-key",
    AI_CAPTCHA_ENDPOINT: "https://ai.example.com/captcha",
    AI_CAPTCHA_API_KEY: "test-api-key",
    EXTERNAL_PROXY_URL: undefined,
    USE_PROXY: undefined,
    ALLOWED_ORIGINS: undefined,
    ...overrides,
  };
}

export function mockFetchSuccess(data: any, status = 200) {
  (globalThis.fetch as vi.Mock).mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  });
}

export function mockFetchError(message: string, status = 500) {
  (globalThis.fetch as vi.Mock).mockResolvedValue({
    ok: false,
    status,
    json: vi.fn().mockResolvedValue({ error: message }),
    text: vi.fn().mockResolvedValue(message),
  });
}

export function mockFetchFail(error: Error) {
  (globalThis.fetch as vi.Mock).mockRejectedValue(error);
}

export function resetMocks() {
  vi.clearAllMocks();
}
