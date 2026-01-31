# BHXH API - Codebase Summary

## Overview

This document provides a high-level summary of the BHXH API codebase, an Express server with tsoa that proxies the Vietnam Social Insurance (BHXH) portal with autonomous CAPTCHA solving capabilities.

## Project Statistics

| Metric | Value |
|--------|-------|
| Architecture | Express + tsoa |
| Language | TypeScript |
| Entry Point | `src/local-server.ts` |
| Default Port | 4000 |
| API Docs | `/docs` (Swagger UI) |

## Directory Structure

```
bhxh-api/
├── src/
│   ├── local-server.ts          # Express server entry point
│   ├── crypto.ts                 # AES encryption utilities
│   ├── bhxh-types.ts             # BHXH API type definitions
│   ├── bhxh-http-utils.ts        # HTTP utility functions
│   ├── controllers/              # tsoa REST controllers
│   │   ├── health.controller.ts
│   │   ├── employees.controller.ts
│   │   ├── session.controller.ts
│   │   └── master-data.controller.ts
│   ├── services/                 # Business logic layer
│   │   ├── session.service.ts
│   │   ├── bhxh.service.ts
│   │   └── proxy.service.ts
│   ├── models/                   # TypeScript interfaces
│   │   ├── api-response.model.ts
│   │   ├── proxy.model.ts
│   │   ├── master-data.model.ts
│   │   ├── session.model.ts
│   │   └── employee.model.ts
│   ├── middleware/               # Express middleware
│   │   └── api-key.middleware.ts
│   └── generated/                # tsoa auto-generated
│       ├── routes.ts
│       └── swagger.json
├── api-docs/                     # BHXH API documentation
├── docs/                         # Project documentation
├── .dev.vars                     # Environment variables (local)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tsoa.json                     # tsoa configuration
└── tsx.config.js                 # tsx configuration
```

## Source Code Summary

### Core Modules

| File | Lines | Purpose |
|------|-------|---------|
| `src/local-server.ts` | 99 | Express server setup, middleware, Swagger UI |
| `src/middleware/api-key.middleware.ts` | 106 | API key authentication middleware |
| `src/services/session.service.ts` | 266 | Session management, in-memory caching, login |
| `src/services/bhxh.service.ts` | ~200 | BHXH API client methods |
| `src/services/proxy.service.ts` | 66 | Proxy configuration with Basic auth |
| `src/controllers/employees.controller.ts` | 84 | Employee data endpoints |
| `src/controllers/session.controller.ts` | ~60 | Session management endpoints |
| `src/controllers/master-data.controller.ts` | 200 | Reference data endpoints |
| `src/controllers/health.controller.ts` | ~20 | Health check endpoint |

### Total Source Code

- **TypeScript files**: 18+
- **Total lines**: ~1200 lines

## Key Components

### 1. Express Server Layer (`src/local-server.ts`)

**Responsibilities:**
- HTTP server configuration
- Middleware registration (JSON parser, API key auth)
- Swagger UI setup at `/docs`
- Request profiling middleware
- Error handling middleware

**Key Functions:**
- `profileRequest()` - Logs request duration
- Error handler middleware - Catches unhandled errors

**Configuration:**
- Host: `0.0.0.0` (configurable via `HOST`)
- Port: `4000` (configurable via `PORT`)

### 2. Authentication Layer (`src/middleware/api-key.middleware.ts`)

**Responsibilities:**
- API key validation via `X-API-Key` header
- Public path bypass (/, /docs, /swagger, /swagger.json)
- API key usage logging

**Key Functions:**
- `parseApiKeys()` - Parse comma-separated API keys from env
- `createApiKeyMiddleware()` - Create Express middleware
- `isValidApiKey()` - Validate a single API key

**Public Paths:**
- `/` - Health check
- `/docs` - Swagger UI
- `/swagger` - Swagger UI alternate
- `/swagger.json` - OpenAPI specification

**Authentication Logic:**
```typescript
// Missing X-API-Key header -> 401 Unauthorized
// Invalid X-API-Key header -> 403 Forbidden
// Valid X-API-Key header -> Proceed to controller
```

### 3. Controller Layer (`src/controllers/`)

**Responsibilities:**
- Define REST endpoints via tsoa decorators
- Extract query parameters
- Call service layer
- Handle errors and format responses

