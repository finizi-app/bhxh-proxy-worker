# API Code 062: Get Form Templates (Danh sách mẫu tờ khai)

**Purpose**: Retrieve the list of form templates (Mẫu tờ khai) required or available for a specific procedure (Quy trình).

## Payload Structure

```json
{
  "code": "062",
  "data": {
    "maQuyTrinh": "600",     // Procedure Code (e.g., "600" for Báo tăng/giảm)
    "maCoQuan": "07906",     // Agency Code
    "masobhxhuser": "TZH490L",  // Unit Code (User Context)
    "macoquanuser": "07906",    // Agency Code (User Context)
    "loaidoituonguser": "1"     // Object Type (User Context)
  }
}
```

## Response Structure

The response is an array of template definitions.

### Sample Response (Captured from Live System)

```json
[
    {
        "dmquitrinhid": "605907",
        "tentokhai": "Danh sách lao động tham gia BHXH, BHYT, BHTN, BHTNLĐ-BNN ",
        "matokhai": "D02-TS",     // Template Code
        "dmcoquantochucid": 4455,
        "isbatbuoc": "1",        // 1: Mandatory, 0: Optional
        "dmtokhaiid": 4,
        "soluong": 0,
        "stt": 1,
        "loaitokhai": "1",
        "maKhoQG": null
    },
    {
        "dmquitrinhid": "605907",
        "tentokhai": "Chứng từ đi kèm",
        "matokhai": "CT-DK",
        "dmcoquantochucid": 4455,
        "isbatbuoc": "0",
        "dmtokhaiid": 7,
        "soluong": 0,
        "stt": 2,
        "loaitokhai": "3",
        "maKhoQG": null
    },
    {
        "dmquitrinhid": "605907",
        "tentokhai": "Bảng kê thông tin",
        "matokhai": "D01-TS",
        "dmcoquantochucid": 4455,
        "isbatbuoc": "0",
        "dmtokhaiid": 1,
        "soluong": 0,
        "stt": 3,
        "loaitokhai": "1",
        "maKhoQG": null
    },
    {
        "dmquitrinhid": "605907",
        "tentokhai": "Tờ khai tham gia, điều chỉnh thông tin BHXH, BHYT",
        "matokhai": "TK1-TS",
        "dmcoquantochucid": 4455,
        "isbatbuoc": "0",
        "dmtokhaiid": 2,
        "soluong": 0,
        "stt": 4,
        "loaitokhai": "1",
        "maKhoQG": null
    }
]
```

### Key Fields

- **matokhai**: The unique code for the form template (e.g., `D02-TS`, `TK1-TS`).
- **tentokhai**: Human-readable name of the form.
- **isbatbuoc**: "1" if mandatory, "0" if optional.
- **dmquitrinhid**: Procedure ID binding.
