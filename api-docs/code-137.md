# API Code 137: Monthly Payment Obligation (C12 Report)

**Purpose**: Retrieves the complete monthly reconciliation statement (Bảng kê C12) showing all financial obligations, payments, and balances for a specific month.

## Payload Structure

```json
{
  "thang": "1",           // Month number (1-12)
  "maDmBhxh": "07906",    // BHXH Agency Code
  "maDonVi": "TZH490L",   // Unit Code
  "masobhxhuser": "TZH490L",
  "macoquanuser": "07906",
  "loaidoituonguser": "1"
}
```

## Response Structure

```json
{
  "maCqBhxh": "07906",
  "tenCqBhxh": "Bảo hiểm xã hội cơ sở Bình Thạnh",
  "c12s": [ /* Array of line items */ ]
}
```

---

## C12 Report Structure (c12s Array)

This is a hierarchical financial statement with sections A through Đ. Each item contains:

| Field      | Type          | Description                                 |
| ---------- | ------------- | ------------------------------------------- |
| `tenDonVi` | string        | Unit name                                   |
| `maDonVi`  | string        | Unit code                                   |
| `diaChi`   | string        | Unit address                                |
| `stt`      | string        | Section/Line code (e.g., "A", "B.1", "D.1") |
| `noiDung`  | string        | Line item description                       |
| `bhxh`     | string/number | Social Insurance amount                     |
| `bhyt`     | string/number | Health Insurance amount                     |
| `bhtn`     | string/number | Unemployment Insurance amount               |
| `bhtnld`   | string/number | Labor Accident Insurance amount             |
| `cong`     | string/number | Total amount                                |

---

## Section Breakdown

### Section A: Previous Period Balance (Kỳ trước mang sang)
Amounts carried over from previous months.

| Code    | Description        | Purpose                  |
| ------- | ------------------ | ------------------------ |
| `A`     | Kỳ trước mang sang | Total carried over       |
| `A.1`   | Số lao động        | Number of employees      |
| `A.2`   | Phải đóng          | Amount due               |
| `A.2.1` | Thừa               | Overpayment              |
| `A.2.2` | Thiếu              | Underpayment             |
| `A.3`   | Thiếu lãi          | Interest on underpayment |

### Section B: Current Period Activity (Phát sinh trong kỳ)
All changes and obligations for the current month.

| Code      | Description                   | Purpose                             |
| --------- | ----------------------------- | ----------------------------------- |
| `B`       | Phát sinh trong kỳ            | **Total current period obligation** |
| `B.1`     | Số lao động                   | Employee count changes              |
| `B.1.1`   | Tăng                          | Employees added (count)             |
| `B.1.2`   | Giảm                          | Employees removed (count)           |
| `B.2`     | Quỹ lương                     | Total salary fund                   |
| `B.2.1`   | Tăng                          | Salary increase                     |
| `B.2.2`   | Giảm                          | Salary decrease                     |
| `B.3`     | Phải đóng                     | **Amount due for current period**   |
| `B.3.1`   | Tăng                          | Increase in obligation              |
| `B.3.2`   | Giảm                          | Decrease in obligation              |
| `B.4`     | Điều chỉnh phải đóng kỳ trước | Adjustments to prior periods        |
| `B.4.1`   | Tăng                          | Increase adjustment                 |
| `B.4.1.1` | Trong đó: năm trước           | Of which: prior year                |
| `B.4.2`   | Giảm                          | Decrease adjustment                 |
| `B.4.2.1` | Trong đó: năm trước           | Of which: prior year                |
| `B.4.3`   | Điều chỉnh                    | Net adjustment                      |
| `B.5`     | Lãi                           | Interest calculations               |
| `B.5.1`   | Số tiền tính lãi              | Principal for interest              |
| `B.5.2`   | Tỷ lệ tính lãi                | Interest rate (%)                   |
| `B.5.3`   | Tổng tiền lãi                 | Total interest                      |
| `B.6`     | 2% bắt buộc để lại            | 2% mandatory reserve                |

### Section C: Payments Made (Số tiền đã nộp trong kỳ)
Payments received during the period.

| Code  | Description               | Purpose                        |
| ----- | ------------------------- | ------------------------------ |
| `C`   | Số tiền đã nộp trong kỳ   | **Total payments received**    |
| `C.1` | + UNC số [X], Ngày [date] | Individual payment transaction |

### Section D: Payment Allocation (Phân bổ tiền đóng)
How payments are allocated across obligations.

| Code  | Description       | Purpose                      |
| ----- | ----------------- | ---------------------------- |
| `D`   | Phân bổ tiền đóng | Payment allocation           |
| `D.1` | Phải đóng         | **Allocated to obligations** |
| `D.2` | tiền lãi          | Allocated to interest        |

### Section Đ: Carried Forward (Chuyển kỳ sau)
Balance to carry to next period.

| Code    | Description   | Purpose                  |
| ------- | ------------- | ------------------------ |
| `Đ`     | Chuyển kỳ sau | Total carried forward    |
| `Đ.1`   | Số lao động   | Employee count           |
| `Đ.2`   | Phải đóng     | Amount due               |
| `Đ.2.1` | Thừa          | Overpayment              |
| `Đ.2.2` | Thiếu         | Underpayment             |
| `Đ.2.3` | Thiếu lãi     | Interest on underpayment |

---

## Key Calculations

### Total Amount to Pay
```javascript
const totalDue = c12s.find(item => item.stt === "D.1")?.cong || 0;
```

### Current Month Obligation
```javascript
const currentObligation = c12s.find(item => item.stt === "B.3")?.cong || 0;
```

### Payment Status
```javascript
const paid = c12s.find(item => item.stt === "C")?.cong || 0;
const allocated = c12s.find(item => item.stt === "D.1")?.cong || 0;
const remaining = c12s.find(item => item.stt === "Đ.2")?.cong || 0;
```

### Employee Changes
```javascript
const employeesAdded = c12s.find(item => item.stt === "B.1.1")?.bhxh || 0;
const employeesRemoved = c12s.find(item => item.stt === "B.1.2")?.bhxh || 0;
const currentEmployees = c12s.find(item => item.stt === "Đ.1")?.bhxh || 0;
```

---

## Example Data Interpretation

From your sample:
- **Current Period Obligation** (`B.3`): 3,398,400 VND
- **Payments Made** (`C`): 3,398,400 VND (UNC #01043, 29/01/2026)
- **Amount Allocated** (`D.1`): 3,398,400 VND
- **Remaining Balance** (`Đ.2`): 0 VND ✅ Fully paid

Breakdown:
- BHXH: 2,655,000 VND
- BHYT: 477,900 VND
- BHTN: 212,400 VND
- BHTNLD: 53,100 VND

Employee count: 2 employees added (`B.1.1`), 2 active (`Đ.1`)

---

## Implementation Notes

1. **Always parse the entire `c12s` array** - it's a complete financial statement
2. **Use `stt` codes to extract specific values** - don't rely on array position
3. **The `cong` field is the total** - individual insurance types sum to this
4. **Section C.1 shows payment references** - useful for reconciliation
5. **Interest rates are in `B.5.2`** - stored as decimals (0.644 = 0.644%)
