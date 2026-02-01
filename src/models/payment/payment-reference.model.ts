/**
 * Payment Reference String Models
 *
 * Contains types for generating standardized BHXH payment reference strings.
 * Format: +BHXH+[Type]+[Reserved]+[UnitCode]+[AgencyCode]+[Description]+
 *
 * Example: +BHXH+103+00+TZH490L+07906+dong BHXH+
 */

/**
 * Payment reference string components
 */
export interface PaymentReferenceComponents {
  /** Prefix (always "+BHXH") */
  prefix: string;
  /** Transaction type (e.g., "103" for payment) */
  transactionType: string;
  /** Reserved/version field (e.g., "00") */
  reserved: string;
  /** Unit code (e.g., "TZH490L") */
  unitCode: string;
  /** Agency code (e.g., "07906") */
  agencyCode: string;
  /** Description (e.g., "dong BHXH") */
  description: string;
}

/**
 * Payment reference generation parameters
 */
export interface PaymentReferenceParams {
  /** Transaction type (default: "103") */
  type?: string;
  /** Description (default: "dong BHXH") */
  description?: string;
  /** Unit code (required) */
  unitCode: string;
  /** Agency code (required) */
  agencyCode: string;
}

/**
 * Payment reference response
 */
export interface PaymentReferenceResponse {
  /** Success flag */
  success: boolean;
  /** Reference data */
  data: {
    /** Full reference string */
    reference: string;
    /** Reference components */
    components: PaymentReferenceComponents;
  };
}
