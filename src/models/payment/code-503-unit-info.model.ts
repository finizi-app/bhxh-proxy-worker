/**
 * Payment Unit Info Models (BHXH API Code 503)
 *
 * Contains unit information for payment initialization.
 *
 * NOTE: Structure is TBD based on actual API response.
 * Uses flexible type to handle unknown fields.
 */

/**
 * Unit information for payment initialization (structure TBD)
 * Will be updated based on actual API response from Code 503
 */
export interface PaymentUnitInfo {
  /** Additional fields for future extensibility */
  [key: string]: unknown;
}

/**
 * Unit info response
 */
export interface PaymentUnitInfoResponse {
  /** Success flag */
  success: boolean;
  /** Unit information data */
  data: PaymentUnitInfo;
}
