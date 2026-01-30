# API Code 504: Agency/Unit Config (Payment Context)

**Purpose**: Retrieves context or configuration for the unit regarding payments, specifically the beneficiary bank account options.

## Payload Structure

```json
{
  "maCoquan": "07906",
  "masobhxhuser": "TZH490L",
  "macoquanuser": "07906",
  "loaidoituonguser": "1"
}
```

## Response Structure

Returns a list of valid beneficiary bank accounts for the BHXH agency.

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
