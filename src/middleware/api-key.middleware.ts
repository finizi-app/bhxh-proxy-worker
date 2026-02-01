/**
 * API Key Authentication Middleware
 *
 * Validates X-API-Key header on all protected endpoints.
 * Extracts BHXH credentials from X-Username and X-Password headers.
 * Use environment variable API_KEYS (comma-separated) to configure valid keys.
 */
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config({ path: ".dev.vars" });

/** Extended request type with BHXH credentials */
export interface AuthenticatedRequest extends Request {
  apiKey?: string;
  bhxhUsername?: string;
  bhxhPassword?: string;
}

/** API key configuration */
interface ApiKeyConfig {
  /** List of valid API keys */
  keys: string[];
  /** Log API key usage for monitoring */
  logUsage: boolean;
  /** Paths to skip validation (public endpoints) */
  publicPaths: string[];
}

/** Default configuration */
const DEFAULT_CONFIG: ApiKeyConfig = {
  keys: parseApiKeys(process.env.API_KEYS || ""),
  logUsage: true,
  publicPaths: ["/", "/health", "/api/health", "/docs", "/swagger", "/swagger.json", "/openapi.json", "/openapi.yaml"],
};

/**
 * Parse API_KEYS from environment variable
 * @param keysStr - Comma-separated API keys string
 * @returns Array of API keys
 */
function parseApiKeys(keysStr: string): string[] {
  if (!keysStr.trim()) return [];
  return keysStr.split(",").map((k) => k.trim()).filter(Boolean);
}

/**
 * Create API key authentication middleware
 * @param config - Middleware configuration
 * @returns Express middleware function
 */
export function createApiKeyMiddleware(config: ApiKeyConfig = DEFAULT_CONFIG) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip public paths - exact match for "/", startsWith for others
    const isPublic = config.publicPaths.some((path) => {
      if (path === "/") {
        return req.path === "/";
      }
      return req.path.startsWith(path);
    });

    if (isPublic) {
      return next();
    }

    const apiKey = req.headers["x-api-key"] as string | undefined;

    // Check for API key header
    if (!apiKey) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Missing X-API-Key header",
      });
    }

    // Validate API key
    if (!config.keys.includes(apiKey)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Invalid API key",
      });
    }

    // Log API key usage (truncate key for security)
    if (config.logUsage) {
      const keyPreview = apiKey.length > 10 ? `${apiKey.substring(0, 10)}...` : apiKey;
      console.log(`[API_KEY] ${keyPreview} → ${req.method} ${req.path}`);
    }

    // Store API key and BHXH credentials in request for potential use
    const authReq = req as AuthenticatedRequest;
    authReq.apiKey = apiKey;
    authReq.bhxhUsername = (req.headers["x-username"] as string) || undefined;
    authReq.bhxhPassword = (req.headers["x-password"] as string) || undefined;
    next();
  };
}

/**
 * Get list of valid API keys
 * @returns Array of valid API keys
 */
export function getValidApiKeys(): string[] {
  return parseApiKeys(process.env.API_KEYS || "");
}

/**
 * Check if an API key is valid
 * @param apiKey - API key to validate
 * @returns True if key is valid
 */
export function isValidApiKey(apiKey: string): boolean {
  return getValidApiKeys().includes(apiKey);
}

export default { createApiKeyMiddleware, getValidApiKeys, isValidApiKey };
