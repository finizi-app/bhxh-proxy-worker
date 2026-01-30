# API Code 117: Fetch Full Employee Details

**Purpose**: Retrieve comprehensive employee information when selected for procedure forms.

---

## Payload Structure

```json
{
  "code": "117",
  "data": {
    "listNldid": [123456, 789012],  // Array of employee internal IDs
    "masobhxhuser": "TZH490L",
    "macoquanuser": "07906",
    "loaidoituonguser": "1"
  }
}
```

---

## Response Structure

Returns exhaustive employee details including:

```json
{
  "dsLaoDong": [
    {
      "nldid": 123456,
      "Hoten": "Trần Hạ Trân",
      "Masobhxh": "7937368040",
      "ngaySinh": "1990-05-15",
      "gioiTinh": "Nữ",
      "diaChi": "123 Nguyễn Văn Linh, Q.7, TP.HCM",
      "soDienThoai": "0901234567",
      "email": "tran.ha.tran@example.com",
      
      // Contract information
      "hopDong": {
        "loaiHopDong": "Không xác định thời hạn",
        "ngayBatDau": "2024-01-01",
        "ngayKetThuc": null
      },
      
      // Current salary
      "luong": {
        "mucLuong": 5310000,
        "heSo": null,
        "phuCapChucVu": 0,
        "phuCapTNVK": 0,
        "phuCapTNNghe": 0
      },
      
      // Family members
      "listThanhVien": [
        {
          "hoTen": "Nguyễn Văn A",
          "quanHe": "Vợ/Chồng",
          "ngaySinh": "1992-03-20",
          "cccd": "079092001234"
        }
      ],
      
      // Employment history
      "lichSuCongTac": [...]
    }
  ]
}
```

---

## Field Descriptions

| Field           | Type   | Description                               |
| --------------- | ------ | ----------------------------------------- |
| `nldid`         | number | Internal employee ID (used for selection) |
| `Hoten`         | string | Full name                                 |
| `Masobhxh`      | string | Social insurance number (10 digits)       |
| `ngaySinh`      | string | Date of birth (YYYY-MM-DD)                |
| `gioiTinh`      | string | Gender (Nam/Nữ)                           |
| `diaChi`        | string | Full address                              |
| `hopDong`       | object | Contract information                      |
| `luong`         | object | Salary breakdown                          |
| `listThanhVien` | array  | Family members (for TK1-TS form)          |

---

## Usage Example

```typescript
// After user selects employees from Code 067 results
const selectedEmployeeIds = [123456, 789012];

const response = await client.callApi("117", {
  listNldid: selectedEmployeeIds,
  masobhxhuser: session.currentDonVi.Ma,
  macoquanuser: session.currentDonVi.MaCoquan,
  loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1"
}, session.token, session.xClient);

// Use response.dsLaoDong to populate form fields
const employees = response.dsLaoDong;
```

---

## Related Documentation

- [Code 067: Employee List](code-067.md) - Search/list employees
- [Code 600: Register/Adjust BHXH](code-600.md) - Form that uses this data
- [Code 084: Submit Form](code-084.md) - Submit the filled form
