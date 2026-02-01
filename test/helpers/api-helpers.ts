/**
 * API Test Helper Functions
 *
 * Utilities for making authenticated API requests and asserting responses
 */

import type { Express } from "express";
import type { Response } from "supertest";
import { getTestCredentials, createAuthHeaders, type TestCredentials } from "./auth-helpers";

// Import expect for type checking
// Note: In actual tests, vitest provides the global 'expect'
interface Expect {
  (value: unknown): Matchers;
  extensions: Record<string, unknown>;
}
interface Matchers {
  toBe(value: unknown): void;
  toEqual(value: unknown): void;
  toHaveProperty(property: string, value?: unknown): void;
  toMatch(pattern: string | RegExp): void;
}
declare const expect: Expect;

/**
 * Make an authenticated API request
 * Wraps supertest with auth headers
 *
 * @param app - Express app instance
 * @param method - HTTP method (get, post, put, patch, delete)
 * @param path - Request path
 * @param credentials - Optional credentials override
 * @returns Supertest request builder
 */
export function makeAuthenticatedRequest(
  app: Express,
  method: "get" | "post" | "put" | "patch" | "delete",
  path: string,
  credentials?: Partial<TestCredentials>,
) {
  const headers = createAuthHeaders(credentials);
  const request = (app as any)[method](path);

  // Set headers
  Object.entries(headers).forEach(([key, value]) => {
    request.set(key, value);
  });

  return request;
}

/**
 * Expect a successful API response
 * Asserts status 200 and checks response structure
 *
 * @param response - Supertest response
 * @param expectedStatus - Expected HTTP status (default: 200)
 * @param expectedData - Optional expected data to match
 */
export function expectApiResponse(
  response: Response,
  expectedStatus = 200,
  expectedData?: unknown,
): void {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty("success");

  if (expectedData !== undefined) {
    expect(response.body.data).toEqual(expectedData);
  }
}

/**
 * Expect an API error response
 * Asserts error status and message format
 *
 * @param response - Supertest response
 * @param expectedStatusCode - Expected HTTP status code
 * @param expectedMessage - Optional expected error message substring
 */
export function expectApiError(
  response: Response,
  expectedStatusCode: number,
  expectedMessage?: string,
): void {
  expect(response.status).toBe(expectedStatusCode);

  if (expectedStatusCode === 401 || expectedStatusCode === 403) {
    expect(response.body).toHaveProperty("error");
    expect(response.body).toHaveProperty("message");
  }

  if (expectedMessage) {
    expect(response.body.message || response.body.error).toMatch(expectedMessage);
  }
}

/**
 * Expect a paginated response
 * Asserts pagination metadata structure
 *
 * @param response - Supertest response
 * @param expectedCount - Expected number of items in current page
 * @param expectedTotal - Optional expected total count
 */
export function expectPaginatedResponse(
  response: Response,
  expectedCount: number,
  expectedTotal?: number,
): void {
  expectApiResponse(response, 200);
  expect(response.body).toHaveProperty("meta");
  expect(response.body.meta).toHaveProperty("count", expectedCount);

  if (expectedTotal !== undefined) {
    expect(response.body.meta).toHaveProperty("total", expectedTotal);
  }
}

/**
 * Build query string from parameters
 * Converts object to URL query string
 *
 * @param params - Query parameters object
 * @returns URL query string (without leading ?)
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

/**
 * Make a paginated request
 * Helper for requests with PageIndex and PageSize parameters
 *
 * @param app - Express app instance
 * @param method - HTTP method
 * @param path - Base path
 * @param pageIndex - Page index (default: 1)
 * @param pageSize - Page size (default: 10)
 * @param credentials - Optional credentials override
 * @returns Supertest request builder with query params
 */
export function makePaginatedRequest(
  app: Express,
  method: "get" | "post",
  path: string,
  pageIndex = 1,
  pageSize = 10,
  credentials?: Partial<TestCredentials>,
) {
  const queryString = buildQueryString({ PageIndex: pageIndex, PageSize: pageSize });
  const fullPath = queryString ? `${path}?${queryString}` : path;

  return makeAuthenticatedRequest(app, method, fullPath, credentials);
}

/**
 * Expect timing metrics in response
 * Asserts session timing is present
 *
 * @param response - Supertest response
 */
export function expectTimingMetrics(response: Response): void {
  if (response.body.timing) {
    expect(response.body.timing).toHaveProperty("sessionMs");
    expect(response.body.timing).toHaveProperty("fetchMs");
    expect(response.body.timing).toHaveProperty("totalMs");
    expect(typeof response.body.timing.totalMs).toBe("number");
  }
}

/**
 * Get response data helper
 * Safely extracts data from response body
 *
 * @param response - Supertest response
 * @returns Response data or null
 */
export function getResponseData<T = unknown>(response: Response): T | null {
  return response.body?.data ?? null;
}

/**
 * Get response error helper
 * Safely extracts error from response body
 *
 * @param response - Supertest response
 * @returns Error message or null
 */
export function getResponseError(response: Response): string | null {
  return response.body?.error || response.body?.message || null;
}