**Controllers:**

| Controller | Endpoints | Purpose |
|------------|-----------|---------|
| `HealthController` | `GET /` | Health check |
| `EmployeesController` | `GET /api/v1/employees` | Fetch employee list |
| `SessionController` | `GET /api/v1/session/status`, `POST /api/v1/session/refresh` | Session management |
| `MasterDataController` | 6 endpoints under `/api/v1/master-data/*` | Reference data |

**tsoa Decorators:**
```typescript
@Route("/api/v1/employees")
export class EmployeesController extends Controller {
  @Get("/")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed")
  public async getEmployees(
    @Query() username?: string,
    @Query() password?: string,
    @Query() PageIndex?: number,
    @Query() PageSize?: number
  ): Promise<EmployeeListResponse>
}
```

### 4. Service Layer (`src/services/`)

#### Session Service (`src/services/session.service.ts`)

**Responsibilities:**
- In-memory session caching (Map)
- Autonomous login flow
- Session validation and refresh
- Multi-tenant session management

**Key Functions:**
- `getValidSession()` - Get cached or create new session
- `getSessionStatus()` - Check session without refresh
- `refreshSession()` - Force session refresh
- `clearSession()` - Clear specific session
- `clearAllSessions()` - Clear all cached sessions
- `performLogin()` - Execute full login flow with CAPTCHA

**Session Cache:**
```typescript
const sessionCache = Map<string, Session>();

// Cache key format
function createCacheKey(username?: string, password?: string): string {
  if (username && password) {
    return `${username}:${password.substring(0, 3)}***`;
  }
  return "default";
}
```

#### BHXH Service (`src/services/bhxh.service.ts`)

**Responsibilities:**
- HTTP calls to BHXH API
- CAPTCHA handling
- OAuth token management
- Employee data fetching
- Master data lookups

**Key Functions:**
- `getClientId()` - Fetch OAuth client ID
- `getCaptcha()` - Fetch CAPTCHA image and token
- `solveCaptcha()` - Call AI CAPTCHA solver
- `login()` - Exchange credentials for access token
- `lookup()` - Generic lookup API call
- `fetchEmployees()` - Fetch employee list
- `encryptXClient()` - AES encryption for X-CLIENT header

#### Proxy Service (`src/services/proxy.service.ts`)

**Responsibilities:**
- Configure HTTPS proxy agent
- Basic authentication support
- Proxy toggle via environment

**Key Functions:**
- `getHttpsAgent()` - Get configured HttpsProxyAgent
- `createAxios()` - Create axios instance with proxy
- `getProxyConfig()` - Get current proxy config

**Proxy Authentication:**
```typescript
// Uses EXTERNAL_PROXY_USERNAME and EXTERNAL_PROXY_PASSWORD
const auth = username && password
  ? `${username}:${password}@`
  : "";
const proxyFullUrl = `http://${auth}${proxyUrl.host}`;
```

### 5. Model Layer (`src/models/`)

**Models:**

| Model | Purpose |
|-------|---------|
| `session.model.ts` | Session, DonVi, BhxhCredentials interfaces |
| `employee.model.ts` | Employee, EmployeesQueryParams, EmployeeListResponse |
| `master-data.model.ts` | PaperType, Country, Ethnicity, LaborPlanType, Benefit, Relationship |
| `api-response.model.ts` | Standard API response wrappers (success/error) |
| `proxy.model.ts` | ProxyConfig, ProxyCredentials interfaces |

### 6. Crypto Module (`src/crypto.ts`)

**Responsibilities:**
- AES encryption for X-CLIENT header
- URL-safe encoding (replace '+' with 'teca')

**Key Function:**
```typescript
function encryptXClient(clientId: string, encryptionKey: string): string {
  const payload = JSON.stringify(clientId);
  const encrypted = CryptoJS.AES.encrypt(payload, encryptionKey).toString();
  return encrypted.replace(/\+/g, "teca");
}
```

## API Flow

### Autonomous Login Flow
```
1. Check in-memory Map for valid session (keyed by credentials)
2. If expired/missing:
   a. Get Client ID from /oauth2/GetClientId
   b. Encrypt Client ID to X-CLIENT
   c. Get CAPTCHA from /api/getCaptchaImage
   d. Solve CAPTCHA via external AI API
   e. Login to /token with credentials
   f. Cache session in Map (1 hour TTL)
