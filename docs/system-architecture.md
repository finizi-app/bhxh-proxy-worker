# BHXH API - System Architecture

## 1. High-Level Overview

The BHXH API is an Express server with tsoa that acts as a proxy between client applications and the Vietnam Social Insurance (BHXH) portal.

```
+------------------+     +-------------------+     +------------------+
|  Client App      | --> | Express Server    | --> |  BHXH Portal     |
|  (HR System,     |     | (bhxh-api)        |     |  dichvucong.     |
|   Payroll, etc.) | <-- |                   | <-- |  baohiemxahoi.gov|
+------------------+     +-------------------+     +------------------+
                                |
                                v
                         +-------------------+
                         |  In-Memory Cache  |
                         |  (Session Map)    |
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
     |  Client   | ----------------------> |  Express Server   |
     |  (curl,  |                         |  (Port 4000)      |
     |   App)   | <---------------------- |                   |
     +-----------+      HTTP Response      +-------------------+
                                                      |
                                                      v
                                             +------------------+
                                             |  API Key MW       |
                                             |  (Auth Layer)     |
                                             +------------------+
                                                      |
                                                      v
                                             +------------------+
                                             |  tsoa Router      |
                                             |  (Routes Gen)     |
                                             +------------------+
                                                      |
                                    +------------------+------------------+
                                    |                  |                  |
                                    v                  v                  v
                           +-------------+    +-------------+    +-------------+
                           |  Employees  |    |  Master     |    |  Session    |
                           |  Controller |    |  Data       |    |  Controller |
                           +-------------+    +-------------+    +-------------+
                                                      |
                                    +------------------+------------------+
                                    |                  |                  |
                                    v                  v                  v
                           +-------------+    +-------------+    +-------------+
                           |   Session   |    |   BHXH      |    |   AI       |
                           |   Service   |    |   Service   |    |   CAPTCHA   |
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

### 3.1 Express Server Layer

**Entry Point**: `src/local-server.ts` (99 lines)

**Responsibilities:**
- HTTP server configuration
- Middleware registration
- Swagger UI setup
- Request profiling
- Error handling

**Key Design Decisions:**
- Express 4.x for tsoa compatibility
- Built-in JSON body parser
- Request profiling for all non-Swagger routes
- Centralized error handling middleware

### 3.2 Authentication Layer

**Module**: `src/middleware/api-key.middleware.ts` (106 lines)

**Components:**
```
api-key.middleware.ts
├── parseApiKeys(keysStr) -> string[]
├── createApiKeyMiddleware(config) -> Express middleware
├── getValidApiKeys() -> string[]
└── isValidApiKey(apiKey) -> boolean
```

**Authentication Flow:**
1. Request arrives with `X-API-Key` header
2. Middleware checks if path is public (/, /docs, /swagger, /swagger.json)
3. If protected, validates API key against configured keys
4. Returns 401 if missing, 403 if invalid
5. Logs API key usage (truncated for security)

**Configuration:**
```typescript
interface ApiKeyConfig {
  keys: string[];           // From API_KEYS env var
  logUsage: boolean;        // Enable logging
  publicPaths: string[];    // Paths to skip validation
}
```

### 3.3 Controller Layer (tsoa)

**Directory**: `src/controllers/`

**Controllers:**
```
controllers/
├── health.controller.ts        # Health check endpoint
├── employees.controller.ts     # Employee endpoints (list, detail, update, sync, bulk upload)
├── session.controller.ts       # Session management endpoints
├── master-data.controller.ts   # Reference data endpoints
├── department.controller.ts    # Department CRUD endpoints
└── geographic.controller.ts    # Geographic data endpoints (districts)
```

**tsoa Decorators:**
```typescript
@Route("/api/v1/employees")
export class EmployeesController extends Controller {
  @Get("/")
  @SuccessResponse(200, "OK")
  public async getEmployees(
    @Query() username?: string,
    @Query() password?: string,
    @Query() PageIndex?: number,
    @Query() PageSize?: number
  ): Promise<EmployeeListResponse>
}
```

### 3.4 Service Layer

**Directory**: `src/services/`

**Services:**
```
services/
├── session.service.ts     # Session management, caching, login
├── bhxh.service.ts        # BHXH API client methods (employee, captcha, lookup, sync, detail)
├── department.service.ts  # Department CRUD operations
├── geographic.service.ts  # Geographic data lookups (districts)
└── proxy.service.ts       # Proxy configuration
```

**Session Service Structure:**
```typescript
// In-memory session cache per credentials
const sessionCache = Map<string, Session>();

export function getValidSession(
  username?: string,
  password?: string
): Promise<Session>

export function getSessionStatus(
  username?: string,
  password?: string
): Promise<SessionStatus>

