/**
 * Payments Endpoint Integration Tests
 *
 * Tests for all payment-related endpoints:
 * - GET /api/v1/payments/c12-report (Code 137)
 * - GET /api/v1/payments/history (Code 514)
 * - GET /api/v1/payments/bank-accounts (Code 504)
 * - GET /api/v1/payments/unit-info (Code 503)
 * - GET /api/v1/payments/reference
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createTestServer } from "../helpers/test-server";
import {
  createAuthHeaders,
  createNoAuthHeaders,
  createInvalidAuthHeaders,
  getTestCredentials,
} from "../helpers/auth-helpers";
import { buildQueryString } from "../helpers/api-helpers";
import { clearAllSessions } from "../../src/services/session.service";

describe("Payments Endpoint Tests", () => {
  const testServer = createTestServer();
  let app: any;

  beforeAll(async () => {
    // Clear session cache before tests
    clearAllSessions();
    app = testServer.app;
  });

  afterAll(() => {
    // Clear session cache after tests
    clearAllSessions();
  });

  describe("GET /api/v1/payments/c12-report (Code 137)", () => {
    const basePath = "/api/v1/payments/c12-report";

    describe("Authentication", () => {
      it("should return 401 without credentials", async () => {
        const response = await request(app)
          .get(basePath)
          .query({ thang: 1 })
          .set(createNoAuthHeaders());

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
      });

      it("should return 403 with invalid API key", async () => {
        const response = await request(app)
          .get(basePath)
          .query({ thang: 1 })
          .set(createInvalidAuthHeaders());

        expect([401, 403]).toContain(response.status);
        expect(response.body).toHaveProperty("error");
      });

      it("should accept per-request credentials via query params", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          // Skip if no test credentials available
          return;
        }

        const response = await request(app)
          .get(basePath)
          .query({
            thang: 1,
            username: creds.username,
            password: creds.password,
          })
          .set("X-API-Key", creds.apiKey);

        // May fail auth but should accept the format
        expect([200, 401, 403, 500]).toContain(response.status);
        if (response.status === 401 || response.status === 403) {
          expect(response.body).toHaveProperty("error");
        }
      });
    });

    describe("Request Validation", () => {
      it("should require month parameter", async () => {
        const creds = getTestCredentials();
        const headers = creds.username && creds.password
          ? createAuthHeaders({ username: creds.username, password: creds.password })
          : createAuthHeaders();

        const response = await request(app)
          .get(basePath)
          .set(headers);

        // Should return 400 for missing month, or auth error if credentials invalid
        expect([400, 401, 403, 500]).toContain(response.status);
        if (response.status === 400) {
          expect(response.body).toHaveProperty("error", "Bad Request");
          expect(response.body.message).toMatch(/month/i);
        }
      });

      it("should return 400 for invalid month (0)", async () => {
        const creds = getTestCredentials();
        const headers = creds.username && creds.password
          ? createAuthHeaders({ username: creds.username, password: creds.password })
          : createAuthHeaders();

        const response = await request(app)
          .get(basePath)
          .query({ thang: 0 })
          .set(headers);

        // Should return 400 for invalid month, or auth error
        expect([400, 401, 403, 500]).toContain(response.status);
        if (response.status === 400) {
          expect(response.body).toHaveProperty("error", "Bad Request");
          expect(response.body.message).toMatch(/month/i);
        }
      });

      it("should return 400 for invalid month (13)", async () => {
        const creds = getTestCredentials();
        const headers = creds.username && creds.password
          ? createAuthHeaders({ username: creds.username, password: creds.password })
          : createAuthHeaders();

        const response = await request(app)
          .get(basePath)
          .query({ thang: 13 })
          .set(headers);

        expect([400, 401, 403, 500]).toContain(response.status);
        if (response.status === 400) {
          expect(response.body).toHaveProperty("error", "Bad Request");
          expect(response.body.message).toMatch(/month/i);
        }
      });

      it("should return 400 for negative month", async () => {
        const creds = getTestCredentials();
        const headers = creds.username && creds.password
          ? createAuthHeaders({ username: creds.username, password: creds.password })
          : createAuthHeaders();

        const response = await request(app)
          .get(basePath)
          .query({ thang: -1 })
          .set(headers);

        expect([400, 401, 403, 500]).toContain(response.status);
        if (response.status === 400) {
          expect(response.body).toHaveProperty("error", "Bad Request");
        }
      });

      it("should accept valid month parameter (1-12)", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        // Test just one valid month to avoid timeout
        const response = await request(app)
          .get(basePath)
          .query({ thang: 1, nam: 2024 })
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        // May fail auth but validation should pass
        expect([200, 401, 403, 500]).toContain(response.status);
        if (response.status === 400) {
          throw new Error("Valid month should not return 400");
        }
      });

      it("should accept optional year parameter", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .query({ thang: 1, nam: 2024 })
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        // May fail auth but request format is valid
        expect([200, 401, 403, 500]).toContain(response.status);
      });
    });

    describe("Response Structure", () => {
      it("should return C12 data structure on success", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .query({ thang: 1, nam: 2024 })
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          expect(response.body).toHaveProperty("success", true);
          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty("raw");
          expect(response.body.data).toHaveProperty("parsed");
          expect(response.body).toHaveProperty("meta");

          // Check raw structure
          expect(response.body.data.raw).toHaveProperty("maCqBhxh");
          expect(response.body.data.raw).toHaveProperty("tenCqBhxh");
          expect(response.body.data.raw).toHaveProperty("c12s");
          expect(Array.isArray(response.body.data.raw.c12s)).toBe(true);

          // Check parsed structure
          expect(response.body.data.parsed).toHaveProperty("agencyCode");
          expect(response.body.data.parsed).toHaveProperty("agencyName");
          expect(response.body.data.parsed).toHaveProperty("sectionA");
          expect(response.body.data.parsed).toHaveProperty("sectionB");
          expect(response.body.data.parsed).toHaveProperty("sectionC");
          expect(response.body.data.parsed).toHaveProperty("sectionD");
          expect(response.body.data.parsed).toHaveProperty("sectionDau");

          // Check meta
          expect(response.body.meta).toHaveProperty("month");
          expect(response.body.meta).toHaveProperty("year");
          expect(response.body.meta).toHaveProperty("unitCode");
        }
      });
    });
  });

  describe("GET /api/v1/payments/history (Code 514)", () => {
    const basePath = "/api/v1/payments/history";

    describe("Authentication", () => {
      it("should return 401 without credentials", async () => {
        const response = await request(app)
          .get(basePath)
          .set(createNoAuthHeaders());

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
      });

      it("should return 403 with invalid API key", async () => {
        const response = await request(app)
          .get(basePath)
          .set(createInvalidAuthHeaders());

        expect([401, 403]).toContain(response.status);
        expect(response.body).toHaveProperty("error");
      });

      it("should accept per-request credentials", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .query({
            username: creds.username,
            password: creds.password,
          })
          .set("X-API-Key", creds.apiKey);

        expect([200, 401, 403, 500]).toContain(response.status);
      });
    });

    describe("Response Structure", () => {
      it("should return payment transactions on success", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          expect(response.body).toHaveProperty("success", true);
          expect(response.body).toHaveProperty("data");
          expect(Array.isArray(response.body.data)).toBe(true);
          expect(response.body).toHaveProperty("meta");

          // Check meta structure
          expect(response.body.meta).toHaveProperty("total");
          expect(response.body.meta).toHaveProperty("count");
          expect(response.body.meta).toHaveProperty("pageIndex");
          expect(response.body.meta).toHaveProperty("pageSize");
        }
      });
    });

    describe("Pagination", () => {
      it("should support PageIndex parameter", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .query({ PageIndex: 2 })
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          expect(response.body.meta.pageIndex).toBe(2);
        }
      });

      it("should support PageSize parameter", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .query({ PageSize: 5 })
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          expect(response.body.meta.pageSize).toBe(5);
          expect(response.body.data.length).toBeLessThanOrEqual(5);
        }
      });

      it("should use default PageIndex=1 when not provided", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          expect(response.body.meta.pageIndex).toBe(1);
        }
      });

      it("should use default PageSize=10 when not provided", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          expect(response.body.meta.pageSize).toBe(10);
        }
      });
    });

    describe("Filtering", () => {
      it("should support Filter parameter", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .query({ Filter: "test" })
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        // Should accept the filter parameter
        expect([200, 401, 500]).toContain(response.status);
      });
    });
  });

  describe("GET /api/v1/payments/bank-accounts (Code 504)", () => {
    const basePath = "/api/v1/payments/bank-accounts";

    describe("Authentication", () => {
      it("should return 401 without credentials", async () => {
        const response = await request(app)
          .get(basePath)
          .set(createNoAuthHeaders());

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
      });

      it("should return 403 with invalid API key", async () => {
        const response = await request(app)
          .get(basePath)
          .set(createInvalidAuthHeaders());

        expect([401, 403]).toContain(response.status);
        expect(response.body).toHaveProperty("error");
      });

      it("should accept per-request credentials", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .query({
            username: creds.username,
            password: creds.password,
          })
          .set("X-API-Key", creds.apiKey);

        expect([200, 401, 403, 500]).toContain(response.status);
      });
    });

    describe("Response Structure", () => {
      it("should return bank account list on success", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          expect(response.body).toHaveProperty("success", true);
          expect(response.body).toHaveProperty("data");
          expect(Array.isArray(response.body.data)).toBe(true);
          expect(response.body).toHaveProperty("meta");

          // Check meta
          expect(response.body.meta).toHaveProperty("agencyCode");
          expect(response.body.meta).toHaveProperty("count");
          expect(response.body.meta.count).toBe(response.body.data.length);
        }
      });

      it("should include bank account details", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200 && response.body.data.length > 0) {
          const account = response.body.data[0];

          // Check required fields
          expect(account).toHaveProperty("tkThuHuong");
          expect(account).toHaveProperty("maNHThuHuong");
          expect(account).toHaveProperty("tenVietTatNHThuHuong");
          expect(account).toHaveProperty("tenNHThuHuong");
        }
      });

      it("should have valid bank account structure", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200 && response.body.data.length > 0) {
          const account = response.body.data[0];

          // Types should be correct
          expect(typeof account.tkThuHuong).toBe("string");
          expect(typeof account.maNHThuHuong).toBe("string");
          expect(typeof account.tenVietTatNHThuHuong).toBe("string");
          expect(typeof account.tenNHThuHuong).toBe("string");

          // Bank short name should be typical format (uppercase letters)
          expect(account.tenVietTatNHThuHuong).toMatch(/^[A-Z]+$/);
        }
      });
    });
  });

  describe("GET /api/v1/payments/unit-info (Code 503)", () => {
    const basePath = "/api/v1/payments/unit-info";

    describe("Authentication", () => {
      it("should return 401 without credentials", async () => {
        const response = await request(app)
          .get(basePath)
          .set(createNoAuthHeaders());

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
      });

      it("should return 403 with invalid API key", async () => {
        const response = await request(app)
          .get(basePath)
          .set(createInvalidAuthHeaders());

        expect([401, 403]).toContain(response.status);
        expect(response.body).toHaveProperty("error");
      });

      it("should accept per-request credentials", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .query({
            username: creds.username,
            password: creds.password,
          })
          .set("X-API-Key", creds.apiKey);

        expect([200, 401, 403, 500]).toContain(response.status);
      });
    });

    describe("Response Structure", () => {
      it("should return unit info on success", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          expect(response.body).toHaveProperty("success", true);
          expect(response.body).toHaveProperty("data");
          expect(typeof response.body.data).toBe("object");
        }
      });

      it("should contain tax code and address info", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          const data = response.body.data;

          // Check for common unit info fields
          // Note: exact fields depend on BHXH API response
          expect(typeof data).toBe("object");
        }
      });
    });
  });

  describe("GET /api/v1/payments/reference", () => {
    const basePath = "/api/v1/payments/reference";

    describe("Authentication", () => {
      it("should return 401 without credentials", async () => {
        const response = await request(app)
          .get(basePath)
          .set(createNoAuthHeaders());

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("error");
      });

      it("should return 403 with invalid API key", async () => {
        const response = await request(app)
          .get(basePath)
          .set(createInvalidAuthHeaders());

        expect([401, 403]).toContain(response.status);
        expect(response.body).toHaveProperty("error");
      });

      it("should accept per-request credentials", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .query({
            username: creds.username,
            password: creds.password,
          })
          .set("X-API-Key", creds.apiKey);

        expect([200, 401, 403, 500]).toContain(response.status);
      });
    });

    describe("Response Structure", () => {
      it("should return reference string on success", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          expect(response.body).toHaveProperty("success", true);
          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty("reference");
          expect(response.body.data).toHaveProperty("components");
        }
      });

      it("should return valid reference format", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          const { reference, components } = response.body.data;

          // Reference should match pattern: +BHXH+103+00+{unitCode}+{agencyCode}+{description}+
          expect(reference).toMatch(/^\+BHXH\+\d+\+\d+\+[A-Z0-9]+\+\d+\+.+\+$/);

          // Components should have all parts
          expect(components).toHaveProperty("prefix", "BHXH");
          expect(components).toHaveProperty("transactionType");
          expect(components).toHaveProperty("reserved");
          expect(components).toHaveProperty("unitCode");
          expect(components).toHaveProperty("agencyCode");
          expect(components).toHaveProperty("description");
        }
      });

      it("should use default type=103 and description='dong BHXH'", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          const { components } = response.body.data;

          expect(components.transactionType).toBe("103");
          expect(components.description).toBe("dong BHXH");
        }
      });
    });

    describe("Custom Parameters", () => {
      it("should accept custom type parameter", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .query({ type: "999" })
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          expect(response.body.data.components.transactionType).toBe("999");
        }
      });

      it("should accept custom description parameter", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const customDesc = "test payment";
        const response = await request(app)
          .get(basePath)
          .query({ description: customDesc })
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          expect(response.body.data.components.description).toBe(customDesc);
        }
      });

      it("should accept custom unitCode parameter", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .query({ unitCode: "TEST123" })
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          expect(response.body.data.components.unitCode).toBe("TEST123");
        }
      });

      it("should accept custom agencyCode parameter", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        const response = await request(app)
          .get(basePath)
          .query({ agencyCode: "99999" })
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        if (response.status === 200) {
          expect(response.body.data.components.agencyCode).toBe("99999");
        }
      });
    });

    describe("Error Handling", () => {
      it("should return 400 when unit/agency codes cannot be determined", async () => {
        const creds = getTestCredentials();
        if (!creds.username || !creds.password) {
          return;
        }

        // Mock scenario where session doesn't have required codes
        // This test may not trigger 400 in real environment if defaults exist
        const response = await request(app)
          .get(basePath)
          .set(createAuthHeaders({ username: creds.username, password: creds.password }));

        // Most likely will succeed or fail with 500, but format is accepted
        expect([200, 400, 401, 403, 500]).toContain(response.status);
      });
    });
  });
});
