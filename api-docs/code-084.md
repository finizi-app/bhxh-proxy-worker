# API Code 084: Save/Submit Procedure Form

**Purpose**: Main submission API for saving filled procedure forms (Code 600, etc.) to the BHXH server.

**Triggered by**: Clicking the **"Lưu" (Save)** button on procedure forms

> [!IMPORTANT]
> **Direct API Usage**: You can call Code 084 directly without going through the Code 600 UI form. The UI validation (documented in [code-600.md](code-600.md)) happens client-side only. As long as your payload meets the validation requirements, you can bypass the entire browser form and submit directly to this API.
>
> **For automation**: Build your payload according to the structure below, ensure all required fields are present and valid, then POST directly to `/CallApiWithCurrentUser` with `code: "084"`.

---

## Payload Structure

```json
{
  "code": "084",
  "data": {
    "thuTuc": {
      "maThuTuc": "600",           // Procedure code
      "kyKeKhai": "022026",        // Declaration period (MMYYYY)
      "maCoQuan": "07906",         // Agency code
      "maDonVi": "TZH490L",        // Unit code
      "status": 4                  // Status code (see below)
    },
    "D02-TS": {
      "nguoiLaoDong": [
        {
          "Hoten": "Trần Hạ Trân",
          "Masobhxh": "7937368040",
          "phuongAn": "TM",          // Method code
          "tienLuong": 5310000,
          "tuThang": "01/2026",
          "denThang": "01/2026",
          "chucVu": "Nhân viên bán hàng",
          "daCoSo": true,
          "tinhLai": false,
          "ghiChu": ""
        }
      ]
    },
    "TK1-TS": {
      "nguoiLaoDong": [
        {
          "Hoten": "Trần Hạ Trân",
          "Masobhxh": "7937368040",
          "listThanhVien": [
            // Family member details
          ]
        }
      ]
    },
    "listToKhai": [
      {"maToKhai": "D02-TS", "tenToKhai": "Đăng ký, điều chỉnh đóng BHXH"},
      {"maToKhai": "TK1-TS", "tenToKhai": "Tờ khai tổng hợp"}
    ]
  }
}
```

---

## Response Structure

### Success
```json
{
  "success": true,
  "message": "Lưu thành công",
  "thuTucId": 8092349
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...]
}
```

---

## Status Codes

| Status | Meaning        | Description                                   |
| ------ | -------------- | --------------------------------------------- |
| **4**  | Draft/Recorded | Form saved but not yet submitted for approval |
| **1**  | Pending        | Submitted and awaiting approval               |
| **2**  | Approved       | Approved by BHXH agency                       |
| **3**  | Rejected       | Rejected by BHXH agency                       |

---

## Form Types (listToKhai)

| Code       | Name                          | Description                           |
| ---------- | ----------------------------- | ------------------------------------- |
| **D02-TS** | Đăng ký, điều chỉnh đóng BHXH | Employee registration/adjustment form |
| **TK1-TS** | Tờ khai tổng hợp              | Summary declaration form              |
| **D01-TS** | Giảm lao động                 | Employee termination form             |

---

## Method Codes (phuongAn)

| Code   | Vietnamese Name | English             | Description              |
| ------ | --------------- | ------------------- | ------------------------ |
| **TM** | Tăng mới        | New Registration    | Register new employee    |
| **DC** | Điều chỉnh      | Adjustment          | Adjust existing employee |
| **TT** | Tăng thêm       | Additional Increase | Increase contribution    |

---

## Usage Example

```typescript
const payload = {
  code: "084",
  data: {
    thuTuc: {
      maThuTuc: "600",
      kyKeKhai: `${month.padStart(2, '0')}${year}`,
      maCoQuan: session.currentDonVi.MaCoquan,
      maDonVi: session.currentDonVi.Ma,
      status: 4 // Save as draft
    },
    "D02-TS": {
      nguoiLaoDong: employees.map(emp => ({
        Hoten: emp.fullName,
        Masobhxh: emp.insuranceNumber,
        phuongAn: "TM",
        tienLuong: emp.salary,
        tuThang: `${month}/${year}`,
        denThang: `${month}/${year}`,
        chucVu: emp.position,
        daCoSo: emp.hasInsuranceBook,
        tinhLai: false,
        ghiChu: emp.notes || ""
      }))
    },
    listToKhai: [
      {maToKhai: "D02-TS", tenToKhai: "Đăng ký, điều chỉnh đóng BHXH"}
    ]
  }
};

const response = await client.callApi("084", payload.data, session.token, session.xClient);
```

---

## Related Documentation

- [Code 600: Register/Adjust BHXH](code-600.md) - Complete validation and form documentation
- [Code 067: Employee List](code-067.md) - Search employees for selection
- [Code 117: Employee Details](code-117.md) - Fetch full employee information
