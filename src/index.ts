// Polyfill for WeakRef if missing (fix for undici in some worker envs)
if (typeof WeakRef === 'undefined') {
    (globalThis as any).WeakRef = class WeakRef<T extends object> {
        private target: T;
        constructor(target: T) { this.target = target; }
        deref(): T | undefined { return this.target; }
    };
}

import { BHXHClient } from "./bhxh-client";

import type { Session, DonVi } from "./bhxh-types";
import { Env, getValidSession, saveSession } from "./auth";
import { encryptXClient } from "./crypto";
import { ProxyManager } from "./proxy-manager";
import type { ProxyCredentials } from "./bhxh-http-utils";

// Rate limiting
const requestCounts = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 100;

function checkRateLimit(key: string): boolean {
    const now = Date.now();
    const count = requestCounts.get(key) || 0;
    if (count >= RATE_LIMIT_MAX) return false;
    requestCounts.set(key, count + 1);
    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
        for (const [k, v] of requestCounts) {
            if (now - v > RATE_LIMIT_WINDOW) requestCounts.delete(k);
        }
    }
    return true;
}

/**
 * Get proxy configuration from environment
 */
function getProxyConfig(env: Env): { url?: string; auth?: ProxyCredentials } {
    const useProxy = env.USE_PROXY === "true";
    if (!useProxy || !env.EXTERNAL_PROXY_URL) {
        return {};
    }
    const auth = env.EXTERNAL_PROXY_USERNAME && env.EXTERNAL_PROXY_PASSWORD
        ? { username: env.EXTERNAL_PROXY_USERNAME, password: env.EXTERNAL_PROXY_PASSWORD }
        : undefined;
    return { url: env.EXTERNAL_PROXY_URL, auth };
}

/**
 * Create BHXHClient with proxy support
 */
function createClient(env: Env): BHXHClient {
    const { url, auth } = getProxyConfig(env);
    return new BHXHClient(env.BHXH_BASE_URL, url, auth);
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS headers
        const corsHeaders = {
            "Access-Control-Allow-Origin": env.ALLOWED_ORIGINS || "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        // Rate limit check
        const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
        if (!checkRateLimit(clientIp)) {
            return Response.json({ error: "Rate limit exceeded" }, { status: 429, headers: corsHeaders });
        }

        // Handle preflight
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // Route handling
            switch (path) {
                case "/":
                case "/api/v1/health":
                    return Response.json(
                        {
                            status: "ok",
                            service: "bhxh-proxy-worker",
                            version: "v1",
                            timestamp: new Date().toISOString(),
                        },
                        { headers: corsHeaders }
                    );

                case "/api/v1/employees":
                    return await handleEmployees(env, corsHeaders);

                case "/api/v1/session/status":
                    return await handleSessionStatus(env, corsHeaders);

                case "/api/v1/session/refresh":
                    return await handleSessionRefresh(env, corsHeaders);

                case "/api/v1/login/captcha":
                    return await handleLoginCaptcha(env, corsHeaders);

                case "/api/v1/login/token":
                    return await handleLoginToken(request, env, corsHeaders);

                // Lookup Endpoints
                case "/api/v1/lookup/paper-types":
                    return await handleLookup(env, corsHeaders, "071");
                case "/api/v1/lookup/countries":
                    return await handleLookup(env, corsHeaders, "072");
                case "/api/v1/lookup/ethnicities":
                    return await handleLookup(env, corsHeaders, "073");
                case "/api/v1/lookup/labor-plan-types":
                    return await handleLookup(env, corsHeaders, "086");
                case "/api/v1/lookup/benefits":
                    return await handleLookup(env, corsHeaders, "098");
                case "/api/v1/lookup/relationships":
                    return await handleLookup(env, corsHeaders, "099");
                case "/api/v1/lookup/document-list":
                    return await handleLookup(env, corsHeaders, "028");

                // Proxy Endpoint
                case "/api/v1/proxy/current":
                    return await handleGetProxy(env, corsHeaders);

                // Debug Proxy Check Endpoint
                case "/api/v1/proxy/check":
                    return await handleCheckProxy(request, env, corsHeaders);

                default:
                    return Response.json(
                        { error: "Not found", path },
                        { status: 404, headers: corsHeaders }
                    );
            }
        } catch (error) {
            console.error("Worker error:", error);
            const message = error instanceof Error ? error.message : "Unknown error";
            return Response.json(
                { error: "Internal server error", message },
                { status: 500, headers: corsHeaders }
            );
        }
    },
} satisfies ExportedHandler<Env>;

