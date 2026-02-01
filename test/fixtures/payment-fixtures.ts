/**
 * Payment Test Fixtures
 *
 * Reusable fixtures for payment endpoints (codes 137, 503, 504, 514)
 */

import type {
  C12LineItem,
  C12ReportRawResponse,
  PaymentTransaction,
  BhxhBankAccount,
} from "../../src/models";

/**
 * C12 report line items fixture
 */
export const c12LineItemsFixture: C12LineItem[] = [
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
  {
    tenDonVi: "Cong ty ABC",
    maDonVi: "DV001",
    diaChi: "123 Nguyen Trai, Ha Noi",
    stt: "B.1",
    noiDung: "Nhan su them moi trong ky",
    bhxh: "500000",
    bhyt: "100000",
    bhtn: "50000",
    bhtnld: "25000",
    cong: "675000",
  },
  {
    tenDonVi: "Cong ty ABC",
    maDonVi: "DV001",
    diaChi: "123 Nguyen Trai, Ha Noi",
    stt: "C",
    noiDung: "So tien da nop trong ky",
    bhxh: "0",
    bhyt: "0",
    bhtn: "0",
    bhtnld: "0",
    cong: "1000000",
  },
];

/**
 * C12 report raw response fixture
 */
export const c12ReportRawFixture: C12ReportRawResponse = {
  maCqBhxh: "CQBHXH01",
  tenCqBhxh: "Co quan BHXH Ha Noi",
  c12s: c12LineItemsFixture,
};

/**
 * Payment transactions fixture
 */
export const paymentTransactionsFixture: PaymentTransaction[] = [
  {
    soUnc: "UNC001",
    ngayNop: "15/01/2026",
    soTien: "5000000",
  },
  {
    soUnc: "UNC002",
    ngayNop: "20/01/2026",
    soTien: "3500000",
  },
  {
    soUnc: "UNC003",
    ngayNop: "25/01/2026",
    soTien: "2000000",
  },
];

/**
 * Empty payment history fixture (no transactions)
 */
export const emptyPaymentHistoryFixture: PaymentTransaction[] = [];

/**
 * BHXH bank accounts fixture
 */
export const bankAccountsFixture: BhxhBankAccount[] = [
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
  {
    tkThuHuong: "1122334455",
    maNHThuHuong: "MB",
    tenVietTatNHThuHuong: "MB",
    tenNHThuHuong: "Ngan hang TMCP Quan Doi",
  },
];

/**
 * Payment unit info fixture (structure TBD based on actual API)
 */
export const paymentUnitInfoFixture = {
  maDonVi: "DV001",
  tenDonVi: "Cong ty ABC",
  diaChi: "123 Nguyen Trai, Ha Noi",
  maTinh: "01",
  maHuyen: "001",
  maXa: "00001",
};

/**
 * Paginated payment history fixture
 */
export const paginatedPaymentHistoryFixture = {
  data: paymentTransactionsFixture.slice(0, 2),
  meta: {
    total: 3,
    count: 2,
    pageIndex: 1,
    pageSize: 2,
  },
};

/**
 * Get C12 report fixture by month
 */
export function getC12ReportByMonth(month: number): C12ReportRawResponse {
  return {
    ...c12ReportRawFixture,
    c12s: c12LineItemsFixture.map((item) => ({
      ...item,
      noiDung: `${item.noiDung} - Thang ${month}`,
    })),
  };
}
