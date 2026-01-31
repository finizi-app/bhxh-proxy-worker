# Vietnam Social Security (DVC BHXH) API Reference

This document catalogs the API endpoints discovered during reverse engineering. All endpoints use the main `CallApiWithCurrentUser` gateway.

## Base Configuration

*   **URL**: `https://dichvucong.baohiemxahoi.gov.vn/CallApiWithCurrentUser`
*   **Method**: `POST`
*   **Auth**: Bearer Token + AES Encrypted `X-CLIENT` header.

---

## 1. Employee Management

*   **[Code 067](code-067.md)** - Get employee list
*   **[Code 172](code-172.md)** - Get employee details (Draft/Internal)
*   **[Code 156](code-156.md)** - Get employee official data (Sync/Validation)
*   See [employee_api_docs.md](employee_api_docs.md) and [edit_employee_flow.md](edit_employee_flow.md).

---

## 2. Declarations & Submissions

*   **[Code 600](code-600.md)** - **Register/Adjust BHXH Contributions** (D02-TS, TK1-TS, D01-TS forms)
  - Comprehensive validation rules documented
  - Client-side validation flow reverse-engineered
*   **[Code 084](code-084.md)** - **Save/Submit Procedure Form** ⭐
  - Main submission API for Code 600 and other procedures
  - Saves form data to server (draft or final)
*   **[Code 117](code-117.md)** - Fetch Full Employee Details
  - Used when selecting employees for forms
  - Returns comprehensive employee data
*   **View [submission_history_api_docs.md](submission_history_api_docs.md) for:**
  - **[Code 085](code-085.md)** - Submission History
  - **[Code 090](code-090.md)** - Declaration Detail
  - **[Code 062](code-062.md)** - Required Forms/Templates
  - **[Code 019](code-019.md)** - Processing Status
  - **[Code 092](code-092.md)** - Next Batch Number

---

## 3. Payments & Financial

*   **[Code 137](code-137.md)** - **Monthly Payment Obligation** (C12 Report)
*   **[Code 503](code-503.md)** - Get Unit Info for Payment
*   **[Code 504](code-504.md)** - Get Agency Config for Payment
*   **[Code 514](code-514.md)** - Payment History (Electronic payments)




---

## 2. Reference Data (Metadata)

These APIs return dictionaries/catalogs used for dropdowns and mapping codes.

| Code    | Purpose                     | Response Structure | Sample Data                                                                                        |
| ------- | --------------------------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| **071** | **Paper Types**             | Array              | `{"ma": "01", "ten": "Sổ hộ khẩu"}`                                                                |
| **072** | **Countries**               | Array              | `{"ma": "VN", "ten": "VIET NAM"}`                                                                  |
| **073** | **Ethnicities**             | Array              | `{"ma": "01", "ten": "Kinh"}`                                                                      |
| **086** | **Labor Plan Types**        | Array              | `{"ma": 1, "ten": "Tăng lao động"}`                                                                |
| **098** | **Chedo / Benefits**        | Array              | `{"ma_chedo": "DS", "ten_nhomhuong": "Dưỡng sức"}`                                                 |
| **099** | **Relationships**           | Array              | `{"ma": "00", "ten": "Chủ hộ"}` (Head of Household)                                                |
| **063** | **Districts**               | Array              | `{"maTinh": "79"}` -> List of districts (Quan 1, Quan 3...)                                        |
| **028** | **Document List (Thủ tục)** | Array (Paginated)  | Returns list of administrative procedures. See [Procedure API Master Page](procedure_api_docs.md). |

### Common Metadata Payload
Most metadata APIs just require the user context fields:
```json
{
  "code": "071",
  "data": {
    "masobhxhuser": "...",
    "macoquanuser": "...",
    "loaidoituonguser": "1"
  }
}
```

---

## 3. Other/Unknown Codes

| Code | Notes |
| ---- | ----- |

| **063** | Documeted as [Code 063](code-063.md) (Get Districts).                                           |

## 4. System/Utility Endpoints

| Endpoint   | Method | Purpose                                                                                                                                   |
| ---------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **/check** | `GET`  | **Session Heartbeat / Token Validation**. <br>Sends empty body check to keep session alive and validate token. Returns success if active. |
