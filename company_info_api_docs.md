# BHXH Company Information Source

**Important:** There is **NO** standalone endpoint to fetch company information (e.g., `GET /user-info`).
The company information is returned **only** as part of the initial authentication/login response.

## 1. Login Endpoint
**Endpoint:** `https://dichvucong.baohiemxahoi.gov.vn/token`
**Method:** `POST`
**Content-Type:** `application/x-www-form-urlencoded`

### Request Body (Form Data)
| Key          | Value             | Description                                            |
| :----------- | :---------------- | :----------------------------------------------------- |
| `grant_type` | `password`        | Standard OAuth2 grant type.                            |
| `username`   | `<USERNAME>`      | e.g. "0317530616"                                      |
| `password`   | `<PASSWORD>`      | User password                                          |
| `client_id`  | `<CLIENT_ID>`     | App specific client ID (e.g. from config or hardcoded) |
| `captcha`    | `<CAPTCHA_TOKEN>` | Solved captcha value required for login.               |

### Response (JSON)
The response contains the access token and a `dsDonVi` field, which is a **stringified JSON array** containing the company details.

```json
{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "bearer",
  "expires_in": 1200,
  "userName": "0317530616",
  "dsDonVi": "[{\"Id\":5901180,\"Ten\":\"CÔNG TY TNHH TM DV PATEDELI\",\"Diachi\":\"Số 405/12,...\",\"Mst\":\"0317530616\",\"Ma\":\"TZH490L\",...}]",
  "issued": "Mon, 01 Jan 2025 10:00:00 GMT",
  "expires": "Mon, 01 Jan 2025 10:20:00 GMT"
}
```

## 2. Extracting Company Info
1.  **Parse the Login Response:** Read the `dsDonVi` field from the JSON response.
2.  **Parse the Stringified JSON:** The value of `dsDonVi` is a string. Parse it as JSON to get the array of organization objects.

### Data Schema (Inside `dsDonVi`)
```json
[
  {
    "Id": 5901180,
    "Ten": "CÔNG TY TNHH TM DV PATEDELI",
    "Diachi": "Số 405/12, đường Xô Viết Nghệ Tĩnh, Phường Bình Thạnh, Thành phố Hồ Chí Minh",
    "Sodienthoai": "0948670125",
    "Mst": "0317530616",
    "Ma": "TZH490L",
    "MaCQ": "07906",
    "TenCQ": "Bảo hiểm xã hội Cơ sở Bình Thạnh",
    "Email": "hnhi01042001@gmail.com"
  }
]
```
