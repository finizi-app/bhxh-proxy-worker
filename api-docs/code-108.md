# API Code 108: Company/Unit Profile

**Purpose**: Retrieves detailed information about the currently logged-in agency/unit (Don vi).

## Payload Structure

Standard user context payload.

```json
{
  "code": "108",
  "data": {
    "masobhxhuser": "TZH490L",
    "macoquanuser": "07906",
    "loaidoituonguser": "1"
  }
}
```

## Response Structure

Returns an object containing the unit's profile details.

```json
{
  "data": {
    "Id": null,
    "Masothue": null,        // Tax ID
    "Madonvi": null,         // Unit Code (e.g., TZH490L)
    "Sotaikhoan": null,      // Bank Account Number
    "Manganhang": null,      // Bank Code
    "Matinhnganhang": null,  // Bank Province Code
    "Ngaynghituan": null,    // Weekly Rest Day
    "Sodienthoai": null,     // Phone Number
    "Thutruongdonvi": null   // Head of Unit (Name)
  },
  "error": null
}
```

**Note**: In some captured data, fields may return `null` if the system doesn't have the specific info or if it's already contextualized. However, the keys indicate this is the profile endpoint.
