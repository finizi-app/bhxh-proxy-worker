/**
 * Test Constants and Valid IDs
 *
 * Centralized constants for API endpoints, valid test IDs, and error messages
 * Uses real valid IDs from test environment where applicable
 */

/**
 * API Endpoint Paths
 */
export const API_PATHS = {
  /** Health check endpoint */
  HEALTH: "/api/health",

  /** Session check endpoint */
  SESSION: "/api/session",

  /** Master data endpoints */
  PAPER_TYPES: "/api/master-data/paper-types",
  COUNTRIES: "/api/master-data/countries",
  ETHNICITIES: "/api/master-data/ethnicities",
  LABOR_PLAN_TYPES: "/api/master-data/labor-plan-types",
  BENEFITS: "/api/master-data/benefits",
  RELATIONSHIPS: "/api/master-data/relationships",

  /** Geographic endpoints */
  PROVINCES: "/api/geographic/provinces",
  DISTRICTS: "/api/geographic/districts",
  WARDS: "/api/geographic/wards",

  /** Department endpoints */
  DEPARTMENTS: "/api/departments",

  /** Employee endpoints */
  EMPLOYEES: "/api/employees",
  EMPLOYEE_SYNC: "/api/employees/sync",
  EMPLOYEE_DETAIL: "/api/employees/detail",

  /** Payment endpoints */
  C12_REPORT: "/api/payments/c12",
  PAYMENT_UNIT_INFO: "/api/payments/unit-info",
  BANK_ACCOUNTS: "/api/payments/bank-accounts",
  PAYMENT_HISTORY: "/api/payments/history",
} as const;

/**
 * Valid Test IDs
 * Use real valid IDs from test environment
 */
export const VALID_IDS = {
  /** Valid province code (Hanoi) */
  PROVINCE_HANOI: "01",

  /** Valid province code (Ho Chi Minh City) */
  PROVINCE_HCMC: "79",

  /** Valid district code in Hanoi */
  DISTRICT_HANOI: "001",

  /** Valid ward code */
  WARD_SAMPLE: "00001",

  /** Valid unit/department code */
  UNIT_SAMPLE: "DV001",

  /** Valid department code */
  DEPARTMENT_SAMPLE: "PB001",

  /** Valid employee BHXH number (10 digits) */
  EMPLOYEE_BHXH_SAMPLE: "1234567890",

  /** Valid BHXH agency code */
  AGENCY_SAMPLE: "CQBHXH01",

  /** Valid bank code */
  BANK_BIDV: "BIDV",
  BANK_VCB: "VCB",
} as const;

/**
 * Invalid Test IDs (for negative testing)
 */
export const INVALID_IDS = {
  /** Non-existent province code */
  PROVINCE_INVALID: "99",

  /** Non-existent district code */
  DISTRICT_INVALID: "999",

  /** Non-existent ward code */
  WARD_INVALID: "99999",

  /** Invalid BHXH number (wrong format) */
  EMPLOYEE_BHXH_INVALID: "123",

  /** Empty string */
  EMPTY: "",

  /** Special characters */
  SPECIAL_CHARS: "<script>alert('xss')</script>",
} as const;

/**
 * Error Message Templates
 */
export const ERROR_MESSAGES = {
  /** Missing API key */
  MISSING_API_KEY: "Missing X-API-Key header",

  /** Invalid API key */
  INVALID_API_KEY: "Invalid API key",

  /** Unauthorized */
  UNAUTHORIZED: "Unauthorized",

  /** Forbidden */
  FORBIDDEN: "Forbidden",

  /** Not found */
  NOT_FOUND: "Not found",

  /** Invalid request */
  BAD_REQUEST: "Bad request",

  /** Invalid province code */
  INVALID_PROVINCE: "Invalid province code",

  /** Invalid district code */
  INVALID_DISTRICT: "Invalid district code",

  /** Invalid ward code */
  INVALID_WARD: "Invalid ward code",

  /** Invalid BHXH number */
  INVALID_BHXH_NUMBER: "Invalid BHXH number format",

  /** Missing required parameter */
  MISSING_PARAM: (param: string) => `Missing required parameter: ${param}`,

  /** Invalid parameter value */
  INVALID_PARAM: (param: string, value: string) => `Invalid ${param}: ${value}`,
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_INDEX: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * BHXH API Codes
 */
export const BHXH_CODES = {
  LOGIN: 0,
  EMPLOYEES: 67,
  PAPER_TYPES: 71,
  COUNTRIES: 72,
  ETHNICITIES: 73,
  DEPARTMENTS: 79,
  LABOR_PLAN_TYPES: 86,
  BENEFITS: 98,
  RELATIONSHIPS: 99,
  EMPLOYEE_SYNC: 156,
  EMPLOYEE_DETAIL: 172,
  C12_REPORT: 137,
  PAYMENT_UNIT_INFO: 503,
  BANK_ACCOUNTS: 504,
  PAYMENT_HISTORY: 514,
} as const;

/**
 * Test Timeouts (in milliseconds)
 */
export const TIMEOUTS = {
  /** Default request timeout (increased for cold starts with login) */
  DEFAULT: 10000,

  /** Long-running request timeout (sync operations) */
  LONG: 15000,

  /** Very long timeout (payment operations) */
  VERY_LONG: 30000,
} as const;

/**
 * Content Types
 */
export const CONTENT_TYPES = {
  JSON: "application/json",
  YAML: "application/yaml",
  TEXT: "text/plain",
} as const;

/**
 * Headers
 */
export const HEADERS = {
  API_KEY: "x-api-key",
  USERNAME: "x-username",
  PASSWORD: "x-password",
  CONTENT_TYPE: "content-type",
  ACCEPT: "accept",
} as const;

/**
 * Build API path with query parameters
 */
export function buildPath(basePath: string, params: Record<string, string | number>): string {
  const queryString = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Get error message for status code
 */
export function getErrorMessageForStatus(status: number): string {
  switch (status) {
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 400:
      return ERROR_MESSAGES.BAD_REQUEST;
    default:
      return "Unknown error";
  }
}
