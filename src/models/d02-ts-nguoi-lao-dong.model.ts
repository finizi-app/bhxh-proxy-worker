/**
 * D02-TS NguoiLaoDong Model
 *
 * Employee data structure for BHXH Code 600 D02-TS form submission.
 * Based on actual API payload from BHXH CallApiWithCurrentUser (Code 084).
 *
 * **Field Categories:**
 * - Core identity: id, Nldid, Hoten, Masobhxh, Ngaysinh, Gioitinh
 * - Method & Status: pa, Tinhtrang, loai, stt
 * - Employment: chucVu, Maphongban, Tenphongban, noiLamViec
 * - Salary: tienLuong, phuCapCV, phuCapTNVK, phuCapTNNghe, phuCapLuong, phuCapBoSung
 * - Period: tuThang, denThang
 * - Insurance: daCoSo, tinhLai, mucHuong, tyLeDong
 * - Documents: soToBiaSoBhxh, soToRoiSoBhxh, soTheBHYT, Cmnd
 * - Leave dates: Vtvl*, Nndh*, Hdld* (various leave types)
 * - Other: ghiChu, maVungSS, maVungLTT
 */

/**
 * Method codes (pa) for D02-TS declaration
 */
export type D02MethodCode =
  | "TM"  // Tăng mới (New Registration)
  | "DC"  // Điều chỉnh (Adjustment)
  | "TT"  // Tăng thêm (Additional)
  | "AD"  // Bổ sung tăng nguyên lương (Retroactive salary supplement)
  | "GH"  // Giảm hẳn (Full Termination)
  | "KL"  // Không lương (Unpaid Leave)
  | "OF"  // Nghỉ ốm (Sick Leave)
  | "TS"  // Thai sản (Maternity)
  | "NC"  // Nghỉ hưu (Retirement)
  | "TBHYT" // Tăng BHYT (Health Insurance Only)
  | "TBHTN" // Tăng BHTN (Unemployment Insurance)
  | "TNLD" // Tăng TNLĐ (Labor Accident)
  | "BNN"; // Bổ sung NN (Occupational Disease)

/**
 * Employee status codes (Tinhtrang)
 */
export type D02StatusCode =
  | "01" // Active
  | "02" // Suspended
  | "03" // Other
  | "04"; // Terminated

/**
 * Full D02-TS Employee Record
 * Complete structure as sent to BHXH API Code 084
 */
export interface D02TSNguoiLaoDong {
  /** Record ID (existing records) */
  id?: number;
  /** Employee ID from BHXH system */
  Nldid?: number;
  /** Internal employee code */
  Manld?: string | null;
  /** Method code */
  pa: D02MethodCode;
  /** Status code */
  Tinhtrang: D02StatusCode;
  /** Full name */
  Hoten: string;
  /** BHXH number (10 digits) */
  Masobhxh: string;
  /** Position/title */
  chucVu: string;
  /** Salary - STRING format required by API */
  tienLuong: string;
  /** Position allowance */
  phuCapCV: string;
  /** Seniority allowance - thâm niên vượt khung */
  phuCapTNVK: string;
  /** Professional seniority - thâm niên nghề */
  phuCapTNNghe: string;
  /** Salary allowance */
  phuCapLuong?: string | null;
  /** Additional allowance */
  phuCapBoSung?: string | null;
  /** Contribution rate */
  tyLeDong: string;
  /** Start month (MM/YYYY) */
  tuThang: string;
  /** End month (MM/YYYY) - for terminations */
  denThang: string;
  /** Calculate interest (0/1) */
  tinhLai: number;
  /** Has insurance book (0/1) */
  daCoSo: number;
  /** Benefit level */
  mucHuong?: string | null;
  /** Department code */
  Maphongban: string;
  /** Region code - Social Security */
  maVungSS?: string | null;
  /** Region code - Labor territory */
  maVungLTT?: string | null;
  /** Serial number */
  stt?: number;
  /** Type (1=new, 2=update, etc.) */
  loai?: number;
  /** Notes */
  ghiChu?: string;
  /** Reference ID */
  Refid?: number;
  /** Procedure ID */
  thuTucId?: number;
  /** Book cover number */
  soToBiaSoBhxh?: string | null;
  /** Loose leaf number */
  soToRoiSoBhxh?: string | null;
  /** Health insurance card number */
  soTheBHYT?: string | null;
  /** Gender (0=female, 1=male) */
  Gioitinh: string;
  /** Deceased flag */
  Cogiamchet?: number;
  /** Date of death */
  Ngaychet?: string;
  /** Workplace */
  noiLamViec?: string;
  /** Vtvl = Việc làm việc khác (Other work) - Start */
  VtvlKhacTungay?: string;
  /** Vtvl = Việc làm việc khác - End */
  VtvlKhacDenngay?: string;
  /** Nql = Nghỉ việc làm lại (Return from leave) - Start */
  VtvlNqlTungay?: string;
  /** Nql - End */
  VtvlNqlDenngay?: string;
  /** Cmktbc = Chấm dứt mút ký theo bản kế hoạch (Planned contract end) */
  VtvlCmktbcTungay?: string;
  VtvlCmktbcDenngay?: string;
  /** Cmktbt = Chấm dứt mút ký theo bản khác (Other contract end) */
  VtvlCmktbtTungay?: string;
  VtvlCmktbtDenngay?: string;
  /** Nndh = Nghỉ việc không hưởng lương (Unpaid leave) */
  NndhTungay?: string;
  NndhDenngay?: string;
  /** Hdld = Hợp đồng lao động (Labor contract) */
  HdldTungay?: string;
  /** Xdth = Hợp đồng thử việc (Probation contract) */
  HdldXdthTungay?: string;
  HdldXdthDenngay?: string;
  /** Other contract */
  HdldKhacTungay?: string;
  HdldKhacDenngay?: string;
  /** Date of birth (DD/MM/YYYY) */
  Ngaysinh?: string;
  /** ID card number */
  Cmnd?: string;
  /** Method name in Vietnamese (same as Tenphongban - likely a typo in API) */
  Tenphuongan?: string;
  /** Department name */
  Tenphongban?: string;
  /** Type name */
  Tenloai?: string;
  /** Region name */
  Tenvungltt?: string;
  /** Editable flag */
  editable?: boolean;
  /** Display order */
  Stt?: number;
  /** Employee code */
  maNLD?: string;
  /** Status display */
  tinhTrang?: string;
  /** Vtvl active status */
  VtvlActive?: number;
  /** Hdld active status */
  HdldActive?: number;
}

/**
 * D02-TS Form Section
 * Wrapper for employee array in submission
 */
export interface D02TSFormSection {
  nguoiLaoDong: D02TSNguoiLaoDong[];
}

/**
 * Minimum required fields for new employee submission
 */
export interface D02TSEmployeeMinimal {
  pa: D02MethodCode;
  Hoten: string;
  Masobhxh?: string;
  chucVu: string;
  tienLuong: string | number; // Will be converted to string
  tuThang: string;
  denThang: string;
  tinhLai: number;
  daCoSo: number;
  Gioitinh: string;
  Ngaysinh?: string;
  Tinhtrang: D02StatusCode;
  Maphongban: string;
}
