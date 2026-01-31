# Project Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

#### Authentication & Security
- **Header-Based Authentication** (2026-01-31)
  - `X-Username` header - BHXH username for authentication (overrides query params)
  - `X-Password` header - BHXH password for authentication (overrides query params)
  - Headers take priority over query parameters for backward compatibility
  - Updated `AuthenticatedRequest` interface in middleware for type safety
  - All controllers updated to use `@Request()` decorator
  - Swagger documentation updated with header parameters

#### Department Management
- **Department CRUD Operations** (Codes 077, 079, 080)
  - `GET /api/v1/departments` - List departments with pagination and filters
  - `GET /api/v1/departments/{id}` - Get department by ID
  - `POST /api/v1/departments` - Create new department
  - `PUT /api/v1/departments/{id}` - Update department
  - `DELETE /api/v1/departments/{id}` - Delete department
  - Added `madonvi` and `macoquan` fields for BHXH API compatibility

#### Employee Management
- **Employee CRUD Extensions** (Codes 068, 112, 156, 172)
  - `GET /api/v1/employees/{employeeId}` - Get employee by ID using Code 172
  - `GET /api/v1/employees/{employeeId}/sync` - Sync employee with central BHXH (Code 156)
  - `PUT /api/v1/employees/{employeeId}` - Update employee (Code 068)
  - `POST /api/v1/employees/upload` - Bulk upload employees from Excel file (Code 112)

#### Geographic Data
- **Geographic Data Endpoints** (Code 063)
  - `GET /api/v1/geographic/districts` - Get districts by province code

#### Master Data
- **Named Master Data Endpoints** (replaces generic `/lookup/{code}`)
  - `GET /api/v1/master-data/paper-types` (Code 071) - Document types
  - `GET /api/v1/master-data/countries` (Code 072) - ISO country codes
  - `GET /api/v1/master-data/ethnicities` (Code 073) - Vietnamese ethnic groups
  - `GET /api/v1/master-data/labor-plan-types` (Code 086) - Employment change categories
  - `GET /api/v1/master-data/benefits` (Code 098) - Social insurance benefit types
  - `GET /api/v1/master-data/relationships` (Code 099) - Family/household relationships

#### Models
- `src/models/department.model.ts` - Department CRUD type definitions
- `src/models/geographic.model.ts` - Geographic data types (District, Province, Ward)
- Extended `src/models/employee.model.ts` - Added detail, update, sync, and bulk upload types

#### Services
- `src/services/department.service.ts` - Department CRUD operations
- `src/services/geographic.service.ts` - Geographic data lookup
- Extended `src/services/bhxh.service.ts` - Added `updateEmployee`, `syncEmployee`, `getEmployeeDetail` functions

#### Controllers
- `src/controllers/department.controller.ts` - Department REST endpoints
- `src/controllers/geographic.controller.ts` - Geographic data REST endpoints
- `src/controllers/master-data.controller.ts` - Named master data endpoints
- Extended `src/controllers/employees.controller.ts` - Added PUT update, GET sync, improved GET detail

#### Documentation
- API documentation for Edit Employee flow (Code 068)
- API documentation for geographic data endpoints (Code 063)
- API documentation for employee sync (Code 156)
- API documentation for employee detail (Code 172)

### Changed
- Query parameters for username/password now deprecated (headers preferred)
- Swagger UI updated with security definitions for API key authentication

### Fixed
- Department API calls missing `madonvi` and `macoquan` lowercase fields for BHXH API compatibility

### Known Limitations
- Employee detail endpoint (Code 172) requires internal record ID from employee list
- No individual employee create/delete operations (BHXH API limitation)
- Employee update (Code 068) requires full employee data structure - retrieve with GET first
- Bulk upload requires Excel file (.xls or .xlsx) via multipart/form-data
- Employee sync (Code 156) requires valid Social Security Number and agency code

---

## v2.1.0 (2026-01-31)

### Summary
Major feature release adding Department CRUD, Employee management extensions, and geographic data endpoints.

### Authentication & Security
- Header-based authentication (`X-Username`, `X-Password`) with backward compatibility for query parameters
- API key authentication via `X-API-Key` header for all protected endpoints

### API Endpoints Added

#### Department Management
- `POST /api/v1/departments` - Create department (Code 077)
- `GET /api/v1/departments` - List departments with pagination (Code 079)
- `GET /api/v1/departments/{id}` - Get department by ID
- `PUT /api/v1/departments/{id}` - Update department (Code 077)
- `DELETE /api/v1/departments/{id}` - Delete department (Code 080)

