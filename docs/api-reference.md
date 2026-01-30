# API Reference

> Generated from [openapi.yaml](../api-docs/openapi.yaml)

**Version:** 1.0.0

Proxy API for Vietnam Social Insurance (BHXH) Dich Vu Cong.

Provides authenticated access to employee data and lookup tables.



## Authentication

- Sessions are managed via KV cache (1 hour TTL)

- Use `/api/v1/login/captcha` to get captcha

- Use `/api/v1/login/token` to exchange captcha for session



## Base URL

- Production: `https://{worker-subdomain}.workers.dev/api/v1`

- Local: `http://localhost:8787/api/v1`



## Servers

| URL | Description |
|-----|-------------|
| `https://{subdomain}.workers.dev/api/v1` | Production Cloudflare Worker |
| `http://localhost:8787/api/v1` | Local development |

## GET /employees

**List employees**

Retrieve paginated list of insured employees

### Parameters

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| `page` | query | integer | No | Page number |
| `size` | query | integer | No | Page size |

### Responses

| `200` | List of employees
    | Schema: `EmployeeListResponse`
| `401` | Session expired or invalid

---

## GET /health

**Health check**

Returns API status and version

### Responses

| `200` | Service is healthy
    | Schema: `HealthResponse`

---

## GET /login/captcha

**Get captcha for manual login**

Returns captcha image and tokens for manual login flow.
Use this when AI captcha solving is not available.


### Responses

| `200` | Captcha data
    | Schema: `CaptchaResponse`

---

## POST /login/token

**Exchange captcha for auth token**

Complete login by providing solved captcha

### Request Body

```json
{
  "$ref": "#/components/schemas/LoginTokenRequest"
}
```

### Responses

| `200` | Login successful, session cached
    | Schema: `LoginResponse`
| `400` | Missing required fields
| `401` | Invalid captcha or credentials

---

## GET /lookup/benefits

**Get benefits**

Lookup table code 098

### Responses

| `200` | List of benefits

---

## GET /lookup/countries

**Get countries**

Lookup table code 072

### Responses

| `200` | List of countries

---

## GET /lookup/document-list

**Get document list**

Lookup table code 028

### Responses

| `200` | List of documents

---

## GET /lookup/ethnicities

**Get ethnicities**

Lookup table code 073

### Responses

| `200` | List of ethnicities

---

## GET /lookup/labor-plan-types

**Get labor plan types**

Lookup table code 086

### Responses

| `200` | List of labor plan types

---

## GET /lookup/paper-types

**Get paper types**

Lookup table code 071

### Responses

| `200` | List of paper types

---

## GET /lookup/relationships

**Get relationships**

Lookup table code 099

### Responses

| `200` | List of relationships

---

## POST /session/refresh

**Refresh session**

Force refresh the authentication session

### Responses

| `200` | Session refreshed
    | Schema: `SessionRefreshResponse`

---

## GET /session/status

**Session status**

Check if current session is valid

### Responses

| `200` | Session status
    | Schema: `SessionStatus`

---

## Schemas

### HealthResponse

```json
{
  "status?": string // example: "ok",
  "service?": string // example: "bhxh-proxy-worker",
  "version?": string // example: "v1",
  "timestamp?": string // example: "2026-01-30T17:00:00.000Z"
}
```

### Employee

```json
{
  "id?": integer // example: 12345,
  "Hoten?": string // example: "Nguyen Van A",
  "Masobhxh?": string // example: "0123456789",
  "chucVu?": string // example: "Nhan Vien",
  "mucLuong?": number // example: 5000000,
  "tinhTrang?": string // example: "Dang Lam Viec",
  "Ngaysinh?": string // example: "1990-01-15",
  "Gioitinh?": integer // example: 1,
  "soCMND?": string // example: "123456789"
}
```

### EmployeeListResponse

```json
{
  "success?": boolean // example: true,
  "data?": Employee[],
  "meta?": object
}
```

### SessionStatus

```json
{
  "status?": string // example: "active",
  "expiresIn?": integer // example: 3600,
  "unit?": string // example: "Cong Ty ABC"
}
```

### SessionRefreshResponse

```json
{
  "success?": boolean // example: true,
  "message?": string // example: "Session refreshed",
  "unit?": string // example: "Cong Ty ABC",
  "expiresIn?": integer // example: 3600
}
```

### CaptchaResponse

```json
{
  "success?": boolean // example: true,
  "clientId?": string // example: "550e8400-e29b-41d4-a716-446655440000",
  "xClient?": string,
  "captchaToken?": string,
  "captchaImage?": string,
  "message?": string // example: "Solve the captcha and POST to /api/v1/login/token"
}
```

### LoginTokenRequest

```json
{
  "clientId": string,
  "xClient": string,
  "captchaToken": string,
  "captchaSolution": string
}
```

### LoginResponse

```json
{
  "success?": boolean // example: true,
  "token?": string,
  "currentUnit?": object,
  "availableUnits?": object[],
  "expiresIn?": integer // example: 3600,
  "message?": string // example: "Session cached. You can now call /api/v1/employees"
}
```
