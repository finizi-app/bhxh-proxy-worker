# BHXH Proxy Worker - Deployment Guide

## Prerequisites

### Required Tools

| Tool | Version | Installation |
|------|---------|--------------|
| Node.js | 18+ | `nvm install 18` |
| npm | 9+ | Included with Node.js |
| wrangler | 4.0+ | `npm install -D wrangler` |
| git | 2.0+ | Standard installation |

### Accounts

- **Cloudflare Account**: With Workers & KV access
- **BHXH Portal Account**: Username and password for `dichvucong.baohiemxahoi.gov.vn`
- **Finizi AI API Access**: For CAPTCHA solving (optional for manual mode)

## Development Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd bhxh-proxy-worker

# Install dependencies
npm install
```

### 2. Configure Environment

Create `.dev.vars` for local development:

```bash
# Copy secrets for local development
npx wrangler secret pull

# Or manually create .dev.vars
cat > .dev.vars << EOF
BHXH_USERNAME=your_username
BHXH_PASSWORD=your_password
BHXH_ENCRYPTION_KEY=S6|d'qc1GG,'rx&xn0XC
AI_CAPTCHA_ENDPOINT=http://34.126.156.34:4000/api/v1/captcha/solve
AI_CAPTCHA_API_KEY=your_api_key
EOF
```

### 3. Local Development

```bash
# Start development server
npm run dev

# Server runs at http://localhost:8787
# Test endpoints:
# curl http://localhost:8787/health
# curl http://localhost:8787/employees
```

### 4. TypeScript Compilation

```bash
# Check for type errors
npx tsc --noEmit

# Generate Cloudflare types
npm run cf-typegen
```

## Production Deployment

### 1. Set Secrets

Configure sensitive credentials as Cloudflare Secrets:

```bash
# Interactive secret setup
npx wrangler secret put BHXH_USERNAME
npx wrangler secret put BHXH_PASSWORD
npx wrangler secret put BHXH_ENCRYPTION_KEY
npx wrangler secret put AI_CAPTCHA_ENDPOINT
npx wrangler secret put AI_CAPTCHA_API_KEY
```

### 2. Verify Configuration

Check `wrangler.toml`:

```toml
name = "bhxh-proxy-worker"
main = "src/index.ts"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[[kv_namespaces]]
binding = "BHXH_SESSION"
id = "2c3dacd3163f4dda97eac85c82324f0d"  # Production ID
preview_id = "ff7eea72287f4f8eb7c640d4c4818072"  # Preview ID

[vars]
BHXH_BASE_URL = "https://dichvucong.baohiemxahoi.gov.vn"
AI_CAPTCHA_ENDPOINT = "http://34.126.156.34:4000/api/v1/captcha/solve"
EXTERNAL_PROXY_URL = "http://103.3.246.71:3128"
USE_PROXY = "true"
```

### 3. Deploy

```bash
# Deploy to production
npm run deploy

# Output includes:
# - Worker URL: https://bhxh-proxy-worker.<your-subdomain>.workers.dev
# - Deployment timestamp
```

### 4. Verify Deployment

```bash
# Health check
curl https://bhxh-proxy-worker.<subdomain>.workers.dev/health

# Expected response:
# {"status":"ok","service":"bhxh-proxy-worker","timestamp":"..."}

# Check session status
curl https://bhxh-proxy-worker.<subdomain>.workers.dev/session/status

# Expected response (first call triggers login):
# {"status":"active","expiresIn":3600,"unit":"..."}
```

## Environment Configuration

### Variables Reference

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `BHXH_USERNAME` | Secret | Yes | BHXH portal username |
| `BHXH_PASSWORD` | Secret | Yes | BHXH portal password |
| `BHXH_ENCRYPTION_KEY` | Secret | Yes | AES encryption key |
| `AI_CAPTCHA_ENDPOINT` | Secret/Var | Yes | Finizi AI API endpoint |
| `AI_CAPTCHA_API_KEY` | Secret | No | AI API authentication |
| `BHXH_BASE_URL` | Var | No | BHXH portal URL (default provided) |
| `EXTERNAL_PROXY_URL` | Var | No | Proxy server URL |
| `USE_PROXY` | Var | No | Enable proxy (`true`/`false`) |

### Setting Variables

**In wrangler.toml (non-sensitive):**
```toml
[vars]
BHXH_BASE_URL = "https://dichvucong.baohiemxahoi.gov.vn"
USE_PROXY = "true"
```

**As Secrets (sensitive):**
```bash
npx wrangler secret put BHXH_USERNAME
npx wrangler secret put BHXH_PASSWORD
```

### KV Namespace Setup

If creating a new KV namespace:

```bash
# Create KV namespace
npx wrangler kv:namespace create BHXH_SESSION

