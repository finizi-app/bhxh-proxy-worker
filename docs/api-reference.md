# API Reference

Express server with tsoa that proxies the Vietnam Social Insurance (BHXH) API.

**Version:** 2.0.0

Provides authenticated access to employee data and lookup tables.

## Authentication

### Required Headers

All protected endpoints require the following headers:

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes | API key for proxy authentication (configure in `.dev.vars`) |
| `X-Username` | No* | BHXH username for per-request authentication |
| `X-Password` | No* | BHXH password for per-request authentication |

\*Headers are optional if default credentials are configured in `.dev.vars`.

**Example:**
```bash
# With headers
curl -X GET "http://localhost:4000/api/v1/employees" \
  -H "X-API-Key: sk_test_abc123" \
  -H "X-Username: your@email.com" \
  -H "X-Password: yourpassword"

# Without credentials (uses fallback from .dev.vars)
curl -X GET "http://localhost:4000/api/v1/employees" \
  -H "X-API-Key: sk_test_abc123"
```

**Note:** Sessions are cached per unique credentials combination.

## Base URLs

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:4000` |
| Production | `https://your-domain.com` |

## Endpoints

### Health Check

#### GET /

Health check endpoint (no authentication required).

**Response 200:**
```json
{
  "service": "bhxh-api",
  "version": "1.0.0",
  "docs": "/docs",
  "status": "ok"
}
```

---

### Employees

#### GET /api/v1/employees

Get paginated list of employees for the current unit.

**Authentication:** API Key required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |
| `maNguoiLaoDong` | string | No | Filter by employee code |
| `ten` | string | No | Filter by name |
| `maPhongBan` | string | No | Filter by department |
| `maTinhTrang` | string | No | Filter by status |
| `MaSoBhxh` | string | No | Filter by BHXH number |
| `PageIndex` | number | No | Page number (default: 1) |
| `PageSize` | number | No | Page size (default: 100) |

**Example Request:**
```bash
curl -X GET "http://localhost:4000/api/v1/employees?PageSize=10" \
  -H "X-API-Key: sk_test_abc123" \
  -H "X-Username: your@email.com" \
  -H "X-Password: yourpassword"
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "Hoten": "Nguyen Van A",
      "Masobhxh": "0123456789",
      "chucVu": "Nhan Vien",
      "mucLuong": 5000000,
      "tinhTrang": "DangLamViec",
      "Ngaysinh": "1990-01-15",
      "Gioitinh": 1,
      "soCMND": "123456789"
    }
  ],
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

**Response 401:** Missing X-API-Key header
**Response 403:** Invalid API key
**Response 500:** Failed to fetch employees

---

#### GET /api/v1/employees/{employeeId}

Get employee by ID (Code 172 - uses list filter fallback).

**Authentication:** API Key required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employeeId` | string | Yes | Employee ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Example Request:**
```bash
curl -X GET "http://localhost:4000/api/v1/employees/EMP001" \
  -H "X-API-Key: sk_test_abc123" \
  -H "X-Username: your@email.com" \
  -H "X-Password: yourpassword"
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "EMP001",
    "Hoten": "Nguyen Van A",
    "Masobhxh": "0123456789"
  }
}
```

**Response 404:** Employee not found
**Response 500:** Failed to fetch employee detail

---

#### POST /api/v1/employees/upload

Bulk upload employees from Excel file (Code 112).

**Authentication:** API Key required

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Form Data:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Excel file (.xls or .xlsx) |

**Example Request:**
```bash
curl -X POST "http://localhost:4000/api/v1/employees/upload" \
  -H "X-API-Key: sk_test_abc123" \
  -H "X-Username: your@email.com" \
  -H "X-Password: yourpassword" \
  -F "file=@employees.xlsx"
```

**Response 200:**
```json
{
  "success": true,
  "message": "Employee bulk upload completed successfully",
  "processed": 50,
  "errors": []
}
```

**Response 400:** Invalid file type or missing file
**Response 500:** Failed to upload employees

---

#### PUT /api/v1/employees/{employeeId}

Update employee (Code 068).

