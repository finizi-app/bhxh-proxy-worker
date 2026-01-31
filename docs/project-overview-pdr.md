# BHXH API - Project Overview & Product Development Requirements

## 1. Executive Summary

**BHXH API** is an Express server with tsoa that provides a secure, autonomous interface to the Vietnam Social Insurance (BHXH) portal (`dichvucong.baohiemxahoi.gov.vn`). The system automates the login process including CAPTCHA solving via AI, caches sessions in-memory, and exposes simplified REST endpoints for employee data retrieval and reference lookups.

**Target Users**: Enterprise HR systems, payroll providers, and government agencies that need programmatic access to BHXH employee records.

**Tech Stack**: Node.js, Express, tsoa, TypeScript, in-memory session caching

## 2. Problem Statement

The BHXH portal requires manual browser-based authentication with CAPTCHA challenges, making it impractical for automated integrations. Current manual processes:
- Require human intervention for each CAPTCHA
- Lack programmatic API access
- Have no session persistence across requests
- Cannot scale for enterprise use cases

## 3. Product Vision

Create a REST API proxy that:
- Handles BHXH authentication autonomously
- Maintains session state via in-memory caching
- Exposes clean REST endpoints for data access
- Supports AI-powered CAPTCHA solving
- Operates as an Express server with tsoa for OpenAPI integration

## 4. Functional Requirements

### 4.1 Authentication & Session Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | API key authentication via X-API-Key header | P0 | Done |
| FR-02 | Per-request BHXH credentials (username/password query params) | P0 | Done |
| FR-03 | Multi-tenant session caching (keyed by credentials) | P0 | Done |
| FR-04 | Obtain Client ID from BHXH OAuth endpoint | P0 | Done |
| FR-05 | Encrypt Client ID using AES for X-CLIENT header | P0 | Done |
| FR-06 | Fetch and cache CAPTCHA image | P0 | Done |
| FR-07 | Solve CAPTCHA via AI API | P0 | Done |
| FR-08 | Perform login with credentials and captcha | P0 | Done |
| FR-09 | Cache session token in-memory with 1-hour TTL | P0 | Done |
| FR-10 | Auto-refresh expired sessions | P0 | Done |
| FR-11 | Session status check endpoint | P1 | Done |
| FR-12 | Force session refresh endpoint | P1 | Done |

### 4.2 Employee Data Access

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-20 | Fetch employee list with pagination | P0 | Done |
| FR-21 | Filter employees by criteria | P1 | Done |
| FR-22 | Support per-request credentials for multi-tenant access | P0 | Done |

### 4.3 Reference Data Lookups

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-30 | Lookup paper types (Code 071) | P1 | Done |
| FR-31 | Lookup countries (Code 072) | P1 | Done |
| FR-32 | Lookup ethnicities (Code 073) | P1 | Done |
| FR-33 | Lookup labor plan types (Code 086) | P1 | Done |
| FR-34 | Lookup benefits (Code 098) | P1 | Done |
| FR-35 | Lookup relationships (Code 099) | P1 | Done |

### 4.4 Proxy Support

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-40 | Route requests through external proxy | P1 | Done |
| FR-41 | Toggle proxy mode via environment variable | P1 | Done |
| FR-42 | Proxy authentication via Basic auth | P1 | Done |

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Session retrieval from in-memory cache | < 10ms |
| NFR-02 | Autonomous login completion | < 10s |
| NFR-03 | API response time (BHXH fetch) | < 5s |

### 5.2 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-10 | Session cache hit rate | > 90% |
| NFR-11 | CAPTCHA solving success rate | > 80% |
| NFR-12 | Server uptime | 99.9% |

### 5.3 Security

| ID | Requirement |
|----|-------------|
| NFR-20 | API key authentication for all protected endpoints |
| NFR-21 | Credentials stored as environment variables |
| NFR-22 | Sessions cached in-memory with TTL |
| NFR-23 | CORS enabled for authorized origins |
| NFR-24 | No credentials logged or exposed |

### 5.4 Scalability

| ID | Requirement |
|----|-------------|
| NFR-30 | Per-request credentials enable multi-tenant support |
| NFR-31 | Express server for easy deployment |
| NFR-32 | In-memory cache (future: Redis for scaling) |

## 6. API Specification

### 6.1 Authentication

**API Key Header:**
```bash
X-API-Key: your-api-key-here
```

**Per-Request Credentials:**
```bash
GET /api/v1/employees?username=user@example.com&password=pass123
```

