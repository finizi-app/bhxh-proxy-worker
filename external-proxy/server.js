const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;

// Permissive SSL Agent
const agent = new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
    minVersion: 'TLSv1',
    ciphers: 'DEFAULT@SECLEVEL=0'
});

const server = http.createServer((req, res) => {
    // CORS configuration
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CLIENT, User-Agent');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'bhxh-forward-proxy' }));
        return;
    }

    // Parse target URL from query or body
    // We expect the client to send the target URL in a custom header or query param
    // or we can just act as a transparent proxy for a specific target

    // For this specific use case, we are proxying for dichvucong.baohiemxahoi.gov.vn
    // usage: POST /proxy?url=https://dichvucong.baohiemxahoi.gov.vn/api/foo

    const reqUrl = url.parse(req.url, true);

    if (reqUrl.pathname !== '/proxy') {
        res.writeHead(404);
        res.end('Not Found. Use /proxy?url=...');
        return;
    }

    const targetUrlStr = reqUrl.query.url;
    if (!targetUrlStr) {
        res.writeHead(400);
        res.end('Missing "url" query parameter');
        return;
    }

    console.log(`Proxying POST to: ${targetUrlStr}`);

    try {
        const targetUrl = new url.URL(targetUrlStr);

        const options = {
            hostname: targetUrl.hostname,
            port: targetUrl.port || 443,
            path: targetUrl.pathname + targetUrl.search,
            method: req.method,
            headers: {
                ...req.headers,
                host: targetUrl.hostname, // Override host header
            },
            agent: agent,
            timeout: 30000
        };

        // Remove hop-by-hop headers
        delete options.headers['host'];
        delete options.headers['connection'];
        delete options.headers['content-length'];

        const proxyReq = https.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
            console.error('Proxy Error:', err);
            if (!res.headersSent) {
                res.writeHead(502);
                res.end(JSON.stringify({ error: 'Proxy Request Failed', details: err.message }));
            }
        });

        // If request has body, pipe it too
        req.pipe(proxyReq);

    } catch (err) {
        console.error('Invalid URL:', err);
        res.writeHead(400);
        res.end('Invalid URL parameter');
    }
});

server.listen(PORT, () => {
    console.log(`BHXH Forward Proxy running on port ${PORT}`);
});
