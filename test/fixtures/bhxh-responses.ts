/**
 * BHXH API Response Fixtures
 *
 * Mock responses for BHXH backend API codes.
 * Structure matches BHXH API format: { Code: number, Message: string, Data: any[] }
 */

import type { Employee } from "../../src/models/employee.model";
import type { MasterDataItem } from "../../src/models/master-data.model";

/**
 * BHXH API response wrapper format
 */
export interface BhxhApiResponse<T = unknown> {
  Code: number;
  Message: string;
  Data: T;
}

/**
 * Login session response (Captcha endpoint)
 */
export const loginSessionResponse: BhxhApiResponse<{ clientId: string }> = {
  Code: 0,
  Message: "Success",
  Data: {
    clientId: "test-client-12345",
  },
};

/**
 * Captcha image response
 */
export const captchaImageResponse = {
  image: "base64-encoded-captcha-image-data",
};

/**
 * Employee list response (Code 067)
 */
export const employeeListResponse: BhxhApiResponse<Employee[]> = {
  Code: 67,
  Message: "Success",
  Data: [
    {
      id: "1",
      Hoten: "Nguyen Van A",
      Masobhxh: "1234567890",
      NgaySinh: "1990-01-15",
      GioiTinh: "1",
      DiaChi: "123 Nguyen Trai, Ha Noi",
      maPhongBan: "PB001",
      maTinhTrang: "1",
      NgayBatDau: "2020-01-01",
      chucVu: "Nhan vien",
      mucLuong: "10000000",
      soDienThoai: "0912345678",
      email: "nguyenvana@example.com",
      ghiChu: "Nhan vien chinh thuc",
    },
    {
      id: "2",
      Hoten: "Tran Thi B",
      Masobhxh: "0987654321",
      NgaySinh: "1995-05-20",
      GioiTinh: "0",
      DiaChi: "456 Tran Hung Dao, Ha Noi",
      maPhongBan: "PB002",
      maTinhTrang: "1",
      NgayBatDau: "2021-03-15",
      chucVu: "Ke toan",
      mucLuong: "12000000",
      soDienThoai: "0987654321",
      email: "tranthib@example.com",
      ghiChu: "Nhan vien chinh thuc",
    },
  ],
};

/**
 * Employee detail response (Code 172)
 */
export const employeeDetailResponse: BhxhApiResponse<Employee> = {
  Code: 172,
  Message: "Success",
  Data: {
    id: "1",
    Hoten: "Nguyen Van A",
    Masobhxh: "1234567890",
    NgaySinh: "1990-01-15",
    GioiTinh: "1",
    DiaChi: "123 Nguyen Trai, Ha Noi",
    maPhongBan: "PB001",
    maTinhTrang: "1",
    NgayBatDau: "2020-01-01",
    chucVu: "Nhan vien",
    mucLuong: "10000000",
    soDienThoai: "0912345678",
    email: "nguyenvana@example.com",
    ghiChu: "Nhan vien chinh thuc",
  },
};

/**
 * Paper types response (Code 071)
 */
export const paperTypesResponse: BhxhApiResponse<MasterDataItem[]> = {
  Code: 71,
  Message: "Success",
  Data: [
    { id: 1, ma: "01", ten: "Sổ hộ khẩu" },
    { id: 2, ma: "02", ten: "CCCD" },
    { id: 3, ma: "03", ten: "CMND" },
    { id: 4, ma: "04", ten: "Hộ chiếu" },
  ],
};

/**
 * Countries response (Code 072)
 */
export const countriesResponse: BhxhApiResponse<MasterDataItem[]> = {
  Code: 72,
  Message: "Success",
  Data: [
    { id: 1, ma: "VN", ten: "Việt Nam" },
    { id: 2, ma: "US", ten: "United States" },
    { id: 3, ma: "CN", ten: "China" },
    { id: 4, ma: "JP", ten: "Japan" },
  ],
};

/**
 * Ethnicities response (Code 073)
 */
export const ethnicitiesResponse: BhxhApiResponse<MasterDataItem[]> = {
  Code: 73,
  Message: "Success",
  Data: [
    { id: 1, ma: "01", ten: "Kinh" },
    { id: 2, ma: "02", ten: "Tày" },
    { id: 3, ma: "03", ten: "Thái" },
    { id: 4, ma: "04", ten: "Mường" },
    { id: 5, ma: "05", ten: "Khmer" },
  ],
};

/**
 * Labor plan types response (Code 086)
 */
export const laborPlanTypesResponse: BhxhApiResponse<MasterDataItem[]> = {
  Code: 86,
  Message: "Success",
  Data: [
    { id: 1, ma: "01", ten: "Tang quy mo lao dong" },
    { id: 2, ma: "02", ten: "Giam quy mo lao dong" },
    { id: 3, ma: "03", ten: "Thay doi vi tri cong viec" },
    { id: 4, ma: "04", ten: "Thoi viec" },
  ],
};

/**
 * Benefits response (Code 098)
 */
