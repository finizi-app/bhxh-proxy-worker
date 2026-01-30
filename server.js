/**
 * Node.js HTTP Server for Cloud Run deployment
 * Adapts the Cloudflare Worker to run as a standard Node.js server
 */

const http = require('http');

// In-memory session cache (will be replaced with proper storage)
const sessionCache = new Map();

const PORT = process.env.PORT || 8080;

// CORS headers
function getCorsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };
}

// Simple router implementation
async function handleRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const corsHeaders = getCorsHeaders();

    // Set CORS headers
    Object.keys(corsHeaders).forEach(key => {
        res.setHeader(key, corsHeaders[key]);
    });

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        // Parse body for POST requests
        let body = {};
        if (req.method === 'POST') {
            body = await parseBody(req);
        }

        // Route handling
        if (path === '/health') {
            res.writeHead(200);
            res.end(JSON.stringify({
                status: 'ok',
                service: 'bhxh-proxy-cloudrun',
                timestamp: new Date().toISOString()
            }));
            return;
        }

        if (path === '/') {
            res.writeHead(200);
            res.end(JSON.stringify({
                message: 'BHXH Proxy API on Cloud Run',
                endpoints: ['/health', '/employees', '/session/status'],
                usage: 'POST /employees with { username, password }',
                environment: process.env.NODE_ENV || 'development'
            }));
            return;
        }

        if (path === '/employees') {
            if (req.method !== 'POST') {
                res.writeHead(405);
                res.end(JSON.stringify({ error: 'Method not allowed. Use POST with { username, password }' }));
                return;
            }

            const { username, password, encryptionKey } = body;

            if (!username || !password) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Missing username or password in request body' }));
                return;
            }

            console.log(`Processing request for user: ${username}`);
            // Pass encryptionKey to handler
            const result = await handleEmployees(username, password, encryptionKey);
            res.writeHead(200);
            res.end(JSON.stringify(result));
            return;
        }

        if (path === '/session/status') {
            // For status, we might need username too, but for now just show generic info or 
            // we could require POST with username to check specific session.
            // Converting to POST to check specific session status
            if (req.method === 'POST') {
                const { username } = body;
                if (username) {
                    const session = sessionCache.get(username);
                    res.writeHead(200);
                    res.end(JSON.stringify({
                        username,
                        hasSession: !!session,
                        expiresAt: session?.expiresAt ?? null,
                        isExpired: session ? Date.now() > session.expiresAt : true
                    }));
                    return;
                }
            }

            // Public generic status
            res.writeHead(200);
            res.end(JSON.stringify({
                totalActiveSessions: sessionCache.size,
                message: "POST with { username } to check specific session"
            }));
            return;
        }

        // 404 for unknown routes
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found', path }));

    } catch (error) {
        console.error('Request error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({
            error: 'Internal server error',
            message: error.message
        }));
    }
}

// Helper to parse JSON body
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                if (!body) resolve({});
                else resolve(JSON.parse(body));
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

// Handle employees endpoint
async function handleEmployees(username, password, encryptionKey) {
    const sessionKey = username;

    // Get or create session
    let session = sessionCache.get(sessionKey);

    if (!session || Date.now() > session.expiresAt) {
        console.log(`Session expired or missing for ${username}, performing login...`);
        session = await performLogin(username, password, encryptionKey);
        sessionCache.set(sessionKey, session);
    } else {
        console.log(`Reusing existing session for ${username}`);
    }

    // Fetch employees using the session
    const employees = await fetchEmployees(session);
    return employees;
}

// Custom HTTPS Agent to handle legacy SSL/TLS issues
const https = require('https');
const sslAgent = new https.Agent({
    rejectUnauthorized: false, // Ignore self-signed/invalid certs
    keepAlive: true,
    minVersion: 'TLSv1',
    ciphers: 'DEFAULT@SECLEVEL=0' // Allow legacy ciphers
});

// Helper for fetch with agent
function fetchWithAgent(url, options = {}) {
    return fetch(url, {
        ...options,
        dispatcher: new (require('undici').Agent)({
            connect: {
                rejectUnauthorized: false,
                keepAlive: true,
                minVersion: 'TLSv1',
                ciphers: 'DEFAULT@SECLEVEL=0'
            }
        })
    });
}

