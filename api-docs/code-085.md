# API Code 085: Submission History (Lịch sử kê khai)

**Purpose**: Retrieve the history of filed procedures/documents (Hồ sơ) for a specific period.

## Payload Structure

```json
{
  "code": "085",
  "data": {
    "soHoSo": "",            // Filter by Document No
    "status": "",            // Filter by Status ID
    "thangKeKhai": "1",      // Month (required)
    "namKeKhai": "2026",     // Year (required)
    "kyKeKhai": "012026",    // Period MMYYYY (required) - Format: Month + Year
    "maThuTuc": "",          // Filter by Procedure Code (e.g., "600")
    "dot": "",               // Batch number
    "PageSize": "50",
    "PageIndex": "1",
    "masobhxhuser": "TZH490L",   // Unit Code (User Context)
    "macoquanuser": "07906",     // Agency Code (User Context)
    "loaidoituonguser": "1"      // Object Type (User Context)
  }
}
```

## Response Structure

The response contains a list of procedures (`DSThuTuc`) and total count.

### Sample Response (Captured from Live System)

```json
{
    "DSThuTuc": [
        {
            "id": 8103194.0,
            "ngayTao": "2026-01-31T22:05:48",
            "status": 4,  // Status 4: Possibly "Processing" or "Completed"
            "maCoQuan": "07906",
            "maThuTuc": "600",
            "tenCoQuan": "Bảo hiểm xã hội Cơ sở Bình Thạnh",
            "kyKeKhai": "012026",
            "dot": 2,
            "soHoSo": null, // Can be null if not yet finalized?
            "tenThuTuc": "Báo tăng, báo giảm, điều chỉnh đóng BHXH, BHYT, BHTN, BHTNLĐ, BNN",
            "rowNumber": 1.0,
            "totalRecords": 2.0,
            "ngayGui": "2026-01-31T22:27:43"
        },
        {
            "id": 7965825.0,
            "ngayTao": "2026-01-13T09:13:00",
            "status": 2,  // Status 2: Possibly "Submitted"
            "maCoQuan": "07906",
            "maThuTuc": "600",
            "tenCoQuan": "Bảo hiểm xã hội Cơ sở Bình Thạnh",
            "kyKeKhai": "012026",
            "dot": 1,
            "soHoSo": "03706/2026/07906",
            "tenThuTuc": "Báo tăng, báo giảm, điều chỉnh đóng BHXH, BHYT, BHTN, BHTNLĐ, BNN",
            "rowNumber": 2.0,
            "totalRecords": 2.0,
            "ngayGui": "2026-01-13T09:29:22"
        }
    ],
    "TotalRecords": 2.0
}
```

### Key Fields

- **id**: Internal ID of the submission record.
- **soHoSo**: Official Document Number (e.g., `03706/2026/07906`). Can be `null`.
- **status**: Integer status code.
  - `2`: Likely "Submitted" (Đã gửi).
  - `4`: Likely "Processing" or "Accepted" (Đang xử lý / Đã tiếp nhận).
- **maThuTuc**: Procedure code (e.g., `600`).
- **kyKeKhai**: Billing period (e.g., `012026` for Jan 2026).
- **dot**: Submission batch number within the period.
- **ngayGui**: Date and time sent.
