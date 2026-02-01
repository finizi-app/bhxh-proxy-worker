/**
 * Payment Service for BHXH Payment APIs
 *
 * Handles C12 monthly payment obligation reports (Code 137),
 * payment history (Code 514), bank accounts (Code 504),
 * unit info (Code 503), and payment reference generation.
 */

import type { Session } from "../models/session.model.js";
import { createAxios } from "./proxy.service.js";
import type {
  C12LineItem,
  C12ReportRawResponse,
  C12ReportParsed,
  C12SectionA,
  C12SectionB,
  C12SectionC,
  C12Payment,
  C12SectionD,
  C12SectionDau,
  C12ReportQueryParams,
  BhxhBankAccount,
  PaymentHistoryRawResponse,
  PaymentHistoryQueryParams,
  PaymentUnitInfo,
  PaymentReferenceParams,
} from "../models/payment/index.js";
import dotenv from "dotenv";

dotenv.config({ path: ".dev.vars" });

/** Configuration from environment */
const CONFIG = {
  baseUrl: process.env.BHXH_BASE_URL || "https://dichvucong.baohiemxahoi.gov.vn",
};

// ============================================================================
// C12 Report Functions (Code 137)
// ============================================================================

/**
 * Fetch C12 monthly payment obligation report (Code 137)
 * @param session - Valid session with token and unit info
 * @param params - Query parameters (month, optional year)
 * @returns C12 report with raw and parsed data
 */
export async function fetchC12Report(
  session: Session,
  params: C12ReportQueryParams
): Promise<{ raw: C12ReportRawResponse; parsed: C12ReportParsed }> {
  const api = createAxios();

  const payload = {
    thang: String(params.thang),
    nam: params.nam ? String(params.nam) : String(new Date().getFullYear()),
    maDmBhxh: session.currentDonVi.MaCoquan || "",
    maDonVi: session.currentDonVi.Ma || "",
    masobhxhuser: session.currentDonVi.Ma || "",
    macoquanuser: session.currentDonVi.MaCoquan || "",
    loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
  };

  const response = await api.post(
    `${CONFIG.baseUrl}/CallApiWithCurrentUser`,
    { code: "137", data: JSON.stringify(payload) },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "X-CLIENT": session.xClient,
      },
    }
  );

  const raw = response.data as C12ReportRawResponse;
  const parsed = parseC12Report(raw);

  return { raw, parsed };
}

/**
 * Parse raw C12 report into structured sections
 * @param raw - Raw C12 report response
 * @returns Parsed C12 report with sections
 */
function parseC12Report(raw: C12ReportRawResponse): C12ReportParsed {
  const c12s = raw.c12s || [];

  return {
    agencyCode: raw.maCqBhxh,
    agencyName: raw.tenCqBhxh,
    sectionA: parseSectionA(c12s),
    sectionB: parseSectionB(c12s),
    sectionC: parseSectionC(c12s),
    sectionD: parseSectionD(c12s),
    sectionDau: parseSectionDau(c12s),
  };
}

/**
 * Parse Section A: Previous Period Balance (Kỳ trước mang sang)
 * @param c12s - Array of C12 line items
 * @returns Parsed Section A or null
 */
function parseSectionA(c12s: C12LineItem[]): C12SectionA {
  const section = c12s.find((item) => item.stt === "A");
  if (!section) {
    return { stt: "", noiDung: "", total: 0, employeeCount: 0, amountDue: 0, overpayment: 0, underpayment: 0, interest: 0 };
  }

  return {
    stt: section.stt,
    noiDung: section.noiDung,
    total: toNumber(section.cong),
    employeeCount: toNumber(c12s.find((i) => i.stt === "A.1")?.bhxh),
    amountDue: toNumber(c12s.find((i) => i.stt === "A.2")?.cong),
    overpayment: toNumber(c12s.find((i) => i.stt === "A.2.1")?.cong),
    underpayment: toNumber(c12s.find((i) => i.stt === "A.2.2")?.cong),
    interest: toNumber(c12s.find((i) => i.stt === "A.3")?.cong),
  };
}

/**
 * Parse Section B: Current Period Activity (Phát sinh trong kỳ)
 * @param c12s - Array of C12 line items
 * @returns Parsed Section B or null
 */
