# Procedure List API (Code 028)

Retrieves the list of administrative procedures ("Thủ tục hành chính") available for declaration. This list drives the available options in the UI and their corresponding "Document IDs" (`ma` / `id`).

## API Endpoint

*   **URL**: `https://dichvucong.baohiemxahoi.gov.vn/CallApiWithCurrentUser`
*   **Method**: `POST`
*   **Content-Type**: `application/json`

## Payload

```json
{
  "code": "028",
  "data": {
    "loaihoso": 0,
    "pagenum": 1,
    "pagesize": 50,
    "coquanid": 4455,        // Specific Agency ID
    "mathutuc": "",          // Optional filter by Procedure Code
    "loaidoituong": "1",
    "masobhxhuser": "...",
    "macoquanuser": "...",
    "loaidoituonguser": "1"
  }
}
```

## Response

Returns an object containing `dsDmthutuc` (List of Procedures) and `totalRecords`.

### Sample Response

```json
{
    "dsDmthutuc": [
        {
            "rownumber": 1.0,
            "id": 605907.0,
            "ten": "Báo tăng, báo giảm, điều chỉnh đóng BHXH, BHYT, BHTN, BHTNLĐ, BNN",
            "sudung": "1",
            "dmloaihosoid": 0.0,
            "ma": "600",
            "tenlinhvuc": "Lĩnh vực thu Bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp",
            "totalCount": 33.0
        },
        {
            "rownumber": 4.0,
            "id": 606213.0,
            "ten": "Truy đóng BHXH, BHYT, BHTN, BHTNLĐ, BNN ",
            "ma": "601",
            "tenlinhvuc": "Lĩnh vực thu Bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp"
        },
        {
            "rownumber": 9.0,
            "id": 553748.0,
            "ten": "Đăng ký, thay đổi thông tin đóng BHXH, BHYT, BHTN, BHTNLĐ, BNN",
            "ma": "604",
            "tenlinhvuc": "Lĩnh vực thu Bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp"
        }
    ],
    "totalRecords": 33
}
```

### Key Fields

*   `ma`: The Procedure Code (e.g., "600", "601"). This is used in other API calls like Code 092 and Code 062.
*   `ten`: The display name of the procedure.
*   `tenlinhvuc`: The domain/category of the procedure.
