/**
 * Test Script for BHXH Proxy Worker
 * Usage: node scripts/test_worker.js [local|prod|custom_url]
 */

const TARGETS = {
    local: "http://localhost:8787",
    prod: "https://bhxh-proxy-worker.trung-f9c.workers.dev" // Replace with actual if different
};

const args = process.argv.slice(2);
const targetEnv = args[0] || "local";
const baseUrl = TARGETS[targetEnv] || targetEnv;

// Endpoints to test
const ENDPOINTS = [
    { path: "/employees", method: "GET", desc: "Fetch Employees (Requires Proxy)" },
    // { path: "/debug/env", method: "GET", desc: "Check Env Vars" } // If debug endpoint exists
];

async function runTests() {
    console.log(`\n🔍 Testing Worker Target: ${baseUrl}\n`);

    for (const endpoint of ENDPOINTS) {
        const url = `${baseUrl}${endpoint.path}`;
        console.log(`Testing ${endpoint.desc}...`);
        console.log(`> ${endpoint.method} ${url}`);

        try {
            const startTime = Date.now();
            const response = await fetch(url, {
                method: endpoint.method,
                headers: {
                    "User-Agent": "TestScript/1.0"
                }
            });
            const duration = Date.now() - startTime;

            const status = response.status;
            const statusText = response.statusText;

            let body;
            try {
                body = await response.json();
            } catch (e) {
                body = await response.text();
            }

            console.log(`< Status: ${status} ${statusText} (${duration}ms)`);

            // Analyze Result
            if (status === 200) {
                console.log("✅ SUCCESS: Request succeeded.");
                if (body.data && Array.isArray(body.data)) {
                    console.log(`   Received ${body.data.length} records.`);
                }
            } else if (status === 525) {
                console.log("❌ FAILED: SSL Handshake Error (525).");
                console.log("   --> Worker cannot connect to BHXH via HTTPS.");
                console.log("   --> Check if USE_PROXY is true and Proxy URL is correct.");
            } else if (status === 401) {
                console.log("⚠️ WARNING: Unauthorized (401).");
                console.log("   --> Network connection OK (Proxy working if enabled).");
                console.log("   --> Logic Error: Session expired or Invalid Credentials.");
            } else {
                console.log("❌ FAILED: API Error.");
                console.log("   Response:", JSON.stringify(body, null, 2));
            }

        } catch (error) {
            console.log("❌ ERROR: Network/Fetch Failed.");
            console.error("   ", error.message);
            if (error.cause) console.error("   Cause:", error.cause);
        }
        console.log("-".repeat(40) + "\n");
    }
}

runTests();