**Authentication:** API Key required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employeeId` | string | Yes | Employee ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Request Body:** Full employee data structure (use GET /employees/{id} first to retrieve current data).

**Example Request:**
```bash
curl -X PUT "http://localhost:4000/api/v1/employees/12959231" \
  -H "X-API-Key: sk_test_abc123" \
  -H "X-Username: your@email.com" \
  -H "X-Password: yourpassword" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 12959231,
    "Hoten": "Trần Thị Cẩm Tiên",
    "Masobhxx": "7930514316",
    "Ngaysinh": "05/01/2003",
    "Gioitinh": "0",
    "mucLuong": "5310000",
    "chucVu": "Nhân viên bán hàng",
    "maPhongBan": "BH",
    "ghiChu": "Updated note"
  }'
```

**Response 200:**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "id": 12959231,
    "Hoten": "Trần Thị Cẩm Tiên",
    "Masobhxh": "7930514316"
  }
}
```

**Response 404:** Employee not found
**Response 500:** Failed to update employee

---

#### GET /api/v1/employees/{employeeId}/sync

Sync employee with central BHXH system (Code 156).

**Authentication:** API Key required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employeeId` | string | Yes | Employee ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `masoBhxh` | string | Yes | 10-digit Social Security Number |
| `maCqbh` | string | Yes | Social Security Agency code |
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Example Request:**
```bash
curl -X GET "http://localhost:4000/api/v1/employees/123/sync?masoBhxh=7930514316&maCqbh=07906" \
  -H "X-API-Key: sk_test_abc123" \
  -H "X-Username: your@email.com" \
  -H "X-Password: yourpassword"
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "masoBhxh": "7930514316",
    "trangThaiBaoHiem": "Active",
    "hoten": "Trần Thị Cẩm Tiên"
  }
}
```

**Response 400:** Invalid sync parameters
**Response 500:** Failed to sync employee

---

### Geographic Data

#### GET /api/v1/geographic/districts

Get districts by province code (Code 063).

**Authentication:** API Key required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `maTinh` | string | Yes | Province code (2-digit, e.g., "79" for Ho Chi Minh City) |
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Example Request:**
```bash
curl -X GET "http://localhost:4000/api/v1/geographic/districts?maTinh=79" \
  -H "X-API-Key: sk_test_abc123" \
  -H "X-Username: your@email.com" \
  -H "X-Password: yourpassword"
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {"ma": "760", "ten": "Quận 1", "cap": "Quận"},
    {"ma": "761", "ten": "Quận 2", "cap": "Quận"}
  ]
}
```

**Response 500:** Failed to fetch districts

---

### Departments

#### GET /api/v1/departments

Get paginated list of departments (Code 079).

**Authentication:** API Key required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |
| `ma` | string | No | Filter by department code |
| `ten` | string | No | Filter by department name |
| `PageIndex` | number | No | Page number (default: 1) |
| `PageSize` | number | No | Page size (default: 50) |

**Example Request:**
```bash
curl -X GET "http://localhost:4000/api/v1/departments?PageSize=10" \
  -H "X-API-Key: sk_test_abc123" \
  -H "X-Username: your@email.com" \
  -H "X-Password: yourpassword"
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ma": "PB001",
      "ten": "Phong Ke Toan",
      "ghiChu": "Ke toan chinh"
    }
  ],
  "meta": {
    "total": 10,
    "count": 1
  }
}
```

---

#### GET /api/v1/departments/{id}

Get department by ID (via list filter).

**Authentication:** API Key required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Department ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ma": "PB001",
    "ten": "Phong Ke Toan"
  }
}
```

**Response 404:** Department not found

---

#### POST /api/v1/departments

Create a new department (Code 077).

**Authentication:** API Key required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Request Body:**
```json
{
  "ma": "PB002",
  "ten": "Phong Nhan Su",
  "ghiChu": "Optional notes"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "ma": "PB002",
    "ten": "Phong Nhan Su"
  }
}
```

---

#### PUT /api/v1/departments/{id}

Update existing department (Code 077).

**Authentication:** API Key required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Department ID to update |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Request Body:**
```json
{
  "ma": "PB002",
  "ten": "Phong Human Resources",
  "ghiChu": "Updated name"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "ma": "PB002",
    "ten": "Phong Human Resources"
  }
}
```

---

#### DELETE /api/v1/departments/{id}

Delete department by ID (Code 080).

