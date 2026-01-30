# BHXH Proxy Worker - Code Standards

## 1. File Naming Convention

| Pattern | Examples | Purpose |
|---------|----------|---------|
| `kebab-case` | `index.ts`, `bhxh-client.ts` | TypeScript source files |
| `kebab-case` | `project-overview-pdr.md` | Documentation files |
| `kebab-case` | `employee-list-api-docs.md` | Detailed API docs |

**Rule**: Use long, descriptive names so LLMs can understand purpose without reading content.

## 2. Code Structure Guidelines

### 2.1 Maximum File Size

- **TypeScript files**: Under 200 lines when possible
- **Split criteria**: When a file exceeds 200 lines, refactor into focused modules
- **Exceptions**: `index.ts` may exceed due to route handlers

### 2.2 Module Boundaries

```
src/
├── index.ts           # Entry point + route handlers
├── auth.ts            # Authentication & sessions (cohesive unit)
├── bhxh-client.ts     # API client + type definitions
├── crypto.ts          # Encryption utilities
└── utils/             # (Optional) Shared utilities
```

### 2.3 Composition Over Inheritance

```typescript
// Good: Composition
class BHXHClient {
    constructor(private baseUrl: string, private proxyUrl?: string) {}
    // Methods using baseUrl/proxyUrl
}

// Avoid: Deep inheritance hierarchies
class BaseClient extends AbstractBaseClient implements IClient {}
```

## 3. TypeScript Standards

### 3.1 Type Definitions

```typescript
// Interfaces for data transfer objects
interface Employee {
    id: number;
    Hoten: string;
    Masobhxh: string;
    chucVu?: string;
    mucLuong?: number;
}

// Environment interface (single source of truth)
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

### 3.2 Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true
  }
}
```

### 3.3 Export Patterns

```typescript
// Named exports for modules
export { BHXHClient, Session, DonVi } from "./bhxh-client";

// Default export for worker
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        // Handler
    },
} satisfies ExportedHandler<Env>;
```

## 4. Error Handling

### 4.1 Try-Catch Pattern

```typescript
try {
    const result = await riskyOperation();
    return Response.json({ success: true, data: result });
} catch (error) {
    console.error("Operation failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
        { error: "Operation failed", message },
        { status: 500 }
    );
}
```

### 4.2 Error Response Format

```typescript
// Consistent error format
interface ErrorResponse {
    error: string;
    message: string;
    path?: string;
}
```

### 4.3 Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 400 | Bad request / Missing fields |
| 401 | Authentication failed |
| 404 | Not found |
| 500 | Internal server error |

## 5. Session Management

### 5.1 KV Caching Pattern

```typescript
const TOKEN_TTL_SECONDS = 3600;

async function getSession(env: Env): Promise<Session | null> {
    const cached = await env.BHXH_SESSION.get<Session>("session", "json");
    if (cached && cached.expiresAt > Date.now()) {
        return cached;
    }
    return null;
}

async function saveSession(env: Env, session: Session): Promise<void> {
    await env.BHXH_SESSION.put("session", JSON.stringify(session), {
        expirationTtl: TOKEN_TTL_SECONDS,
    });
}
```

### 5.2 Session Validation

```typescript
async function getValidSession(env: Env): Promise<Session> {
    const cached = await getSession(env);
    if (cached) {
        return cached;
    }
    return performLogin(env);
}
```

## 6. HTTP Client Patterns

### 6.1 Request Pattern

```typescript
async function callApi<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json, text/plain, */*",
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
}
```

### 6.2 Proxy Support

```typescript
class BHXHClient {
    constructor(
        private baseUrl: string,
        private proxyUrl?: string
    ) {}

    private async proxyFetch(
        path: string,
        init: RequestInit = {}
    ): Promise<Response> {
        const targetUrl = `${this.baseUrl}${path}`;

        if (!this.proxyUrl) {
            return fetch(targetUrl, init);
        }

        const proxyEndpoint = `${this.proxyUrl}/proxy?url=${encodeURIComponent(targetUrl)}`;
        return fetch(proxyEndpoint, init);
    }
}
```

## 7. Logging Standards

### 7.1 Log Levels

```typescript
console.log("Step 1: Fetching data...");       // Info
console.warn("Cache miss, performing login"); // Warning
console.error("Login failed:", error);        // Error
```

### 7.2 Sensitive Data

**NEVER log:**
- Passwords
- Session tokens
- API keys
- User credentials

## 8. Documentation Comments

### 8.1 Function Documentation

```typescript
/**
 * Handle /employees endpoint
 * @param env - Environment variables and KV namespace
 * @param corsHeaders - CORS headers for response
 * @returns JSON response with employee data
 */
async function handleEmployees(
    env: Env,
    corsHeaders: Record<string, string>
): Promise<Response> {
    // Implementation
}
```

### 8.2 Interface Documentation

```typescript
/**
 * BHXH Session data cached in KV
 */
interface Session {
    token: string;              // OAuth access token
    xClient: string;            // Encrypted client ID header
    currentDonVi: DonVi;        // Current working unit
    expiresAt: number;          // Unix timestamp in milliseconds
}
```

## 9. Environment Configuration

### 9.1 Secrets (Never commit)

```bash
# Using wrangler secrets
npx wrangler secret put BHXH_USERNAME
npx wrangler secret put BHXH_PASSWORD
npx wrangler secret put BHXH_ENCRYPTION_KEY
```

### 9.2 Variables (OK in wrangler.toml)

```toml
[vars]
BHXH_BASE_URL = "https://dichvucong.baohiemxahoi.gov.vn"
USE_PROXY = "true"
```

## 10. Testing Guidelines

### 10.1 Test Coverage Priority

1. Authentication flow (login, session, refresh)
2. API endpoint responses
3. Error handling
4. Proxy routing

### 10.2 Mock Patterns

```typescript
// Mock KV namespace
const mockEnv: Env = {
    BHXH_SESSION: {
        get: jest.fn().mockResolvedValue(null),
        put: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
    } as unknown as KVNamespace,
    // ... other required fields
};
```

## 11. Security Standards

### 11.1 Input Validation

```typescript
function validateLoginRequest(body: unknown): asserts body is LoginTokenRequest {
    if (!body || typeof body !== "object") {
        throw new Error("Invalid request body");
    }

    const { clientId, xClient, captchaToken, captchaSolution } = body as any;

    if (!clientId || !xClient || !captchaToken || !captchaSolution) {
        throw new Error("Missing required fields");
    }
}
```

### 11.2 CORS Configuration

```typescript
const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Or specific origin
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};
```

## 12. Import Order

```typescript
// 1. Node.js built-ins
import { Readable } from "stream";

// 2. Third-party packages
import CryptoJS from "crypto-js";

// 3. Relative imports (shorter paths first)
import { BHXHClient } from "./bhxh-client";
import { Env, getValidSession } from "./auth";
```

## 13. Linting Exceptions

- **Permitted**: Minor style deviations if they improve readability
- **Required**: No syntax errors, code must compile
- **Required**: Proper error handling on all async operations

## 14. Git Commit Standards

```bash
# Good commit messages
feat: add employee lookup endpoint
fix: resolve captcha solve timeout issue
docs: update API documentation
chore: update wrangler to v4

# Avoid
Update file
Fix stuff
WIP
```

## 15. Related Documentation

- [Project Overview & PDR](./project-overview-pdr.md)
- [System Architecture](./system-architecture.md)
- [Deployment Guide](./deployment-guide.md)