export function refreshSession(
  username?: string,
  password?: string
): Promise<Session>

export function clearSession(
  username?: string,
  password?: string
): void
```

**Session Structure:**
```typescript
interface Session {
  token: string;              // OAuth access_token
  xClient: string;            // Encrypted client ID
  currentDonVi: DonVi;        // Current organizational unit
  expiresAt: number;          // Unix timestamp (ms)
}
```

**Session Lifecycle:**
1. Check in-memory Map for valid session (keyed by credentials)
2. If expired/missing, trigger autonomous login
3. Cache new session with 1-hour TTL
4. Return valid session for API calls

### 3.5 Model Layer

**Directory**: `src/models/`

**Models:**
```
models/
├── index.ts               # Centralized model exports
├── session.model.ts       # Session, DonVi, BhxhCredentials
├── employee.model.ts      # Employee, QueryParams, Detail, Update, Sync, BulkUpload types
├── department.model.ts    # Department, CRUD request/response types
├── geographic.model.ts    # District, Province, Ward types
├── master-data.model.ts   # Master data types
├── api-response.model.ts  # Standard API response wrappers
└── proxy.model.ts         # Proxy configuration types
```

### 3.6 Crypto Layer

**Module**: `src/crypto.ts` (existing)

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
                  (External API)

Step 5: Login
--------
Credentials + CAPTCHA ---> BHXH Token Endpoint ---> Access Token
                                                      + dsDonVi

Step 6: Cache Session
--------
Session ---> In-Memory Map ---> (expires in 1 hour)
Key: credentials hash
```

### 4.2 Employee Fetch Flow

```
1. Client requests /api/v1/employees with X-API-Key header
2. API Key middleware validates access
3. tsoa routes to EmployeesController.getEmployees()
4. Extract optional username/password from query params
5. Call getValidSession(username, password)
   - Check in-memory Map for cached session
   - Cache hit: Return cached session
   - Cache miss: Perform autonomous login
6. Call fetchEmployees(session, params)
7. Return employee list with metadata
```

### 4.3 Per-Request Credentials Flow

```
Request with credentials:
GET /api/v1/employees?username=user1@example.com&password=pass123

1. Create cache key: "user1@example.com:pas***"
2. Check Map for this specific key
3. If not found, perform login with THESE credentials
4. Cache session under this key
5. Future requests with same credentials reuse session

Request without credentials:
GET /api/v1/employees

1. Create cache key: "default"
2. Check Map for default key
3. If not found, perform login with .dev.vars credentials
4. Cache session under default key
```

## 5. API Endpoints

### 5.1 Route Mapping

| Path | Method | Controller | Auth Required |
|------|--------|------------|---------------|
| `/` | GET | HealthController | No |
| `/docs` | GET | Swagger UI | No |
| `/swagger.json` | GET | Swagger Spec | No |
| `/api/v1/employees` | GET | EmployeesController | API Key |
| `/api/v1/employees/{employeeId}` | GET | EmployeesController | API Key |
| `/api/v1/employees/{employeeId}/sync` | GET | EmployeesController | API Key |
| `/api/v1/employees/{employeeId}` | PUT | EmployeesController | API Key |
| `/api/v1/employees/upload` | POST | EmployeesController | API Key |
| `/api/v1/geographic/districts` | GET | GeographicController | API Key |
| `/api/v1/departments` | GET | DepartmentController | API Key |
| `/api/v1/departments` | POST | DepartmentController | API Key |
| `/api/v1/departments/{id}` | GET | DepartmentController | API Key |
| `/api/v1/departments/{id}` | PUT | DepartmentController | API Key |
| `/api/v1/departments/{id}` | DELETE | DepartmentController | API Key |
| `/api/v1/session/status` | GET | SessionController | API Key |
| `/api/v1/session/refresh` | POST | SessionController | API Key |
| `/api/v1/master-data/paper-types` | GET | MasterDataController | API Key |
| `/api/v1/master-data/countries` | GET | MasterDataController | API Key |
| `/api/v1/master-data/ethnicities` | GET | MasterDataController | API Key |
| `/api/v1/master-data/labor-plan-types` | GET | MasterDataController | API Key |
| `/api/v1/master-data/benefits` | GET | MasterDataController | API Key |
| `/api/v1/master-data/relationships` | GET | MasterDataController | API Key |

### 5.2 Request/Response Patterns

**Health Check:**
```typescript
// Request
GET /

// Response
{
  "service": "bhxh-api",
  "version": "1.0.0",
  "docs": "/docs",
  "status": "ok"
}
```

**Employee List:**
```typescript
// Request
GET /api/v1/employees?PageSize=10
Headers: X-API-Key: sk_test_abc123

// Response
{
  "success": true,
  "data": [...],
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

**Master Data:**
```typescript
// Request
GET /api/v1/master-data/countries
Headers: X-API-Key: sk_test_abc123