**Authentication:** API Key required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Department ID to delete |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Response 200:**
```json
{
  "success": true,
  "message": "Department deleted successfully"
}
```

---

### Session Management

#### GET /api/v1/session/status

Check if current session is valid.

**Authentication:** API Key required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Response 200:**
```json
{
  "status": "active",
  "expiresIn": 3600,
  "unit": "Cong Ty ABC"
}
```

---

#### POST /api/v1/session/refresh

Force refresh the authentication session.

**Authentication:** API Key required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Response 200:**
```json
{
  "success": true,
  "message": "Session refreshed",
  "unit": "Cong Ty ABC",
  "expiresIn": 3600
}
```

---

### Master Data

#### GET /api/v1/master-data/paper-types

Get paper types (Code 071). Document types: Sổ hộ khẩu, CCCD/ĐDCN, etc.

**Authentication:** API Key required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "Ma": "01",
      "Ten": "So ho khau"
    },
    {
      "Ma": "02",
      "Ten": "CCCD/ĐDCN"
    }
  ]
}
```

---

#### GET /api/v1/master-data/countries

Get countries (Code 072). ISO country codes with Vietnamese names.

**Authentication:** API Key required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "Ma": "VN",
      "Ten": "Viet Nam"
    },
    {
      "Ma": "US",
      "Ten": "United States"
    }
  ]
}
```

---

#### GET /api/v1/master-data/ethnicities

Get ethnicities (Code 073). Vietnamese ethnic groups: Kinh, Tày, Thái, etc.

**Authentication:** API Key required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "Ma": "01",
      "Ten": "Kinh"
    },
    {
      "Ma": "02",
      "Ten": "Tày"
    }
  ]
}
```

---

#### GET /api/v1/master-data/labor-plan-types

Get labor plan types (Code 086). Employment change categories: Tăng lao động, Giảm lao động, etc.

**Authentication:** API Key required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "Ma": "01",
      "Ten": "Tăng lao động"
    },
    {
      "Ma": "02",
      "Ten": "Giảm lao động"
    }
  ]
}
```

---

#### GET /api/v1/master-data/benefits

Get benefits (Code 098). Social insurance benefit types (Chế độ): Dưỡng sức, ốm đau, etc.

**Authentication:** API Key required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "Ma": "01",
      "Ten": "Dưỡng sức"
    },
    {
      "Ma": "02",
      "Ten": "Ốm đau"
    }
  ]
}
```

---

#### GET /api/v1/master-data/relationships

Get relationships (Code 099). Family/household relationships: Chủ hộ, Vợ, Chồng, Con, etc.

**Authentication:** API Key required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | No | BHXH username for per-request auth |
| `password` | string | No | BHXH password for per-request auth |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "Ma": "01",
      "Ten": "Chủ hộ"
    },
    {
      "Ma": "02",
      "Ten": "Vợ"
    },
    {
      "Ma": "03",
      "Ten": "Chồng"
    }
  ]
}
```

---

## Error Responses

### 401 Unauthorized

Missing X-API-Key header.

```json
{
  "error": "Unauthorized",
  "message": "Missing X-API-Key header"
}
```

### 403 Forbidden

Invalid X-API-Key.

```json
{
  "error": "Forbidden",
  "message": "Invalid API key"
}
```

### 500 Internal Server Error

Request failed.

```json
{
  "error": "Failed to fetch employees",
  "message": "BHXH credentials not provided"
}
```

---

## Data Schemas

### Employee

```json
{
  "id": 1,
  "Hoten": "Nguyen Van A",
  "Masobhxh": "0123456789",
  "chucVu": "Nhan Vien",
  "mucLuong": 5000000,
  "tinhTrang": "DangLamViec",
  "Ngaysinh": "1990-01-15",
  "Gioitinh": 1,
  "soCMND": "123456789"
}
```

### Master Data Item

```json
{
  "Ma": "01",
  "Ten": "Display Name"
}
```

---

## Swagger UI

Interactive API documentation available at:

```
http://localhost:4000/docs
```

---

## Related Documentation

- [Project Overview & PDR](./project-overview-pdr.md)
- [System Architecture](./system-architecture.md)
- [Code Standards](./code-standards.md)
- [API Migration Guide](./api-migration-guide.md)
