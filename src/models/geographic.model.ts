/**
 * Geographic data models from BHXH API
 * Provinces, Districts, Wards for address handling
 */

/**
 * District/Quan/Huyen entity (Code 063)
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
 * District list query parameters (Code 063)
 */
export interface DistrictListQueryParams {
  /** Province code (2-digit) */
  maTinh: string;
}

/**
 * Geographic list response wrapper
 */
export interface GeographicListResponse<T> {
  success: boolean;
  data: T[];
}
