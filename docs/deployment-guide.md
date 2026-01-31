# BHXH API - Deployment Guide

## Prerequisites

### Required Tools

| Tool | Version | Installation |
|------|---------|--------------|
| Node.js | 18+ | `nvm install 18` |
| npm | 9+ | Included with Node.js |
| git | 2.0+ | Standard installation |

### Accounts

- **BHXH Portal Account**: Username and password for `dichvucong.baohiemxahoi.gov.vn`
- **AI CAPTCHA API Access**: For CAPTCHA solving (optional for manual mode)

## Development Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd bhxh-api

# Install dependencies
npm install
```

### 2. Configure Environment

Create `.dev.vars` for local development:

```bash
# Create .dev.vars file
cat > .dev.vars << EOF
# Required: API keys for authentication
API_KEYS=sk_test_abc123def456,sk_prod_xyz789ghi012

# Optional: Fallback BHXH credentials
BHXH_USERNAME=your_username
BHXH_PASSWORD=your_password

# Optional: Encryption key (has default)
BHXH_ENCRYPTION_KEY=S6|d'qc1GG,'rx&xn0XC

# Optional: AI CAPTCHA solver
AI_CAPTCHA_ENDPOINT=http://your-api.com/captcha/solve
AI_CAPTCHA_API_KEY=your_api_key

# Optional: Proxy configuration
USE_PROXY=false
EXTERNAL_PROXY_URL=http://proxy.example.com:3128
EXTERNAL_PROXY_USERNAME=proxyuser
EXTERNAL_PROXY_PASSWORD=proxypass

# Optional: Server configuration
HOST=0.0.0.0
PORT=4000
EOF
```

### 3. Generate API Keys

```bash
# Generate secure API key (32 bytes hex)
openssl rand -hex 32
```

### 4. Local Development

```bash
# Start development server
npm run dev

# Server runs at http://localhost:4000
# Swagger UI: http://localhost:4000/docs

# Test endpoints:
curl http://localhost:4000/
curl -H "X-API-Key: sk_test_abc123" http://localhost:4000/api/v1/employees
```

### 5. Generate Routes and Swagger

```bash
# Generate OpenAPI spec
npm run swagger

# Generate tsoa routes
npm run routes
```

## Production Deployment

### 1. Environment Configuration

Configure environment variables in your deployment platform:

| Variable | Required | Description |
|----------|----------|-------------|
| `API_KEYS` | Yes | Comma-separated API keys |
| `BHXH_USERNAME` | No | Fallback BHXH username |
| `BHXH_PASSWORD` | No | Fallback BHXH password |
| `BHXH_ENCRYPTION_KEY` | No | AES encryption key |
| `AI_CAPTCHA_ENDPOINT` | No | AI CAPTCHA solver endpoint |
| `USE_PROXY` | No | Enable proxy (`true`/`false`) |
| `EXTERNAL_PROXY_URL` | No | Proxy server URL |
| `EXTERNAL_PROXY_USERNAME` | No | Proxy auth username |
| `EXTERNAL_PROXY_PASSWORD` | No | Proxy auth password |
| `HOST` | No | Server host (default: `0.0.0.0`) |
| `PORT` | No | Server port (default: `4000`) |

### 2. Deployment Options

#### Option A: Direct Node.js Deployment

```bash
# Install dependencies
npm install --production

# Generate routes
npm run routes

# Start server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "bhxh-api" -- start
pm2 save
pm2 startup
```

#### Option B: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run routes

EXPOSE 4000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t bhxh-api .
docker run -p 4000:4000 --env-file .env bhxh-api
```

#### Option C: Cloud Run / Container Registry

```bash
# Build Docker image
docker build -t gcr.io/PROJECT-ID/bhxh-api .

# Push to registry
docker push gcr.io/PROJECT-ID/bhxh-api

# Deploy to Cloud Run
gcloud run deploy bhxh-api \
  --image gcr.io/PROJECT-ID/bhxh-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars API_KEYS=your-keys
```

### 3. Verify Deployment

```bash
# Health check
curl https://your-domain.com/

# Expected response:
# {"service":"bhxh-api","version":"1.0.0","docs":"/docs","status":"ok"}

# Check session status
curl -H "X-API-Key: your-key" https://your-domain.com/api/v1/session/status

# Expected response (first call triggers login):
# {"status":"active","expiresIn":3600,"unit":"..."}
```

## Environment Configuration

### Variables Reference

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `API_KEYS` | string | Yes | - | Comma-separated API keys |
| `BHXH_USERNAME` | string | No | - | Fallback BHXH username |
| `BHXH_PASSWORD` | string | No | - | Fallback BHXH password |
| `BHXH_ENCRYPTION_KEY` | string | No | `S6|d'qc1GG,'rx&xn0XC` | AES encryption key |
| `BHXH_BASE_URL` | string | No | `https://dichvucong.baohiemxahoi.gov.vn` | BHXH portal URL |
| `AI_CAPTCHA_ENDPOINT` | string | No | - | AI CAPTCHA solver endpoint |
| `AI_CAPTCHA_API_KEY` | string | No | - | AI API authentication |
| `USE_PROXY` | boolean | No | `false` | Enable proxy |
| `EXTERNAL_PROXY_URL` | string | No | - | Proxy server URL |
| `EXTERNAL_PROXY_USERNAME` | string | No | - | Proxy auth username |
| `EXTERNAL_PROXY_PASSWORD` | string | No | - | Proxy auth password |
| `HOST` | string | No | `0.0.0.0` | Server host |
| `PORT` | number | No | `4000` | Server port |

