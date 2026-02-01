/**
 * Payment History Models (BHXH API Code 514)
 *
 * Contains electronic payment transaction history records.
 *
 * NOTE: Actual payment transaction fields are partially documented.
 * Uses flexible type to handle unknown fields. Will refine after receiving
 * actual payment data during testing.
 */

/**
 * Payment transaction record from BHXH Code 514
 * Fields TBD - will be refined after receiving actual payment data
 */
export interface PaymentTransaction {
  /** Payment reference number (UNC) */
  soUnc?: string;
  /** Payment date */
  ngayNop?: string;
  /** Payment amount */
  soTien?: string;
  /** Additional fields for future extensibility */
  [key: string]: unknown;
}

/**
 * Payment history response from BHXH API
 * Returns null for DSNopBhxhBB if no payment history exists
 */
export interface PaymentHistoryRawResponse {
  /** Array of payment transactions or null if no history */
  DSNopBhxhBB: PaymentTransaction[] | null;
  /** Total number of records */
  TotalRecords: number;
}

/**
 * Payment history query parameters
 */
export interface PaymentHistoryQueryParams {
  /** Page index (default: 1) */
  PageIndex?: number;
  /** Page size (default: 10) */
  PageSize?: number;
  /** Filter string (optional) */
  Filter?: string;
}

/**
 * Payment history API response
 */
export interface PaymentHistoryResponse {
  /** Success flag */
  success: boolean;
  /** Array of payment transactions */
  data: PaymentTransaction[];
  /** Response metadata */
  meta: {
    /** Total number of records */
    total: number;
    /** Number of records in current page */
    count: number;
    /** Current page index */
    pageIndex: number;
    /** Page size */
    pageSize: number;
  };
}
