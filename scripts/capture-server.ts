import http from 'http';

const PORT = 61990;

const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const timestamp = new Date().toISOString();
        console.log(`\n--- [${timestamp}] Incoming Request ---`);
        console.log(`${req.method} ${req.url}`);
        console.log('Headers:', JSON.stringify(req.headers, null, 2));

        if (body) {
            console.log('Body:', body);
        }

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Request Captured');
    });
});

server.listen(PORT, () => {
    console.log(`Capture server running at http://localhost:${PORT}`);
    console.log('Waiting for requests...');
});
