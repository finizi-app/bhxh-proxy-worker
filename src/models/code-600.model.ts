/**
 * Code 600 Declaration Types
 * For BHXH/BHYT/BHTN monthly contribution declarations
 *
 * **Form Types:**
 * - D02-TS: Employee registration/adjustment (Đăng ký, điều chỉnh đóng BHXH)
 * - TK1-TS: Summary report (Tờ khai tổng hợp)
 * - D01-TS: Employee termination (Giảm lao động)
 *
 * **Method Codes (phuongAn):**
 * - TM: Tăng mới (New Registration)
 * - DC: Điều chỉnh (Adjustment)
 * - TT: Tăng thêm (Additional Increase)
 * - AD: Bổ sung tăng nguyên lương (Retroactive salary supplement)
 */

import type { EmployeeFamilyMember } from './employee.model';
import type { D02TSNguoiLaoDong } from './d02-ts-nguoi-lao-dong.model';

// ============================================================================
// CODE 117: Fetch Full Employee Details (now in employees API)
// ============================================================================

export interface FullEmployeeDetailsRequest {
  listNldid: number[];
  masobhxhuser: string;
  macoquanuser: string;
  loaidoituonguser: string;
}

export interface FullEmployeeDetailsResponse {
  success: boolean;
  data?: FullEmployeeDetails[];
  message?: string;
}

export interface FullEmployeeDetails {
  id: number;
  Hoten?: string;
  Masobhxh?: string;
  soHopDong?: string;
  loaiHopDong?: string;
  ngayHieuLuc?: string;
  ngayKy?: string;
  heSoLuong?: number;
  mucLuong?: string;
  phuCapCV?: string;
  phuCapTNNghe?: string;
  phuCapTNVK?: string;
  listThanhVien?: EmployeeFamilyMember[];
  lichSu?: unknown[];
  [key: string]: unknown;
}

// ============================================================================
// CODE 084: Submit Declaration Form (Actual API Structure)
// ============================================================================

/**
 * Procedure metadata (thuTuc) - Actual structure from BHXH API
 */
export interface Code600ThuTuc {
  /** Procedure ID (for updates) */
  thuTucId?: number;
  /** Status: 2=Submitted, 4=Draft, 1=Pending, 3=Rejected */
  Trangthai?: number;
  maThuTuc: "600";
  /** Declaration period format: "MMYYYY" e.g., "022026" */
  kyKeKhai: string;
  /** Submission period: "1", "2", etc. */
  dot?: string;
  maCoQuan: string;
  maDonVi?: string;
  /** Full procedure name */
  tenThuTuc?: string;
}

/** Form declaration info */
export interface Code600ToKhai {
  maToKhai: "D02-TS" | "TK1-TS" | "D01-TS";
  tenToKhai: string;
}

// --------------------------------------------------------------------------
// D02-TS Form: Employee Registration/Adjustment (using actual API type)
// --------------------------------------------------------------------------

export interface Code600D02FormSection {
  nguoiLaoDong: D02TSNguoiLaoDong[];
}

// --------------------------------------------------------------------------
// TK1-TS Form: Summary Report
// --------------------------------------------------------------------------

export interface Code600TK1Employee {
  Stt?: number;
  nhan_Bangiay?: number;
  nhan_BanDientu?: number;
  Hoten: string;
  Ngaysinh?: string;
  Gioitinh?: string;
  Tengioitinh?: string;
  quocTich?: string;
  Tenquoctich?: string;
  danToc?: string;
  Tendantoc?: string;
  Diachiks?: string;
  maXa_KS?: string;
  maTinh_KS?: string;
  diaChi_NN?: string;
  Diachinnhs?: string;
  maXa_NN?: string;
  maHuyen_NN?: string | null;
  maTinh_NN?: string;
  Masobhxh?: string;
  dienThoai_LH?: string | null;
  cmnd?: string;
  ThTreEmDuoi6?: boolean;
  ten_ChaMe_GiamHo?: string | null;
  maHo_GiaDinh?: string;
  Muctien?: string | null;
  Phuongthuc?: string | null;
  Noidkkcb?: string;
  Matinhbenhvien?: string;
  Tentinhbenhvien?: string;
  Mabenhvien?: string;
  noiDung_ThayDoi?: string | null;
  hoSoKemTheo?: string | null;
  dangKyNhanTai?: string | null;
  Ccns?: string;
  Nldid?: number;
  id?: number;
  thongTinHoGiaDinh?: Record<string, unknown>;
  Refid?: number;
  email_LH?: string | null;
  diaChi_ks2?: string | null;
  nhan_Bangiay_chk?: boolean;
  nhan_BanDientu_chk?: boolean;
  Tinh_NhanBangiay?: string | null;
  Huyen_NhanBangiay?: string | null;
  Xa_NhanBangiay?: string | null;
  DiaChiNhanBangiay?: string | null;
  editable?: boolean;
  [key: string]: unknown;
}

export interface Code600TK1FormSection {
  nguoiLaoDong: Code600TK1Employee[];
}

// --------------------------------------------------------------------------
// D01-TS Form: Employee Termination
// --------------------------------------------------------------------------

export interface Code600D01FormSection {
  nguoiLaoDong: unknown[];
}

// --------------------------------------------------------------------------
// Generic Form Section (for flexibility)
// --------------------------------------------------------------------------

export interface Code600FormSection {
  nguoiLaoDong: unknown[];
}

// --------------------------------------------------------------------------
// Submit Request/Response (Actual API Structure)
// --------------------------------------------------------------------------

export interface Code600SubmitRequest {
  /** Procedure ID (for updates) */
  thuTucId?: number;
  /** Employee list (null at top level, actual data in form sections) */
  nguoiLaoDong?: null;
  /** Procedure metadata */
  thuTuc: Code600ThuTuc;
  /** List of forms included */
  listToKhai?: Code600ToKhai[];
  /** Reference form IDs */
  refIdForm?: unknown[];
  /** Attached files */
  scanFile?: {
    listFile: unknown[];
    otherFile: unknown[];
  };
  /** D02-TS: Registration/Adjustment form */
  "D02-TS"?: Code600D02FormSection | Code600FormSection;
  /** TK1-TS: Summary report form */
  "TK1-TS"?: Code600TK1FormSection | Code600FormSection;
  /** D01-TS: Termination form */
  "D01-TS"?: Code600D01FormSection | Code600FormSection;
  /** Session context (added by service) */
  masobhxhuser?: string;
  macoquanuser?: string;
  loaidoituonguser?: string;
  /** Optional per-request credentials */
  username?: string;
  password?: string;
}

export interface Code600SubmitResponse {
  success: boolean;
  message: string;
  /** Submission reference ID */
  thuTucId?: number;
  data?: unknown;
}
