/**
 * Authentication Helper Functions
 *
 * Utilities for building authenticated request headers and managing test credentials
 */

import type { AuthenticatedRequest } from "../../src/middleware/api-key.middleware";

/**
 * Test credentials interface
 */
export interface TestCredentials {
  apiKey: string;
  username?: string;
  password?: string;
}

/**
 * Get test credentials from environment or defaults
 * Uses environment variables for production-like tests
 *
 * @returns Test credentials object
 */
export function getTestCredentials(): TestCredentials {
  const apiKeys = process.env.API_KEYS?.split(",") || [];
  return {
    apiKey: process.env.TEST_API_KEY || apiKeys[0]?.trim() || "sk_test_abc123def456",
    username: process.env.BHXH_USERNAME || process.env.TEST_USERNAME,
    password: process.env.BHXH_PASSWORD || process.env.TEST_PASSWORD,
  };
}

/**
 * Create authentication headers for API requests
 * Supports per-request credential override
 *
 * @param credentials - Optional credentials override
 * @returns Headers object with X-API-Key and optional X-Username/X-Password
 */
export function createAuthHeaders(credentials?: Partial<TestCredentials>): Record<string, string> {
  const creds = credentials ? { ...getTestCredentials(), ...credentials } : getTestCredentials();
  const headers: Record<string, string> = {
    "X-API-Key": creds.apiKey,
    "Content-Type": "application/json",
  };

  if (creds.username) {
    headers["X-Username"] = creds.username;
  }
  if (creds.password) {
    headers["X-Password"] = creds.password;
  }

  return headers;
}

/**
 * Create headers with invalid API key for negative testing
 *
 * @returns Headers object with invalid X-API-Key
 */
export function createInvalidAuthHeaders(): Record<string, string> {
  return {
    "X-API-Key": "invalid-api-key",
    "Content-Type": "application/json",
  };
}

/**
 * Create headers without API key for unauthorized testing
 *
 * @returns Headers object without X-API-Key
 */
export function createNoAuthHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
  };
}

/**
 * Check if request has BHXH credentials
 *
 * @param req - Request object (partial AuthenticatedRequest)
 * @returns True if request has username and password
 */
export function hasBhxhCredentials(req: Partial<AuthenticatedRequest>): boolean {
  return !!(req.bhxhUsername && req.bhxhPassword);
}

/**
 * Get default API key from environment
 *
 * @returns Default API key string
 */
export function getDefaultApiKey(): string {
  return process.env.API_KEYS?.split(",")[0]?.trim() || "test-api-key-12345";
}

/**
 * Validate API key format (basic validation)
 *
 * @param apiKey - API key to validate
 * @returns True if API key is non-empty string
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return typeof apiKey === "string" && apiKey.length > 0;
}
