/**
 * Test Server Helper
 * Creates Express app instance for integration testing
 * Supports dynamic port binding for parallel test execution
 */
import express, { Request, Response, NextFunction } from "express";
import { RegisterRoutes } from "../../src/generated/routes";
import { createApiKeyMiddleware } from "../../src/middleware/api-key.middleware";
import "../../src/services/proxy.service";

// Extend Express Request type for profiling
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
    }
  }
}

export interface TestServer {
  app: express.Application;
  close: () => Promise<void>;
}

/**
 * Create Express app instance for testing
 * Binds to dynamic port (0) to avoid conflicts
 */
export function createTestServer(): TestServer {
  const app = express();

  // Middleware
  app.use(express.json());

  // Skip profiling in tests
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.startTime = Date.now();
    next();
  });

  // API Key middleware (use test key if available)
  app.use(createApiKeyMiddleware());

  // Swagger endpoints (disabled in tests)
  app.get("/openapi.json", (_req: Request, res: Response) => {
    res.sendFile("openapi.json", { root: "./src/generated" });
  });

  // Health check
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      service: "bhxh-api",
      version: "1.0.0",
      status: "ok",
      test: true,
    });
  });

  // Register tsoa routes
  RegisterRoutes(app);

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  });

  return {
    app,
    close: async () => {
      // Cleanup if needed (e.g., close database connections)
      await Promise.resolve();
    },
  };
}
