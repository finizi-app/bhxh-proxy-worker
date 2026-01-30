# BHXH Proxy Worker - Codebase Summary

## Overview

This document provides a high-level summary of the BHXH Proxy Worker codebase, generated from the repomix output.

## Project Statistics

| Metric | Value |
|--------|-------|
| Total Files | 63 files |
| Total Tokens | 755,495 tokens |
| Total Characters | 2,112,076 chars |

## Directory Structure

```
bhxh-proxy-worker/
├── .wrangler/                 # Cloudflare Worker build artifacts
├── api-docs/                   # BHXH API documentation
│   ├── headless_login_docs.md
│   ├── headless_employee_api_docs.md
│   └── ... (other API docs)
├── external-proxy/            # External proxy configuration
├── node_modules/              # Dependencies
├── plans/                     # Planning documents
├── src/                       # Source code (main implementation)
│   ├── index.ts              # Main entry point
│   ├── auth.ts               # Authentication & session management
│   ├── bhxh-client.ts        # BHXH API client
│   └── crypto.ts             # Encryption utilities
├── .claude/                   # Claude Code configuration
├── docs/                      # Project documentation
├── wrangler.toml             # Cloudflare Worker config
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config
```

## Source Code Summary

### Core Modules

| File | Lines | Purpose |
|------|-------|---------|
| `src/index.ts` | 351 | Main worker entry point, route handlers, endpoint implementations |
| `src/auth.ts` | 206 | Session management, CAPTCHA solving, autonomous login |
| `src/bhxh-client.ts` | 275 | BHXH API client with HTTP calls and proxy support |
| `src/crypto.ts` | 16 | AES encryption for X-CLIENT header |

### Total Source Code

- **TypeScript files**: 4
- **Total lines**: ~850 lines

## Key Components

### 1. Main Entry Point (`src/index.ts`)

**Responsibilities:**
- HTTP request routing via switch statement
- CORS header management
- Error handling and response formatting
- Endpoint implementations

**Key Functions:**
- `handleEmployees()` - Fetch employee list
- `handleSessionStatus()` - Check cached session
- `handleSessionRefresh()` - Force session refresh
- `handleLoginCaptcha()` - Get captcha for manual login
- `handleLoginToken()` - Exchange captcha for token
- `handleLookup()` - Generic lookup data fetcher

### 2. Authentication Module (`src/auth.ts`)

**Responsibilities:**
- KV session caching
- Autonomous login flow
- CAPTCHA solving via AI API
- Session validation and refresh

**Key Functions:**
- `getSession()` - Retrieve from KV cache
- `saveSession()` - Store in KV cache
- `solveCaptcha()` - Call AI CAPTCHA solver
- `performLogin()` - Execute full login flow
- `getValidSession()` - Get cached or fresh session

**Environment Variables:**
```typescript
interface Env {
    BHXH_SESSION: KVNamespace;
    BHXH_BASE_URL: string;
    BHXH_USERNAME: string;
    BHXH_PASSWORD: string;
    BHXH_ENCRYPTION_KEY: string;
    AI_CAPTCHA_ENDPOINT: string;
    EXTERNAL_PROXY_URL?: string;
    USE_PROXY?: string;
    AI_CAPTCHA_API_KEY?: string;
}
```

### 3. BHXH Client (`src/bhxh-client.ts`)

**Responsibilities:**
- HTTP requests to BHXH API
- Proxy routing support
- Generic API call wrapper
- Type definitions for responses

**Key Classes:**
- `BHXHClient` - Main client with baseUrl and proxyUrl
- Methods: `getClientId()`, `getCaptcha()`, `login()`, `callApi()`, `fetchEmployees()`, `fetchLookupData()`

**Type Definitions:**
```typescript
interface Session {
    token: string;
    xClient: string;
    currentDonVi: DonVi;
    expiresAt: number;
}

interface DonVi {
    Ma: string;
    Ten?: string;
    TenDonVi?: string;
    MaCoquan: string;
    MaSoBHXH?: string;
    MaDonVi?: string;
    LoaiDoiTuong?: string;
}

interface Employee {
    id: number;
    Hoten: string;
    Masobhxh: string;
    // ... additional fields
}
```

### 4. Crypto Module (`src/crypto.ts`)

**Responsibilities:**
- AES encryption for X-CLIENT header
- BHXH-specific encryption format (replace '+' with 'teca')

**Key Function:**
- `encryptXClient(clientId, encryptionKey)` - Returns URL-safe encrypted string

## API Flow

### Autonomous Login Flow
```
1. Check KV cache for valid session
2. If expired/missing:
   a. Get Client ID from /oauth2/GetClientId
   b. Encrypt Client ID to X-CLIENT
   c. Get CAPTCHA from /api/getCaptchaImage
   d. Solve CAPTCHA via AI Core API
   e. Login to /token with credentials
   f. Cache session in KV (1 hour TTL)
3. Use session token for API calls
```

### Request Flow
```
Client Request
    |
    v
Cloudflare Worker
    |
    v
Route Matching (index.ts switch)
    |
    v
Handler Function
    |
    v
getValidSession() [auth.ts]
    |
    +---> KV Cache Hit? ---> Return cached session
    |
    +---> KV Cache Miss ---> performLogin() ---> Cache to KV
    |
    v
BHXH API Call [bhxh-client.ts]
    |
    v
Response (JSON)
```

## Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| crypto-js | ^4.2.0 | AES encryption |
| axios | ^1.13.4 | HTTP client (for external scripts) |
| undici | ^7.19.2 | Fetch polyfill |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @cloudflare/workers-types | ^4.20250129.0 | TypeScript types |
| typescript | ^5.7.0 | TypeScript compiler |
| wrangler | ^4.0.0 | Cloudflare CLI |

## Configuration Files

### wrangler.toml

```toml
name = "bhxh-proxy-worker"
main = "src/index.ts"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[[kv_namespaces]]
binding = "BHXH_SESSION"
id = "2c3dacd3163f4dda97eac85c82324f0d"
preview_id = "ff7eea72287f4f8eb7c640d4c4818072"

[vars]
BHXH_BASE_URL = "https://dichvucong.baohiemxahoi.gov.vn"
AI_CAPTCHA_ENDPOINT = "http://34.126.156.34:4000/api/v1/captcha/solve"
EXTERNAL_PROXY_URL = "http://103.3.246.71:3128"
USE_PROXY = "true"
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types", "@types/crypto-js"]
  },
  "include": ["src/**/*"]
}
```

## Build & Deployment

### Commands

```bash
npm run dev        # Local development with wrangler
npm run deploy     # Deploy to Cloudflare
npm run cf-typegen # Generate TypeScript types
```

## Security Notes

- Credentials stored as Cloudflare Secrets (not in code)
- Session data cached in KV with expiration
- CORS enabled for all origins (configurable)
- No logging of sensitive data

## Generated By

- Repomix v1.9.2
- Output: repomix-output.xml
- Date: 2025-01-30
