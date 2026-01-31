/**
 * Session service for managing BHXH authentication state
 */
import dotenv from "dotenv";
import type { Request } from "express";
import CryptoJS from "crypto-js";
import { Session, DonVi, BhxhCredentials } from "../models/session.model";
import {
  getClientId,
  getCaptcha,
  solveCaptcha,
  login,
  encryptXClient,
} from "./bhxh.service";
import { createAxios } from "./proxy.service";
import type { AuthenticatedRequest } from "../middleware/api-key.middleware";

dotenv.config({ path: ".dev.vars" });

/** Configuration from environment */
const CONFIG = {
  baseUrl: process.env.BHXH_BASE_URL || "https://dichvucong.baohiemxahoi.gov.vn",
  encryptionKey: process.env.BHXH_ENCRYPTION_KEY || "S6|d'qc1GG,'rx&xn0XC",
  targetUnitCode: process.env.BHXH_TARGET_UNIT_CODE || "TZH490L",
  maxCaptchaRetries: 3,
  tokenTtlSeconds: 3600,
};

/** In-memory session cache per credentials */
const sessionCache = new Map<string, Session>();

/**
 * Get or refresh session token
 * @param req - Express Request object (optional, for header-based auth)
 * @param username - Optional BHXH username for per-request auth (legacy)
 * @param password - Optional BHXH password for per-request auth (legacy)
 * @returns Valid Session object
 */
export async function getValidSession(
  req?: Request,
  username?: string,
  password?: string
): Promise<Session> {
  // Extract credentials from headers (if request provided) or use parameters
  let extractedUsername: string | undefined;
  let extractedPassword: string | undefined;

  if (req) {
    const authReq = req as AuthenticatedRequest;
    extractedUsername = authReq.bhxhUsername;
    extractedPassword = authReq.bhxhPassword;
  }

  // Fall back to query/body parameters if not in headers
  const finalUsername = extractedUsername || username;
  const finalPassword = extractedPassword || password;

  // Create cache key from credentials
  const cacheKey = createCacheKey(finalUsername, finalPassword);

  // Check cache
  const cached = sessionCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    console.log(`Using cached session for ${cacheKey.substring(0, 10)}...`);
    return cached;
  }

  // Perform login
  return performLogin(finalUsername, finalPassword);
}

/**
 * Create cache key from credentials
 * @param username - BHXH username
 * @param password - BHXH password
 * @returns Cache key string
 */
function createCacheKey(username?: string, password?: string): string {
  if (username && password) {
    // Simple hash for cache key (in production, use crypto)
    return `${username}:${password.substring(0, 3)}***`;
  }
  return "default";
}

/**
 * Get current session status without triggering refresh
 * @param username - Optional BHXH username
 * @param password - Optional BHXH password
 * @returns Session status object
 */
export async function getSessionStatus(
  username?: string,
  password?: string
): Promise<{
  status: "active" | "expired";
  expiresIn: number;
  unit?: string;
}> {
  const cacheKey = createCacheKey(username, password);
  const cached = sessionCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    const expiresIn = Math.floor((cached.expiresAt - Date.now()) / 1000);
    return {
      status: "active",
      expiresIn,
      unit: cached.currentDonVi.Ten || "Unknown",
    };
  }
  return { status: "expired", expiresIn: 0 };
}

/**
 * Force clear cached session
 * @param username - Optional BHXH username to clear specific session
 * @param password - Optional BHXH password to clear specific session
 */
export function clearSession(username?: string, password?: string): void {
  const cacheKey = createCacheKey(username, password);
  sessionCache.delete(cacheKey);
}

/**
 * Clear all cached sessions
 */
export function clearAllSessions(): void {
  sessionCache.clear();
}

/**
 * Get cached session if available
 * @param username - Optional BHXH username
 * @param password - Optional BHXH password
 * @returns Cached session or null
 */
export function getCachedSession(username?: string, password?: string): Session | null {
  const cacheKey = createCacheKey(username, password);
  return sessionCache.get(cacheKey) || null;
}

/**
 * Parse dsDonVi from login response and select target unit
 * @param dsDonViRaw - Raw unit data from API
 * @returns Selected DonVi object
 */
function parseAndSelectUnit(dsDonViRaw: unknown): DonVi {
  const donViList: DonVi[] =
    typeof dsDonViRaw === "string" ? JSON.parse(dsDonViRaw) : (dsDonViRaw as DonVi[]);

  // Try to find target unit, otherwise use first unit
  const targetUnit =
    donViList.find(
      (u) => u.Ma === CONFIG.targetUnitCode || u.MaSoBHXH === CONFIG.targetUnitCode
    ) || donViList[0];

  return targetUnit;
}

