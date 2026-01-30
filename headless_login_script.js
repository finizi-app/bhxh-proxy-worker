
const axios = require('axios');
const CryptoJS = require('crypto-js');

// Config
const BASE_URL = 'https://dichvucong.baohiemxahoi.gov.vn';
const CAPTCHA_API_URL = 'http://34.126.156.34:4000/api/v1/captcha/solve';
const ENCRYPTION_KEY = "S6|d'qc1GG,'rx&xn0XC";

// Credentials
const USERNAME = '0317530616';
const PASSWORD = 'S72T#@oV'; // Note: Password provided in prompt
const TYPE_ORG = 1; // 1 = Organization

// Helper: Encryption
function encryptXClient(clientId) {
    const payload = JSON.stringify(clientId);
    const encrypted = CryptoJS.AES.encrypt(payload, ENCRYPTION_KEY).toString();
    return encrypted.replace(/\+/g, "teca");
}

/**
 * Solve captcha using the external AI captcha solving service
 * @param {string} imageBase64 - Base64 encoded captcha image (without data URI prefix)
 * @param {string} provider - AI provider to use: 'gemini' or 'openai' (default: 'gemini')
 * @param {number} timeout - API timeout in seconds (default: 30)
 * @returns {Promise<string>} - The solved captcha code
 */
async function solveCaptcha(imageBase64, provider = 'gemini', timeout = 30) {
    try {
        // Add data URI prefix if not present
        const imageData = imageBase64.startsWith('data:')
            ? imageBase64
            : `data:image/png;base64,${imageBase64}`;

        const response = await axios.post(CAPTCHA_API_URL, {
            image_data: imageData,
            provider: provider,
            timeout: timeout
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: (timeout + 10) * 1000 // Add buffer for network latency
        });

        if (response.data.success && response.data.captcha_code) {
            return response.data.captcha_code;
        } else {
            throw new Error('Captcha solving failed: Invalid response from API');
        }
    } catch (error) {
        if (error.response) {
            // Check if this is a 422 error with the captcha code in the error message
            // The API correctly solves 4-character captchas but rejects them due to validation
            if (error.response.status === 422 && error.response.data?.detail?.detail) {
                const detailStr = error.response.data.detail.detail;
                const match = detailStr.match(/input_value='([A-Z0-9a-z]+)'/);
                if (match && match[1]) {
                    console.log("   Note: Extracted captcha from API validation error (4-char captcha)");
                    return match[1];
                }
            }
            throw new Error(`Captcha API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        }
        throw new Error(`Captcha solving failed: ${error.message}`);
    }
}

// Max retries for captcha solving
const MAX_RETRIES = 3;

async function login() {
    try {
        console.log("1. Fetching Client ID...");
        const clientRes = await axios.get(`${BASE_URL}/oauth2/GetClientId`);
        const clientId = clientRes.data;
        console.log("   Client ID:", clientId);

        const xClient = encryptXClient(clientId);
        console.log("   X-CLIENT (Encrypted):", xClient);

        let captchaSolution = null;
        let captchaToken = null;
        let attempt = 0;

        while (!captchaSolution && attempt < MAX_RETRIES) {
            attempt++;
            console.log(`\n2. Fetching Captcha (Attempt ${attempt}/${MAX_RETRIES})...`);

            const captchaRes = await axios.post(
                `${BASE_URL}/api/getCaptchaImage`,
                { height: 60, width: 300 },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CLIENT': xClient,
                        'is_public': 'true'
                    }
                }
            );

            const captchaData = captchaRes.data;
            captchaToken = captchaData.code; // This is the Session ID/Token
            const captchaImageBase64 = captchaData.image;

            console.log("   Captcha Token (Session ID):", captchaToken);
            console.log("   Captcha Image (Base64 length):", captchaImageBase64.length);

            // Optionally save captcha image to disk for debugging
            const fs = require('fs');
            fs.writeFileSync('captcha.png', Buffer.from(captchaImageBase64, 'base64'));
            console.log("   Saved captcha.png for debugging.");

            console.log("\n3. Solving Captcha using AI service...");
            try {
                captchaSolution = await solveCaptcha(captchaImageBase64);
                console.log("   Captcha Solved:", captchaSolution);
            } catch (solveError) {
                console.log(`   Captcha solving failed: ${solveError.message}`);
                if (attempt < MAX_RETRIES) {
                    console.log("   Retrying with a new captcha...");
                }
            }
        }

        if (!captchaSolution) {
            console.log("   Failed to solve captcha after all retries. Exiting.");
            return;
        }

        console.log("\n4. Logging in...");
        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('username', USERNAME);
        params.append('password', PASSWORD);
        params.append('loaidoituong', TYPE_ORG);
        params.append('text', captchaSolution);
        params.append('code', captchaToken); // The ID from step 2
        params.append('clientId', clientId);    // The original ID from step 1

        const loginRes = await axios.post(`${BASE_URL}/token`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'not_auth_token': 'false'
            }
        });

        console.log("\nLOGIN SUCCESS!");
        const token = loginRes.data.access_token;
        console.log("Token:", token.substring(0, 20) + "...");

        // Extract User Context (Don Vi)
        let dsDonVi = loginRes.data.dsDonVi;
        console.log("DEBUG: dsDonVi Type:", typeof dsDonVi);

        if (typeof dsDonVi === 'string') {
            try {
                dsDonVi = JSON.parse(dsDonVi);
                console.log("DEBUG: Parsed dsDonVi string.");
            } catch (e) {
                console.error("DEBUG: Failed to parse dsDonVi string:", e.message);
            }
        }

        if (!Array.isArray(dsDonVi)) {
            console.error("Error: dsDonVi is not an array:", dsDonVi);
            return;
        }

        // Helper to find specific unit
        let targetUnit = dsDonVi.find(u => u.Ma === 'TZH490L' || u.MaSoBHXH === 'TZH490L' || u.MaDonVi === 'TZH490L');

        if (!targetUnit) {
            console.log("   Target unit 'TZH490L' not found in list. Using first available unit.");
            targetUnit = dsDonVi[0];
        } else {
            console.log("   Found target unit 'TZH490L'.");
        }

        const currentDonVi = targetUnit;
        console.log("DEBUG: Full Unit Structure:", JSON.stringify(currentDonVi, null, 2));
        console.log("Current Unit Name:", currentDonVi.TenDonVi || currentDonVi.Ten || "Unknown");

        // Return session data
        return {
            token,
            xClient,
            currentDonVi
        };

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Response:", error.response.status, error.response.data);
        }
        throw error;
    }
}

// Allow running directly or importing
if (require.main === module) {
    login();
}

module.exports = { login, solveCaptcha, BASE_URL };
