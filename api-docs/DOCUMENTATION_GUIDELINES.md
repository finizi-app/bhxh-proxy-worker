# Documentation Guidelines

This project uses a modular documentation structure to manage the reverse-engineered API endpoints.

## Structure

1.  **Index Files** (`*_api_docs.md`):
    *   Located in the root directory.
    *   Group APIs by domain (e.g., `department_api_docs.md`, `employee_api_docs.md`).
    *   Act as a Table of Contents.
    *   Link to detailed documentation in `api-docs/`.

2.  **Detail Files** (`api-docs/code-XXX.md`):
    *   Located in the `api-docs/` directory.
    *   Named `code-<CODE>.md` (e.g., `code-079.md`).
    *   Contain the specific Payload and Response examples for a single API code.

## How to Add New Documentation

### 1. Create the Detail File
Create a new file in `api-docs/` named `code-<CODE>.md`.

**Template:**
```markdown
### Payload
json
{
  "code": "<CODE>",
  "data": {
    // ... payload fields
  }
}


### Response Example
json
{
  // ... response body
}

```

### 2. Update the Index File
Add a section to the relevant domain index file (e.g., `department_api_docs.md`).

**Template:**
```markdown
---

## <N>. <Title> (Code <CODE>)

<Short Description>

*   **Purpose**: <Purpose>
*   **Detailed Documentation**: [code-<CODE>.md](code-<CODE>.md)
```

## Naming Conventions
*   **Files**: Snake case for index files (`my_feature_api_docs.md`), kebab case for code files (`code-123.md`).
*   **Codes**: Use the 3-digit code from the API payload (e.g., `079`, `001`).