/**
 * Handle /api/v1/employees endpoint
 */
async function handleEmployees(
    env: Env,
    corsHeaders: Record<string, string>
): Promise<Response> {
    console.log("Fetching employees...");

    // Get or create session
    const session = await getValidSession(env);
    console.log("Session obtained, unit:", session.currentDonVi.Ten || session.currentDonVi.TenDonVi);

    // Fetch employees
    const client = createClient(env);
    const result = await client.fetchEmployees(session);

    console.log(`Fetched ${result.dsLaoDong.length} employees, total: ${result.TotalRecords}`);

    return Response.json(
        {
            success: true,
            data: result.dsLaoDong,
            meta: {
                total: result.TotalRecords,
                count: result.dsLaoDong.length,
                unit: session.currentDonVi.Ten || session.currentDonVi.TenDonVi,
            },
        },
        { headers: corsHeaders }
    );
}

/**
 * Handle /api/v1/session/status endpoint
 */
async function handleSessionStatus(
    env: Env,
    corsHeaders: Record<string, string>
): Promise<Response> {
    const cached = await env.BHXH_SESSION.get<{ expiresAt: number; currentDonVi: { Ten?: string } }>("session", "json");

    if (cached) {
        const expiresIn = Math.floor((cached.expiresAt - Date.now()) / 1000);
        return Response.json(
            {
                status: "active",
                expiresIn: expiresIn > 0 ? expiresIn : 0,
                unit: cached.currentDonVi?.Ten || "Unknown",
            },
            { headers: corsHeaders }
        );
    }

    return Response.json(
        { status: "expired", expiresIn: 0 },
        { headers: corsHeaders }
    );
}

/**
 * Handle /api/v1/session/refresh endpoint
 */
async function handleSessionRefresh(
    env: Env,
    corsHeaders: Record<string, string>
): Promise<Response> {
    // Force refresh by deleting cache first
    await env.BHXH_SESSION.delete("session");

    // This will trigger a new login
    const session = await getValidSession(env);

    return Response.json(
        {
            success: true,
            message: "Session refreshed",
            unit: session.currentDonVi.Ten || session.currentDonVi.TenDonVi,
            expiresIn: 3600,
        },
        { headers: corsHeaders }
    );
}

const TOKEN_TTL_SECONDS = 3600;

/**
 * Handle /api/v1/login/captcha - Get captcha image for manual login
 * Returns: clientId, xClient, captchaToken, captchaImage (base64)
 */
async function handleLoginCaptcha(
    env: Env,
    corsHeaders: Record<string, string>
): Promise<Response> {
    console.log("Getting captcha for manual login...");
    const client = createClient(env);

    // Step 1: Get client ID
    const clientId = await client.getClientId();
    console.log("Client ID obtained:", clientId.substring(0, 10) + "...");

    // Step 2: Encrypt X-CLIENT
    const xClient = encryptXClient(clientId, env.BHXH_ENCRYPTION_KEY);

    // Step 3: Get captcha
    const captcha = await client.getCaptcha(xClient);
    console.log("Captcha obtained, token:", captcha.code);

    return Response.json(
        {
            success: true,
            clientId,
            xClient,
            captchaToken: captcha.code,
            captchaImage: captcha.image, // Base64 PNG
            message: "Solve the captcha and POST to /login/token",
        },
        { headers: corsHeaders }
    );
}

interface LoginTokenRequest {
    clientId: string;
    xClient: string;
    captchaToken: string;
    captchaSolution: string;
}

/**
 * Handle /api/v1/login/token - Exchange captcha solution for auth token
 * Expects POST body: { clientId, xClient, captchaToken, captchaSolution }
 */
