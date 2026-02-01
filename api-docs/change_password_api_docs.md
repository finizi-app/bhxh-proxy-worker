# Change Password API (Organization)

This endpoint allows an organization to change their account password.

## Endpoint

*   **URL**: `https://dichvucong.baohiemxahoi.gov.vn/api/thaydoimatkhautochuc`
*   **Method**: `POST`

## Request Headers

The request requires standard headers, including authentication tokens and the encrypted client ID.

| Header          | Value                   | Description                                                       |
| :-------------- | :---------------------- | :---------------------------------------------------------------- |
| `Content-Type`  | `application/json`      |                                                                   |
| `Authorization` | `Bearer <JWT Token>`    | Token received from the Login API (`/token`).                     |
| `X-CLIENT`      | `<Encrypted Client ID>` | Encrypted Client ID (same as used in Login).                      |
| `Cookie`        | `...`                   | Session cookies, likely required (e.g., `_gtpk_ses`, `_gtpk_id`). |

## Request Body

The body is a JSON object containing the user credentials and OTP information.

```json
{
  "username": "0317530616",
  "oldPassword": "CurrentPassword",
  "newPassword": "NewPassword123!",
  "otpGroup": {},
  "isSmartOTP": false,
  "smartOtpGroup": {},
  "loaidoituong": "1"
}
```

### Parameters

| Parameter       | Type    | Required | Description                                         |
| :-------------- | :------ | :------- | :-------------------------------------------------- |
| `username`      | String  | Yes      | The organization's username (Tax Code).             |
| `oldPassword`   | String  | Yes      | The current password.                               |
| `newPassword`   | String  | Yes      | The new password to set.                            |
| `otpGroup`      | Object  | No       | Empty object `{}`, likely for OTP data if required. |
| `isSmartOTP`    | Boolean | No       | `false`                                             |
| `smartOtpGroup` | Object  | No       | Empty object `{}`, likely for Smart OTP data.       |
| `loaidoituong`  | String  | Yes      | `1` for Organization (matches Login API).           |

## Response

*   **Success**: Expect a JSON response confirming the change.
*   **Error**: Likely returns an error message if the old password is incorrect or password requirements are not met.

## Notes

*   Ensure the `Authorization` header contains a valid JWT token.
*   The `X-CLIENT` header must be present and valid for the current session.
