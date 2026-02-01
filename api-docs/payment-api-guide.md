# Payment API Usage Guide

## Overview

The Payment API provides comprehensive access to BHXH payment functionality including monthly obligation reports, payment history, bank account information, and payment reference generation.

## Authentication

All payment endpoints require the following headers:

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes | API key for proxy authentication |
| `X-Username` | No* | BHXH username for per-request authentication |
| `X-Password` | No* | BHXH password for per-request authentication |

\*Headers are optional if default credentials are configured.

**Example:**
```bash
curl -X GET "http://localhost:4000/api/v1/payments/c12-report?thang=1&nam=2026" \
  -H "X-API-Key: your-api-key" \
  -H "X-Username: your@email.com" \
  -H "X-Password: yourpassword"
```

## C12 Monthly Report

### Use Case

Get detailed monthly payment obligation showing:
- Previous period balance (Section A)
- Current period activity (Section B)
- Payments made (Section C)
- Payment allocation (Section D)
- Balance carried forward (Section Dau)

### Endpoint

`GET /api/v1/payments/c12-report`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| thang | number | Yes | Month number (1-12) |
| nam | number | No | Year (defaults to current year) |

### Example Request

```bash
curl -X GET "http://localhost:4000/api/v1/payments/c12-report?thang=1&nam=2026" \
  -H "X-API-Key: your-api-key" \
  -H "X-Username: your@email.com" \
  -H "X-Password: yourpassword"
```

### Response

```json
{
  "success": true,
  "data": {
    "raw": {
      "maCqBhxh": "07906",
      "tenCqBhxh": "Bao hiem xa hoi co so Binh Thanh",
      "c12s": [...]
    },
    "parsed": {
      "agencyCode": "07906",
      "agencyName": "Bao hiem xa hoi co so Binh Thanh",
      "sectionA": { "amountDue": 15000000 },
      "sectionB": { "amountDue": 45000000, "employeesAdded": 2, "employeesRemoved": 0 },
      "sectionC": { "total": 50000000, "count": 1 },
      "sectionD": { "allocatedToObligations": 47000000 },
      "sectionDau": { "amountDue": 13000000 }
    }
  },
  "meta": {
    "month": 1,
    "year": 2026,
    "unitCode": "TZH490L"
  }
}
```

### Parsing the Response

```typescript
// Raw data - hierarchical c12s array
const raw = response.data.raw.c12s;

// Parsed sections - structured data
const parsed = response.data.parsed;

// Get total amount due
const totalDue = parsed.sectionD?.allocatedToObligations || 0;

// Get current period obligation
const currentObligation = parsed.sectionB?.amountDue || 0;

// Get payments made
const paymentsMade = parsed.sectionC?.total || 0;

// Get remaining balance
const remaining = parsed.sectionDau?.amountDue || 0;
```

## Payment History

### Use Case

Retrieve electronic payment transaction records with pagination.

### Endpoint

`GET /api/v1/payments/history`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| PageIndex | number | No | Page number (default: 1) |
| PageSize | number | No | Page size (default: 10) |
| Filter | string | No | Filter string |

### Example Request

```bash
curl -X GET "http://localhost:4000/api/v1/payments/history?PageIndex=1&PageSize=10" \
  -H "X-API-Key: your-api-key" \
  -H "X-Username: your@email.com" \
  -H "X-Password: yourpassword"
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "maDonVi": "TZH490L",
      "tenDonVi": "CONG TY TNHH ABC",
      "soTien": "50000000",
      "ngayNop": "2026-01-15T00:00:00",
      "trangThai": "Da hoan thanh"
    }
  ],
  "meta": {
    "total": 5,
    "count": 1,
    "pageIndex": 1,
    "pageSize": 10
  }
}
```

### Handling Empty History

When no payment history exists, the API returns an empty array (not null):

```typescript
if (response.data.data.length === 0) {
  console.log("No payment history found");
  console.log("Total records:", response.data.meta.total); // Will be 0
}
```

## Bank Accounts

### Use Case

Get valid beneficiary bank accounts for BHXH payments.

### Endpoint

`GET /api/v1/payments/bank-accounts`

### Example Request