/**
 * Perform full login flow with CAPTCHA solving and retry
 * @param username - Optional BHXH username for per-request auth
 * @param password - Optional BHXH password for per-request auth
 * @returns Session object with token and unit info
 */
export async function performLogin(
  username?: string,
  password?: string
): Promise<Session> {
  const t0 = Date.now();
  let tClientId = 0,
    tCaptcha = 0,
    tSolve = 0,
    tLogin = 0;

  // Use provided credentials or fallback to config
  const bhxhUsername = username || process.env.BHXH_USERNAME || "";
  const bhxhPassword = password || process.env.BHXH_PASSWORD || "";

  if (!bhxhUsername || !bhxhPassword) {
    throw new Error("BHXH credentials not provided. Please include username and password in request, or configure default credentials.");
  }

  console.log(`1. Fetching Client ID (user: ${bhxhUsername})...`);
  const t1 = Date.now();
  const clientId = await getClientId();
  tClientId = Date.now() - t1;
  console.log(`   Client ID: ${clientId.substring(0, 15)}... [${tClientId}ms]`);

  const xClient = encryptXClient(clientId);
  console.log("   X-CLIENT encrypted");

  let captchaSolution: string | null = null;
  let captchaToken: string | null = null;
  let attempt = 0;

  while (!captchaSolution && attempt < CONFIG.maxCaptchaRetries) {
    attempt++;
    console.log(`\n2. Fetching Captcha (Attempt ${attempt}/${CONFIG.maxCaptchaRetries})...`);
    const tCaptchaStart = Date.now();

    const captcha = await getCaptcha(xClient);
    captchaToken = captcha.code;
    const tCaptchaFetch = Date.now() - tCaptchaStart;
    tCaptcha += tCaptchaFetch;
    console.log(`   Captcha token: ${captchaToken.substring(0, 20)}... [${tCaptchaFetch}ms]`);

    console.log("3. Solving Captcha via AI...");
    const tSolveStart = Date.now();
    try {
      captchaSolution = await solveCaptcha(captcha.image);
      tSolve += Date.now() - tSolveStart;
      console.log(`   Captcha solved: ${captchaSolution} [${Date.now() - tSolveStart}ms]`);
    } catch (solveError) {
      const errorMessage = solveError instanceof Error ? solveError.message : String(solveError);
      console.log(`   Captcha solving failed: ${errorMessage}`);
      if (attempt < CONFIG.maxCaptchaRetries) {
        console.log("   Retrying with a new captcha...");
      }
    }
  }

  if (!captchaSolution || !captchaToken) {
    throw new Error("Failed to solve captcha after all retries");
  }

  console.log("4. Logging in...");
  const tLoginStart = Date.now();
  const { access_token, dsDonVi } = await login(
    captchaSolution,
    captchaToken,
    clientId,
    bhxhUsername,
    bhxhPassword
  );
  tLogin = Date.now() - tLoginStart;
  console.log(`   Login successful! [${tLogin}ms]`);

  const targetUnit = parseAndSelectUnit(dsDonVi);

  const session: Session = {
    token: access_token,
    xClient,
    currentDonVi: targetUnit,
    expiresAt: Date.now() + CONFIG.tokenTtlSeconds * 1000,
  };

  console.log(`   Unit: ${targetUnit.Ten || targetUnit.TenDonVi}`);
  console.log(
    `[LOGIN TIMING] Total: ${Date.now() - t0}ms (clientId: ${tClientId}ms, captcha: ${tCaptcha}ms, solve: ${tSolve}ms, login: ${tLogin}ms)`
  );

  // Cache the session
  const cacheKey = createCacheKey(username, password);
  sessionCache.set(cacheKey, session);

  return session;
}

/**
 * Refresh session by clearing cache and performing new login
 * @param username - Optional BHXH username
 * @param password - Optional BHXH password
 * @returns Fresh Session object
 */
export async function refreshSession(
  username?: string,
  password?: string
): Promise<Session> {
  const cacheKey = createCacheKey(username, password);
  sessionCache.delete(cacheKey);
  return performLogin(username, password);
}

export default {
  getValidSession,
  getSessionStatus,
  clearSession,
  clearAllSessions,
  getCachedSession,
  performLogin,
  refreshSession,
};