// Response
{
  "success": true,
  "data": [
    { "Ma": "VN", "Ten": "Viet Nam" },
    { "Ma": "US", "Ten": "United States" }
  ]
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

interface BhxhCredentials {
    username: string;
    password: string;
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

### 7.1 Server Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| Runtime | Node.js 18+ | JavaScript runtime |
| Framework | Express 4.x | HTTP server |
| Port | 4000 | Default port |
| Host | 0.0.0.0 | Listen on all interfaces |

### 7.2 Session Cache

| Type | Description |
|------|-------------|
| Storage | In-memory Map |
| Key | Credentials hash (username:password prefix) |
| TTL | 1 hour (3600 seconds) |
| Scope | Per-process (not shared across instances) |

### 7.3 Environment Variables

**Required:**
- `API_KEYS` - Comma-separated valid API keys

**Optional (with defaults):**
- `BHXH_USERNAME` - Fallback BHXH username
- `BHXH_PASSWORD` - Fallback BHXH password
- `BHXH_ENCRYPTION_KEY` - AES encryption key
- `BHXH_BASE_URL` - BHXH portal URL
- `AI_CAPTCHA_ENDPOINT` - AI CAPTCHA solver endpoint
- `AI_CAPTCHA_API_KEY` - AI API key
- `USE_PROXY` - Enable proxy routing
- `EXTERNAL_PROXY_URL` - Proxy server URL
- `EXTERNAL_PROXY_USERNAME` - Proxy auth username
- `EXTERNAL_PROXY_PASSWORD` - Proxy auth password
- `HOST` - Server host
- `PORT` - Server port

## 8. Security Architecture

### 8.1 Authentication Flow

```
1. Client includes X-API-Key header
2. API Key middleware validates key
3. If valid, request proceeds to controller
4. Controller extracts optional BHXH credentials
5. Session service gets/creates session for those credentials
6. BHXH API calls made with session token
```

### 8.2 Data Protection

| Data | Protection |
|------|------------|
| API Keys | Environment variable, never logged in full |
| BHXH Credentials | Query params (HTTPS), logged with truncation |
| Session Token | In-memory Map with TTL |
| X-CLIENT | AES encryption with URL-safe encoding |
| Proxy Auth | Environment variable, https-proxy-agent |

### 8.3 Attack Surface

- **Input Validation**: All query parameters validated via tsoa
- **API Key Throttling**: Log usage (implement rate limiting as needed)
- **CORS**: Configure for specific origins in production
- **Logging**: No sensitive data (passwords) logged in full

## 9. Performance Characteristics

### 9.1 Latency Targets

| Operation | Target | 95th Percentile |
|-----------|--------|-----------------|
| Session cache hit | < 10ms | < 20ms |
| Autonomous login | < 10s | < 15s |
| Employee fetch | < 5s | < 8s |
| Lookup API | < 3s | < 5s |

### 9.2 Scalability

- **Stateful Design**: In-memory cache not shared across instances
- **Horizontal Scaling**: Requires sticky sessions or external cache (Redis)
- **Multi-Tenant**: Per-request credentials enable isolated sessions

## 10. Failure Modes

| Scenario | Impact | Recovery |
|----------|--------|----------|
| BHXH portal unavailable | All requests fail | Manual intervention |
| AI CAPTCHA fails | Login fails | Implement manual login flow |
| Server restart | Session cache lost | Auto-login on next request |
| Proxy down | Requests fail | Toggle proxy off |
| Token expired | API calls fail | Auto-refresh on next request |

## 11. Monitoring Points

### 11.1 Logging

```typescript
// Session operations
console.log(`Using cached session for ${cacheKey.substring(0, 10)}...`);
console.log(`Session expired or missing, need to refresh`);

// Login flow
console.log("1. Fetching Client ID...");
console.log("2. Fetching Captcha...");
console.log("3. Solving Captcha via AI...");
console.log("4. Logging in...");

// Request profiling
console.log(`[PROFILE] ${req.method} ${req.path} - ${duration}ms`);

// API Key usage
console.log(`[API_KEY] ${keyPreview}... -> ${req.method} ${req.path}`);
```

### 11.2 Metrics

| Metric | Source |
|--------|--------|
| Request latency | Built-in profiler |
| Session cache hit rate | Session service logs |
| Login success rate | performLogin() results |
| CAPTCHA solve rate | solveCaptcha() results |

## 12. Related Documentation

- [Project Overview & PDR](./project-overview-pdr.md)
- [Codebase Summary](./codebase-summary.md)
- [Code Standards](./code-standards.md)
- [Deployment Guide](./deployment-guide.md)
- [API Reference](./api-reference.md)
