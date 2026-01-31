/**
 * Employee model from BHXH API (code 067)
 * Note: Uses string-based id to match API response format
 */
export interface Employee {
  /** Employee ID (as string from API) */
  id?: string | number;
  /** Full name */
  Hoten?: string;
  /** BHXH number */
  Masobhxh?: string;
  /** Birth date */
  NgaySinh?: string;
  /** Gender */
  GioiTinh?: string;
  /** Address */
  DiaChi?: string;
  /** Department code */
  maPhongBan?: string;
  /** Status code */
  maTinhTrang?: string;
  /** Work start date */
  NgayBatDau?: string;
  /** Position */
  chucVu?: string;
  /** Salary */
  mucLuong?: string;
  /** Phone */
  soDienThoai?: string;
  /** Email */
  email?: string;
  /** Notes */
  ghiChu?: string;
  /** Additional fields from API */
  [key: string]: unknown;
}

/**
 * Employee list response with pagination
 */
export interface EmployeeListResponse {
  success: boolean;
  /** Timing metrics */
  timing: {
    sessionMs: number;
    fetchMs: number;
    totalMs: number;
  };
  /** Array of employee records */
  data: Employee[];
  /** Response metadata */
  meta: {
    total: number;
    count: number;
    unit: string;
  };
}

/**
 * Employees query parameters
 */
export interface EmployeesQueryParams {
  /** Filter by employee code */
  maNguoiLaoDong?: string;
  /** Filter by name */
  ten?: string;
  /** Filter by department */
  maPhongBan?: string;
  /** Filter by status */
  maTinhTrang?: string;
  /** Filter by BHXH number */
  MaSoBhxh?: string;
  /** Page number (default 1) */
  PageIndex?: number;
  /** Page size (default 100) */
  PageSize?: number;
  /** BHXH username for per-request authentication */
  username?: string;
  /** BHXH password for per-request authentication */
  password?: string;
}

/**
 * Employee detail response (Code 172)
 */
export interface EmployeeDetailResponse {
  success: boolean;
  data?: Employee;
  message?: string;
}

/**
 * Employee bulk upload response (Code 112)
 */
export interface EmployeeBulkUploadResponse {
  success: boolean;
  message: string;
  /** Number of employees processed */
  processed?: number;
  /** Upload errors if any */
  errors?: Array<{ row: number; message: string }>;
}

/**
 * Employee update request (Code 068)
 * Full employee data structure for update operation
 */
