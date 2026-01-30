# BHXH Proxy Worker - Project Overview & Product Development Requirements

## 1. Executive Summary

**BHXH Proxy Worker** is a Cloudflare Worker that provides a secure, autonomous interface to the Vietnam Social Insurance (BHXH) portal (`dichvucong.baohiemxahoi.gov.vn`). The system automates the login process including CAPTCHA solving via AI, caches sessions in Cloudflare KV, and exposes simplified API endpoints for employee data retrieval and reference lookups.

**Target Users**: Enterprise HR systems, payroll providers, and government agencies that need programmatic access to BHXH employee records.

## 2. Problem Statement

The BHXH portal requires manual browser-based authentication with CAPTCHA challenges, making it impractical for automated integrations. Current manual processes:
- Require human intervention for each CAPTCHA
- Lack programmatic API access
- Have no session persistence across requests
- Cannot scale for enterprise use cases

## 3. Product Vision

Create a headless API proxy that:
- Handles BHXH authentication autonomously
- Maintains session state via KV caching
- Exposes clean REST endpoints for data access
- Supports AI-powered CAPTCHA solving
- Operates on Cloudflare Workers edge network

## 4. Functional Requirements

### 4.1 Authentication & Session Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Obtain Client ID from BHXH OAuth endpoint | P0 | Done |
| FR-02 | Encrypt Client ID using AES for X-CLIENT header | P0 | Done |
| FR-03 | Fetch and cache CAPTCHA image | P0 | Done |
| FR-04 | Solve CAPTCHA via Finizi AI Core API | P0 | Done |
| FR-05 | Perform login with credentials and captcha | P0 | Done |
| FR-06 | Cache session token in KV with 1-hour TTL | P0 | Done |
| FR-07 | Auto-refresh expired sessions | P0 | Done |
| FR-08 | Support manual login flow (get captcha -> submit solution) | P1 | Done |

### 4.2 Employee Data Access

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-10 | Fetch employee list with pagination | P0 | Done |
| FR-11 | Filter employees by criteria | P1 | Pending |
| FR-12 | Get employee details (Code 081) | P1 | Pending |
| FR-13 | Support unit switching for multi-unit accounts | P2 | Pending |

### 4.3 Reference Data Lookups

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-20 | Lookup paper types (Code 071) | P1 | Done |
| FR-21 | Lookup countries (Code 072) | P1 | Done |
| FR-22 | Lookup ethnicities (Code 073) | P1 | Done |
| FR-23 | Lookup labor plan types (Code 086) | P1 | Done |
| FR-24 | Lookup benefits (Code 098) | P1 | Done |
| FR-25 | Lookup relationships (Code 099) | P1 | Done |
| FR-26 | Lookup document list (Code 028) | P1 | Done |

### 4.4 Proxy Support

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-30 | Route requests through external proxy | P1 | Done |
| FR-31 | Toggle proxy mode via environment variable | P1 | Done |

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Session retrieval from KV | < 50ms |
| NFR-02 | Autonomous login completion | < 10s |
| NFR-03 | API response time (BHXH fetch) | < 5s |

### 5.2 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-10 | Session cache hit rate | > 90% |
| NFR-11 | CAPTCHA solving success rate | > 80% |
| NFR-12 | Worker uptime | 99.9% |

### 5.3 Security

| ID | Requirement |
|----|-------------|
| NFR-20 | Credentials stored as Cloudflare Secrets |
| NFR-21 | Sessions encrypted at rest in KV |
| NFR-22 | CORS enabled for authorized origins |
| NFR-23 | No credentials logged or exposed |

### 5.4 Scalability

| ID | Requirement |
|----|-------------|
| NFR-30 | Stateless worker design |
| NFR-31 | Edge deployment via Cloudflare |
| NFR-32 | No single point of failure |

## 6. API Specification

### 6.1 Health Check

```
GET /health

Response 200:
{
  "status": "ok",
  "service": "bhxh-proxy-worker",
  "timestamp": "2025-01-30T10:00:00.000Z"
}
```

### 6.2 Employee List

```
GET /employees

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
    "count": 10,
    "unit": "Don Vi 1"
  }
}
```

### 6.3 Session Status

```
GET /session/status

Response 200:
{
  "status": "active" | "expired",
  "expiresIn": 3600,
  "unit": "Don Vi 1"
}
```

### 6.4 Manual Login Flow

```
# Step 1: Get captcha
GET /login/captcha

Response 200:
{
  "success": true,
  "clientId": "550e8400-...",
  "xClient": "encrypted...",
  "captchaToken": "abc123...",
  "captchaImage": "base64...",
  "message": "Solve the captcha and POST to /login/token"
}

# Step 2: Submit solution
POST /login/token
Content-Type: application/json

{
  "clientId": "550e8400-...",
  "xClient": "encrypted...",
  "captchaToken": "abc123...",
  "captchaSolution": "XY12Z"
}

Response 200:
{
  "success": true,
  "token": "access_token...",
  "currentUnit": { "code": "TZH490L", "name": "Ten Don Vi" },
  "expiresIn": 3600
}
```

## 7. Technical Constraints

| Constraint | Description |
|------------|-------------|
| TC-01 | Must run on Cloudflare Workers |
| TC-02 | Must use native fetch() (no axios in worker) |
| TC-03 | Session TTL fixed at 1 hour |
| TC-04 | BHXH uses 4-character CAPTCHA (API workaround required) |
| TC-05 | Proxy required for some network environments |

## 8. Dependencies

### 8.1 External Services

| Service | Purpose | SLA |
|---------|---------|-----|
| dichvucong.baohiemxahoi.gov.vn | BHXH Portal | 99% |
| Finizi AI Core API | CAPTCHA Solving | 95% |
| External Proxy | Network routing | 99% |

### 8.2 Internal Dependencies

| Component | Version | Purpose |
|-----------|---------|---------|
| crypto-js | ^4.2.0 | AES encryption |
| @cloudflare/workers-types | ^4.20250129.0 | Type definitions |

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Session cache hit rate | > 90% | KV hits / total requests |
| CAPTCHA solve success | > 80% | Successful solves / attempts |
| API uptime | 99.9% | Worker availability |
| Mean response time | < 3s | Average /employees latency |

## 10. Acceptance Criteria

- [ ] Worker deploys successfully to Cloudflare
- [ ] Autonomous login completes without manual intervention
- [ ] Session cached in KV and reused across requests
- [ ] /employees endpoint returns employee data
- [ ] All lookup endpoints return reference data
- [ ] Manual login flow works when AI CAPTCHA fails
- [ ] Proxy mode routes traffic correctly
- [ ] Credentials not exposed in logs or responses

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| BHXH portal changes API | High | Monitor API docs, implement graceful degradation |
| AI CAPTCHA service unavailable | Medium | Implement fallback to manual login flow |
| Proxy server downtime | Medium | Allow proxy toggle, direct connection fallback |
| Session token expiration during request | Low | Implement retry with re-authentication |

## 12. References

- [Headless Login API Documentation](../api-docs/headless_login_docs.md)
- [Employee API Documentation](../api-docs/headless_employee_api_docs.md)
- [Wrangler Configuration](../wrangler.toml)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
