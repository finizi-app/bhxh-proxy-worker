# BHXH Proxy Worker - System Architecture

## 1. High-Level Overview

The BHXH Proxy Worker is a serverless application deployed on Cloudflare Workers that acts as a proxy between client applications and the Vietnam Social Insurance (BHXH) portal.

```
+------------------+     +-------------------+     +------------------+
|  Client App      | --> | Cloudflare Worker | --> |  BHXH Portal     |
|  (HR System,     |     | (bhxh-proxy)      |     |  dichvucong.     |
|   Payroll, etc.) | <-- |                   | <-- |  baohiemxahoi.gov|
+------------------+     +-------------------+     +------------------+
                                |
                                v
                         +-------------------+
                         |  KV Namespace     |
                         |  (Session Cache)  |
                         +-------------------+
                                |
                                v
                         +-------------------+
                         |  AI Core API      |
                         |  (CAPTCHA Solver) |
                         +-------------------+
```

## 2. Architecture Diagram

```
                                    Request Flow
                                    ============

     +-----------+      HTTP Request       +-------------------+
     |  Client   | ----------------------> |  Cloudflare Edge  |
     |  (curl,  |                         |  (Global Network) |
     |   App)   | <---------------------- |                   |
     +-----------+      HTTP Response      +-------------------+
                                                      |
                                                      v
                                             +------------------+
                                             |  Worker Handler  |
                                             |  (index.ts)      |
                                             +------------------+
                                                      |
                                    +------------------+------------------+
                                    |                  |                  |
                                    v                  v                  v
                           +-------------+    +-------------+    +-------------+
                           |  CORS       |    |  Route      |    |  Error      |
                           |  Headers    |    |  Matching   |    |  Handler    |
                           +-------------+    +-------------+    +-------------+
                                                      |
                                    +------------------+------------------+
                                    |                  |                  |
                                    v                  v                  v
                           +-------------+    +-------------+    +-------------+
                           |  /health    |    | /employees  |    | /login/*    |
                           +-------------+    +-------------+    +-------------+
                                                      |
                                                      v
                                    +------------------+------------------+
                                    |                  |                  |
                                    v                  v                  v
                           +-------------+    +-------------+    +-------------+
                           |   KV Cache  |    |   BHXH      |    |   AI CAPTCHA|
                           |   Check     |    |   Client    |    |   Solver    |
                           +-------------+    +-------------+    +-------------+
                                                      |
                                                      v
                                             +------------------+
                                             |  BHXH API Calls  |
                                             |  - OAuth2        |
                                             |  - Login         |
                                             |  - Employee API  |
                                             |  - Lookup API    |
                                             +------------------+
```

## 3. Component Architecture

### 3.1 Cloudflare Worker Layer

**Entry Point**: `src/index.ts` (351 lines)

**Responsibilities:**
- HTTP request routing
- CORS header injection
- Request/response transformation
- Error handling and response formatting

**Key Design Decisions:**
- Single export using Cloudflare Workers `ExportedHandler` pattern
- Switch-case routing for clear endpoint mapping
- All responses include CORS headers (configurable per environment)

### 3.2 Authentication Layer

**Module**: `src/auth.ts` (206 lines)

**Components:**
```
auth.ts
├── getSession(env) -> Session | null
├── saveSession(env, session)
├── solveCaptcha(image, endpoint, apiKey) -> string
├── performLogin(env) -> Session
└── getValidSession(env) -> Session
```

**Session Structure:**
```typescript
interface Session {
    token: string;              // OAuth access token from BHXH
    xClient: string;            // Encrypted client ID for API calls
    currentDonVi: DonVi;        // Current organizational unit
    expiresAt: number;          // Cache expiration timestamp
}
```

**Session Lifecycle:**
1. Check KV cache for valid session
2. If expired/missing, trigger autonomous login
3. Cache new session with 1-hour TTL
4. Return valid session for API calls

### 3.3 BHXH API Client Layer

**Module**: `src/bhxh-client.ts` (275 lines)

