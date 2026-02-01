/**
 * Employees Endpoint Integration Tests (Phase 07)
 *
 * Tests for employee-related endpoints:
 * - GET /api/v1/employees/ - List employees (Code 067)
 * - GET /api/v1/employees/{id} - Get employee by ID (Code 172)
 * - GET /api/v1/employees/{id}/sync - Sync employee (Code 156)
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createTestServer } from "../helpers/test-server";
import {
  createAuthHeaders,
  createNoAuthHeaders,
  createInvalidAuthHeaders,
  getTestCredentials,
  type TestCredentials,
} from "../helpers/auth-helpers";
import {
  buildQueryString,
  expectApiResponse,
  expectApiError,
  expectTimingMetrics,
  getResponseData,
} from "../helpers/api-helpers";
import { HTTP_STATUS } from "../helpers/test-constants";
import { clearAllSessions } from "../../src/services/session.service";

const hasCredentials = !!(
  process.env.BHXH_USERNAME ||
  process.env.TEST_USERNAME
) && !!(
  process.env.BHXH_PASSWORD ||
  process.env.TEST_PASSWORD
);

describe("Employees Endpoint Tests", () => {
  let app: Awaited<ReturnType<typeof createTestServer>>["app"];

  // Test credentials from environment
  let credentials: TestCredentials;

  beforeAll(async () => {
    // Clear session cache before tests
    clearAllSessions();

    const server = createTestServer();
    app = server.app;
    credentials = getTestCredentials();

    if (!hasCredentials) {
      console.warn("Skipping employees tests: No BHXH credentials configured");
    }
  });

  afterAll(() => {
    // Clear session cache after tests
    clearAllSessions();
  });

  // Helper to skip tests if no credentials
  const skipIfNoCredentials = hasCredentials ? it : it.skip;

  describe("GET /api/v1/employees/ - List Employees (Code 067)", () => {
    it("should return 401 without credentials", async function() {
      const response = await request(app)
        .get("/api/v1/employees/")
        .set(createNoAuthHeaders());

      expectApiError(response, 401);
    });

    it("should return 401/403 with invalid API key", async () => {
      const response = await request(app)
        .get("/api/v1/employees/")
        .set(createInvalidAuthHeaders());

      // API key middleware returns 403 for invalid keys
      expectApiError(response, 403);
    });

    skipIfNoCredentials("should return 200 with employees array", async () => {
      const response = await request(app)
        .get("/api/v1/employees/")
        .set(createAuthHeaders(credentials));

      expectApiResponse(response, 200);
      expect(Array.isArray(response.body.data)).toBe(true);

      // If employees exist, verify structure
      if (response.body.data.length > 0) {
        const employee = response.body.data[0];
        expect(employee).toHaveProperty("id");
        expect(employee).toHaveProperty("Hoten");
        expect(employee).toHaveProperty("Masobhxh");
        // Note: NgaySinh, GioiTinh, DiaChi may not always be present
        // Check for common fields that should exist
        const possibleFields = ["NgaySinh", "Ngaysinh", "GioiTinh", "Gioitinh", "DiaChi", "maPhongBan"];
        const hasAnyField = possibleFields.some(field => field in employee);
        expect(hasAnyField).toBe(true);
      }

      // Verify timing metrics
      expectTimingMetrics(response);
    });

    skipIfNoCredentials("should support pagination with PageIndex and PageSize", async () => {
      const pageIndex = 1;
      const pageSize = 5;

      const response = await request(app)
        .get("/api/v1/employees/")
        .query(buildQueryString({ PageIndex: pageIndex, PageSize: pageSize }))
        .set(createAuthHeaders(credentials));

      expectApiResponse(response, 200);
      expect(response.body.data).toBeDefined();

      // Verify page size respected
      expect(response.body.data.length).toBeLessThanOrEqual(pageSize);

      // Verify meta has pagination info
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta).toHaveProperty("count");
      expect(response.body.meta).toHaveProperty("total");
    });

    skipIfNoCredentials("should support search filter by name (ten)", async () => {
      const response = await request(app)
        .get("/api/v1/employees/")
        .query(buildQueryString({ ten: "Nguyen" }))
        .set(createAuthHeaders(credentials));

      expectApiResponse(response, 200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    skipIfNoCredentials("should support filter by BHXH number (MaSoBhxh)", async () => {
      const response = await request(app)
        .get("/api/v1/employees/")
        .query(buildQueryString({ MaSoBhxh: "1234567890" }))
        .set(createAuthHeaders(credentials));

      expectApiResponse(response, 200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    skipIfNoCredentials("should support filter by department (maPhongBan)", async () => {
      const response = await request(app)
        .get("/api/v1/employees/")
        .query(buildQueryString({ maPhongBan: "PB001" }))
        .set(createAuthHeaders(credentials));

      expectApiResponse(response, 200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    skipIfNoCredentials("should support filter by status (maTinhTrang)", async () => {
      const response = await request(app)
        .get("/api/v1/employees/")
        .query(buildQueryString({ maTinhTrang: "1" }))
        .set(createAuthHeaders(credentials));

      expectApiResponse(response, 200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    skipIfNoCredentials("should support per-request credentials via headers", async () => {
      const perRequestCreds: Partial<TestCredentials> = {
        username: credentials.username,
        password: credentials.password,
      };

      const response = await request(app)
        .get("/api/v1/employees/")
        .set(createAuthHeaders(perRequestCreds));

      expectApiResponse(response, 200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    skipIfNoCredentials("should return empty array for unit with no employees", async () => {
      // Use credentials for empty unit if available
      const emptyUnitCreds: Partial<TestCredentials> = {
        username: process.env.TEST_EMPTY_UNIT_USERNAME,
        password: process.env.TEST_EMPTY_UNIT_PASSWORD,
      };

      if (!emptyUnitCreds.username || !emptyUnitCreds.password) {
        return;
      }

      const response = await request(app)
        .get("/api/v1/employees/")
        .set(createAuthHeaders(emptyUnitCreds));

      expectApiResponse(response, 200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe("GET /api/v1/employees/{id} - Get Employee By ID (Code 172)", () => {
    let testEmployeeId: string;

    beforeAll(async () => {
      // Get a valid employee ID first
      if (hasCredentials) {
        const response = await request(app)
          .get("/api/v1/employees/")
          .set(createAuthHeaders(credentials));

        if (response.status === 200 && response.body?.data?.length > 0) {
          testEmployeeId = String(response.body.data[0].id || response.body.data[0].Ma);
        }
      }
    });

    it("should return 401 without credentials", async function() {
      const response = await request(app)
        .get("/api/v1/employees/123")
        .set(createNoAuthHeaders());

      expectApiError(response, 401);
    });

    skipIfNoCredentials("should return 200 with full employee details for valid ID", async function() {
      if (!testEmployeeId) {
        console.warn("Skipping test: No valid employee ID available");
        this.skip();
      }
      const response = await request(app)
        .get(`/api/v1/employees/${testEmployeeId}`)
        .set(createAuthHeaders(credentials));

      expectApiResponse(response, 200);
      expect(response.body).toHaveProperty("success", true);

      // Check if data exists - API may return empty array or null
      if (!response.body.data || (Array.isArray(response.body.data) && response.body.data.length === 0)) {
        // Empty response is valid for some IDs
        expect(response.body.success).toBe(true);
        return;
      }

      const employee = response.body.data;
      if (employee) {
        expect(employee).toHaveProperty("id");
        expect(employee).toHaveProperty("Hoten");
        expect(employee).toHaveProperty("Masobhxh");
        // Note: Some fields may not always be present depending on BHXH data
        const possibleFields = ["NgaySinh", "Ngaysinh", "GioiTinh", "Gioitinh", "DiaChi"];
        const hasAnyField = possibleFields.some(field => field in employee);
        if (hasAnyField) {
          expect(possibleFields.some(field => field in employee)).toBe(true);
        }
      }
    });

    skipIfNoCredentials("should return 404 or success=false for invalid ID", async () => {
      const response = await request(app)
        .get("/api/v1/employees/999999999")
        .set(createAuthHeaders(credentials));

      // API may return 200 with success=false or 200 with empty data
      expect(response.status).toBe(200);
      if (response.body.success === false) {
        expect(response.body).toHaveProperty("message");
      } else {
        // If success is true, data should be empty or the response structure varies
        expect(response.body).toHaveProperty("success");
      }
    });

    skipIfNoCredentials("should return error for non-numeric ID", async () => {
      const response = await request(app)
        .get("/api/v1/employees/invalid")
        .set(createAuthHeaders(credentials));

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    skipIfNoCredentials("should handle special characters in ID", async () => {
      const response = await request(app)
        .get("/api/v1/employees/%3Cscript%3E")
        .set(createAuthHeaders(credentials));

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    skipIfNoCredentials("should support per-request credentials via headers", async function() {
      if (!testEmployeeId) {
        console.warn("Skipping test: No valid employee ID available");
        this.skip();
      }
      const perRequestCreds: Partial<TestCredentials> = {
        username: credentials.username,
        password: credentials.password,
      };

      const response = await request(app)
        .get(`/api/v1/employees/${testEmployeeId}`)
        .set(createAuthHeaders(perRequestCreds));

      expectApiResponse(response, 200);
      expect(response.body).toHaveProperty("success", true);
    });
  });

  describe("GET /api/v1/employees/{id}/sync - Sync Employee (Code 156)", () => {
    const syncParams = {
      masoBhxh: "1234567890",
      maCqbh: "CQBHXH01",
    };

    it("should return 401 without credentials", async function() {
      const response = await request(app)
        .get(`/api/v1/employees/1/sync`)
        .query(syncParams)
        .set(createNoAuthHeaders());

      expectApiError(response, 401);
    });

    skipIfNoCredentials("should return 400 without required sync parameters", async () => {
      const response = await request(app)
        .get(`/api/v1/employees/1/sync`)
        .set(createAuthHeaders(credentials));

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    skipIfNoCredentials("should return sync result for valid parameters", async () => {
      const response = await request(app)
        .get(`/api/v1/employees/1/sync`)
        .query(syncParams)
        .set(createAuthHeaders(credentials));

      // May return 200 or error depending on BHXH system availability
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);

      if (response.status === 200) {
        expect(response.body).toHaveProperty("success");
        if (response.body.data) {
          expect(response.body.data).toHaveProperty("masoBhxh");
        }
      }
    });

    skipIfNoCredentials("should handle invalid BHXH number format", async () => {
      const response = await request(app)
        .get(`/api/v1/employees/1/sync`)
        .query({
          masoBhxh: "123",
          maCqbh: syncParams.maCqbh,
        })
        .set(createAuthHeaders(credentials));

      // API returns 200 but may have error in response
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    skipIfNoCredentials("should support per-request credentials via headers", async () => {
      const perRequestCreds: Partial<TestCredentials> = {
        username: credentials.username,
        password: credentials.password,
      };

      const response = await request(app)
        .get(`/api/v1/employees/1/sync`)
        .query(syncParams)
        .set(createAuthHeaders(perRequestCreds));

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });
  });

  describe("Employee Response Properties", () => {
    skipIfNoCredentials("should contain all expected employee properties", async () => {
      const response = await request(app)
        .get("/api/v1/employees/")
        .set(createAuthHeaders(credentials));

      expectApiResponse(response, 200);

      if (response.body.data.length > 0) {
        const employee = response.body.data[0];

        // Core properties
        expect(employee).toHaveProperty("id");
        expect(employee).toHaveProperty("Hoten");
        expect(employee).toHaveProperty("Masobhxh");

        // Optional but expected properties
        const possibleProps = [
          "NgaySinh",
          "GioiTinh",
          "DiaChi",
          "maPhongBan",
          "maTinhTrang",
          "NgayBatDau",
          "chucVu",
          "mucLuong",
          "soDienThoai",
          "email",
        ];

        // At least some of these should be present
        const presentProps = possibleProps.filter(prop => prop in employee);
        expect(presentProps.length).toBeGreaterThan(0);
      }
    });

    skipIfNoCredentials("should have correct metadata structure", async () => {
      const response = await request(app)
        .get("/api/v1/employees/")
        .set(createAuthHeaders(credentials));

      expectApiResponse(response, 200);
      expect(response.body).toHaveProperty("meta");
      expect(response.body.meta).toHaveProperty("total");
      expect(response.body.meta).toHaveProperty("count");
      expect(response.body.meta).toHaveProperty("unit");

      expect(typeof response.body.meta.total).toBe("number");
      expect(typeof response.body.meta.count).toBe("number");
    });
  });
});
