/**
 * Local BHXH API Server
 * Run locally without Cloudflare Workers dependencies
 */
import express from "express";
import axios from "axios";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";
dotenv.config({ path: ".dev.vars" });

const app = express();
app.use(express.json());
app.use(profileRequest);

// Profiling middleware
function profileRequest(req, res, next) {
    req.startTime = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - req.startTime;
        console.log(`[PROFILE] ${req.method} ${req.path} - ${duration}ms`);
    });
    next();
}

// Configuration
const BASE_URL = process.env.BHXH_BASE_URL || "https://dichvucong.baohiemxahoi.gov.vn";
const ENCRYPTION_KEY = process.env.BHXH_ENCRYPTION_KEY || "S6|d'qc1GG,'rx&xn0XC";
const AI_ENDPOINT = process.env.AI_CAPTCHA_ENDPOINT || "http://34.126.156.34:4000/api/v1/captcha/solve";
const API_KEY = process.env.AI_CAPTCHA_API_KEY;

// In-memory session cache
let cachedSession = null;
const TOKEN_TTL_SECONDS = 3600;
const MAX_CAPTCHA_RETRIES = 3;

// Encrypt X-CLIENT header
function encryptXClient(clientId) {
    const payload = JSON.stringify(clientId);
    const encrypted = CryptoJS.AES.encrypt(payload, ENCRYPTION_KEY).toString();
    return encrypted.replace(/\+/g, "teca");
}

// Solve CAPTCHA using AI service
async function solveCaptcha(imageBase64) {
    const imageData = imageBase64.startsWith("data:") ? imageBase64 : `data:image/png;base64,${imageBase64}`;

    let response;
    try {
        response = await axios.post(AI_ENDPOINT, {
            image_data: imageData,
            provider: "gemini",
            timeout: 30,
        }, {
            headers: {
                "Content-Type": "application/json",
                ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
            },
        });
    } catch (error) {
        // Handle 422 validation error - extract 4-character captcha code
        if (error.response?.status === 422 && error.response?.data?.detail?.detail) {
            const detailStr = error.response.data.detail.detail;
            const match = detailStr.match(/input_value='([A-Z0-9a-z]+)'/);
            if (match && match[1]) {
                console.log("Extracted 4-char captcha from validation error:", match[1]);
                return match[1];
            }
        }
        throw error;
    }

    if (response.data.success && response.data.captcha_code) {
        return response.data.captcha_code;
    }

    throw new Error("Failed to solve CAPTCHA");
}

// Perform login flow with CAPTCHA retry
async function performLogin() {
    const t0 = Date.now();
    let tClientId = 0, tCaptcha = 0, tSolve = 0, tLogin = 0;

    console.log("1. Fetching Client ID...");
    const t1 = Date.now();
    const clientIdResp = await axios.get(`${BASE_URL}/oauth2/GetClientId`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
        },
    });
    const clientId = clientIdResp.data;
    tClientId = Date.now() - t1;
    console.log("   Client ID:", clientId.substring(0, 15) + "..." + ` [${tClientId}ms]`);

    const xClient = encryptXClient(clientId);
    console.log("   X-CLIENT encrypted");

    let captchaSolution = null;
    let captchaToken = null;
    let attempt = 0;

    while (!captchaSolution && attempt < MAX_CAPTCHA_RETRIES) {
        attempt++;
        console.log(`\n2. Fetching Captcha (Attempt ${attempt}/${MAX_CAPTCHA_RETRIES})...`);
        const tCaptchaStart = Date.now();

        const captchaResp = await axios.post(`${BASE_URL}/api/getCaptchaImage`, {
            height: 60,
            width: 300,
        }, {
            headers: {
                "Content-Type": "application/json",
                "X-CLIENT": xClient,
                "is_public": "true",
            },
        });
        const captcha = captchaResp.data;
        captchaToken = captcha.code;
        const tCaptchaFetch = Date.now() - tCaptchaStart;
        tCaptcha += tCaptchaFetch;
        console.log("   Captcha token:", captchaToken.substring(0, 20) + "..." + ` [${tCaptchaFetch}ms]`);

        console.log("3. Solving Captcha via AI...");
        const tSolveStart = Date.now();
        try {
            captchaSolution = await solveCaptcha(captcha.image);
            tSolve += Date.now() - tSolveStart;
            console.log("   Captcha solved:", captchaSolution + ` [${Date.now() - tSolveStart}ms]`);
        } catch (solveError) {
            console.log(`   Captcha solving failed: ${solveError.message}`);
            if (attempt < MAX_CAPTCHA_RETRIES) {
                console.log("   Retrying with a new captcha...");
            }
        }
    }

    if (!captchaSolution) {
        throw new Error("Failed to solve captcha after all retries");
    }

    console.log("4. Logging in...");
    const tLoginStart = Date.now();
    const loginResp = await axios.post(`${BASE_URL}/token`, new URLSearchParams({
        grant_type: "password",
        username: process.env.BHXH_USERNAME || "",
        password: process.env.BHXH_PASSWORD || "",
        loaidoituong: "1",
        text: captchaSolution,
        code: captchaToken,
        clientId: clientId,
    }), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "not_auth_token": "false",
        },
    });

    const { access_token, dsDonVi } = loginResp.data;
    tLogin = Date.now() - tLoginStart;
    console.log("   Login successful!" + ` [${tLogin}ms]`);

    // Parse dsDonVi
    let donViList = typeof dsDonVi === "string" ? JSON.parse(dsDonVi) : dsDonVi;
    const targetUnit = donViList.find(
        (u) => u.Ma === "TZH490L" || u.MaSoBHXH === "TZH490L"
    ) || donViList[0];

    cachedSession = {
        token: access_token,
        xClient,
        currentDonVi: targetUnit,
        expiresAt: Date.now() + TOKEN_TTL_SECONDS * 1000,
    };

    console.log("   Unit:", targetUnit?.Ten || targetUnit?.TenDonVi);
    console.log(`[LOGIN TIMING] Total: ${Date.now() - t0}ms (clientId: ${tClientId}ms, captcha: ${tCaptcha}ms, solve: ${tSolve}ms, login: ${tLogin}ms)`);
    return cachedSession;
}