# Output includes binding configuration to add to wrangler.toml
# [[kv_namespaces]]
# binding = "BHXH_SESSION"
# id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## Deployment Environments

### Development

```bash
# Uses wrangler dev (local emulation)
npm run dev

# Or deploy to development namespace
npx wrangler deploy --env development
```

### Staging

```bash
# Deploy to staging
npx wrangler deploy --env staging

# Staging URL:
# https://bhxh-proxy-worker-staging.<subdomain>.workers.dev
```

### Production

```bash
# Deploy to production
npm run deploy

# Production URL:
# https://bhxh-proxy-worker.<subdomain>.workers.dev
```

## Rollback Procedure

### 1. View Deployment History

```bash
npx wrangler deployments list
```

### 2. Rollback to Previous Version

```bash
# Get the deployment ID to rollback to
npx wrangler deployments list

# Rollback
npx wrangler deployments rollback --deployment-id <deployment-id>
```

### 3. Verify Rollback

```bash
curl https://bhxh-proxy-worker.<subdomain>.workers.dev/health
```

## Monitoring

### Cloudflare Dashboard

1. Navigate to **Workers & Pages** > **bhxh-proxy-worker**
2. View **Metrics** tab for:
   - Request count
   - Error rate
   - Execution time
   - CPU time

### Logs

```bash
# View live logs
npx wrangler tail

# Or access logs in Cloudflare Dashboard
# Workers & Pages > bhxh-proxy-worker > Logs
```

### Health Checks

```bash
# Create a cron job or use external monitoring
*/5 * * * * curl -s https://bhxh-proxy-worker.<subdomain>.workers.dev/health
```

## Troubleshooting

### Common Issues

#### 1. Authentication Failures

**Symptom**: 401 errors on API calls

**Diagnosis**:
```bash
curl https://bhxh-proxy-worker.<subdomain>.workers.dev/session/status
```

**Solutions**:
- Check BHXH credentials in secrets
- Verify `BHXH_ENCRYPTION_KEY` is correct
- Ensure AI CAPTCHA endpoint is accessible

#### 2. KV Cache Misses

**Symptom**: Slow response times, frequent logins

**Diagnosis**:
```bash
curl https://bhxh-proxy-worker.<subdomain>.workers.dev/session/status
# Check "expiresIn" value
```

**Solutions**:
- KV namespace may have been recreated (use correct ID)
- Check KV is bound to worker

#### 3. CAPTCHA Solving Failures

**Symptom**: Login succeeds but CAPTCHA fails repeatedly

**Diagnosis**:
```bash
# Check logs
npx wrangler tail
```

**Solutions**:
- Fallback to manual login flow (`/login/captcha`, `/login/token`)
- Check AI CAPTCHA endpoint health
- Verify AI API key if required

#### 4. Proxy Issues

**Symptom**: Requests timeout or connection refused

**Diagnosis**:
```bash
# Check if proxy is accessible
curl -v http://103.3.246.71:3128
```

**Solutions**:
- Disable proxy: set `USE_PROXY=false`
- Update proxy URL if changed
- Check proxy server status

### Debug Mode

Enable verbose logging by checking `/debug/env` endpoint:

```bash
curl https://bhxh-proxy-worker.<subdomain>.workers.dev/debug/env

# Returns (without sensitive data):
# {
#   "password_length": 12,
#   "password_chars": [...],
#   "username": "xxx"
# }
```

## Security Checklist

- [ ] Secrets configured via `wrangler secret put`
- [ ] No credentials in `wrangler.toml`
- [ ] No credentials in git history
- [ ] CORS origins configured appropriately
- [ ] Logging does not capture sensitive data
- [ ] HTTPS enforced (automatic on Cloudflare)

## Performance Optimization

### Tips

1. **Session Cache**: Ensure KV namespace is deployed
2. **Minimize Requests**: Use session refresh sparingly
3. **Proxy**: Only use when required (adds latency)
4. **Batching**: Fetch employees with appropriate page size

### Monitoring Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Request latency (P95) | < 5s | > 10s |
| Error rate | < 1% | > 5% |
| KV cache hit rate | > 90% | < 70% |

## Related Documentation

- [Project Overview & PDR](./project-overview-pdr.md)
- [System Architecture](./system-architecture.md)
- [Code Standards](./code-standards.md)
- [Codebase Summary](./codebase-summary.md)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