**Class Structure:**
```
BHXHClient
├── constructor(baseUrl, proxyUrl)
├── getClientId() -> string
├── getCaptcha(xClient) -> CaptchaResponse
├── login(username, password, captcha, token, clientId) -> LoginResponse
├── callApi<T>(code, data, token, xClient) -> T
├── fetchEmployees(session, pageIndex, pageSize) -> EmployeeListResponse
└── fetchLookupData(session, code) -> any
```

**Proxy Support:**
- Optional proxy URL passed to constructor
- All requests routed through proxy when configured
- Format: `POST {proxyUrl}/proxy?url={encodedTargetUrl}`

### 3.4 Crypto Layer

**Module**: `src/crypto.ts` (16 lines)

**Encryption Logic:**
```typescript
function encryptXClient(clientId: string, encryptionKey: string): string {
    const payload = JSON.stringify(clientId);
    const encrypted = CryptoJS.AES.encrypt(payload, encryptionKey).toString();
    return encrypted.replace(/\+/g, "teca");  // URL-safe transformation
}
```

## 4. Data Flow

### 4.1 Autonomous Login Flow

```
Step 1: Get Client ID
--------
Client ---> BHXH OAuth2 ---> GetClientId
                           <--- 550e8400-... (GUID)

Step 2: Encrypt Client ID
--------
Client ID ---> encryptXClient() ---> X-CLIENT header
              (AES + 'teca' replace)

Step 3: Get CAPTCHA
--------
X-CLIENT ---> BHXH API ---> getCaptchaImage
                              <--- { image: base64, code: token }

Step 4: Solve CAPTCHA
--------
base64 image ---> AI Core API ---> Captcha solution
                  (Gemini/OpenAI)

Step 5: Login
--------
Credentials + CAPTCHA ---> BHXH Token Endpoint ---> Access Token
                                                      + dsDonVi

Step 6: Cache Session
--------
Session ---> KV Namespace ---> (expires in 1 hour)
```

### 4.2 Employee Fetch Flow

```
1. Client requests /employees
2. Worker checks KV cache
   - Cache Hit: Go to step 5
   - Cache Miss: Go to step 3
3. Trigger autonomous login
   - Get Client ID
   - Get CAPTCHA
   - Solve via AI
   - Login to BHXH
   - Cache session
4. Extract currentDonVi from session
5. Call fetchEmployees API (Code 067)
6. Return employee list with metadata
```

## 5. API Endpoints

### 5.1 Route Mapping

| Path | Method | Handler | Auth Required |
|------|--------|---------|---------------|
| `/health` | GET | handleHealth | No |
| `/employees` | GET | handleEmployees | Yes |
| `/session/status` | GET | handleSessionStatus | No |
| `/session/refresh` | GET | handleSessionRefresh | No |
| `/login/captcha` | GET | handleLoginCaptcha | No |
| `/login/token` | POST | handleLoginToken | No |
| `/lookup/*` | GET | handleLookup | Yes |

### 5.2 Request/Response Patterns

**Health Check:**
```typescript
// Request
GET /health

// Response
{
  "status": "ok",
  "service": "bhxh-proxy-worker",
  "timestamp": "2025-01-30T10:00:00.000Z"
}
```

**Employee List:**
```typescript
// Request
GET /employees

// Response
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "count": 10,
    "unit": "Don Vi 1"
  }
}
```

## 6. Data Models

### 6.1 Session Data

```typescript
interface Session {
    token: string;              // OAuth access_token
    xClient: string;            // Encrypted client ID
    currentDonVi: DonVi;        // Current organization unit
    expiresAt: number;          // Unix timestamp (ms)
}

interface DonVi {
    Ma: string;                 // Unit code
    Ten?: string;               // Unit name (Vietnamese)
    TenDonVi?: string;          // Alternative name field
    MaCoquan: string;           // Authority code
    MaSoBHXH?: string;          // BHXH number
    MaDonVi?: string;           // Department code
    LoaiDoiTuong?: string;      // Object type (usually "1")
}
```

### 6.2 Employee Data

