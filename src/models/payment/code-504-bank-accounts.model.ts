/**
 * BHXH Beneficiary Bank Account Models (BHXH API Code 504)
 *
 * Contains bank account information for receiving social insurance payments.
 */

/**
 * BHXH beneficiary bank account information
 * Represents a single bank account where payments can be sent
 */
export interface BhxhBankAccount {
  /** Beneficiary account number */
  tkThuHuong: string;
  /** Bank code */
  maNHThuHuong: string;
  /** Bank short name (e.g., "BIDV") */
  tenVietTatNHThuHuong: string;
  /** Bank full name (e.g., "Ngân hàng TMCP Đầu tư và Phát triển Việt nam") */
  tenNHThuHuong: string;
}

/**
 * Bank accounts list response
 */
export interface BankAccountsResponse {
  /** Success flag */
  success: boolean;
  /** Array of beneficiary bank accounts */
  data: BhxhBankAccount[];
  /** Response metadata */
  meta?: {
    /** BHXH agency code */
    agencyCode: string;
    /** Number of bank accounts returned */
    count: number;
  };
}
