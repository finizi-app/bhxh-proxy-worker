/**
 * Department model from BHXH API (codes 077, 079, 080)
 */

/**
 * Department entity
 */
export interface Department {
  /** Database ID */
  id: number;
  /** Department code */
  ma: string;
  /** Department name */
  ten: string;
  /** Unit code */
  maDonVi?: string;
  /** Notes/remarks */
  ghiChu?: string;
  /** Creation date */
  ngayTao?: string;
}

/**
 * Create/Update department request (Code 077)
 * Uses id field to determine create (null) vs update (existing)
 */
export interface DepartmentCreateRequest {
  /** Department code */
  ma: string;
  /** Department name */
  ten: string;
  /** Optional notes */
  ghiChu?: string;
}

export interface DepartmentUpdateRequest {
  /** Existing department ID */
  id: number;
  /** Department code */
  ma: string;
  /** Department name */
  ten: string;
  /** Optional notes */
  ghiChu?: string;
}

/**
 * Department list query parameters (Code 079)
 */
export interface DepartmentListQueryParams {
  /** Filter by department code */
  ma?: string;
  /** Filter by department name */
  ten?: string;
  /** Page number (default 1) */
  PageIndex?: number;
  /** Page size (default 50) */
  PageSize?: number;
}

/**
 * Department list response with pagination
 */
export interface DepartmentListResponse {
  success: boolean;
  data: Department[];
  meta: {
    total: number;
    count: number;
  };
}

/**
 * Department detail response
 */
export interface DepartmentDetailResponse {
  success: boolean;
  data: Department;
}

/**
 * Department delete response
 */
export interface DepartmentDeleteResponse {
  success: boolean;
  message: string;
}