async function handleLoginToken(
    request: Request,
    env: Env,
    corsHeaders: Record<string, string>
): Promise<Response> {
    if (request.method !== "POST") {
        return Response.json(
            { error: "Method not allowed. Use POST." },
            { status: 405, headers: corsHeaders }
        );
    }

    const body = await request.json() as LoginTokenRequest;
    const { clientId, xClient, captchaToken, captchaSolution } = body;

    if (!clientId || !xClient || !captchaToken || !captchaSolution) {
        return Response.json(
            { error: "Missing required fields: clientId, xClient, captchaToken, captchaSolution" },
            { status: 400, headers: corsHeaders }
        );
    }

    console.log("Attempting login with captcha solution...");
    const client = createClient(env);

    // Perform login
    const loginResponse = await client.login(
        env.BHXH_USERNAME,
        env.BHXH_PASSWORD,
        captchaSolution,
        captchaToken,
        clientId
    );
    console.log("Login successful!");

    // Parse dsDonVi
    let dsDonVi: DonVi[] = [];
    if (typeof loginResponse.dsDonVi === "string") {
        dsDonVi = JSON.parse(loginResponse.dsDonVi);
    } else {
        dsDonVi = loginResponse.dsDonVi;
    }

    // Find target unit or use first
    const targetUnit = dsDonVi.find(
        (u) => u.Ma === "TZH490L" || u.MaSoBHXH === "TZH490L" || u.MaDonVi === "TZH490L"
    ) || dsDonVi[0];

    if (!targetUnit) {
        return Response.json(
            { error: "No unit found in login response" },
            { status: 500, headers: corsHeaders }
        );
    }

    // Create session
    const session: Session = {
        token: loginResponse.access_token,
        xClient,
        currentDonVi: targetUnit,
        expiresAt: Date.now() + (TOKEN_TTL_SECONDS * 1000),
    };

    // Cache the session
    await saveSession(env, session);

    return Response.json(
        {
            success: true,
            token: session.token,
            currentUnit: {
                code: targetUnit.Ma,
                name: targetUnit.Ten || targetUnit.TenDonVi,
                maCoquan: targetUnit.MaCoquan,
            },
            availableUnits: dsDonVi.map((u) => ({
                code: u.Ma,
                name: u.Ten || u.TenDonVi,
                maCoquan: u.MaCoquan,
                maSoBHXH: u.MaSoBHXH,
            })),
            expiresIn: TOKEN_TTL_SECONDS,
            message: "Session cached. You can now call /api/v1/employees",
        },
        { headers: corsHeaders }
    );
}

/**
 * Handle /api/v1/lookup/* endpoints
 */
async function handleLookup(
    env: Env,
    corsHeaders: Record<string, string>,
    code: string
): Promise<Response> {
    try {
        const session = await getValidSession(env);
        const client = createClient(env);
        const data = await client.fetchLookupData(session, code);
        return Response.json({ success: true, data }, { headers: corsHeaders });
    } catch (error) {
        console.error(`Lookup failed for code ${code}:`, error);
        const message = error instanceof Error ? error.message : "Unknown error";

        // Return 401 if authentication/captcha failed
        const status = (message.includes("Captcha solving not configured") || message.includes("Login failed"))
            ? 401
            : 500;

        return Response.json(
            { error: "Lookup failed", message },
            { status, headers: corsHeaders }
        );
    }
}

/**
 * Handle /api/v1/proxy/current
 * Returns a working proxy URL
 */
async function handleGetProxy(
    env: Env,
    corsHeaders: Record<string, string>
): Promise<Response> {
    try {
        const proxy = await ProxyManager.getWorkingProxy(env);
        if (proxy) {
            return Response.json(
                { success: true, proxy },
                { headers: corsHeaders }
            );
        } else {
            return Response.json(
                { success: false, error: "No working proxy found" },
                { status: 503, headers: corsHeaders }
            );
        }
    } catch (error) {
        console.error("Proxy fetch error:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

/**
 * Handle /api/v1/proxy/check?url=...
 * Checks a specific proxy and returns detailed result
 */
async function handleCheckProxy(
    request: Request,
    env: Env,
    corsHeaders: Record<string, string>
): Promise<Response> {
    const url = new URL(request.url);
    const proxyUrl = url.searchParams.get("url");

    if (!proxyUrl) {
        return Response.json(
            { error: "Missing url parameter" },
            { status: 400, headers: corsHeaders }
        );
    }

    const result = await ProxyManager.checkProxyDetailed(proxyUrl);

    return Response.json(
        {
            proxy: proxyUrl,
            ...result
        },
        { headers: corsHeaders }
    );
}