3. Use session token for API calls
```

### Request Flow
```
Client Request
    |
    v
Express Server (local-server.ts)
    |
    v
API Key Middleware (api-key.middleware.ts)
    |
    +---> Public path? ---> Bypass auth
    |
    +---> Protected path ---> Validate X-API-Key
    |                         |
    |                         +---> Missing key ---> 401
    |                         +---> Invalid key ---> 403
    |                         +---> Valid key ---> Proceed
    |
    v
tsoa Router (generated/routes.ts)
    |
    v
Controller Method
    |
    v
Service Layer (session.service.ts, bhxh.service.ts)
    |
    +---> Check in-memory Map for session
    |
    +---> Cache Miss? ---> performLogin() ---> Cache to Map
    |
    v
BHXH API Call
    |
    v
Response (JSON)
```

## Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.22.1 | HTTP server framework |
| `tsoa` | ^6.6.0 | OpenAPI/Swagger integration |
| `swagger-ui-express` | ^5.0.1 | Swagger UI |
| `axios` | ^1.13.4 | HTTP client |
| `crypto-js` | ^4.2.0 | AES encryption |
| `https-proxy-agent` | ^7.0.6 | HTTPS proxy support |
| `dotenv` | ^17.2.3 | Environment configuration |
| `undici` | ^5.29.0 | Fetch API polyfill |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.7.0 | TypeScript compiler |
| `tsx` | ^4.21.0 | TypeScript execution |
| `@types/express` | ^5.0.6 | Express type definitions |
| `@types/node` | ^25.1.0 | Node.js type definitions |
| `vitest` | ^4.0.18 | Testing framework |
| `@apidevtools/swagger-cli` | ^4.0.4 | Swagger validation |

## Configuration Files

### package.json

```json
{
  "name": "bhxh-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "npx tsx src/local-server.ts",
    "swagger": "tsoa spec",
    "routes": "tsoa routes",
    "test": "vitest"
  }
}
```

### tsoa.json

```json
{
  "entryFile": "src/local-server.ts",
  "controllerPathGlobs": ["src/controllers/*controller.ts"],
  "spec": {
    "outputDirectory": "./src/generated",
    "specFileBaseName": "swagger"
  },
  "routes": {
    "routesDir": "./src/generated",
    "routesFileName": "routes.ts"
  }
}
```

### tsconfig.json

- Target: ES2022
- Module: ESNext
- Experimental decorators: enabled
- Strict mode: enabled

## Environment Configuration

### Required Variables

| Variable | Description |
|----------|-------------|
| `API_KEYS` | Comma-separated API keys |

### Optional Variables (with defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `BHXH_USERNAME` | - | Fallback BHXH username |
| `BHXH_PASSWORD` | - | Fallback BHXH password |
| `BHXH_ENCRYPTION_KEY` | `S6|d'qc1GG,'rx&xn0XC` | AES encryption key |
| `BHXH_BASE_URL` | `https://dichvucong.baohiemxahoi.gov.vn` | BHXH portal URL |
| `AI_CAPTCHA_ENDPOINT` | - | AI CAPTCHA solver endpoint |
| `AI_CAPTCHA_API_KEY` | - | AI API key |
| `USE_PROXY` | `false` | Enable proxy |
| `EXTERNAL_PROXY_URL` | - | Proxy server URL |
| `EXTERNAL_PROXY_USERNAME` | - | Proxy auth username |
| `EXTERNAL_PROXY_PASSWORD` | - | Proxy auth password |
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `4000` | Server port |

## Build & Development

### Commands

```bash
npm run dev        # Start development server on port 4000
npm run swagger    # Generate OpenAPI spec
npm run routes     # Generate tsoa routes
npm test           # Run tests
```

## Security Notes

- API keys stored as environment variables (never in code)
- Session data cached in-memory with TTL (not persisted)
- Per-request credentials enable multi-tenant isolation
- Proxy authentication via Basic auth
- No logging of sensitive data (passwords truncated)

## Related Documentation

- [Project Overview & PDR](./project-overview-pdr.md)
- [System Architecture](./system-architecture.md)
- [Code Standards](./code-standards.md)
- [Deployment Guide](./deployment-guide.md)
- [API Reference](./api-reference.md)