### Setting Variables

**In .dev.vars (local):**
```bash
API_KEYS=sk_test_abc123,sk_prod_xyz789
BHXH_USERNAME=your@email.com
BHXH_PASSWORD=yourpassword
```

**In production (Cloud Run):**
```bash
gcloud run deploy bhxh-api --set-env-vars \
  API_KEYS=sk_prod_xyz789,\
  BHXH_USERNAME=prod@email.com
```

**In production (Docker):**
```bash
docker run -e API_KEYS=sk_prod_xyz789 -e PORT=4000 bhxh-api
```

## Deployment Environments

### Development

```bash
# Uses .dev.vars
npm run dev

# Or with custom port
PORT=3000 npm run dev
```

### Staging

```bash
# Deploy with staging keys
API_KEYS=sk_staging_abc123 npm start
```

### Production

```bash
# Deploy with production keys
API_KEYS=sk_prod_xyz789 npm start
```

## Monitoring

### Logging

The application logs to stdout:

```typescript
// Session operations
console.log("Using cached session...");
console.log("Session expired or missing, need to refresh");

// Login flow
console.log("1. Fetching Client ID...");
console.log("2. Fetching Captcha...");
console.log("3. Solving Captcha via AI...");
console.log("4. Logging in...");

// Request profiling
console.log("[PROFILE] GET /api/v1/employees - 250ms");

// API Key usage
console.log("[API_KEY] sk_test_abc1... -> GET /api/v1/employees");
```

### Health Checks

```bash
# Create a cron job or use external monitoring
*/5 * * * * curl -s https://your-domain.com/
```

### Metrics

| Metric | Source |
|--------|--------|
| Request latency | Built-in profiler |
| Session cache hit rate | Session service logs |
| Login success rate | performLogin() results |
| CAPTCHA solve rate | solveCaptcha() results |

## Troubleshooting

### Common Issues

#### 1. Authentication Failures

**Symptom**: 401/403 errors on API calls

**Diagnosis**:
```bash
curl -v -H "X-API-Key: test-key" https://your-domain.com/api/v1/employees
```

**Solutions**:
- Check API_KEYS environment variable is set
- Verify X-API-Key header is being sent
- Ensure API key matches configured keys

#### 2. Session Cache Misses

**Symptom**: Slow response times, frequent logins

**Diagnosis**:
```bash
curl -H "X-API-Key: your-key" https://your-domain.com/api/v1/session/status
# Check "expiresIn" value
```

**Solutions**:
- In-memory cache is lost on server restart (expected behavior)
- Consider Redis for multi-instance deployments

#### 3. CAPTCHA Solving Failures

**Symptom**: Login succeeds but CAPTCHA fails repeatedly

**Diagnosis**: Check logs for CAPTCHA errors

**Solutions**:
- Verify AI_CAPTCHA_ENDPOINT is accessible
- Check AI API key if required
- Consider manual login flow implementation

#### 4. Proxy Issues

**Symptom**: Requests timeout or connection refused

**Diagnosis**:
```bash
# Check if proxy is accessible
curl -v http://proxy.example.com:3128
```

**Solutions**:
- Disable proxy: set `USE_PROXY=false`
- Update proxy URL if changed
- Check proxy credentials (EXTERNAL_PROXY_USERNAME/PASSWORD)

### Debug Mode

Enable verbose logging:

```bash
# Logs are output to stdout
npm run dev

# Check for:
# - Session operations
# - Login flow steps
# - Request timing
# - API key usage
```

## Security Checklist

- [ ] API_KEYS configured (not hardcoded)
- [ ] BHXH credentials in environment variables only
- [ ] No credentials in git history
- [ ] HTTPS enabled in production
- [ ] CORS configured appropriately
- [ ] Logging does not capture sensitive data
- [ ] API keys rotated regularly (90 days recommended)

## Performance Optimization

### Tips

1. **Session Cache**: In-memory cache reduces login frequency
2. **Minimize Requests**: Use appropriate page sizes
3. **Proxy**: Only use when required (adds latency)
4. **Batching**: Fetch employees with appropriate PageSize

### Monitoring Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Request latency (P95) | < 5s | > 10s |
| Error rate | < 1% | > 5% |
| Session cache hit rate | > 90% | < 70% |

## Scaling Considerations

### Current Limitations

- **In-Memory Cache**: Not shared across instances
- **Stateful Design**: Requires sticky sessions for scaling

### Future Enhancements

| Feature | Description |
|---------|-------------|
| Redis Cache | Shared session cache for horizontal scaling |
| Rate Limiting | Prevent API abuse |
| Load Balancing | Multi-instance support |

## Related Documentation

- [Project Overview & PDR](./project-overview-pdr.md)
- [System Architecture](./system-architecture.md)
- [Code Standards](./code-standards.md)
- [Codebase Summary](./codebase-summary.md)
- [API Reference](./api-reference.md)
