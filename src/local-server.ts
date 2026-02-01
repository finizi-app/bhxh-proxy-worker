/**
 * Local BHXH API Server Entry Point
 * Express server with tsoa-generated routes and Swagger UI
 * Run with: npm run dev
 */
import express, { Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".dev.vars" });

// Import routes - this registers all tsoa routes
import { RegisterRoutes } from "./generated/routes";

// Import middleware
import { createApiKeyMiddleware } from "./middleware/api-key.middleware";

// Import services to initialize proxy configuration
import "./services/proxy.service";

const app = express();

// Middleware
app.use(express.json());

// Request profiling middleware
function profileRequest(req: Request, res: Response, next: NextFunction) {
  req.startTime = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - (req.startTime || 0);
    console.log(`[PROFILE] ${req.method} ${req.path} - ${duration}ms`);
  });
  next();
}

// Apply profiling to all routes except swagger
app.use((req, res, next) => {
  if (req.path.startsWith("/docs") || req.path.startsWith("/swagger")) {
    return next();
  }
  profileRequest(req, res, next);
});

// API Key authentication middleware
app.use(createApiKeyMiddleware());

// Swagger UI setup
app.use("/docs", swaggerUi.serve, swaggerUi.setup(undefined, {
  swaggerOptions: {
    url: "/openapi.json",
    docExpansion: "list",
    filter: true,
  },
}));

// Serve openapi.json
app.get("/openapi.json", (_req: Request, res: Response) => {
  res.sendFile("openapi.json", { root: "./src/generated" });
});

// Serve openapi.yaml (for Insomnia compatibility)
app.get("/openapi.yaml", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/yaml");
  res.sendFile("openapi.yaml", { root: "./src/generated" });
});

// Backward compatibility: redirect swagger.json to openapi.json
app.get("/swagger.json", (_req: Request, res: Response) => {
  res.redirect("/openapi.json");
});

// Health check at root (bypass profiling)
app.get("/", (_req: Request, res: Response) => {
  res.json({
    service: "bhxh-api",
    version: "1.0.0",
    docs: "/docs",
    status: "ok",
  });
});

// Register tsoa generated routes
RegisterRoutes(app);

// Error handling middleware
function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
}

app.use(errorHandler);

// Server configuration
const HOST = process.env.HOST || "0.0.0.0";
const PORT = parseInt(process.env.PORT || "4000", 10);

// Start server
app.listen(PORT, HOST, () => {
  console.log(`BHXH API Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/docs`);
  console.log(`BASE_URL: ${process.env.BHXH_BASE_URL || "https://dichvucong.baohiemxahoi.gov.vn"}`);
  console.log(`Proxy: ${process.env.USE_PROXY === "true" ? process.env.EXTERNAL_PROXY_URL : "disabled"}`);
});

export default app;
