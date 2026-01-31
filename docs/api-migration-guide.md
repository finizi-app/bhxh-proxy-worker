# API Migration Guide

## Overview

The BHXH API v2.0.0 introduces breaking changes from the previous Cloudflare Workers implementation. This guide covers the migration to the new Express/tsoa architecture.

## Breaking Changes

### Before (v1.0.0 - Cloudflare Workers)

```bash
# No authentication required
GET /employees
GET /lookup/countries
```

### After (v2.0.0 - Express/tsoa)

```bash
# API key header required for all protected endpoints
# BHXH credentials optional via query parameters
GET /api/v1/employees
Headers: X-API-Key: sk_test_abc123
Query: username=user@example.com&password=pass123
```

## Key Changes

| Change | v1.0.0 | v2.0.0 |
|--------|--------|--------|
| Platform | Cloudflare Workers | Express + tsoa |
| Session Cache | KV namespace | In-memory Map |
| Authentication | None | X-API-Key header |
| Credentials | Environment only | Per-request query params |
| Base Path | `/` | `/api/v1` |
| Lookup Endpoints | `/lookup/{code}` | `/api/v1/master-data/{type}` |
| Docs | None | Swagger UI at `/docs` |
| Default Port | 8787 | 4000 |

## Setup

### 1. Generate API Keys

```bash
# Generate secure API key (32 bytes hex)
openssl rand -hex 32
```

### 2. Configure Environment

```bash
# Copy .env.example to .dev.vars
cp .env.example .dev.vars

# Edit .dev.vars and add your API keys
API_KEYS=sk_test_abc123def456,sk_prod_xyz789ghi012
```

### 3. Update Base URL

```bash
# Old URL
https://bhxh-proxy-worker.workers.dev

# New URL (local)
http://localhost:4000

# New URL (production)
https://your-domain.com
```

## API Changes

### Authentication

#### New: API Key Header

All protected endpoints now require an `X-API-Key` header:

```bash
curl -H "X-API-Key: sk_test_abc123" http://localhost:4000/api/v1/employees
```

**Without API Key:**
```json
{
  "error": "Unauthorized",
  "message": "Missing X-API-Key header"
}
```

**With Invalid API Key:**
```json
{
  "error": "Forbidden",
  "message": "Invalid API key"
}
```

### Per-Request Credentials

#### New: Username/Password Query Parameters

Optional `username` and `password` query parameters for multi-tenant support:

```bash
# With specific credentials
curl -H "X-API-Key: sk_test_abc123" \
  "http://localhost:4000/api/v1/employees?username=user1@example.com&password=pass123"

# Without credentials (uses fallback from .dev.vars)
curl -H "X-API-Key: sk_test_abc123" \
  "http://localhost:4000/api/v1/employees"
```

**Benefits:**
- Multi-tenant session isolation
- Each credential combination gets its own cached session
- Fallback to default credentials from environment

### Endpoint Paths

#### Employee Endpoint

```bash
# Old
GET /employees

# New
GET /api/v1/employees
Headers: X-API-Key: your-api-key
```

#### Session Endpoints

```bash
# Old
GET /session/status
GET /session/refresh

# New
GET /api/v1/session/status
POST /api/v1/session/refresh
Headers: X-API-Key: your-api-key
```

#### Master Data Endpoints

```bash
# Old (generic lookup)
GET /lookup/071  # Paper types
GET /lookup/072  # Countries

# New (named endpoints)
GET /api/v1/master-data/paper-types
GET /api/v1/master-data/countries
Headers: X-API-Key: your-api-key
```

**All Named Endpoints:**
- `/api/v1/master-data/paper-types` (Code 071)
- `/api/v1/master-data/countries` (Code 072)
- `/api/v1/master-data/ethnicities` (Code 073)
- `/api/v1/master-data/labor-plan-types` (Code 086)
- `/api/v1/master-data/benefits` (Code 098)
- `/api/v1/master-data/relationships` (Code 099)

## Migration Steps

### Step 1: Update Environment Configuration

