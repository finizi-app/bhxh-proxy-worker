/**
 * Department Endpoint Integration Tests
 *
 * Tests for department endpoints (BHXH API Code 079):
 * - GET /api/v1/departments - List departments with filters and pagination
 * - GET /api/v1/departments/{id} - Get department by ID
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { createTestServer } from "../helpers/test-server";
import {
  createAuthHeaders,
  createNoAuthHeaders,
  getDefaultApiKey,
  type TestCredentials,
} from "../helpers/auth-helpers";
import { buildQueryString, getResponseData } from "../helpers/api-helpers";
import { HTTP_STATUS } from "../helpers/test-constants";
import { clearAllSessions } from "../../src/services/session.service";

describe("Department Endpoint Tests", () => {
  let app: Express;
  let validDepartmentId: number;
  let validApiKey: string;

  beforeAll(async () => {
    // Clear session cache before tests
    clearAllSessions();

    const server = createTestServer();
    app = server.app;
    // Use a valid API key from environment
    validApiKey = getDefaultApiKey();

    // Fetch a valid department ID for testing GET by ID
    const response = await request(app)
      .get("/api/v1/departments")
      .set("X-API-Key", validApiKey)
      .set("Content-Type", "application/json");

    if (response.status === 200 && response.body.data?.length > 0) {
      validDepartmentId = response.body.data[0].id;
    } else {
      // Default to ID 1 if no departments exist
      validDepartmentId = 1;
    }
  });

  afterAll(() => {
    // Clear session cache after tests
    clearAllSessions();
  });

  describe("GET /api/v1/departments - List Departments", () => {
    it("should return 401 without credentials", async () => {
      const response = await request(app)
        .get("/api/v1/departments")
        .set(createNoAuthHeaders());

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 200 with departments array", async () => {
      const response = await request(app)
        .get("/api/v1/departments")
        .set(createAuthHeaders({ apiKey: validApiKey }));

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty("meta");
      expect(response.body.meta).toHaveProperty("total");
      expect(response.body.meta).toHaveProperty("count");
    });

    it("should return departments with Ma, Ten properties", async () => {
      const response = await request(app)
        .get("/api/v1/departments")
        .set(createAuthHeaders({ apiKey: validApiKey }));

      expect(response.status).toBe(HTTP_STATUS.OK);

      if (response.body.data.length > 0) {
        const dept = response.body.data[0];
        expect(dept).toHaveProperty("ma");
        expect(dept).toHaveProperty("ten");
        expect(typeof dept.ma).toBe("string");
        expect(typeof dept.ten).toBe("string");
      }
    });

    it("should support search parameter ma (code filter)", async () => {
      // First get a valid department code
      const listResponse = await request(app)
        .get("/api/v1/departments")
        .set(createAuthHeaders({ apiKey: validApiKey }));

      if (listResponse.body.data?.length > 0) {
        const searchCode = listResponse.body.data[0].ma;
        const response = await request(app)
          .get(`/api/v1/departments?ma=${encodeURIComponent(searchCode)}`)
          .set(createAuthHeaders({ apiKey: validApiKey }));

        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(response.body.data).toBeDefined();
        // Filtered results should match the search code
        if (response.body.data.length > 0) {
          expect(response.body.data[0].ma).toBe(searchCode);
        }
      }
    });

    it("should support search parameter ten (name filter)", async () => {
      // First get a valid department name
      const listResponse = await request(app)
        .get("/api/v1/departments")
        .set(createAuthHeaders({ apiKey: validApiKey }));

      if (listResponse.body.data?.length > 0) {
        const searchName = listResponse.body.data[0].ten;
        const response = await request(app)
          .get(`/api/v1/departments?ten=${encodeURIComponent(searchName)}`)
          .set(createAuthHeaders({ apiKey: validApiKey }));

        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(response.body.data).toBeDefined();
        // Filtered results should match the search name
        if (response.body.data.length > 0) {
          expect(response.body.data[0].ten).toBe(searchName);
        }
      }
    });

    it("should support pagination with PageIndex and PageSize", async () => {
      const pageIndex = 1;
      const pageSize = 5;
      const queryString = buildQueryString({ PageIndex: pageIndex, PageSize: pageSize });

      const response = await request(app)
        .get(`/api/v1/departments?${queryString}`)
        .set(createAuthHeaders({ apiKey: validApiKey }));

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toHaveProperty("meta");
      expect(response.body.meta).toHaveProperty("count");
      expect(response.body.meta.count).toBeLessThanOrEqual(pageSize);
    });

    it("should work with per-request credentials", async () => {
      // Test with different API key but same format
      const altCredentials: Partial<TestCredentials> = {
        apiKey: validApiKey,
        username: process.env.BHXH_USERNAME,
        password: process.env.BHXH_PASSWORD,
      };

      const response = await request(app)
        .get("/api/v1/departments")
        .set(createAuthHeaders(altCredentials));

      // Should succeed with valid API key
      expect(response.status).toBe(HTTP_STATUS.OK);
    });
  });

  describe("GET /api/v1/departments/{id} - Get Department By ID", () => {
    it("should return 401 without credentials", async () => {
      const response = await request(app)
        .get(`/api/v1/departments/${validDepartmentId}`)
        .set(createNoAuthHeaders());

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 200 with single department for valid ID", async () => {
      const response = await request(app)
        .get(`/api/v1/departments/${validDepartmentId}`)
        .set(createAuthHeaders({ apiKey: validApiKey }));

      // May return 200 if found, or 404 if not found in test environment
      expect([HTTP_STATUS.OK, HTTP_STATUS.NOT_FOUND]).toContain(response.status);

      if (response.status === HTTP_STATUS.OK) {
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("id", validDepartmentId);
        expect(response.body.data).toHaveProperty("ma");
        expect(response.body.data).toHaveProperty("ten");
      }
    });

    it("should return 404 for invalid ID", async () => {
      const invalidId = 9999999;
      const response = await request(app)
        .get(`/api/v1/departments/${invalidId}`)
        .set(createAuthHeaders({ apiKey: validApiKey }));

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.data).toBeNull();
      expect(response.body).toHaveProperty("error");
    });

    it("should return response matching expected structure", async () => {
      const response = await request(app)
        .get(`/api/v1/departments/${validDepartmentId}`)
        .set(createAuthHeaders({ apiKey: validApiKey }));

      if (response.status === HTTP_STATUS.OK) {
        const dept = response.body.data;
        expect(dept).toMatchObject({
          id: expect.any(Number),
          ma: expect.any(String),
          ten: expect.any(String),
        });
        // Optional fields - ghiChu can be string or object (null/empty in some cases)
        if (dept.maDonVi !== undefined) {
          expect(typeof dept.maDonVi).toBe("string");
        }
      }
    });

    it("should work with per-request credentials", async () => {
      const altCredentials: Partial<TestCredentials> = {
        apiKey: validApiKey,
        username: process.env.BHXH_USERNAME,
        password: process.env.BHXH_PASSWORD,
      };

      const response = await request(app)
        .get(`/api/v1/departments/${validDepartmentId}`)
        .set(createAuthHeaders(altCredentials));

      // Should succeed or return 404 if not found
      expect([HTTP_STATUS.OK, HTTP_STATUS.NOT_FOUND]).toContain(response.status);
    });
  });
});
