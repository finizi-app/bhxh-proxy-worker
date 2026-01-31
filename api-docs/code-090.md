# API Code 090: Get Declaration Detail (Chi tiết hồ sơ / Xem tờ khai)

**Purpose**: Retrieve the detailed content of a specific declaration submission (Hồ sơ), including member lists (`D02-TS`), application forms (`TK1-TS`), and metadata.

## Payload Structure

```json
{
  "code": "090",
  "data": {
    "maThuTuc": "600",     // Procedure Code (e.g., "600" for Báo tăng/giảm)
    "kyKeKhai": "012026",  // Period MMYYYY
    "dot": "2",            // Batch number
    "masobhxhuser": "TZH490L",  // Unit Code (User Context)
    "macoquanuser": "07906",    // Agency Code (User Context)
    "loaidoituonguser": "1"     // Object Type (User Context)
  }
}
```

## Response Structure

The response contains the full data set for the declaration.

### Key Fields

- **id**: Submission ID.
- **status**: Status code (e.g., `4`).
- **D02-TS**: List of employees with changes (Increase/Decrease, labor changes).
- **TK1-TS**: List of individual application details (Tờ khai tham gia).
- **listToKhai**: Metadata about the forms included in this submission.

### Status Codes

- `2`: **Submitted** (Đã nộp/Chờ xử lý). The declaration has been sent to BHXH.
- `4`: **Processing/Accepted** (Đang xử lý/Chấp nhận).

### Field Analysis: D02-TS (Employee Changes)

The `D02-TS` array contains detailed employment data.

#### 1. Vị Trí Việc Làm (VTVL) - Job Position

Categorizes the employee's role and effective period.

| Field Name          | Description      | Details                                              |
| :------------------ | :--------------- | :--------------------------------------------------- |
| `chucVu`            | **Job Title**    | Specific position name (e.g., "Nhân viên bán hàng"). |
| `VtvlNqlTungay`     | Manager - From   | `Nql`: Người quản lý (Manager/Executive).            |
| `VtvlNqlDenngay`    | Manager - To     |                                                      |
| `VtvlCmktbcTungay`  | High-Tech - From | `Cmktbc`: Chuyên môn kỹ thuật bậc cao.               |
| `VtvlCmktbcDenngay` | High-Tech - To   |                                                      |
| `VtvlCmktbtTungay`  | Mid-Tech - From  | `Cmktbt`: Chuyên môn kỹ thuật bậc trung.             |
| `VtvlCmktbtDenngay` | Mid-Tech - To    |                                                      |
| `VtvlKhacTungay`    | Other - From     | `Khac`: Other roles (Unskilled, Service, etc.).      |
| `VtvlKhacDenngay`   | Other - To       |                                                      |

#### 2. Hợp Đồng Lao Động (HĐLĐ) - Labor Contract

Defines the type and duration of the labor contract. Populated fields indicate the contract type.

| Field Name        | Description                     | Contract Type                                                   |
| :---------------- | :------------------------------ | :-------------------------------------------------------------- |
| `HdldTungay`      | **Indefinite Term** - From Date | HĐLĐ Không xác định thời hạn (Indefinite). Only has Start Date. |
| `HdldXdthTungay`  | **Definite Term** - From Date   | HĐLĐ Xác định thời hạn (Definite).                              |
| `HdldXdthDenngay` | **Definite Term** - To Date     |                                                                 |
| `HdldKhacTungay`  | **Other/Seasonal** - From Date  | HĐLĐ Khác (Other/Seasonal).                                     |
| `HdldKhacDenngay` | **Other/Seasonal** - To Date    |                                                                 |

#### 3. Other Important Fields

- **`loai`**: Declaration Type code (e.g., `1` for Increase, `3` for Adjustment).
- **`pa`**: Scheme/Plan code (e.g., "TM" for Tăng Mới - New Increase?).
- **`tienLuong`**: Salary amount.
- **`tuThang` / `denThang`**: Period for the declaration (MM/YYYY).
- **`ghiChu`**: Notes (often contains the dossier number).
- **`maVungLTT`**: Region Code for Min. Wage (e.g., "01").

### Sample Response 1: Processing (Status 4)

```json
{
    "id": 8103194.0,
    "ngayTao": "2026-01-31T22:05:48",
    "status": 4,
    "maCoQuan": "07906",
    "D02-TS": [
        {
            "id": 64065547.0,
            "Hoten": "Trần Thị Cẩm Tiên",
            "Masobhxh": "7930514316",
            "chucVu": "Nhân viên bán hàng",
            "tienLuong": 5310000.0,
            "loai": 1,
            
            // Job Position (Example: Other/Unskilled)
            "VtvlKhacTungay": "01/01/2026",
            "VtvlKhacDenngay": "01/01/2026",
            
            // Labor Contract (Example: Indefinite Term)
            "HdldTungay": "01/01/2026",
            "HdldXdthTungay": null,
            "HdldXdthDenngay": null
        }
    ]
}
```

### Sample Response 2: Submitted (Status 2)

```json
{
  "id": 7965825.0,
  "ngayTao": "2026-01-13T09:13:00",
  "status": 2, // Submitted
  "maCoQuan": "07906",
  "kyKeKhai": "012026",
  "dot": 1,
  "soHoSo": "03706/2026/07906",
  "D02-TS": [
    {
      "id": 59253288.0,
      "pa": "TM", // Plan/Scheme (e.g., Tăng Mới)
      "Hoten": "Trần Thị Cẩm Tiên",
      "Masobhxh": "7930514316",
      "chucVu": "Nhân viên bán hàng",
      "tienLuong": 5310000.0,
      "tuThang": "01/2026",
      "denThang": "01/2026",
      "loai": 1,
      
      // Job Position: Other/Unskilled (From 01/12/2025 to 30/11/2026)
      "VtvlKhacTungay": "01/12/2025",
      "VtvlKhacDenngay": "30/11/2026",
      "VtvlNqlTungay": null,
      "VtvlCmktbcTungay": null,
      "VtvlCmktbtTungay": null,
      
      // Labor Contract: Definite Term (From 01/12/2025 to 30/11/2026)
      "HdldTungay": null,
      "HdldXdthTungay": "01/12/2025",
      "HdldXdthDenngay": "30/11/2026",
      "HdldKhacTungay": null
    }
  ],
  "TK1-TS": [
     {
         "id": 87856777.0,
         "Hoten": "Trần Thị Cẩm Tiên",
         "Ngaysinh": "05/01/2003",
         "Gioitinh": "0",
         "quocTich": "VN",
         "diaChi_NN": "19 Võ Văn Tần",
         "Masobhxh": "7930514316",
         "cmnd": "079303017495"
     }
  ]
}
```
