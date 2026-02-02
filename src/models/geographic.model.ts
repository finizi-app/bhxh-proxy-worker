/**
 * Geographic data models from BHXH API
 * Provinces, Districts, Wards for address handling
 */

/**
 * District/Quan/Huyen entity
 */
export interface District {
  /** District code */
  ma: string;
  /** District name (Vietnamese) */
  ten: string;
  /** Level type (Quận, Huyện, Thị xã) */
  cap: string;
}

/**
 * Province/Tinh/Thanh Pho entity
 */
export interface Province {
  /** Province code */
  ma: string;
  /** Province name (Vietnamese) */
  ten: string;
}

/**
 * Ward/Phuong/Xa entity
 */
export interface Ward {
  /** Ward code */
  ma: string;
  /** Ward name (Vietnamese) */
  ten: string;
}

/**
 * Medical Facility / Cơ Sở Khám Chữa Bệnh (Code 063)
 * Healthcare facilities for BHXH registration
 */
export interface MedicalFacility {
  /** Facility code */
  ma?: string;
  /** Facility name (Vietnamese) */
  ten?: string;
  /** Province code */
  matinh?: string;
  /** District code */
  mahuyen?: string;
  /** Ward code */
  maphuongxa?: string;
}

/**
 * District list query parameters
 * Note: Districts endpoint not yet implemented - awaiting correct BHXH API code
 */
export interface DistrictListQueryParams {
  /** Province code (2-digit) */
  maTinh: string;
}

/**
 * Medical facilities list query parameters (Code 063)
 */
export interface MedicalFacilitiesListQueryParams {
  /** Province code (2-digit, optional - returns all if not specified) */
  maTinh?: string;
}

/**
 * Provinces list query parameters
 * No params required - returns all provinces
 */
export interface ProvincesListQueryParams {
  // No params - returns all provinces
}

/**
 * Wards list query parameters
 */
export interface WardsListQueryParams {
  /** Province code (2-digit, required) */
  matinh: string;
  /** District code (optional - if empty, returns all wards in province) */
  mahuyen?: string;
}

/**
 * Direct API request types for BHXH geographic endpoints
 */

/**
 * Request body for /api/getDmtinhthanh (empty)
 */
export interface DmtinhthanhRequest {
  // Empty body
}

/**
 * Request body for /api/getDmphuongxa
 */
export interface DmphuongxaRequest {
  /** Province code (2-digit) */
  matinh: string;
  /** District code (optional) */
  mahuyen?: string;
}

/**
 * Request body for /GetValues with Code 063 (medical facilities)
 */
export interface GetValues063Request {
  code: "063";
  data: {
    maTinh?: string;
  };
}

/**
 * Geographic list response wrapper
 */
export interface GeographicListResponse<T> {
  success: boolean;
  data: T[];
}