// Perform login to BHXH
async function performLogin(username, password, encryptionKey) {
    const baseUrl = process.env.BHXH_BASE_URL || 'https://dichvucong.baohiemxahoi.gov.vn';
    // Use passed credentials or fallback to env
    const encKey = encryptionKey || process.env.BHXH_ENCRYPTION_KEY;
    const aiCaptchaEndpoint = process.env.AI_CAPTCHA_ENDPOINT || 'http://34.126.156.34:4000/api/v1/captcha/solve';

    if (!encKey) {
        throw new Error("Encryption Key is missing. Pass it in body or set BHXH_ENCRYPTION_KEY env var");
    }

    console.log(`1. Getting Client ID for ${username}...`);
    const clientIdResponse = await fetchWithAgent(`${baseUrl}/oauth2/GetClientId`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*'
        }
    });
    const clientId = await clientIdResponse.text();

    // Encrypt client ID
    const CryptoJS = require('crypto-js');
    const encrypted = CryptoJS.AES.encrypt(clientId, encKey).toString();
    const xClient = encrypted.replace(/\+/g, 'teca');

    console.log('2. Fetching captcha...');
    const captchaResponse = await fetchWithAgent(`${baseUrl}/api/getCaptchaImage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CLIENT': xClient,
            'is_public': 'true',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: JSON.stringify({ height: 60, width: 300 })
    });
    const captcha = await captchaResponse.json();

    console.log('3. Solving captcha via AI...');
    // AI service is HTTP/HTTPS, can use standard fetch or agent. Let's use agent for consistency if it's HTTPS
    const captchaSolution = await solveCaptcha(captcha.image, aiCaptchaEndpoint);
    console.log('   Captcha solved');

    console.log('4. Logging in...');
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', password);
    params.append('loaidoituong', '1');
    params.append('text', captchaSolution);
    params.append('code', captcha.code);
    params.append('clientId', clientId);

    const loginResponse = await fetchWithAgent(`${baseUrl}/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'not_auth_token': 'false',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: params.toString()
    });

    if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        throw new Error(`Login failed: ${loginResponse.status} - ${errorText}`);
    }

    const loginData = await loginResponse.json();

    // Parse don vi list
    let donViList = loginData.dsDonVi;
    if (typeof donViList === 'string') {
        donViList = JSON.parse(donViList);
    }
    const currentDonVi = Array.isArray(donViList) ? donViList[0] : donViList;

    console.log('5. Login successful! Selected unit:', currentDonVi.Ten || currentDonVi.TenDonVi);

    return {
        token: loginData.access_token,
        xClient,
        currentDonVi,
        expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour
    };
}

// Solve captcha using AI service
async function solveCaptcha(imageBase64, aiEndpoint) {
    const imageData = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:image/png;base64,${imageBase64}`;

    // AI endpoint is likely external, but we can use fetchWithAgent too or just fetch
    const response = await fetch(aiEndpoint, { // Keep generic fetch for AI service unless it needs proxy
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image_data: imageData,
            provider: 'gemini',
            timeout: 30
        })
    });

    if (response.ok) {
        const data = await response.json();
        return data.captcha_code;
    }

    // Handle 422 for 4-character captchas
    if (response.status === 422) {
        const errorData = await response.json();
        if (errorData?.detail?.detail) {
            const match = errorData.detail.detail.match(/input_value='([A-Z0-9a-z]+)'/);
            if (match && match[1]) {
                console.log('   Extracted 4-char captcha from validation error');
                return match[1];
            }
        }
    }

    throw new Error(`Captcha solving failed: ${response.status}`);
}

// Fetch employees from BHXH API
async function fetchEmployees(session) {
    const baseUrl = process.env.BHXH_BASE_URL || 'https://dichvucong.baohiemxahoi.gov.vn';

    const response = await fetchWithAgent(`${baseUrl}/CallApiWithCurrentUser`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`,
            'X-CLIENT': session.xClient,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: JSON.stringify({
            code: '067',
            data: JSON.stringify({
                maDonVi: session.currentDonVi.Ma,
                ngayBatDau: '',
                ngayKetThuc: ''
            })
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch employees: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
        success: true,
        data: data.dsLaoDong || [],
        meta: {
            total: data.TotalRecords || (data.dsLaoDong?.length ?? 0),
            count: data.dsLaoDong?.length ?? 0,
            unit: session.currentDonVi.Ten || session.currentDonVi.TenDonVi
        }
    };
}

// Create and start server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    console.log(`🚀 BHXH Proxy Server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