function parseSectionB(c12s: C12LineItem[]): C12SectionB {
  const section = c12s.find((item) => item.stt === "B");
  if (!section) {
    return {
      stt: "", noiDung: "", total: 0, employeesAdded: 0, employeesRemoved: 0,
      salaryFundTotal: 0, salaryFundIncrease: 0, salaryFundDecrease: 0,
      amountDue: 0, amountDueIncrease: 0, amountDueDecrease: 0,
      adjustment: 0, priorYearAdjustment: 0,
      interestPrincipal: 0, interestRate: 0, interestTotal: 0,
      mandatoryReserve: 0
    };
  }

  return {
    stt: section.stt,
    noiDung: section.noiDung,
    total: toNumber(section.cong),
    employeesAdded: toNumber(c12s.find((i) => i.stt === "B.1.1")?.bhxh),
    employeesRemoved: toNumber(c12s.find((i) => i.stt === "B.1.2")?.bhxh),
    salaryFundTotal: toNumber(c12s.find((i) => i.stt === "B.2")?.cong),
    salaryFundIncrease: toNumber(c12s.find((i) => i.stt === "B.2.1")?.cong),
    salaryFundDecrease: toNumber(c12s.find((i) => i.stt === "B.2.2")?.cong),
    amountDue: toNumber(c12s.find((i) => i.stt === "B.3")?.cong),
    amountDueIncrease: toNumber(c12s.find((i) => i.stt === "B.3.1")?.cong),
    amountDueDecrease: toNumber(c12s.find((i) => i.stt === "B.3.2")?.cong),
    adjustment: toNumber(c12s.find((i) => i.stt === "B.4.3")?.cong),
    priorYearAdjustment:
      toNumber(c12s.find((i) => i.stt === "B.4.1.1")?.cong) +
      toNumber(c12s.find((i) => i.stt === "B.4.2.1")?.cong),
    interestPrincipal: toNumber(c12s.find((i) => i.stt === "B.5.1")?.cong),
    interestRate: toNumber(c12s.find((i) => i.stt === "B.5.2")?.cong),
    interestTotal: toNumber(c12s.find((i) => i.stt === "B.5.3")?.cong),
    mandatoryReserve: toNumber(c12s.find((i) => i.stt === "B.6")?.cong),
  };
}

/**
 * Parse Section C: Payments Made (Số tiền đã nộp trong kỳ)
 * @param c12s - Array of C12 line items
 * @returns Parsed Section C or null
 */
function parseSectionC(c12s: C12LineItem[]): C12SectionC {
  const section = c12s.find((item) => item.stt === "C");
  if (!section) {
    return { stt: "", noiDung: "", total: 0, payments: [] };
  }

  // Extract individual payment records from C.1 items
  const payments: C12Payment[] = [];
  for (const item of c12s) {
    if (item.stt.startsWith("C.1")) {
      // Parse format: "+ UNC số 01043, Ngày 29/01/2026"
      const match = item.noiDung.match(/UNC\s*Ổ\s*(\d+),\s*Ngày\s*([\d\/]+)/);
      if (match) {
        payments.push({
          reference: match[1],
          date: match[2],
          amount: toNumber(item.cong),
        });
      }
    }
  }

  return {
    stt: section.stt,
    noiDung: section.noiDung,
    total: toNumber(section.cong),
    payments,
  };
}

/**
 * Parse Section D: Payment Allocation (Phân bổ tiền đóng)
 * @param c12s - Array of C12 line items
 * @returns Parsed Section D or null
 */
function parseSectionD(c12s: C12LineItem[]): C12SectionD {
  const section = c12s.find((item) => item.stt === "D");
  if (!section) {
    return { stt: "", noiDung: "", allocatedToObligations: 0, allocatedToInterest: 0 };
  }

  return {
    stt: section.stt,
    noiDung: section.noiDung,
    allocatedToObligations: toNumber(c12s.find((i) => i.stt === "D.1")?.cong),
    allocatedToInterest: toNumber(c12s.find((i) => i.stt === "D.2")?.cong),
  };
}

/**
 * Parse Section Đ: Carried Forward (Chuyển kỳ sau)
 * @param c12s - Array of C12 line items
 * @returns Parsed Section Đ or null
 */
function parseSectionDau(c12s: C12LineItem[]): C12SectionDau {
  const section = c12s.find((item) => item.stt === "Đ");
  if (!section) {
    return { stt: "", noiDung: "", total: 0, employeeCount: 0, amountDue: 0, overpayment: 0, underpayment: 0, interestOnUnderpayment: 0 };
  }

  return {
    stt: section.stt,
    noiDung: section.noiDung,
    total: toNumber(section.cong),
    employeeCount: toNumber(c12s.find((i) => i.stt === "Đ.1")?.bhxh),
    amountDue: toNumber(c12s.find((i) => i.stt === "Đ.2")?.cong),
    overpayment: toNumber(c12s.find((i) => i.stt === "Đ.2.1")?.cong),
    underpayment: toNumber(c12s.find((i) => i.stt === "Đ.2.2")?.cong),
    interestOnUnderpayment: toNumber(c12s.find((i) => i.stt === "Đ.2.3")?.cong),
  };
}

