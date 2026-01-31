/**
 * Authentication & Session Management
 * Implements the autonomous login flow with KV caching
 */
import { BHXHClient, DonVi, Session } from "./bhxh-client";
import { encryptXClient } from "./crypto";

const TOKEN_TTL_SECONDS = 3600; // 1 hour

// Single-flight pattern: prevent concurrent logins during cache miss
let loginPromise: Promise<Session> | null = null;

export interface Env {
    BHXH_SESSION: KVNamespace;
    BHXH_BASE_URL: string;
    ALLOWED_ORIGINS?: string;
    BHXH_USERNAME: string;
    BHXH_PASSWORD: string;
    BHXH_ENCRYPTION_KEY: string;
    AI_CAPTCHA_ENDPOINT: string;
    EXTERNAL_PROXY_URL?: string;
    EXTERNAL_PROXY_USERNAME?: string;
    EXTERNAL_PROXY_PASSWORD?: string;
    USE_PROXY?: string;
    AI_CAPTCHA_API_KEY?: string;
}

/**
 * Get or refresh session from KV cache
 */
export async function getSession(env: Env): Promise<Session | null> {
    // Null check for KV namespace
    if (!env.BHXH_SESSION) {
        console.warn("KV namespace not configured, cannot get session");
        return null;
    }

    // Check KV cache first
    const cachedSession = await env.BHXH_SESSION.get<Session>("session", "json");

    if (cachedSession && cachedSession.expiresAt > Date.now()) {
        console.log("Using cached session, expires at:", new Date(cachedSession.expiresAt));
        return cachedSession;
    }

    console.log("Session expired or missing, need to refresh");
    return null;
}

/**
 * Save session to KV cache
 */
export async function saveSession(env: Env, session: Session): Promise<void> {
    // Null check for KV namespace
    if (!env.BHXH_SESSION) {
        console.warn("KV namespace not configured, session not cached");
        return;
    }
    await env.BHXH_SESSION.put("session", JSON.stringify(session), {
        expirationTtl: TOKEN_TTL_SECONDS,
    });
    console.log("Session saved to KV, expires in", TOKEN_TTL_SECONDS, "seconds");
}

/**
 * Solve CAPTCHA using Finizi AI Core API
 * Supports both Gemini and OpenAI providers
 * Includes workaround for 4-character captchas (BHXH uses 4-char but API requires 5+)
 */
async function solveCaptcha(
    imageBase64: string,
    aiEndpoint?: string,
    apiKey?: string,
    provider: "gemini" | "openai" = "gemini",
    timeout: number = 30
): Promise<string> {
    if (!aiEndpoint) {
        console.warn("No AI_CAPTCHA_ENDPOINT configured, captcha solving unavailable");
        throw new Error("Captcha solving not configured");
    }

    // Add data URI prefix if not present
    const imageData = imageBase64.startsWith("data:")
        ? imageBase64
        : `data:image/png;base64,${imageBase64}`;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
    }

    try {
        // Call Finizi AI Core captcha solving API
        const response = await fetch(aiEndpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({
                image_data: imageData,
                provider: provider,
                timeout: timeout,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null) as any;

            // Handle 422 validation error - extract 4-character captcha code
            // The API correctly solves 4-char captchas but rejects them due to 5-char minimum validation
            if (response.status === 422 && errorData?.detail?.detail) {
                const detailStr = errorData.detail.detail;
                const match = detailStr.match(/input_value='([A-Z0-9a-z]+)'/);
                if (match && match[1]) {
                    console.log("Extracted 4-char captcha from validation error:", match[1]);
                    return match[1];
                }
            }

            throw new Error(`AI Captcha solver failed: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const result = await response.json() as {
            success: boolean;
            captcha_code: string;
            provider: string;
            length: number;
        };

        if (result.success && result.captcha_code) {
            console.log(`Captcha solved by ${result.provider}: ${result.captcha_code.length} characters`);
            return result.captcha_code;
        } else {
            throw new Error("Invalid response from captcha solver");
        }
    } catch (error) {
        console.error("Captcha solving error:", error);
        throw error;
    }
}

/**
 * Perform full login flow
 */
export async function performLogin(env: Env): Promise<Session> {
    const useProxy = env.USE_PROXY === "true";
    const proxyUrl = useProxy ? env.EXTERNAL_PROXY_URL : undefined;
    const proxyAuth = useProxy && env.EXTERNAL_PROXY_USERNAME && env.EXTERNAL_PROXY_PASSWORD
        ? { username: env.EXTERNAL_PROXY_USERNAME, password: env.EXTERNAL_PROXY_PASSWORD }
        : undefined;

    // Log proxy usage for debugging
    console.log(`Login init: Proxy enabled=${useProxy}, URL=${proxyUrl || 'none'}`);

    const client = new BHXHClient(env.BHXH_BASE_URL, proxyUrl, proxyAuth);
    const username = env.BHXH_USERNAME;
    const password = env.BHXH_PASSWORD;

    console.log("1. Fetching Client ID...");
    const clientId = await client.getClientId();
    console.log("   Client ID obtained:", clientId.substring(0, 10) + "...");

    const xClient = encryptXClient(clientId, env.BHXH_ENCRYPTION_KEY);
    console.log("   X-CLIENT encrypted");

    console.log("2. Fetching Captcha...");
    const captcha = await client.getCaptcha(xClient);
    console.log("   Captcha token:", captcha.code);

    console.log("3. Solving Captcha via AI...");
    const captchaSolution = await solveCaptcha(captcha.image, env.AI_CAPTCHA_ENDPOINT, env.AI_CAPTCHA_API_KEY);
    console.log("   Captcha solved");

    console.log("4. Logging in...");
    const loginResponse = await client.login(
        env.BHXH_USERNAME,
        env.BHXH_PASSWORD,
        captchaSolution,
        captcha.code,
        clientId
    );
    console.log("   Login successful!");

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
        throw new Error("No unit found in login response");
    }

    // Parse expires_in from login response and calculate actual TTL
    const expiresIn = loginResponse.expires_in || 3600;
    const actualTtl = Math.min(expiresIn, TOKEN_TTL_SECONDS);

    const session: Session = {
        token: loginResponse.access_token,
        xClient,
        currentDonVi: targetUnit,
        expiresAt: Date.now() + (actualTtl * 1000),
    };

    // Cache the session
    await saveSession(env, session);

    return session;
}

/**
 * Get valid session (from cache or fresh login)
 */
export async function getValidSession(env: Env): Promise<Session> {
    const cached = await getSession(env);
    if (cached) return cached;

    // Single-flight: return existing promise if login in progress
    if (loginPromise) return loginPromise;

    loginPromise = performLogin(env);
    try {
        return await loginPromise;
    } finally {
        loginPromise = null;
    }
}
