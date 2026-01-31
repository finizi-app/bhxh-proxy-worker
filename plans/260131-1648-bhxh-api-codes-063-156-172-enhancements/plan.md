---
title: "BHXH API Codes 063, 156, 172 Enhancements"
description: "Implement Code 063 (Districts), Code 156 (Employee Sync), and improve Code 172 (Employee Detail)"
status: complete
priority: P2
effort: 4h
issue: none
branch: master
tags: [feature, backend, api]
created: 2026-01-31
---

# BHXH API Codes 063, 156, 172 Enhancements

## Overview

Implement additional BHXH API endpoints for geographic data and employee synchronization based on newly pulled API documentation.

## API Coverage

| Code | Description | Status |
|------|-------------|--------|
| **063** | Get Districts by Province | ✅ Complete |
| **156** | Get Employee Official Data (Sync) | ✅ Complete |
| **172** | Get Employee Details by ID | ✅ Complete |

## Phases

| # | Phase | Status | Effort | Link |
|---|-------|--------|--------|------|
| 1 | Geographic Data Models & Service | Complete | 1h | [phase-01](./phase-01-geographic-models.md) |
| 2 | Employee Sync Models & Service | Complete | 1h | [phase-02](./phase-02-employee-sync.md) |
| 3 | REST Controllers & Routes | Complete | 1h | [phase-03](./phase-03-controllers.md) |
| 4 | Documentation & Testing | Complete | 1h | [phase-04](./phase-04-docs-testing.md) |

## Dependencies

- Existing session management (`src/services/session.service.ts`)
- Existing BHXH service patterns (`src/services/bhxh.service.ts`)
- New API docs: `api-docs/code-063.md`, `api-docs/code-156.md`, `api-docs/edit_employee_flow.md`

## Key Considerations

### Code 063 - Districts
- Input: `maTinh` (2-digit province code)
- Output: Array of district objects with `ma`, `ten`, `cap`
- Used for address dropdowns in employee forms

### Code 156 - Employee Sync
- Input: `masoBhxh` (10-digit SSN), `maCqbh`, `maDonVi`, `isGetAll`
- Output: Official employee data from central BHXH system
- Used for validation/consistency check during edit

### Code 172 - Employee Detail
- Current: Uses list filter fallback
- Improve: Use actual Code 172 API with `id` parameter
- Input: Internal record ID from Code 067 list

## Unresolved Questions

*None* - All planned features implemented.
