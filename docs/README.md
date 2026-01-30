# BHXH Proxy Worker

A Cloudflare Worker that proxies the Vietnam Social Insurance (BHXH) API with autonomous CAPTCHA solving capabilities.

## Overview

This worker provides a simplified interface to the BHXH (Bao Hiem Xa Hoi) portal at `dichvucong.baohiemxahoi.gov.vn`, handling:

- **Session Management**: Automatic login with token caching in Cloudflare KV
- **CAPTCHA Solving**: AI-powered CAPTCHA recognition via Finizi AI Core API
- **Employee Data**: Retrieve employee records from the BHXH system
- **Lookup Data**: Access reference data (paper types, countries, ethnicities, etc.)

## Quick Start

```bash
# Install dependencies
npm install

# Configure secrets (required for production)
npx wrangler secret put BHXH_USERNAME
npx wrangler secret put BHXH_PASSWORD
npx wrangler secret put BHXH_ENCRYPTION_KEY

# Run locally
npm run dev

# Deploy to Cloudflare
npm run deploy
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/employees` | GET | Fetch employee list |
| `/session/status` | GET | Check session status |
| `/session/refresh` | GET | Force session refresh |
| `/login/captcha` | GET | Get captcha for manual login |
| `/login/token` | POST | Exchange captcha for token |
| `/lookup/paper-types` | GET | Lookup paper types (Code 071) |
| `/lookup/countries` | GET | Lookup countries (Code 072) |
| `/lookup/ethnicities` | GET | Lookup ethnicities (Code 073) |
| `/lookup/labor-plan-types` | GET | Lookup labor types (Code 086) |
| `/lookup/benefits` | GET | Lookup benefits (Code 098) |
| `/lookup/relationships` | GET | Lookup relationships (Code 099) |
| `/lookup/document-list` | GET | Lookup documents (Code 028) |

## Architecture

```
Client Request
       |
       v
Cloudflare Worker
       |
   [Route Matching]
       |
   [Session Check] ---> KV Namespace
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
                       [Cache to KV]
                             |
                             v
                       [Fetch Data]
```

## Project Structure

```
bhxh-proxy-worker/
├── src/
│   ├── index.ts         # Main entry point, route handlers
│   ├── auth.ts          # Authentication & session management
│   ├── bhxh-client.ts   # BHXH API client
│   └── crypto.ts        # AES encryption utilities
├── api-docs/            # BHXH API documentation
├── wrangler.toml       # Cloudflare Worker configuration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## Configuration

### Environment Variables (Secrets)

| Variable | Description | Required |
|----------|-------------|----------|
| `BHXH_USERNAME` | BHXH portal username | Yes |
| `BHXH_PASSWORD` | BHXH portal password | Yes |
| `BHXH_ENCRYPTION_KEY` | AES encryption key | Yes |
| `AI_CAPTCHA_ENDPOINT` | Finizi AI Core API endpoint | Yes |
| `AI_CAPTCHA_API_KEY` | AI API authentication token | No |
| `EXTERNAL_PROXY_URL` | Proxy server URL | No |
| `USE_PROXY` | Enable proxy (`true`/`false`) | No |

### KV Namespace

The worker uses `BHXH_SESSION` KV namespace for session caching. Pre-configured in `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "BHXH_SESSION"
id = "2c3dacd3163f4dda97eac85c82324f0d"
preview_id = "ff7eea72287f4f8eb7c640d4c4818072"
```

## Documentation

- [Project Overview & PDR](./project-overview-pdr.md)
- [Codebase Summary](./codebase-summary.md)
- [Code Standards](./code-standards.md)
- [System Architecture](./system-architecture.md)
- [Project Roadmap](./project-roadmap.md)
- [Deployment Guide](./deployment-guide.md)

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `crypto-js` | ^4.2.0 | AES encryption |
| `axios` | ^1.13.4 | HTTP client |
| `undici` | ^7.19.2 | Fetch API polyfill |
| `@cloudflare/workers-types` | ^4.20250129.0 | TypeScript types |
| `wrangler` | ^4.0.0 | Cloudflare CLI |

## License

Private project.