```bash
# Old (wrangler secrets)
npx wrangler secret put BHXH_USERNAME
npx wrangler secret put BHXH_PASSWORD

# New (environment variables)
# Add to .dev.vars or deployment platform:
API_KEYS=sk_test_abc123def456,sk_prod_xyz789ghi012
BHXH_USERNAME=your_username
BHXH_PASSWORD=your_password
```

### Step 2: Update API Client Code

```javascript
// Old code
const response = await fetch('https://bhxh-proxy-worker.workers.dev/employees');

// New code
const response = await fetch('http://localhost:4000/api/v1/employees', {
  headers: {
    'X-API-Key': 'sk_test_abc123'
  }
});
```

### Step 3: Update Endpoint Paths

```javascript
// Old code
fetch('/lookup/071');

// New code
fetch('/api/v1/master-data/paper-types', {
  headers: { 'X-API-Key': 'sk_test_abc123' }
});
```

### Step 4: Add Per-Request Credentials (Optional)

```javascript
// If using multi-tenant support
const response = await fetch(
  '/api/v1/employees' +
  '?username=tenant1@example.com&password=pass123',
  {
    headers: { 'X-API-Key': 'sk_test_abc123' }
  }
);
```

## Testing

### Test Authentication

```bash
# Test without API key (should fail)
curl http://localhost:4000/api/v1/employees

# Test with invalid API key (should fail)
curl -H "X-API-Key: invalid-key" http://localhost:4000/api/v1/employees

# Test with valid API key (should succeed)
curl -H "X-API-Key: sk_test_abc123" http://localhost:4000/api/v1/employees
```

### Test Per-Request Credentials

```bash
# Test with specific credentials
curl -H "X-API-Key: sk_test_abc123" \
  "http://localhost:4000/api/v1/employees?username=user1@example.com&password=pass123"

# Test without credentials (uses fallback)
curl -H "X-API-Key: sk_test_abc123" \
  "http://localhost:4000/api/v1/employees"
```

### Test Named Endpoints

```bash
# Test master-data endpoints
curl -H "X-API-Key: sk_test_abc123" \
  http://localhost:4000/api/v1/master-data/countries

curl -H "X-API-Key: sk_test_abc123" \
  http://localhost:4000/api/v1/master-data/paper-types
```

## Security Best Practices

1. **Never commit API keys** to version control
2. **Rotate keys regularly** - Every 90 days recommended
3. **Use environment-specific keys** - Different keys for dev/staging/prod
4. **Log failed attempts** - Monitor for unauthorized access attempts
5. **Use HTTPS** - Always use HTTPS in production to protect credentials in transit
6. **Truncate keys in logs** - Only log first 10 characters

## Migration Checklist

- [ ] Generate API keys
- [ ] Update .dev.vars with API_KEYS
- [ ] Update application code to send X-API-Key header
- [ ] Update base URL to new endpoint
- [ ] Update endpoint paths (add `/api/v1` prefix)
- [ ] Update lookup endpoints to named paths
- [ ] Test authentication with valid/invalid keys
- [ ] Test per-request credentials
- [ ] Update deployment configuration
- [ ] Monitor logs for API key usage

## Rollback Plan

If issues arise during migration:

1. **Temporary Rollback**: Keep old Cloudflare Workers deployment active
2. **Feature Flags**: Implement feature flags to toggle between old/new APIs
3. **Gradual Migration**: Migrate endpoints one at a time
4. **Monitoring**: Monitor error rates and API key usage

## Troubleshooting

### 401 Unauthorized

**Cause**: Missing X-API-Key header

**Solution**: Add header to requests:
```javascript
headers: { 'X-API-Key': 'your-api-key' }
```

### 403 Forbidden

**Cause**: Invalid X-API-Key

**Solution**: Verify API key matches configured keys in API_KEYS

### Session Not Found

**Cause**: In-memory cache lost on server restart

**Solution**: This is expected behavior. Session will auto-login on next request

### Different Credentials Not Working

**Cause**: Per-request credentials not being passed

**Solution**: Use query parameters:
```bash
?username=user@example.com&password=pass123
```

## Related Documentation

- [API Reference](./api-reference.md)
- [Project Overview & PDR](./project-overview-pdr.md)
- [System Architecture](./system-architecture.md)
- [Deployment Guide](./deployment-guide.md)