export interface EmployeeUpdateRequest {
  /** Employee database ID (required for update) */
  id: number;
  /** Contract number */
  soHopDong?: string | null;
  /** Contract type */
  loaiHopDong?: string | null;
  /** Effective date */
  ngayHieuLuc?: string | null;
  /** Signing date */
  ngayKy?: string | null;
  /** Salary coefficient */
  heSoLuong?: number | null;
  /** Salary amount */
  mucLuong?: string;
  /** Position allowance */
  phuCapCV?: string;
  /** Seniority allowance */
  phuCapTNNghe?: string | null;
  /** Dangerous job allowance */
  phuCapTNVK?: string | null;
  /** Salary allowance */
  phuCapLuong?: string;
  /** Additional allowance */
  phuCapBoSung?: string;
  /** Other allowance */
  phuCapKhac?: string;
  /** Healthcare facility */
  noiDKKCB?: string;
  /** Province code for hospital */
  Matinhbenhvien?: string;
  /** Hospital code */
  Mabenhvien?: string;
  /** Notes */
  ghiChu?: string;
  /** Family members list */
  listThanhVien?: EmployeeFamilyMember[];
  /** Household name */
  hoTenChuHo?: string | null;
  /** Household ID */
  maSo_HoGiaDinh?: string | null;
  /** Household phone */
  dienThoaiChuHo?: string | null;
  /** Permanent residence address */
  diaChi_HK?: string;
  /** Province for household registration */
  tinh_hokhau?: string;
  /** District for household registration */
  huyen_hokhau?: string;
  /** Ward for household registration */
  xa_hokhau?: string;
  /** Document type */
  loaiGiayTo?: string | null;
  /** Document number */
  soGiayTo?: string | null;
  /** Family address */
  diaChiGiaDinh?: string;
  /** Province for family */
  maTinhGiaDinh?: string;
  /** District for family */
  maHuyenGiaDinh?: string;
  /** Ward for family */
  maXaGiaDinh?: string;
  /** Province name */
  Tentinh?: string | null;
  /** District name */
  Tenhuyen?: string | null;
  /** Ward name */
  Tenxa?: string | null;
  /** Full household address */
  diaChi_HK_full?: string;
  /** Current residence address */
  diaChi_ks?: string;
  /** Full name */
  Hoten?: string;
  /** Employment status */
  tinhTrang?: string;
  /** Birth date */
  Ngaysinh?: string;
  /** Email */
  email?: string | null;
  /** Tax ID */
  maSoThue?: string | null;
  /** Department code */
  maPhongBan?: string;
  /** BHXH number */
  Masobhxh?: string;
  /** Employee code */
  maNLD?: string | null;
  /** Nationality */
  quocTich?: string;
  /** Gender (0=female, 1=male) */
  Gioitinh?: string;
  /** Phone number */
  soDienThoai?: string | null;
  /** Ethnicity */
  danToc?: string;
  /** Bank account */
  taiKhoan?: string | null;
  /** Position */
  chucVu?: string;
  /** Health insurance number */
  maSoBHYT?: string | null;
  /** Bank name */
  nganHang?: string | null;
  /** Bank code */
  Manganhang?: string | null;
  /** Bank province code */
  Matinhnganhang?: string | null;
  /** ID card number */
  soCMND?: string;
  /** ID card issuance place */
  noiCapCMND?: string | null;
  /** ID card issuance date */
  ngayCapCMND?: string | null;
  /** ID card issuance place (detailed) */
  noiCapKS?: string;
  /** Province for ID card issuance */
  maTinhKS?: string;
  /** District for ID card issuance */
  maHuyenKS?: string | null;
  /** Ward for ID card issuance */
  maXaKS?: string;
  /** Resigned flag */
  nghiViec?: boolean;
  /** Permanent address */
  diaChiNN?: string;
  /** Province for permanent address */
  maTinhNN?: string;
  /** District for permanent address */
  maHuyenNN?: string | null;
  /** Ward for permanent address */
  maXaNN?: string;
  /** Detailed permanent address */
  dcCuTheNN?: string;
  /** C2NS status */
  Ccns?: string;
  /** Household code */
  maHoGiaDinh?: string;
  /** Region code */
  maVungSS?: string | null;
  /** Birth date (picker format) */
  NgaysinhPicker?: string;
  /** Detailed current address */
  diaChiCuThe_dangSS?: string;
  /** Province for current address */
  maTinh_dangSS?: string;
  /** District for current address */
  maHuyen_dangSS?: string | null;
  /** Ward for current address */
  maXa_dangSS?: string;
  /** Current address */
  diaChi_dangSS?: string;
  /** Workplace */
  noiLamViec?: string | null;
  /** BHXH username (for API call) */
  masobhxhuser?: string;
  /** Agency code (for API call) */
  macoquanuser?: string;
  /** Object type (for API call) */
  loaidoituonguser?: string;
}

/**
 * Employee family member (for update)
 */
export interface EmployeeFamilyMember {
  id?: number;
  Nldid?: number;
  Hoten?: string;
  Masobhxh?: string;
  Ngaysinh?: string;
  Gioitinh?: string;
  maTinhKS?: string;
  maHuyenKS?: string | null;
  maXaKS?: string;
  noiCapKS?: string;
  Tentinh?: string;
  Tenhuyen?: string | null;
  Tenxa?: string;
  moiQuanHeChuHo?: string | null;
  soCMND?: string;
  ghiChu?: string | null;
  Ccns?: string;
  nguoiThamGia?: boolean;
  tenMoiQuanHe?: string | null;
  NgaysinhPicker?: string;
  quocTich?: string;
  danToc?: string;
  diaChi_ks?: string;
}

/**
 * Employee update response (Code 068)
 */
export interface EmployeeUpdateResponse {
  success: boolean;
  message: string;
  data?: Employee;
}

/**
 * Employee sync request (Code 156)
 * Sync with central BHXH system using Social Security Number
 */
export interface EmployeeSyncRequest {
  /** 10-digit Social Security Number */
  masoBhxh: string;
  /** Social Security Agency code */
  maCqbh: string;
  /** Employer/Unit code */
  maDonVi: string;
  /** Get full history vs current status */
  isGetAll?: boolean;
}

/**
 * Employee sync response (Code 156)
 * Official employee data from central BHXH system
 */
export interface EmployeeSyncResponse {
  success: boolean;
  data?: EmployeeOfficialData;
  message?: string;
}

/**
 * Official employee data from BHXH central system
 */
export interface EmployeeOfficialData {
  /** Social Security Number */
  masoBhxh?: string;
  /** Insurance status */
  trangThaiBaoHiem?: string;
  /** Participation process data */
  quyTrinhThamGia?: unknown;
  /** Employee name */
  hoten?: string;
  /** Additional fields */
  [key: string]: unknown;
}

/**
 * Employee detail request (Code 172)
 * Fetch by internal record ID from draft/submission list
 */
export interface EmployeeDetailRequest {
  /** Internal record ID from Code 067 */
  id: number;
}
