# Code 063: Get Districts (Huyen)

**Purpose**: Get the list of Districts (Quan/Huyen) for a specific Province/City.

## 1. Request

**Endpoint**: `/CallApiWithCurrentUser`

**Body**:
```json
{
  "code": "063",
  "data": {
    "maTinh": "79"
  }
}
```

*   `maTinh`: The 2-digit code of the province (e.g., "79" for Ho Chi Minh City, "01" for Hanoi).

## 2. Response (Inferred)

Array of district objects:
```json
[
  {
    "ma": "760",
    "ten": "Quận 1",
    "cap": "Quận"
  },
  ...
]
```
