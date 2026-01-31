# BHXH API

Express server with tsoa that proxies the Vietnam Social Insurance (BHXH) API with autonomous CAPTCHA solving capabilities.

## Overview

This API provides a simplified interface to the BHXH (Bao Hiem Xa Hoi) portal at `dichvucong.baohiemxahoi.gov.vn`, handling:

- **Session Management**: Automatic login with in-memory session caching
- **CAPTCHA Solving**: AI-powered CAPTCHA recognition via external AI API
- **Employee Data**: Retrieve employee records from the BHXH system
- **Master Data**: Access reference data (paper types, countries, ethnicities, etc.)
- **API Key Authentication**: Secure access via X-API-Key header
- **Per-Request Credentials**: Multi-tenant support via username/password query parameters

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .dev.vars
# Edit .dev.vars with your credentials

# Run locally
npm run dev

# Access Swagger UI
open http://localhost:4000/docs
```

## API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | GET | Health check | No |
| `/docs` | GET | Swagger UI | No |
| `/api/v1/employees` | GET | Fetch employee list | API Key |
| `/api/v1/session/status` | GET | Check session status | API Key |
| `/api/v1/session/refresh` | POST | Force session refresh | API Key |
| `/api/v1/master-data/paper-types` | GET | Paper types (Code 071) | API Key |
| `/api/v1/master-data/countries` | GET | Countries (Code 072) | API Key |
| `/api/v1/master-data/ethnicities` | GET | Ethnicities (Code 073) | API Key |
| `/api/v1/master-data/labor-plan-types` | GET | Labor types (Code 086) | API Key |
| `/api/v1/master-data/benefits` | GET | Benefits (Code 098) | API Key |
| `/api/v1/master-data/relationships` | GET | Relationships (Code 099) | API Key |

## Authentication

### API Key Authentication

All protected endpoints require an `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key" http://localhost:4000/api/v1/employees
```

Public endpoints (no API key required):
- `/` - Health check
- `/docs` - Swagger UI
- `/swagger.json` - OpenAPI spec

### Per-Request BHXH Credentials

Optional `username` and `password` query parameters for multi-tenant support:

```bash
# With specific credentials
curl -H "X-API-Key: your-api-key" \
  "http://localhost:4000/api/v1/employees?username=user@example.com&password=pass123"

# Without credentials (uses fallback from .dev.vars)
curl -H "X-API-Key: your-api-key" \
  "http://localhost:4000/api/v1/employees"
```

Sessions are cached per unique credentials combination.

## Architecture

```
Client Request
       |
       v
Express Server (local-server.ts)
       |
   [API Key Middleware] --> 401/403 if invalid
       |
   [tsoa Routes] --> Controller Methods
       |
   [Session Check] ---> In-Memory Map
       |
       v
[Valid Session] ---> [Expired/Missing]
       |                     |
       v                     v
[Fetch Data]          [Autonomous Login]
       |                     |
   BHXH API           [Get Client ID]
       |                     |
       v                     v
[Response]             [Get CAPTCHA]
                       [Solve via AI]
                             |
                             v
                       [Login + Token]
                             |
                             v
                       [Cache to Map]
                             |
                             v
                       [Fetch Data]
```

## Project Structure

```
bhxh-api/
├── src/
│   ├── local-server.ts       # Express server entry point
│   ├── controllers/          # tsoa REST controllers
│   │   ├── health.controller.ts
│   │   ├── employees.controller.ts
│   │   ├── session.controller.ts
│   │   └── master-data.controller.ts
│   ├── services/             # Business logic layer
│   │   ├── session.service.ts
│   │   ├── bhxh.service.ts
│   │   └── proxy.service.ts
│   ├── models/               # TypeScript interfaces
│   │   ├── session.model.ts
│   │   ├── employee.model.ts
│   │   └── master-data.model.ts
│   ├── middleware/           # Express middleware
│   │   └── api-key.middleware.ts
│   ├── generated/            # tsoa auto-generated
│   │   ├── routes.ts
│   │   └── swagger.json
│   ├── crypto.ts             # AES encryption utilities
│   ├── bhxh-types.ts         # BHXH API types
│   └── bhxh-http-utils.ts    # HTTP utilities
├── api-docs/                 # BHXH API documentation
├── docs/                     # Project documentation
├── .dev.vars                 # Environment variables (local)
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── tsoa.json                 # tsoa configuration
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `API_KEYS` | Comma-separated API keys | Yes | - |
| `BHXH_USERNAME` | BHXH portal username (fallback) | No | - |
| `BHXH_PASSWORD` | BHXH portal password (fallback) | No | - |
| `BHXH_ENCRYPTION_KEY` | AES encryption key | No | `S6\|d'qc1GG,'rx&xn0XC` |
| `AI_CAPTCHA_ENDPOINT` | AI CAPTCHA solver endpoint | No | - |
| `AI_CAPTCHA_API_KEY` | AI API authentication token | No | - |
| `BHXH_BASE_URL` | BHXH portal base URL | No | `https://dichvucong.baohiemxahoi.gov.vn` |
| `USE_PROXY` | Enable proxy (`true`/`false`) | No | `false` |
| `EXTERNAL_PROXY_URL` | Proxy server URL | No | - |
| `EXTERNAL_PROXY_USERNAME` | Proxy authentication username | No | - |
| `EXTERNAL_PROXY_PASSWORD` | Proxy authentication password | No | - |
| `HOST` | Server host | No | `0.0.0.0` |
| `PORT` | Server port | No | `4000` |

### Generate API Keys

```bash
# Generate secure API key (32 bytes hex)
openssl rand -hex 32
```

## Development

```bash
# Start development server
npm run dev

# Generate Swagger spec
npm run swagger

# Generate tsoa routes
npm run routes

# Run tests
npm test
```

## Documentation

- [Project Overview & PDR](./project-overview-pdr.md)
- [Codebase Summary](./codebase-summary.md)
- [Code Standards](./code-standards.md)
- [System Architecture](./system-architecture.md)
- [Project Roadmap](./project-roadmap.md)
- [Deployment Guide](./deployment-guide.md)
- [API Reference](./api-reference.md)
- [API Migration Guide](./api-migration-guide.md)

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.22.1 | HTTP server |
| `tsoa` | ^6.6.0 | OpenAPI/Swagger integration |
| `swagger-ui-express` | ^5.0.1 | Swagger UI |
| `axios` | ^1.13.4 | HTTP client |
| `crypto-js` | ^4.2.0 | AES encryption |
| `https-proxy-agent` | ^7.0.6 | Proxy support |
| `dotenv` | ^17.2.3 | Environment configuration |

## License

Private project.
