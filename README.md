# BHXH Proxy Worker

Cloudflare Worker that proxies the Vietnam Social Insurance (BHXH) API with autonomous login, CAPTCHA solving via AI, and employee data retrieval.

## Features

- **Autonomous Authentication**: Automatic login with CAPTCHA solving via AI
- **Session Caching**: KV storage for session tokens (1-hour TTL)
- **RESTful API**: Clean endpoints for employee, department, and geographic data
- **Type-Safe**: Full TypeScript support with tsoa-generated OpenAPI spec
- **Tested**: Integration test suite with 143 tests

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your BHXH credentials
# Required: BHXH_USERNAME, BHXH_PASSWORD, BHXH_ENCRYPTION_KEY
# Required: AI_CAPTCHA_ENDPOINT, AI_CAPTCHA_API_KEY
# Required: API_KEY

# Run local development server
npm run dev

# Deploy to Cloudflare
npm run deploy
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local development server |
| `npm run deploy` | Deploy to Cloudflare Workers |
| `npm run swagger` | Generate OpenAPI/Swagger spec |
| `npm run routes` | Generate tsoa routes |
| `npm test` | Run all tests |
| `npm run test:integration` | Run integration tests only |
| `npm run test:coverage` | Generate coverage report |

## Deploy to Container Platforms

Deploy BHXH API as a container to any platform using portable deployment scripts.

### Quick Deploy

```bash
# Deploy to Cloud Run (Google Cloud)
./deploy/cloud-run.sh

# Deploy to Azure Container Apps
./deploy/azure-aca.sh

# Deploy to Railway
./deploy/railway.sh

# Deploy to VPS via Docker
./deploy/vps.sh

# Deploy to Render (manual - link repo in dashboard)
```

### First-Time Setup

1. **Configure environment variables:**
   ```bash
   cp deploy/.env.template .env
   # Edit .env with your credentials
   ```

2. **Run deployment script:**
   ```bash
   ./deploy/cloud-run.sh  # or any platform script
   ```

**See [Deployment Guide](docs/deployment-portable-guide.md)** for detailed platform setup, troubleshooting, and platform comparison.

## Testing

### Prerequisites

Tests require valid BHXH credentials. Configure `.dev.vars`:

```bash
# Required for tests
BHXH_USERNAME=your_username
BHXH_PASSWORD=your_password
BHXH_ENCRYPTION_KEY=your_encryption_key
AI_CAPTCHA_ENDPOINT=https://your-captcha-service.com/solve
AI_CAPTCHA_API_KEY=your_api_key
API_KEY=your_proxy_api_key
```

### Run Tests

```bash
# Run all tests
npm test

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage

# Run specific test file
npx vitest test/integration/employees-endpoint.test.ts
```

### Coverage

Current coverage: **66.16%** (integration tests focus on API endpoints)

- Controllers: 53.19%
- Services: 76.65%
- Middleware: 89.28%

See [test/README.md](test/README.md) for detailed testing documentation.

## API Documentation

### Interactive Docs

Start the dev server and visit:
- Swagger UI: http://localhost:4000/docs
- OpenAPI JSON: http://localhost:4000/openapi.json
- OpenAPI YAML: http://localhost:4000/openapi.yaml

### Example Endpoints

```bash
# Health check
curl http://localhost:4000/health/

# Get employees (requires auth)
curl -H "X-API-Key: your_key" \
     http://localhost:4000/api/v1/employees/

# Get departments
curl -H "X-API-Key: your_key" \
     http://localhost:4000/api/v1/departments

# Get provinces
curl -H "X-API-Key: your_key" \
     http://localhost:4000/api/v1/geographic/provinces
```

## Architecture

```
Request → API Key Middleware → Controller → Service → BHXH API
              ↓                              ↓
         Credentials                      Session Cache
                                            (KV storage)
```

### Key Components

