# Submission History (Lịch sử kê khai) API Reference

This document details the APIs related to querying previously submitted documents ("Lịch sử kê khai").

## Overview

*   **List Documents**: Code **085**
*   **Get Document Details**: Code **564**
*   **Get Processing Status**: Code **019**
*   **Clone/Copy Submission**: Code **092**
*   **Get Procedure Workflow**: Code **062**
*   **Get Declaration Detail**: Code **090**

---

## 1. List Submissions (Code 085)

List submitted documents/applications matching the filter criteria.

*   **Purpose**: "Tra cứu hồ sơ" / "Lịch sử kê khai".
*   **Detailed Documentation**: [code-085.md](code-085.md)

---

## 2. Get Submission Files (Code 564)

Retrieves the specific file attachments for a submitted application. This is typically called when viewing the details of a row from Code 085.

*   **Purpose**: Submission Detail View.
*   **Detailed Documentation**: [code-564.md](code-564.md)

---

## 3. Get Submission Process (Code 019)

Retrieves the detailed processing history and status of a submission ("Quá trình xử lý").

*   **Purpose**: Tracking the progress of a submitted application.
*   **Detailed Documentation**: [code-019.md](code-019.md)

---

## 4. Get Next Batch Number (Code 092)

Retrieves the next available batch number (`dot`) for a new submission in the given period.

*   **Purpose**: generating the `dot` number for a new dossier.
*   **Detailed Documentation**: [code-092.md](code-092.md)

---

## 5. Get Required Forms (Code 062)

Retrieves the list of required forms/templates (`matokhai`) that make up the dossier for a specific procedure. This defines what files need to be generated or attached.

*   **Purpose**: Getting the "Bill of Materials" for the submission (Required documents).
*   **Detailed Documentation**: [code-062.md](code-062.md)

---

## 6. Get Declaration Detail (Code 090)

Retrieves the detailed content of a specific declaration submission (Hồ sơ), including member lists (`D02-TS`), application forms (`TK1-TS`).

*   **Purpose**: "Chi tiết hồ sơ" / Viewing the data submitted.
*   **Detailed Documentation**: [code-090.md](code-090.md)
