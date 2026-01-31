# Code 172: Get Employee Details

**Purpose**: Fetch the detailed record of an employee from the agency's internal management list (drafts/submissions), identified by a unique Record ID.

## 1. Request

**Endpoint**: `/CallApiWithCurrentUser`

**Body**:
```json
{
  "code": "172",
  "data": {
    "id": 12959231,
    "masobhxhuser": "TZH490L",
    "macoquanuser": "07906",
    "loaidoituonguser": "1"
  }
}
```

*   `id`: The internal primary key of the employee record (from Code 067 list).

## 2. Response (Inferred)

Returns the full employee object used to populate the editing form.
*   Likely contains fields matching **Code 084** submission structure: `ten`, `ngaySinh`, `gioiTinh`, `cmnd`, `soBhxh`, `luong`, etc.