export const benefitsResponse: BhxhApiResponse<Array<{ id: number; ma_chedo: string; ten_nhomhuong: string }>> = {
  Code: 98,
  Message: "Success",
  Data: [
    { id: 1, ma_chedo: "01", ten_nhomhuong: "Hu huu thang" },
    { id: 2, ma_chedo: "02", ten_nhomhuong: "Hu huu mot lan" },
    { id: 3, ma_chedo: "03", ten_nhomhuong: "Bao hiem y te" },
    { id: 4, ma_chedo: "04", ten_nhomhuong: "Bao hiem that nghiep" },
  ],
};

/**
 * Relationships response (Code 099)
 */
export const relationshipsResponse: BhxhApiResponse<MasterDataItem[]> = {
  Code: 99,
  Message: "Success",
  Data: [
    { id: 1, ma: "01", ten: "Vo/chong" },
    { id: 2, ma: "02", ten: "Con" },
    { id: 3, ma: "03", ten: "Cha/me" },
    { id: 4, ma: "04", ten: "Anh/chi/em" },
  ],
};

/**
 * Department list response (Code 079)
 */
export const departmentListResponse: BhxhApiResponse<
  Array<{ id: number; ma: string; ten: string; maDonVi?: string; ghiChu?: string }>
> = {
  Code: 79,
  Message: "Success",
  Data: [
    { id: 1, ma: "PB001", ten: "Phong Hanh Chinh", maDonVi: "DV001", ghiChu: "Phong hanh chinh" },
    { id: 2, ma: "PB002", ten: "Phong Ke Toan", maDonVi: "DV001", ghiChu: "Phong ke toan" },
    { id: 3, ma: "PB003", ten: "Phong Nhan Su", maDonVi: "DV001", ghiChu: "Phong nhan su" },
  ],
};

/**
 * Employee sync response (Code 156)
 */
export const employeeSyncResponse: BhxhApiResponse<{
  masoBhxh: string;
  trangThaiBaoHiem: string;
  hoten: string;
}> = {
  Code: 156,
  Message: "Success",
  Data: {
    masoBhxh: "1234567890",
    trangThaiBaoHiem: "Dang bao hiem",
    hoten: "Nguyen Van A",
  },
};

/**
 * C12 report response (Code 137)
 */
export const c12ReportResponse: BhxhApiResponse<{
  maCqBhxh: string;
  tenCqBhxh: string;
  c12s: Array<{
    tenDonVi: string;
    maDonVi: string;
    diaChi: string;
    stt: string;
    noiDung: string;
    bhxh: string;
    bhyt: string;
    bhtn: string;
    bhtnld: string;
    cong: string;
  }>;
}> = {
  Code: 137,
  Message: "Success",
  Data: {
    maCqBhxh: "CQBHXH01",
    tenCqBhxh: "Co quan BHXH Ha Noi",
    c12s: [
      {
        tenDonVi: "Cong ty ABC",
        maDonVi: "DV001",
        diaChi: "123 Nguyen Trai, Ha Noi",
        stt: "A",
        noiDung: "Ky truoc mang sang",
        bhxh: "1000000",
        bhyt: "200000",
        bhtn: "100000",
        bhtnld: "50000",
        cong: "1350000",
      },
    ],
  },
};

/**
 * Payment unit info response (Code 503)
 */
export const paymentUnitInfoResponse: BhxhApiResponse<Record<string, unknown>> = {
  Code: 503,
  Message: "Success",
  Data: {
    maDonVi: "DV001",
    tenDonVi: "Cong ty ABC",
    diaChi: "123 Nguyen Trai, Ha Noi",
  },
};

/**
 * Bank accounts response (Code 504)
 */
export const bankAccountsResponse: BhxhApiResponse<
  Array<{
    tkThuHuong: string;
    maNHThuHuong: string;
    tenVietTatNHThuHuong: string;
    tenNHThuHuong: string;
  }>
> = {
  Code: 504,
  Message: "Success",
  Data: [
    {
      tkThuHuong: "1234567890",
      maNHThuHuong: "BIDV",
      tenVietTatNHThuHuong: "BIDV",
      tenNHThuHuong: "Ngan hang TMCP Dau tu va Phat trien Viet nam",
    },
    {
      tkThuHuong: "0987654321",
      maNHThuHuong: "VCB",
      tenVietTatNHThuHuong: "VCB",
      tenNHThuHuong: "Ngan hang TMCP Ngoai thuong Viet nam",
    },
  ],
};

/**
 * Payment history response (Code 514)
 */
export const paymentHistoryResponse: BhxhApiResponse<{
  DSNopBhxhBB: Array<{ soUnc?: string; ngayNop?: string; soTien?: string }>;
  TotalRecords: number;
}> = {
  Code: 514,
  Message: "Success",
  Data: {
    DSNopBhxhBB: [
      { soUnc: "UNC001", ngayNop: "15/01/2026", soTien: "5000000" },
      { soUnc: "UNC002", ngayNop: "20/01/2026", soTien: "3500000" },
    ],
    TotalRecords: 2,
  },
};

/**
 * Empty response template
 */
export const emptyResponse: BhxhApiResponse<[]> = {
  Code: 0,
  Message: "Success",
  Data: [],
};

/**
 * Error response template
 */
export const errorResponse = (code: number, message: string): BhxhApiResponse => ({
  Code: code,
  Message: message,
  Data: null,
});
