# Payment Page Documentation (`nop-bao-hiem-xa-hoi`)

**URL**: `https://dichvucong.baohiemxahoi.gov.vn/#/thanh-toan-bhxh-dien-tu/nop-bao-hiem-xa-hoi`

**Purpose**: Execute monthly social insurance payment for the registered unit.

---

## API Flow (Confirmed)

### 1. Session Validation
**Endpoint**: `GET /check`
- Validates the current session/token is still active.
- Called periodically throughout the page lifecycle.

### 2. Load Agency Bank Account
**API Code**: `503`
**Payload**:
```json
{
  "Masobhxh": "TZH490L",
  "Macoquan": "07906",
  "Loaidoituong": "1",
  "masobhxhuser": "TZH490L",
  "macoquanuser": "07906",
  "loaidoituonguser": "1"
}
```
**Response**: Unit information (structure TBD - need actual response).

### 3. Get BHXH Beneficiary Bank Accounts
**API Code**: `504`
**Payload**:
```json
{
  "maCoquan": "07906",
  "masobhxhuser": "TZH490L",
  "macoquanuser": "07906",
  "loaidoituonguser": "1"
}
```
**Response**:
```json
[
  {
    "tkThuHuong": "1359832099",
    "maNHThuHuong": "79202007",
    "tenVietTatNHThuHuong": "BIDV",
    "tenNHThuHuong": "Ngân hàng TMCP Đầu tư và Phát triển Việt nam - Chi nhánh Gia Định"
  }
]
```

### 4. Get Monthly Payment Obligation
**API Code**: `137`
**Payload**:
```json
{
  "thang": "1",
  "maDmBhxh": "07906",
  "maDonVi": "TZH490L",
  "masobhxhuser": "TZH490L",
  "macoquanuser": "07906",
  "loaidoituonguser": "1"
}
```
**Response**: Detailed breakdown with line items in `c12s` array. Key item to find: `stt="D.1"` which contains the total amount due.

---

## Payment Reference String Format

Auto-generated pattern: `+BHXH+[Type]+[Reserved]+[UnitCode]+[AgencyCode]+[Description]+`

**Example**: `+BHXH+103+00+TZH490L+07906+dong BHXH+`
- `103`: Transaction Type (Payment)
- `00`: Reserved/Version
- `TZH490L`: Unit Code
- `07906`: Agency Code
- `dong BHXH`: Description

---

## Implementation Notes

1. **Amount Calculation**: Parse Code 137 response, find item where `stt="D.1"`, use `cong` field for total.
2. **Bank Account**: Code 504 returns the target BHXH bank account details.
3. **Payment Submission**: Actual payment submission endpoint not yet captured (requires E-Payment registration).
4. **History**: Use Code 514 to retrieve past payment records.

---

## Related Documentation
- [Code 137: Monthly Obligation](api-docs/code-137.md)
- [Code 503: Unit Info](api-docs/code-503.md)
- [Code 504: Agency Config](api-docs/code-504.md)
- [Code 514: Payment History](api-docs/code-514.md)
