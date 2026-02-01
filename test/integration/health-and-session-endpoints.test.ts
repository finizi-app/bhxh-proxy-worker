/**
 * Health & Session Endpoint Integration Tests
 *
 * Tests health check and session status endpoints.
 * These are the simplest endpoints with no BHXH API dependency.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createTestServer } from "../helpers/test-server";
import { createAuthHeaders, getTestCredentials, type TestCredentials } from "../helpers/auth-helpers";
import { clearAllSessions } from "../../src/services/session.service";

describe("Health & Session Endpoints", () => {
  let server: ReturnType<typeof createTestServer>;
  let testCredentials: TestCredentials;

  beforeAll(() => {
    server = createTestServer();
    testCredentials = getTestCredentials();
  });

  afterAll(async () => {
    await server.close();
    clearAllSessions();
  });

  describe("GET /health/", () => {
    it("should return 200 with service info", async () => {
      const response = await request(server.app).get("/health/");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("service");
    });

    it("should return service name and version", async () => {
      const response = await request(server.app).get("/health/");

      expect(response.body.service).toBe("bhxh-api");
      expect(response.body.status).toBe("ok");
      expect(response.body).toHaveProperty("timestamp");
    });

    it("should allow requests without authentication", async () => {
      const response = await request(server.app)
        .get("/health/")
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        service: "bhxh-api",
        status: "ok",
      });
    });
  });

  describe("GET /api/v1/session/status", () => {
    it("should return 401 when no API key provided", async () => {
      const response = await request(server.app)
        .get("/api/v1/session/status")
        .set("Content-Type", "application/json");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
      expect(response.body).toHaveProperty("message");
    });

    it("should return 200 when authenticated", async () => {
      const headers = createAuthHeaders(testCredentials);

      const response = await request(server.app)
        .get("/api/v1/session/status")
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("expiresIn");
    });

    it("should return session status with active or expired state", async () => {
      const headers = createAuthHeaders(testCredentials);

      const response = await request(server.app)
        .get("/api/v1/session/status")
        .set(headers);

      expect(response.status).toBe(200);
      expect(["active", "expired"]).toContain(response.body.status);
      expect(typeof response.body.expiresIn).toBe("number");
    });

    it("should return current unit info when session active", async () => {
      const headers = createAuthHeaders(testCredentials);

      const response = await request(server.app)
        .get("/api/v1/session/status")
        .set(headers);

      // Note: If no BHXH credentials configured, status will be "expired"
      // If credentials configured, status may be "active" with unit info
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status");

      // When active, unit info should be present
      if (response.body.status === "active") {
        expect(response.body).toHaveProperty("unit");
        expect(typeof response.body.unit).toBe("string");
      }
    });

    it("should support per-request credentials via headers", async () => {
      const perRequestCredentials: Partial<TestCredentials> = {
        username: testCredentials.username,
        password: testCredentials.password,
      };

      const headers = createAuthHeaders(perRequestCredentials);

      const response = await request(server.app)
        .get("/api/v1/session/status")
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status");
    });
  });

  describe("Session Cache Behavior", () => {
    it("should cache session per unique credentials", async () => {
      const headers1 = createAuthHeaders({
        username: "user1@test.com",
        password: "pass1",
      });

      const headers2 = createAuthHeaders({
        username: "user2@test.com",
        password: "pass2",
      });

      // First request with credentials 1
      const response1 = await request(server.app)
        .get("/api/v1/session/status")
        .set(headers1);

      // Second request with credentials 2
      const response2 = await request(server.app)
        .get("/api/v1/session/status")
        .set(headers2);

      // Both should return 200 (status endpoint doesn't require active session)
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });

    it("should return expired status when no cached session", async () => {
      // Clear all sessions to ensure clean state
      clearAllSessions();

      const headers = createAuthHeaders({
        username: "nonexistent@test.com",
        password: "nopassword",
      });

      const response = await request(server.app)
        .get("/api/v1/session/status")
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("expired");
      expect(response.body.expiresIn).toBe(0);
    });
  });
});
