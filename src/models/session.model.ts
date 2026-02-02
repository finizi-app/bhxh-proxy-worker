/**
 * Session model for BHXH authentication
 */
export interface DonVi {
  /** Internal ID */
  Id?: number;
  /** Unit code */
  Ma?: string;
  /** Unit name */
  Ten?: string;
  /** Alternative name field */
  TenDonVi?: string;
  /** Organization code */
  MaCoquan?: string;
  /** Agency code (MaCQ) */
  MaCQ?: string;
  /** Agency name (TenCQ) */
  TenCQ?: string;
  /** BHXH code */
  MaSoBHXH?: string;
  /** Object type */
  LoaiDoiTuong?: string;
  /** Address */
  Diachi?: string;
  /** Phone number */
  Sodienthoai?: string;
  /** Tax code (MST) */
  Mst?: string;
  /** Email */
  Email?: string;
}

/**
 * Cached session data from BHXH login
 */
export interface Session {
  /** Access token from OAuth login */
  token: string;
  /** Encrypted X-CLIENT header value */
  xClient: string;
  /** Current selected unit */
  currentDonVi: DonVi;
  /** Unix timestamp when session expires */
  expiresAt: number;
}

/**
 * Session status response
 */
export interface SessionStatusResponse {
  /** Session status: 'active' | 'expired' */
  status: string;
  /** Seconds until expiration (0 if expired) */
  expiresIn: number;
  /** Current unit name */
  unit?: string;
}

/**
 * Session refresh response
 */
export interface SessionRefreshResponse {
  success: boolean;
  message: string;
  unit: string;
  expiresIn: number;
}

/**
 * Company profile response
 */
export interface CompanyProfileResponse {
  success: boolean;
  data: DonVi;
  meta: {
    expiresIn: number;
    status: "active" | "expired";
  };
}

/**
 * BHXH credentials for per-request authentication
 */
export interface BhxhCredentials {
  /** BHXH username (email or Mã số BHXH) */
  username?: string;
  /** BHXH password */
  password?: string;
}