/**
 * Convert string/number to number safely
 * @param value - Value to convert
 * @returns Parsed number or 0
 */
function toNumber(value: string | number | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/,/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// ============================================================================
// Payment History Functions (Code 514)
// ============================================================================

/**
 * Fetch payment history (Code 514)
 * @param session - Valid session with token and unit info
 * @param params - Query parameters (pagination, filter)
 * @returns Payment history with pagination metadata
 */
export async function fetchPaymentHistory(
  session: Session,
  params: PaymentHistoryQueryParams = {}
): Promise<{ transactions: unknown[]; total: number }> {
  const api = createAxios();

  const payload = {
    PageSize: params.PageSize || 10,
    PageIndex: params.PageIndex || 1,
    Filter: params.Filter || "",
    masobhxhuser: session.currentDonVi.Ma || "",
    macoquanuser: session.currentDonVi.MaCoquan || "",
    loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
  };

  const response = await api.post(
    `${CONFIG.baseUrl}/CallApiWithCurrentUser`,
    { code: "514", data: JSON.stringify(payload) },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "X-CLIENT": session.xClient,
      },
    }
  );

  const data = response.data as PaymentHistoryRawResponse;

  // Handle null DSNopBhxhBB (no payment history or not registered for E-Payment)
  const transactions = data.DSNopBhxhBB || [];
  const total = data.TotalRecords || 0;

  return { transactions, total };
}

// ============================================================================
// Bank Accounts Functions (Code 504)
// ============================================================================

/**
 * Fetch BHXH beneficiary bank accounts (Code 504)
 * @param session - Valid session with token and unit info
 * @returns List of beneficiary bank accounts
 */
export async function fetchBankAccounts(
  session: Session
): Promise<BhxhBankAccount[]> {
  const api = createAxios();

  const payload = {
    maCoquan: session.currentDonVi.MaCoquan || "",
    masobhxhuser: session.currentDonVi.Ma || "",
    macoquanuser: session.currentDonVi.MaCoquan || "",
    loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
  };

  const response = await api.post(
    `${CONFIG.baseUrl}/CallApiWithCurrentUser`,
    { code: "504", data: JSON.stringify(payload) },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "X-CLIENT": session.xClient,
      },
    }
  );

  return response.data as BhxhBankAccount[];
}

// ============================================================================
// Unit Info Functions (Code 503)
// ============================================================================

/**
 * Fetch unit payment information (Code 503)
 * @param session - Valid session with token and unit info
 * @returns Unit payment information
 */
export async function fetchPaymentUnitInfo(
  session: Session
): Promise<PaymentUnitInfo> {
  const api = createAxios();

  const payload = {
    Masobhxh: session.currentDonVi.Ma || "",
    Macoquan: session.currentDonVi.MaCoquan || "",
    Loaidoituong: session.currentDonVi.LoaiDoiTuong || "1",
    masobhxhuser: session.currentDonVi.Ma || "",
    macoquanuser: session.currentDonVi.MaCoquan || "",
    loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
  };

  const response = await api.post(
    `${CONFIG.baseUrl}/CallApiWithCurrentUser`,
    { code: "503", data: JSON.stringify(payload) },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "X-CLIENT": session.xClient,
      },
    }
  );

  return response.data as PaymentUnitInfo;
}

// ============================================================================
// Payment Reference Generation
// ============================================================================

/**
 * Generate payment reference string
 * Format: +BHXH+[Type]+[Reserved]+[UnitCode]+[AgencyCode]+[Description]+
 * Example: +BHXH+103+00+TZH490L+07906+dong BHXH+
 * @param params - Reference generation parameters
 * @returns Generated reference string with components
 */
export function generatePaymentReference(
  params: PaymentReferenceParams
): { reference: string; components: Record<string, string> } {
  const type = params.type || "103"; // Default: Payment transaction
  const description = params.description || "dong BHXH"; // Default: Pay BHXH

  const components = {
    prefix: "BHXH",
    transactionType: type,
    reserved: "00",
    unitCode: params.unitCode,
    agencyCode: params.agencyCode,
    description,
  };

  const reference = `+${components.prefix}+${components.transactionType}+${components.reserved}+${components.unitCode}+${components.agencyCode}+${components.description}+`;

  return { reference, components };
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  fetchC12Report,
  fetchPaymentHistory,
  fetchBankAccounts,
  fetchPaymentUnitInfo,
  generatePaymentReference,
};