- **Controllers** (`src/controllers/`): REST endpoints with tsoa decorators
- **Services** (`src/services/`): Business logic, BHXH API client, session management
- **Middleware** (`src/middleware/`): API key authentication, per-request credentials
- **Models** (`src/models/`): TypeScript interfaces for request/response

### Authentication Flow

1. Request arrives with `X-API-Key` header
2. Middleware extracts BHXH credentials from headers or query params
3. Service checks KV cache for valid session
4. If expired: autonomous login (CAPTCHA → AI solve → token)
5. Service calls BHXH API with session token
6. Response returned to client

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `BHXH_USERNAME` | BHXH portal username | Yes | - |
| `BHXH_PASSWORD` | BHXH portal password | Yes | - |
| `BHXH_ENCRYPTION_KEY` | AES key for X-CLIENT header | Yes | - |
| `BHXH_TARGET_UNIT_CODE` | Target unit code | No | `TZH490L` |
| `AI_CAPTCHA_ENDPOINT` | AI CAPTCHA solving URL | Yes | - |
| `AI_CAPTCHA_API_KEY` | AI service API key | Yes | - |
| `API_KEY` | Proxy service API key | Yes | - |
| `BHXH_BASE_URL` | BHXH API base URL | No | `https://dichvucong.baohiemxahoi.gov.vn` |
| `USE_PROXY` | Enable external proxy | No | `false` |
| `EXTERNAL_PROXY_URL` | External proxy URL | No | - |

## Project Structure

```
src/
├── controllers/         # REST API endpoints
│   ├── employees.controller.ts
│   ├── departments.controller.ts
│   ├── geographic.controller.ts
│   └── ...
├── services/           # Business logic
│   ├── bhxh.service.ts         # BHXH API client
│   ├── session.service.ts      # Session management
│   ├── geographic.service.ts   # Geographic data
│   └── proxy.service.ts        # HTTP proxy config
├── middleware/         # Express middleware
│   └── api-key.middleware.ts
├── models/            # TypeScript interfaces
│   ├── employee.model.ts
│   ├── session.model.ts
│   └── ...
├── local-server.ts    # Local development server
└── generated/         # Auto-generated (tsoa)
    ├── routes.ts
    ├── swagger.json
    └── openapi.yaml

test/
├── integration/       # Integration tests
├── helpers/          # Test utilities
└── setup.ts          # Global test setup
```

## Development Workflow

1. **Make changes**: Edit TypeScript files in `src/`
2. **Regenerate routes**: `npm run routes` (if you changed controllers)
3. **Regenerate docs**: `npm run swagger` (if you changed API specs)
4. **Run tests**: `npm test`
5. **Commit changes**: `git commit -m "feat: add feature"`
6. **Deploy**: `npm run deploy`

## Troubleshooting

### Tests fail with "credentials not configured"

Ensure `.dev.vars` exists with valid BHXH credentials.

### CAPTCHA solving fails

Check your AI CAPTCHA service is accessible:
```bash
curl -X POST $AI_CAPTCHA_ENDPOINT \
  -H "x-api-key: $AI_CAPTCHA_API_KEY" \
  -d '{"image": "base64_image_data"}'
```

### Session token expires too quickly

Increase TTL in `src/services/session.service.ts`:
```typescript
const tokenTtlSeconds = 3600; // 1 hour (default)
```

### External API rate limiting

Add delay between requests or implement exponential backoff in `src/services/proxy.service.ts`.

## Documentation

- [API Reference](docs/api-reference.md) - Complete API documentation
- [Portable Deployment Guide](docs/deployment-portable-guide.md) - Deploy to any container platform
- [Development Roadmap](docs/development-roadmap.md) - Project milestones
- [Project Changelog](docs/project-changelog.md) - Version history
- [Test Documentation](test/README.md) - Testing guide
- [Payment API Guide](api-docs/payment-api-guide.md) - Payment endpoints

## License

Private project. All rights reserved.
