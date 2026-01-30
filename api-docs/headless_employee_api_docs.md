
# Employee List API Documentation - Dich Vu Cong BHXH

This document outlines the API endpoint and payload to retrieve the list of employees ("Quản lý lao động").

## API Endpoint

*   **URL**: `https://dichvucong.baohiemxahoi.gov.vn/CallApiWithCurrentUser`
*   **Method**: `POST`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer <ACCESS_TOKEN>` (Retrieved from Login)
    *   `X-CLIENT`: `<Encrypted Client ID>`

## Payload Structure

The API uses a generic envelope where `code` specifies the action and `data` is a **JSON-stringified** object.

```json
{
    "code": "067",
    "data": "{\"page\":1,\"size\":50,\"masobhxhuser\":\"...\",\"macoquanuser\":\"...\",\"loaidoituonguser\":\"1\", ...}"
}
```

### Inner Data Object (before stringify)
The `data` string must contain the following fields. Note that the login wrapper (`callApiWithCurrentUser`) automatically injects the `*user` fields based on the logged-in user's profile.

*   **Paging/Filtering**:
    *   `page`: `1` (Integer)
    *   `size`: `20` (Integer)
    *   `keyWord`: `""` (String, optional search text)
    *   `trangthai`: `""` (String, optional status filter)

*   **User Context** (Injected by Client App, must be manually added in headless mode):
    *   `masobhxhuser`: `<User's Ma So BHXH>` (from Login Response or User Profile)
    *   `macoquanuser`: `<User's Ma Co Quan>` (from Login Response)
    *   `loaidoituonguser`: `<User's Loai Doi Tuong>` (usually "1" for Org)

## Example curl

```bash
curl 'https://dichvucong.baohiemxahoi.gov.vn/CallApiWithCurrentUser' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'X-CLIENT: YOUR_ENCRYPTED_CLIENT_ID' \
  -H 'Content-Type: application/json' \
  --data-raw '{"code":"067","data":"{\"page\":1,\"size\":20,\"keyWord\":\"\",\"masobhxhuser\":\"010...\",\"macoquanuser\":\"00...\",\"loaidoituonguser\":\"1\"}"}'
```

## Related Codes
*   **Get List**: `067`
*   **Get Detail**: `081` (Requires `id` in data)
*   **Delete**: `069`
*   **Create**: `066`
*   **Update**: `068`
