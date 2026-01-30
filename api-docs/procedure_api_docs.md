# Administrative Procedures (Quản lý Thủ tục hành chính)

This document groups the APIs related to managing and filing administrative procedures ("Thủ tục hành chính") with the Social Security office.

## Overview

The workflow for filing a procedure generally involves:
1.  **Selection**: Picking the correct procedure from the list (Code 028).
2.  **Preparation**: Getting the correct forms/templates for that procedure (Code 062).
3.  **Initialization**: Generating a batch number (`dot`) for the submission period (Code 092).

---

## 1. List Procedures (Code 028)

Retrieves the catalog of available administrative procedures (e.g., "Báo tăng lao động", "Cấp lại thẻ BHYT").

*   **Key Data**: Returns the Procedure Code (`ma`, e.g., "600") needed for subsequent steps.
*   **Detailed Documentation**: [code-028.md](code-028.md)

---

## 2. Get Required Forms (Code 062)

Retrieves the "Bill of Materials" or list of required templates/forms for a specific procedure code.

*   **Input**: Procedure Code (`ma` from Code 028).
*   **Detailed Documentation**: [code-062.md](code-062.md)

---

## 3. Get Next Batch Number (Code 092)

Generates the next available batch number (`dot`) for a new submission within a specific period (Month/Year).

*   **Purpose**: Required when creating a new dossier/record to unique identify the submission batch.
*   **Detailed Documentation**: [code-092.md](code-092.md)
