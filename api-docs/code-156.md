# Code 156: Get Employee Official Data (Sync)

**Purpose**: Fetch the employee's official participation data from the central BHXH system using their Social Security Number (So BHXH). Used during editing to validate or auto-fill current status.

## 1. Request

**Endpoint**: `/CallApiWithCurrentUser`

**Body**:
```json
{
  "code": "156",
  "data": {
    "masoBhxh": "7930514316",
    "maCqbh": "07906",
    "maDonVi": "TZH490L",
    "isGetAll": false,
    "masobhxhuser": "TZH490L",
    "macoquanuser": "07906",
    "loaidoituonguser": "1"
  }
}
```

## 2. Parameters

*   `masoBhxh`: The employee's 10-digit Social Security Number.
*   `maCqbh`: Codes of the Social Security Agency managing the unit.
*   `maDonVi`: The Employer's code.
*   `isGetAll`: Boolean. `false` likely returns only the current active status or summary, while `true` might return full history.

## 3. Usage Context

Called when opening the Edit Employee form alongside Code 172. While Code 172 fetches the *local* draft data, Code 156 likely fetches the *remote* official data to ensure consistency.