```bash
curl -X GET "http://localhost:4000/api/v1/payments/bank-accounts" \
  -H "X-API-Key: your-api-key" \
  -H "X-Username: your@email.com" \
  -H "X-Password: yourpassword"
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "tkThuHuong": "1359832099",
      "maNHThuHuong": "79202007",
      "tenVietTatNHThuHuong": "BIDV",
      "tenNHThuHuong": "Ngan hang TMCP Dau tu va Phat trien Viet nam - Chi nhanh Gia Dinh"
    }
  ],
  "meta": {
    "agencyCode": "07906",
    "count": 1
  }
}
```

### Using Bank Account Information

```typescript
const accounts = response.data.data;

accounts.forEach(account => {
  console.log("Account:", account.tkThuHuong);
  console.log("Bank:", account.tenVietTatNHThuHuong);
  console.log("Full Name:", account.tenNHThuHuong);
  console.log("Bank Code:", account.maNHThuHuong);
});
```

## Payment Reference

### Use Case

Generate standardized BHXH payment reference string for bank transfers.

### Endpoint

`GET /api/v1/payments/reference`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | No | Transaction type (default: "103") |
| description | string | No | Payment description (default: "dong BHXH") |
| unitCode | string | No | Unit code (uses session default if not provided) |
| agencyCode | string | No | Agency code (uses session default if not provided) |

### Example Request

```bash
curl -X GET "http://localhost:4000/api/v1/payments/reference?type=103&description=dong+BHXH" \
  -H "X-API-Key: your-api-key" \
  -H "X-Username: your@email.com" \
  -H "X-Password: yourpassword"
```

### Response

```json
{
  "success": true,
  "data": {
    "reference": "+BHXH+103+00+TZH490L+07906+dong BHXH+",
    "components": {
      "prefix": "BHXH",
      "type": "103",
      "reserved": "00",
      "unitCode": "TZH490L",
      "agencyCode": "07906",
      "description": "dong BHXH"
    }
  }
}
```

### Reference Format

```
+BHXH+[Type]+[Reserved]+[UnitCode]+[AgencyCode]+[Description]+
```

Example: `+BHXH+103+00+TZH490L+07906+dong BHXH+`

### Custom Reference

```bash
curl -X GET "http://localhost:4000/api/v1/payments/reference?type=103&description=January+2026+payment" \
  -H "X-API-Key: your-api-key" \
  -H "X-Username: your@email.com" \
  -H "X-Password: yourpassword"
```

## Unit Info

### Use Case

Get unit payment information for payment initialization.

### Endpoint

`GET /api/v1/payments/unit-info`

### Example Request

```bash
curl -X GET "http://localhost:4000/api/v1/payments/unit-info" \
  -H "X-API-Key: your-api-key" \
  -H "X-Username: your@email.com" \
  -H "X-Password: yourpassword"
```

## Error Handling

All endpoints return consistent error format:

```typescript
try {
  const response = await axios.get("/api/v1/payments/c12-report", { ... });
} catch (error) {
  if (error.response.status === 401) {
    console.error("Missing API key");
  } else if (error.response.status === 403) {
    console.error("Invalid API key");
  } else if (error.response.status === 500) {
    console.error("Server error:", error.response.data.message);
  }
}
```

## Complete Workflow Example

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "X-API-Key": "your-api-key",
    "X-Username": "your@email.com",
    "X-Password": "yourpassword",
  },
});

async function getPaymentSummary(month: number) {
  // 1. Get C12 report
  const c12 = await api.get("/api/v1/payments/c12-report", {
    params: { thang: month }
  });

  const parsed = c12.data.data.parsed;

  // 2. Extract key metrics
  const summary = {
    agency: parsed.agencyName,
    currentObligation: parsed.sectionB?.amountDue || 0,
    paymentsMade: parsed.sectionC?.total || 0,
    totalDue: parsed.sectionD?.allocatedToObligations || 0,
    remainingBalance: parsed.sectionDau?.amountDue || 0,
  };

  // 3. Get payment history
  const history = await api.get("/api/v1/payments/history");
  summary.paymentCount = history.data.meta.total;

  // 4. Get bank accounts for payment
  const accounts = await api.get("/api/v1/payments/bank-accounts");
  summary.bankAccounts = accounts.data.data;

  // 5. Generate payment reference if needed
  if (summary.remainingBalance > 0) {
    const ref = await api.get("/api/v1/payments/reference");
    summary.paymentReference = ref.data.data.reference;
  }

  return summary;
}
```