// Get valid session (cached or fresh)
async function getValidSession() {
    if (cachedSession && cachedSession.expiresAt > Date.now()) {
        console.log("Using cached session");
        return cachedSession;
    }
    return performLogin();
}

// API Endpoints
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "bhxh-proxy-local" });
});

app.get("/api/v1/session/status", (req, res) => {
    if (cachedSession && cachedSession.expiresAt > Date.now()) {
        const expiresIn = Math.floor((cachedSession.expiresAt - Date.now()) / 1000);
        return res.json({
            status: "active",
            expiresIn,
            unit: cachedSession.currentDonVi?.Ten || "Unknown",
        });
    }
    res.json({ status: "expired", expiresIn: 0 });
});

app.post("/api/v1/session/refresh", async (req, res) => {
    try {
        cachedSession = null;
        const session = await getValidSession();
        res.json({
            success: true,
            message: "Session refreshed",
            unit: session.currentDonVi.Ten || session.currentDonVi.TenDonVi,
            expiresIn: TOKEN_TTL_SECONDS,
        });
    } catch (error) {
        console.error("Refresh error:", error.message);
        console.error("Error details:", error.response?.data || error.stack);
        res.status(500).json({
            error: "Refresh failed",
            message: error.message,
            details: error.response?.data
        });
    }
});

app.get("/api/v1/employees", async (req, res) => {
    const t0 = Date.now();
    let tSession = 0, tFetch = 0, tTotal = 0;

    try {
        const t1 = Date.now();
        const session = await getValidSession();
        tSession = Date.now() - t1;

        console.log(`[TIMING] Session check: ${tSession}ms (cached: ${cachedSession && cachedSession.expiresAt > Date.now()})`);

        const t2 = Date.now();
        console.log("Fetching employees for unit:", session.currentDonVi.Ma);

        const payload = {
            maNguoiLaoDong: "",
            ten: "",
            maPhongBan: "",
            maTinhTrang: "",
            MaSoBhxh: "",
            maDonVi: session.currentDonVi.Ma,
            maCoquan: session.currentDonVi.MaCoquan,
            PageIndex: 1,
            PageSize: 100,
            masobhxhuser: session.currentDonVi.Ma,
            macoquanuser: session.currentDonVi.MaCoquan,
            loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
        };

        const response = await axios.post(`${BASE_URL}/CallApiWithCurrentUser`, {
            code: "067",
            data: JSON.stringify(payload),
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.token}`,
                "X-CLIENT": session.xClient,
            },
        });

        tFetch = Date.now() - t2;
        console.log(`[TIMING] API fetch: ${tFetch}ms`);

        const data = response.data;
        tTotal = Date.now() - t0;
        console.log(`[TIMING] TOTAL: ${tTotal}ms (session: ${tSession}ms, fetch: ${tFetch}ms)`);

        res.json({
            success: true,
            timing: { sessionMs: tSession, fetchMs: tFetch, totalMs: tTotal },
            data: data.dsLaoDong || [],
            meta: {
                total: data.TotalRecords || 0,
                count: (data.dsLaoDong || []).length,
                unit: session.currentDonVi.Ten || session.currentDonVi.TenDonVi,
            },
        });
    } catch (error) {
        console.error("Employees error:", error.message);
        console.error("Error details:", error.response?.data || error.stack);
        res.status(500).json({
            error: "Failed to fetch employees",
            message: error.message,
            details: error.response?.data
        });
    }
});

// Lookup endpoints
app.get("/api/v1/lookup/:code", async (req, res) => {
    try {
        const session = await getValidSession();
        const code = req.params.code;

        const payload = {
            masobhxhuser: session.currentDonVi.Ma,
            macoquanuser: session.currentDonVi.MaCoquan,
            loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
        };

        const response = await axios.post(`${BASE_URL}/CallApiWithCurrentUser`, {
            code,
            data: JSON.stringify(payload),
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.token}`,
                "X-CLIENT": session.xClient,
            },
        });

        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error("Lookup error:", error.message);
        res.status(500).json({ error: "Lookup failed", message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`BHXH Local API Server running on http://localhost:${PORT}`);
    console.log(`BASE_URL: ${BASE_URL}`);
    console.log(`Use /api/v1/employees to fetch employees`);
});
