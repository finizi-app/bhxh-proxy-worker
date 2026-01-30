
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .dev.vars manually or via dotenv
// .dev.vars format might be KEY="VALUE", dotenv handles this usually.
const devVarsPath = path.resolve(__dirname, '../.dev.vars');
dotenv.config({ path: devVarsPath });

const TARGET_URL = 'https://dichvucong.baohiemxahoi.gov.vn';
const PROXY_LIST_URL = 'https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&country=vn&proxy_format=protocolipport&format=text&timeout=20000';

/**
 * Parse proxy URL into Axios config
 * @param {string} proxyUrlStr 
 */
function getAxiosProxyConfig(proxyUrlStr) {
    try {
        const url = new URL(proxyUrlStr);
        return {
            protocol: url.protocol.replace(':', ''),
            host: url.hostname,
            port: parseInt(url.port, 10),
        };
    } catch (e) {
        return null;
    }
}

/**
 * Check if a proxy works by requesting the target URL
 * @param {string} proxyUrl 
 * @returns {Promise<boolean>}
 */
async function checkProxy(proxyUrl) {
    console.log(`Testing proxy: ${proxyUrl}...`);
    const proxyConfig = getAxiosProxyConfig(proxyUrl);

    if (!proxyConfig) {
        console.log(`Invalid proxy URL format: ${proxyUrl}`);
        return false;
    }

    // Axios only supports http/https proxies natively in the 'proxy' config.
    // For socks, we'd need an agent, but for now we'll assumes http/https or compatible.
    if (!['http', 'https'].includes(proxyConfig.protocol)) {
        console.log(`Skipping unsupported protocol: ${proxyConfig.protocol}`);
        return false;
    }

    try {
        await axios.get(TARGET_URL, {
            proxy: proxyConfig,
            timeout: 5000, // 5 seconds timeout
            validateStatus: (status) => status < 500, // Accept 4xx (means we reached the server)
        });
        console.log(`✅ Proxy works: ${proxyUrl}`);
        return true;
    } catch (error) {
        // console.log(`❌ Proxy failed: ${error.message}`);
        return false;
    }
}

/**
 * Fetch new proxy list
 */
async function fetchProxyList() {
    console.log(`Fetching new proxy list from ${PROXY_LIST_URL}...`);
    try {
        const response = await axios.get(PROXY_LIST_URL);
        const text = response.data;
        // Split by lines and filter empty
        const proxies = text.split('\n').map(l => l.trim()).filter(l => l && l.length > 0);
        console.log(`Got ${proxies.length} proxies.`);
        return proxies;
    } catch (error) {
        console.error(`Failed to fetch proxy list: ${error.message}`);
        return [];
    }
}

async function main() {
    // 1. Check current configured proxy
    const currentProxy = process.env.EXTERNAL_PROXY_URL;
    if (currentProxy) {
        console.log(`Checking configured proxy: ${currentProxy}`);
        const isWorking = await checkProxy(currentProxy);
        if (isWorking) {
            console.log(`\nSUCCESS: Current proxy is working.`);
            console.log(currentProxy);
            return;
        } else {
            console.log(`Current proxy is NOT working.`);
        }
    } else {
        console.log("No EXTERNAL_PROXY_URL configured.");
    }

    // 2. Fetch list and find a working one
    console.log("\nSearching for a new working proxy...");
    const proxies = await fetchProxyList();

    for (const proxy of proxies) {
        const isWorking = await checkProxy(proxy);
        if (isWorking) {
            console.log(`\nSUCCESS: Found working proxy!`);
            console.log(proxy);

            // Optional: Update .dev.vars? 
            // The prompt says "return the proxy url", so printing it is the main requirement.
            // But updating the file would be helpful.
            // For now, just output.
            return;
        }
    }

    console.log("\nFAILED: No working proxies found in the list.");
}

main().catch(console.error);
