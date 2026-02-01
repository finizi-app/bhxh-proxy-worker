/**
 * Master Data Endpoint Integration Tests
 *
 * Tests for 6 master data endpoints (Codes 071-073, 086, 098-099)
 * Uses parameterized tests to reduce duplication
 *
 * Total: 24 tests (4 tests x 6 endpoints)
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createTestServer } from "../helpers/test-server";
import { createAuthHeaders, createNoAuthHeaders } from "../helpers/auth-helpers";
import { API_PATHS, HTTP_STATUS, TIMEOUTS } from "../helpers/test-constants";
import { clearAllSessions } from "../../src/services/session.service";

/**
 * Master data endpoint configuration
 * Defines path, BHXH code, and property validators for each endpoint
 */
const masterDataEndpoints = [
  {
    path: "/api/v1/master-data/paper-types",
    apiPath: API_PATHS.PAPER_TYPES,
    code: 71,
    name: "Paper Types",
    codeProperty: "ma",
    nameProperty: "ten",
  },
  {
    path: "/api/v1/master-data/countries",
    apiPath: API_PATHS.COUNTRIES,
    code: 72,
    name: "Countries",
    codeProperty: "ma",
    nameProperty: "ten",
  },
  {
    path: "/api/v1/master-data/ethnicities",
    apiPath: API_PATHS.ETHNICITIES,
    code: 73,
    name: "Ethnicities",
    codeProperty: "ma",
    nameProperty: "ten",
  },
  {
    path: "/api/v1/master-data/labor-plan-types",
    apiPath: API_PATHS.LABOR_PLAN_TYPES,
    code: 86,
    name: "Labor Plan Types",
    codeProperty: "ma",
    nameProperty: "ten",
  },
  {
    path: "/api/v1/master-data/benefits",
    apiPath: API_PATHS.BENEFITS,
    code: 98,
    name: "Benefits",
    codeProperty: "ma_chedo",
    nameProperty: "ten_nhomhuong",
  },
  {
    path: "/api/v1/master-data/relationships",
    apiPath: API_PATHS.RELATIONSHIPS,
    code: 99,
    name: "Relationships",
    codeProperty: "ma",
    nameProperty: "ten",
  },
] as const;

describe("Master Data Endpoints", () => {
  let testServer: ReturnType<typeof createTestServer>;

  beforeAll(() => {
    // Clear session cache before tests
    clearAllSessions();
    testServer = createTestServer();
  });

  afterAll(() => {
    // Clear session cache after tests
    clearAllSessions();
  });

  /**
   * Test 1: Returns 401 without credentials
   * Verifies authentication is required for all endpoints
   */
  describe.each(masterDataEndpoints)("$name (Code $code)", ({ path, name }) => {
    it(`should return 401 without credentials`, async () => {
      const response = await request(testServer.app)
        .get(path)
        .set(createNoAuthHeaders())
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty("error");
    });
  });

  /**
   * Test 2: Returns 200 with data array when authenticated
   * Verifies successful data retrieval with valid credentials
   */
  describe.each(masterDataEndpoints)("$name (Code $code)", ({ path, name, codeProperty, nameProperty }) => {
    it(`should return 200 with data array when authenticated`, async () => {
      const response = await request(testServer.app)
        .get(path)
        .set(createAuthHeaders())
        .expect(HTTP_STATUS.OK);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verify data structure - at least one item if available
      if (response.body.data.length > 0) {
        const firstItem = response.body.data[0];
        expect(firstItem).toHaveProperty("id");
        expect(firstItem).toHaveProperty(codeProperty);
        expect(firstItem).toHaveProperty(nameProperty);
      }
    });
  });

  /**
   * Test 3: Each item has code (Ma) and name (Ten) properties
   * Verifies response data structure matches expected format
   */
  describe.each(masterDataEndpoints)("$name (Code $code)", ({ path, name, codeProperty, nameProperty }) => {
    it(`should have ${codeProperty} and ${nameProperty} properties`, async () => {
      const response = await request(testServer.app)
        .get(path)
        .set(createAuthHeaders())
        .expect(HTTP_STATUS.OK);

      expect(response.body).toHaveProperty("data");
      const data = response.body.data;

      // Only validate if data is available
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((item: unknown) => {
          expect(item).toHaveProperty("id");
          expect(item).toHaveProperty(codeProperty);
          expect(item).toHaveProperty(nameProperty);

          // Verify types
          expect(typeof item.id).toBe("number");
          // Code property can be string or number (API inconsistency)
          expect(["string", "number"]).toContain(typeof item[codeProperty as keyof typeof item]);
          expect(typeof item[nameProperty as keyof typeof item]).toBe("string");
        });
      }
    });
  });

  /**
   * Test 4: Response time <5 seconds for real API call
   * Verifies performance meets acceptable threshold
   */
  describe.each(masterDataEndpoints)("$name (Code $code)", ({ path, name }) => {
    it(`should respond in less than ${TIMEOUTS.DEFAULT}ms`, async () => {
      const startTime = Date.now();

      const response = await request(testServer.app)
        .get(path)
        .set(createAuthHeaders())
        .expect(HTTP_STATUS.OK);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body).toHaveProperty("success", true);
      expect(responseTime).toBeLessThan(TIMEOUTS.DEFAULT);
    });
  });
});
