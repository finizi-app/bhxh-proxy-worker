/**
 * Master Data Models
 *
 * TypeScript interfaces for BHXH master data lookup resources.
 * All master data items share a common structure: id, ma (code), ten (name).
 */

/**
 * Base interface for all master data items
 */
export interface MasterDataItem {
  /** Database ID */
  id: number;
  /** Code (ma) - used for references */
  ma: string;
  /** Display name (ten) - Vietnamese label */
  ten: string;
}

/**
 * Paper Types (Code 071)
 * Document types: Sổ hộ khẩu, CCCD, etc.
 */
export interface PaperType extends MasterDataItem {}

/**
 * Countries (Code 072)
 * ISO country codes with Vietnamese names
 */
export interface Country extends MasterDataItem {}

/**
 * Ethnicities (Code 073)
 * Vietnamese ethnic groups: Kinh, Tày, Thái, etc.
 */
export interface Ethnicity extends MasterDataItem {}

/**
 * Labor Plan Types (Code 086)
 * Employment change categories
 */
export interface LaborPlanType extends MasterDataItem {}

/**
 * Benefits (Code 098)
 * Social insurance benefit types (Chế độ)
 */
export interface Benefit {
  id: number;
  /** Benefit code (ma_chedo) */
  ma_chedo: string;
  /** Benefit group name (ten_nhomhuong) */
  ten_nhomhuong: string;
}

/**
 * Relationships (Code 099)
 * Family/household relationships
 */
export interface Relationship extends MasterDataItem {}

/**
 * Generic master data list response wrapper
 */
export interface MasterDataResponse<T> {
  success: boolean;
  data: T[];
}
