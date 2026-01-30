### Payload
```json
{
  "code": "085",
  "data": {
    "soHoSo": "",            // Filter by Document No
    "status": "",            // Filter by Status ID
    "thangKeKhai": "1",      // Month (required)
    "namKeKhai": "2026",     // Year (required)
    "kyKeKhai": "012026",    // Period MMYYYY (required)
    "maThuTuc": "",          // Filter by Procedure Code
    "dot": "",               // Batch number
    "PageSize": "50",
    "PageIndex": "1",
    "masobhxhuser": "...",   // User Context
    "macoquanuser": "...",   // User Context
    "loaidoituonguser": "1"  // User Context
  }
}
```

### Response Example
```json
{
  "DSThuTuc": [
    {
      "id": 7965825.0,
      "soHoSo": "03706/2026/07906",
      "maThuTuc": "600",
      "tenThuTuc": "Báo tăng, báo giảm...",
      "status": 2,
      "ngayGui": "2026-01-13T09:29:22",
      "kyKeKhai": "012026",
      "dot": 1,
      "maCoQuan": "07906",
      "tenCoQuan": "Bảo hiểm xã hội Cơ sở Bình Thạnh"
    }
  ],
  "TotalRecords": 1.0
}
```
