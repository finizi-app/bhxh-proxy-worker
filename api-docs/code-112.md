# Employee Upload API (Code 112)

This endpoint allows uploading an Excel file containing a list of employees to be imported into the system.

## API Endpoint

*   **URL**: `https://dichvucong.baohiemxahoi.gov.vn/callApiSendFile`
*   **Method**: `POST`
*   **Content-Type**: `multipart/form-data`

## Payload

The request is a Multipart Form submission.

| Field  | Type   | Description                                        |
| :----- | :----- | :------------------------------------------------- |
| `file` | File   | The Excel file (`.xlsx`) containing employee data. |
| `code` | String | Must be `"112"`.                                   |

## Example Fetch Request (Recommended)

Using `FormData` is recommended as it automatically handles the `Content-Type` boundary, preventing 500 errors.

```javascript
// Assume 'fileInput' is your <input type="file"> element
const file = fileInput.files[0];
const formData = new FormData();
formData.append("file", file);
formData.append("code", "112");

fetch("https://dichvucong.baohiemxahoi.gov.vn/callApiSendFile", {
  method: "POST",
  headers: {
    "authorization": "Bearer <ACCESS_TOKEN>",
    "x-client": "<ENCRYPTED_CLIENT_ID>"
    // IMPORTANT: Do NOT set Content-Type header manually when using FormData
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));
```

## Troubleshooting

### Error 500 (Internal Server Error)
*   **Cause**: Often caused by a malformed `multipart/form-data` request.
*   **Fix**:
    *   Ensure you are **NOT** manually setting `Content-Type: multipart/form-data` if you are using the `FormData` API in the browser. The browser sets this header automatically with the correct boundary.
    *   If constructing the request manually (e.g., in a backend script), ensure the `boundary` string in the header exactly matches the boundary used to separate parts in the body.
    *   Ensure the `file` part is actually present and not empty.

