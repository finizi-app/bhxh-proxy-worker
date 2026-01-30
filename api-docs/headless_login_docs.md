
# Headless Login Documentation - Dich Vu Cong BHXH

This document outlines the API flow to authenticate programmatically against `https://dichvucong.baohiemxahoi.gov.vn`.

## Prerequisites
- **Base URL**: `https://dichvucong.baohiemxahoi.gov.vn`
- **Encryption Key**: `S6|d'qc1GG,'rx&xn0XC`
- **Libraries**: `axios`, `crypto-js`

## Authentication Flow

### 1. Retrieve Client ID
Used to identify the session/client.

*   **URL**: `/oauth2/GetClientId`
*   **Method**: `GET`
*   **Response**: A GUID string (e.g., `550e8400-e29b-41d4-a716-446655440000`).

### 2. Prepare X-CLIENT Header
The API requires an `X-CLIENT` header for subsequent requests. This is the **Encrypted** Client ID.

**Encryption Logic (AES):**
1.  Stringify the Client ID (wrap in quotes).
2.  Encrypt using AES with the hardcoded key.
3.  Replace all `+` characters in the output with `teca`.

```javascript
const CryptoJS = require("crypto-js");
const key = "S6|d'qc1GG,'rx&xn0XC";

function getXClient(clientId) {
    // The web app stringifies the data before encrypting
    const payload = JSON.stringify(clientId.toString());
    const encrypted = CryptoJS.AES.encrypt(payload, key).toString();
    return encrypted.replace(/\+/g, "teca");
}
```

### 3. Get Captcha
Retrieve the captcha image and the associated hidden code.

*   **URL**: `/api/getCaptchaImage`
*   **Method**: `POST`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `X-CLIENT`: `<Encrypted Client ID>`
    *   `is_public`: `true`
    *   `ignoreLoadingBar`: `true`
*   **Body**:
    ```json
    {
        "height": 60,
        "width": 300
    }
    ```
*   **Response**:
    ```json
    {
        "image": "base64_string...",
        "code": "captcha_session_token..." (Use this as `code` in the login payload)
    }
    ```

### 4. Login (Get Token)
Exchange credentials and captcha for an access token.

*   **URL**: `/token`
*   **Method**: `POST`
*   **Headers**:
    *   `Content-Type`: `application/x-www-form-urlencoded`
    *   `not_auth_token`: `false`
*   **Body** (URL Encoded):
    *   `grant_type`: `password`
    *   `username`: `<Username>`
    *   `password`: `<Password>`
    *   `loaidoituong`: `1` (1 for Organization, 2? for Individual)
    *   `text`: `<Captcha Solution Text>`
    *   `code`: `<Captcha Session Token from Step 3>`
    *   `clientId`: `<Original Decrypted Client ID>`

*   **Response**:
    JSON containing the `access_token` and user details.

## Example Node.js Script
See `headless_login_script.js` for a working example.
This script will:
1. Fetch and encrypt the Client ID.
2. Fetch the Captcha image and **save it to `captcha.png`**.
3. Prompt you (in code comments) to provide the solution before proceeding to login.