### 6.2 Health Check

```
GET /

Response 200:
{
  "service": "bhxh-api",
  "version": "1.0.0",
  "docs": "/docs",
  "status": "ok"
}
```

### 6.3 Employee List

```
GET /api/v1/employees?PageSize=10
Headers: X-API-Key: your-api-key

Response 200:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "Hoten": "Nguyen Van A",
      "Masobhxh": "0123456789",
      "chucVu": "Nhan Vien",
      "mucLuong": 5000000,
      "tinhTrang": "DangLamViec"
    }
  ],
  "meta": {
    "total": 100,
    "count": 10
  },
  "timing": {
    "sessionMs": 0,
    "fetchMs": 2500,
    "totalMs": 2500
  }
}
```

### 6.4 Session Status

```
GET /api/v1/session/status
Headers: X-API-Key: your-api-key

Response 200:
{
  "status": "active" | "expired",
  "expiresIn": 3600,
  "unit": "Don Vi 1"
}
```

### 6.5 Master Data Endpoints

```
GET /api/v1/master-data/paper-types
GET /api/v1/master-data/countries
GET /api/v1/master-data/ethnicities
GET /api/v1/master-data/labor-plan-types
GET /api/v1/master-data/benefits
GET /api/v1/master-data/relationships

Response 200:
{
  "success": true,
  "data": [
    { "Ma": "01", "Ten": "Display Name" }
  ]
}
```

## 7. Technical Constraints

| Constraint | Description |
|------------|-------------|
| TC-01 | Must run on Node.js 18+ |
| TC-02 | Uses Express 4.x for tsoa compatibility |
| TC-03 | Session TTL fixed at 1 hour |
| TC-04 | BHXH uses 4-character CAPTCHA |
| TC-05 | Proxy required for some network environments |
| TC-06 | In-memory cache not shared across instances |

## 8. Dependencies

### 8.1 External Services

| Service | Purpose | SLA |
|---------|---------|-----|
| dichvucong.baohiemxahoi.gov.vn | BHXH Portal | 99% |
| AI CAPTCHA API | CAPTCHA Solving | 95% |
| External Proxy | Network routing | 99% |

### 8.2 Internal Dependencies

| Component | Version | Purpose |
|-----------|---------|---------|
| express | ^4.22.1 | HTTP server |
| tsoa | ^6.6.0 | OpenAPI integration |
| axios | ^1.13.4 | HTTP client |
| crypto-js | ^4.2.0 | AES encryption |
| https-proxy-agent | ^7.0.6 | Proxy support |

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Session cache hit rate | > 90% | Cache hits / total requests |
| CAPTCHA solve success | > 80% | Successful solves / attempts |
| API uptime | 99.9% | Server availability |
| Mean response time | < 3s | Average /employees latency |

## 10. Acceptance Criteria

- [x] Express server starts on configured port
- [x] API key middleware validates X-API-Key header
- [x] Autonomous login completes without manual intervention
- [x] Session cached in-memory and reused across requests
- [x] /api/v1/employees endpoint returns employee data
- [x] All master-data endpoints return reference data
- [x] Per-request credentials create isolated sessions
- [x] Proxy mode routes traffic correctly
- [x] Credentials not exposed in logs or responses
- [x] Swagger UI available at /docs

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| BHXH portal changes API | High | Monitor API docs, implement graceful degradation |
| AI CAPTCHA service unavailable | Medium | Implement manual login flow (future) |
| Proxy server downtime | Medium | Allow proxy toggle, direct connection fallback |
| Session token expiration during request | Low | Implement retry with re-authentication |
| In-memory cache loss on restart | Low | Auto-login on cache miss (expected behavior) |

## 12. Architecture Overview

```
Express Server (local-server.ts)
    |
    v
API Key Middleware (api-key.middleware.ts)
    |
    v
tsoa Controllers (employees, session, master-data, health)
    |
    v
Services Layer (session, bhxh, proxy)
    |
    v
In-Memory Session Cache (Map<string, Session>)
```

**Tech Stack Changes (v2.0.0):**
- **From**: Cloudflare Workers, KV namespace, wrangler
- **To**: Express server, tsoa, in-memory Map caching

## 13. References

- [Headless Login API Documentation](../api-docs/headless_login_docs.md)
- [Employee API Documentation](../api-docs/headless_employee_api_docs.md)
- [tsoa Documentation](https://tsoa-community.github.io/docs/)
- [Express Documentation](https://expressjs.com/)
