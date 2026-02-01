# Test Documentation

This directory contains integration tests for the BHXH API proxy worker.

## Test Structure

```
test/
├── integration/              # Integration tests (require external API)
│   ├── department-endpoint.test.ts
│   ├── employees-endpoint.test.ts
│   ├── geographic-endpoint.test.ts
│   ├── health-and-session-endpoints.test.ts
│   ├── master-data-endpoint.test.ts
│   ├── payments-endpoint.test.ts
│   └── placeholder.test.ts
├── helpers/                  # Test utilities and fixtures
│   ├── api-helpers.ts
│   ├── auth-helpers.ts
│   ├── test-constants.ts
│   └── test-server.ts
├── auth.test.ts             # Authentication unit tests
├── api-client.test.ts       # API client unit tests
├── setup.ts                 # Global test setup
└── utils.ts                 # Utility functions
```

## Running Tests

### Prerequisites

Tests require BHXH API credentials. Set up your environment:

```bash
# Copy the example environment file
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your credentials
nano .dev.vars
```

Required environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `BHXH_USERNAME` | BHXH portal username | Yes |
| `BHXH_PASSWORD` | BHXH portal password | Yes |
| `BHXH_ENCRYPTION_KEY` | Encryption key for X-CLIENT header | Yes |
| `AI_CAPTCHA_ENDPOINT` | AI CAPTCHA solving service URL | Yes |
| `AI_CAPTCHA_API_KEY` | API key for CAPTCHA service | Yes |
| `API_KEY` | API key for this proxy service | Yes |
| `BHXH_BASE_URL` | BHXH API base URL | Optional |

### Test Commands

```bash
# Run all tests
npm test

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest test/integration/employees-endpoint.test.ts

# Run specific test by name
npx vitest test/integration/employees-endpoint.test.ts -t "should return 200 with employees array"
```

### Coverage Reports

```bash
# Generate coverage report (terminal + HTML)
npm run test:coverage

# View HTML coverage report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
```

Coverage targets:
- **Overall**: 60% (integration tests focus on API endpoints)
- **Controllers**: 50%+ (covered by integration tests)
- **Services**: 75%+ (core business logic)
- **Middleware**: 85%+ (auth, error handling)

## Test Types

### Integration Tests

Located in `test/integration/`, these tests make real API calls to the BHXH portal.

**Characteristics:**
- Test full request/response flow
- Use real BHXH API endpoints
- Require valid credentials
- Slower execution (2-30 seconds per test)
- Test authentication, pagination, filtering

**Example:**
```typescript
it("should return 200 with employees array", async () => {
  const response = await request(app)
    .get("/api/v1/employees/")
    .set(createAuthHeaders(credentials));

  expectApiResponse(response, 200);
  expect(response.body.data).toBeInstanceOf(Array);
});
```

### Unit Tests

Located in `test/`, these test individual functions and classes.

**Characteristics:**
- Test pure functions
- Mock external dependencies
- Fast execution
- No network calls

## Test Helpers

### Authentication Helpers

```typescript
import { createAuthHeaders, getTestCredentials } from "../helpers/auth-helpers";

// Create headers with default credentials
const headers = createAuthHeaders();

// Create headers with custom credentials
const headers = createAuthHeaders({ username: "test", password: "pass" });

// Get test credentials from environment
const creds = getTestCredentials();
```

### API Helpers

```typescript
import { expectApiResponse, buildQueryString } from "../helpers/api-helpers";

// Assert API response structure
expectApiResponse(response, 200);

// Build query string from object
const qs = buildQueryString({ PageIndex: 1, PageSize: 10 });
```

### Test Server

```typescript
import { createTestServer } from "../helpers/test-server";

const server = createTestServer();
const app = server.app;

// Cleanup after tests
await server.close();
```

## Troubleshooting

### Tests Fail with "BHXH credentials not configured"

**Solution:** Set up your `.dev.vars` file with valid BHXH credentials.

```bash
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your credentials
```

### Tests Timeout or Fail Intermittently

**Possible causes:**
1. **External API rate limiting**: Too many requests to BHXH API
2. **Network issues**: Unstable connection to BHXH portal
3. **CAPTCHA solving failures**: AI service unavailable

**Solutions:**
- Wait a few minutes and retry
- Check your AI CAPTCHA service status
- Run tests in isolation: `npx vitest test/integration/specific.test.ts`

### Tests Pass Individually but Fail Together

**Cause:** Test pollution (shared session state).

**Solution:** Each test file now calls `clearAllSessions()` in `beforeAll` and `afterAll` hooks. If you see this issue:

1. Check your test has proper cleanup:
```typescript
import { clearAllSessions } from "../../src/services/session.service";

beforeAll(() => {
  clearAllSessions();
});

afterAll(() => {
  clearAllSessions();
});
```

2. Report the issue if it persists.

### Coverage Report Shows Low Numbers

**Expected behavior:** Integration tests focus on API endpoints, not every code branch.

**Current coverage targets:**
- Overall: 60%+ (realistic for integration tests)
- Services: 75%+ (core business logic)
- Controllers: 50%+ (API routes)

To improve coverage, add unit tests for:
- Error handling paths
- Edge cases
- Utility functions
- Data transformation logic

### "Hook timed out" Errors

**Cause:** Test setup (`beforeAll`) taking too long.

**Solution:** The `hookTimeout` in `vitest.config.ts` is set to 30 seconds. If your tests need more time:

```typescript
// In vitest.config.ts
export default defineConfig({
  test: {
    hookTimeout: 60000, // Increase to 60 seconds
  },
});
```

## Writing New Tests

### Integration Test Template

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createTestServer } from "../helpers/test-server";
import { createAuthHeaders, getTestCredentials } from "../helpers/auth-helpers";
import { clearAllSessions } from "../../src/services/session.service";

describe("Feature Name", () => {
  let app: any;
  let credentials: ReturnType<typeof getTestCredentials>;

  beforeAll(async () => {
    clearAllSessions();
    const server = createTestServer();
    app = server.app;
    credentials = getTestCredentials();
  });

  afterAll(() => {
    clearAllSessions();
  });

  it("should do something", async () => {
    const response = await request(app)
      .get("/api/v1/endpoint")
      .set(createAuthHeaders(credentials));

    expect(response.status).toBe(200);
  });
});
```

## CI/CD Integration

Tests run automatically on GitHub Actions for:
- Push to `master`, `main`, `develop` branches
- Pull requests to `master`, `main`, `develop` branches

**Required secrets for CI:**
- `BHXH_TEST_USERNAME`
- `BHXH_TEST_PASSWORD`
- `BHXH_ENCRYPTION_KEY`
- `AI_CAPTCHA_ENDPOINT`
- `AI_CAPTCHA_API_KEY`
- `API_KEY`

Configure these in GitHub repository Settings > Secrets and variables > Actions.

## Additional Resources

- [Vitest documentation](https://vitest.dev/)
- [Supertest documentation](https://github.com/visionmedia/supertest)
- [API documentation](../docs/api-reference.md)
- [Development roadmap](../docs/development-roadmap.md)