```typescript
interface Employee {
    id: number;
    Hoten: string;              // Full name
    Masobhxh: string;           // BHXH number
    chucVu?: string;            // Position
    mucLuong?: number;          // Salary
    tinhTrang?: string;         // Status
    Ngaysinh?: string;          // Birth date
    Gioitinh?: number;          // Gender (1=M, 2=F)
    soCMND?: string;            // ID number
    maPhongBan?: string;        // Department code
    noiDKKCB?: string;          // Healthcare facility
    diaChiNN?: string;          // Permanent address
    diaChi_dangSS?: string;     // Current address
}
```

## 7. Infrastructure

### 7.1 Cloudflare Workers

| Setting | Value |
|---------|-------|
| Runtime | WebStandard |
| Compatibility | 2024-12-01 |
| Compatibility Flags | nodejs_compat |
| Memory | 128 MB default |

### 7.2 KV Namespace

| Binding | ID | Purpose |
|---------|-----|---------|
| BHXH_SESSION | 2c3dacd3... | Session token caching |

### 7.3 Environment Variables

**Secrets (via `wrangler secret put`):**
- `BHXH_USERNAME` - Portal username
- `BHXH_PASSWORD` - Portal password
- `BHXH_ENCRYPTION_KEY` - AES encryption key
- `AI_CAPTCHA_ENDPOINT` - AI API endpoint
- `AI_CAPTCHA_API_KEY` - AI API key (optional)

**Vars (in wrangler.toml):**
- `BHXH_BASE_URL` - BHXH portal base URL
- `USE_PROXY` - Enable proxy routing
- `EXTERNAL_PROXY_URL` - Proxy server URL

## 8. Security Architecture

### 8.1 Authentication Flow

```
1. Client requests protected resource
2. Worker validates cached session
3. If invalid, triggers autonomous login
4. Login uses encrypted credentials
5. Session cached with TTL
```

### 8.2 Data Protection

| Data | Protection |
|------|------------|
| Credentials | Cloudflare Secrets (encrypted at rest) |
| Session Token | KV namespace with TTL |
| X-CLIENT | AES encryption with URL-safe encoding |
| CORS | Configurable origin policy |

### 8.3 Attack Surface

- **Input Validation**: All request parameters validated
- **CORS**: Proper origin checking
- **Rate Limiting**: Cloudflare handles automatically
- **Logging**: No sensitive data in logs

## 9. Performance Characteristics

### 9.1 Latency Targets

| Operation | Target | 95th Percentile |
|-----------|--------|-----------------|
| Session cache hit | < 50ms | < 100ms |
| Autonomous login | < 10s | < 15s |
| Employee fetch | < 5s | < 8s |
| Lookup API | < 3s | < 5s |

### 9.2 Scalability

- **Edge Deployment**: Global distribution via Cloudflare
- **Stateless**: No local state, scales horizontally
- **KV Caching**: Reduces BHXH portal load

## 10. Failure Modes

| Scenario | Impact | Recovery |
|----------|--------|----------|
| BHXH portal unavailable | All requests fail | Manual intervention |
| AI CAPTCHA fails | Login fails | Fallback to manual login flow |
| KV unavailable | Session cache miss | Perform fresh login |
| Proxy down | Requests fail | Toggle proxy off |
| Token expired | API calls fail | Auto-refresh on next request |

## 11. Monitoring Points

### 11.1 Logging

```typescript
// Session operations
console.log("Using cached session, expires at:", new Date(expiresAt));
console.log("Session expired or missing, need to refresh");

// Login flow
console.log("1. Fetching Client ID...");
console.log("2. Fetching Captcha...");
console.log("3. Solving Captcha via AI...");
console.log("4. Logging in...");

// Errors
console.error("Worker error:", error);
console.error(`Lookup failed for code ${code}:`, error);
```

### 11.2 Metrics

| Metric | Source |
|--------|--------|
| Session cache hit rate | KV operations |
| Login success rate | performLogin() results |
| CAPTCHA solve rate | solveCaptcha() results |
| Response times | Worker execution time |

## 12. Related Documentation

- [Project Overview & PDR](./project-overview-pdr.md)
- [Codebase Summary](./codebase-summary.md)
- [Code Standards](./code-standards.md)
- [Deployment Guide](./deployment-guide.md)
- [API Documentation](../api-docs/)
