const https = require('https');
const http = require('http');

const TARGET_URL = 'https://dichvucong.baohiemxahoi.gov.vn';

const DEFAULT_TIMEOUT = 2000;
const MAX_CONCURRENT = 5;

function checkProxy(proxyUrl) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        try {
            const url = new URL(proxyUrl);
            const isHttps = url.protocol === 'https:';
            const requestFn = isHttps ? https.request : http.request;

            const proxyOptions = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: '/',
                method: 'GET',
                timeout: DEFAULT_TIMEOUT,
                headers: {
                    'Host': new URL(TARGET_URL).hostname,
                    'User-Agent': 'Mozilla/5.0'
                }
            };

            const proxyReq = requestFn(proxyOptions, (proxyRes) => {
                const elapsed = Date.now() - startTime;
                proxyRes.on('data', () => {});
                proxyRes.on('end', () => {
                    if (proxyRes.statusCode && proxyRes.statusCode < 500) {
                        resolve({
                            success: true,
                            proxy: proxyUrl,
                            status: proxyRes.statusCode,
                            elapsed
                        });
                    } else {
                        resolve({
                            success: false,
                            proxy: proxyUrl,
                            status: proxyRes.statusCode,
                            error: `HTTP ${proxyRes.statusCode}`
                        });
                    }
                });
            });

            proxyReq.on('error', (e) => {
                resolve({
                    success: false,
                    proxy: proxyUrl,
                    error: e.message
                });
            });

            proxyReq.on('timeout', () => {
                proxyReq.destroy();
                resolve({
                    success: false,
                    proxy: proxyUrl,
                    error: 'Timeout'
                });
            });

            proxyReq.end();
        } catch (e) {
            resolve({
                success: false,
                proxy: proxyUrl,
                error: e.message
            });
        }
    });
}

async function checkProxies(proxyList) {
    const results = [];

    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < proxyList.length; i += MAX_CONCURRENT) {
        const batch = proxyList.slice(i, i + MAX_CONCURRENT);
        const batchResults = await Promise.all(batch.map(checkProxy));
        results.push(...batchResults);
    }

    // Return only working proxies, sorted by speed
    return results
        .filter(r => r.success)
        .sort((a, b) => a.elapsed - b.elapsed);
}

async function main(params) {
    // Support both array format and single proxy for backward compatibility
    let proxies = params.proxies || params.proxyList;

    // If single proxy param provided, convert to array
    const singleProxy = params.proxy || params.url;
    if (singleProxy && !proxies) {
        proxies = [singleProxy];
    }

    if (!proxies || !Array.isArray(proxies) || proxies.length === 0) {
        return {
            body: JSON.stringify({
                success: false,
                error: 'Missing or empty proxies parameter. Expected: { proxies: ["http://ip:port", ...] }'
            }),
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' }
        };
    }

    const working = await checkProxies(proxies);

    return {
        body: JSON.stringify({
            success: true,
            checked: proxies.length,
            working: working.length,
            proxies: working
        }),
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' }
    };
}

exports.main = main;