#### Employee Management
- `GET /api/v1/employees/{employeeId}` - Get employee by ID (Code 172)
- `PUT /api/v1/employees/{employeeId}` - Update employee (Code 068)
- `GET /api/v1/employees/{employeeId}/sync` - Sync with central BHXH (Code 156)
- `POST /api/v1/employees/upload` - Bulk upload from Excel (Code 112)

#### Geographic Data
- `GET /api/v1/geographic/districts` - Get districts by province (Code 063)

#### Master Data (replaces generic lookup)
- `GET /api/v1/master-data/paper-types` (Code 071)
- `GET /api/v1/master-data/countries` (Code 072)
- `GET /api/v1/master-data/ethnicities` (Code 073)
- `GET /api/v1/master-data/labor-plan-types` (Code 086)
- `GET /api/v1/master-data/benefits` (Code 098)
- `GET /api/v1/master-data/relationships` (Code 099)

---

## v2.0.0 (2026-01-31)

### Breaking Changes

- **Platform Migration**
  - Removed Cloudflare Worker implementation (wrangler, KV namespace)
  - Switched to Express server with tsoa for OpenAPI integration
  - Renamed from `bhxh-proxy-worker` to `bhxh-api`

- **Authentication**
  - Added API key authentication via `X-API-Key` header for all protected endpoints
  - 401 response for missing API key, 403 for invalid API key

- **Session Management**
  - Changed from KV namespace to in-memory Map caching
  - Added per-request BHXH credentials via `username` and `password` query parameters
  - Multi-tenant session support (each credential combination gets isolated session)

- **API Endpoints**
  - Added `/api/v1` prefix to all endpoints
  - Replaced generic `/lookup/{code}` with named master-data endpoints

- **Proxy Support**
  - Added Basic authentication support for external proxy
  - Added `EXTERNAL_PROXY_USERNAME` and `EXTERNAL_PROXY_PASSWORD` environment variables

### Features Added

- **API Key Middleware** (`src/middleware/api-key.middleware.ts`)
  - Public paths: `/`, `/health`, `/docs`, `/swagger`, `/swagger.json`
  - Configurable API key list via `API_KEYS` environment variable
  - API key usage logging (truncated for security)

- **Swagger UI**
  - Interactive API documentation available at `/docs`
  - Auto-generated OpenAPI spec via tsoa

- **Per-Request Credentials**
  - Optional `username` and `password` query parameters on all endpoints
  - Falls back to `BHXH_USERNAME` and `BHXH_PASSWORD` from environment if not provided

### Files Deleted

```
src/index.ts              # Cloudflare Worker entry
src/auth.ts               # KV-based session management
src/bhxh-client.ts        # Old API client
src/proxy-manager.ts      # Proxy manager using Env type
wrangler.toml             # Cloudflare configuration
worker-configuration.d.ts # Worker type definitions
server-local.js           # Old Express server
server.js                 # Old Cloud Run server
fetch_employees.js        # Sample script
headless_login_script.js  # Sample script
```

### Files Added

```
src/controllers/          # tsoa REST controllers
src/services/             # Business logic layer
src/models/               # TypeScript interfaces
src/middleware/           # Express middleware
src/generated/            # tsoa auto-generated routes
tsoa.json                # tsoa configuration
```

### Configuration Changes

- **Environment Variables**
  - Added `API_KEYS` (required): Comma-separated API keys
  - Added `EXTERNAL_PROXY_USERNAME`: Proxy authentication username
  - Added `EXTERNAL_PROXY_PASSWORD`: Proxy authentication password
  - Renamed `HOST` and `PORT`: Server configuration (was wrangler-specific)

- **tsconfig.json**
  - Added `experimentalDecorators: true`
  - Added `emitDecoratorMetadata: true`

- **package.json**
  - Removed: `@cloudflare/workers-types`, `wrangler`
  - Added: `express`, `tsoa`, `swagger-ui-express`
  - Scripts: `npm run dev` starts server on port 4000
  - Scripts: `npm run swagger` generates OpenAPI spec
  - Scripts: `npm run routes` generates tsoa routes

### Documentation Updates

- Updated all documentation to reflect Express/tsoa architecture
- Added API key authentication documentation
- Added per-request credentials documentation
- Updated deployment guide for Node.js/Express
- Added API migration guide from v1.0.0 to v2.0.0

---

## v1.0.0 (2025-01-XX)

### Initial Release

- Cloudflare Worker proxy for BHXH API
- Autonomous login with CAPTCHA solving via AI
- Session caching in KV namespace
- Employee data retrieval endpoint
- Proxy checker with DigitalOcean Functions integration
