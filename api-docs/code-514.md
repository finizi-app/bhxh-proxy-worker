# API Code 514: Payment History (Lịch sử thanh toán)

**Purpose**: specific retrieval of electronic BHXH payment history.

## Payload Structure

```json
{
  "PageSize": 10,
  "PageIndex": 1,
  "Filter": "",
  "masobhxhuser": "TZH490L", // Unit Code
  "macoquanuser": "07906",   // Agency Code
  "loaidoituonguser": "1"    // Object Type (1 = Organization)
}
```

## Response Structure

### Empty Response (No Payment History)
```json
{
    "DSNopBhxhBB": null,
    "TotalRecords": 0.0
}
```

> [!NOTE]
> If the unit is **not registered for E-Payment** or has no payment history, `DSNopBhxhBB` will be `null`.

### Expected Response (With Data)
```json
{
    "DSNopBhxhBB": [
        {
            // Payment transaction details
            // Fields TBD when actual payment data is available
        }
    ],
    "TotalRecords": 5.0
}
```

## Usage in Client

```typescript
const history = await client.callApi("514", {
    PageSize: 10,
    PageIndex: 1,
    Filter: "",
    masobhxhuser: session.currentDonVi.Ma,
    macoquanuser: session.currentDonVi.MaCoquan,
    loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1"
}, session.token, session.xClient);
```
