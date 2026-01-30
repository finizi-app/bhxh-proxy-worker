/**
 * BHXH API Type Definitions
 * Shared interfaces for BHXH API client, authentication, and worker handlers
 */

/**
 * CAPTCHA response from BHXH API
 */
export interface CaptchaResponse {
    code: string;  // Captcha token/session ID
    image: string; // Base64 encoded image
}

/**
 * Login response containing access token and organization units
 */
export interface LoginResponse {
    access_token: string;
    expires_in?: number; // Token expiry in seconds from API
    dsDonVi: string | DonVi[];
}

/**
 * Organization/Unit information from BHXH login
 */
export interface DonVi {
    Ma: string;
    Ten?: string;
    TenDonVi?: string;
    MaCoquan: string;
    MaSoBHXH?: string;
    MaDonVi?: string;
    LoaiDoiTuong?: string;
}

/**
 * Auth session cached in KV namespace
 */
export interface Session {
    token: string;
    xClient: string;
    currentDonVi: DonVi;
    expiresAt: number;
}

/**
 * Employee record from BHXH API
 */
export interface Employee {
    id: number;
    Hoten: string;
    Masobhxh: string;
    chucVu?: string;
    mucLuong?: number;
    tinhTrang?: string;
    Ngaysinh?: string;
    Gioitinh?: number;
    soCMND?: string;
    maPhongBan?: string;
    ghiChu?: string;
    noiDKKCB?: string;
    diaChiNN?: string; // Permanent Address
    diaChi_dangSS?: string; // Current Address
    listThanhVien?: Record<string, unknown>[]; // Family members
}

/**
 * Employee list response with pagination
 */
export interface EmployeeListResponse {
    dsLaoDong: Employee[];
    TotalRecords: number;
}
