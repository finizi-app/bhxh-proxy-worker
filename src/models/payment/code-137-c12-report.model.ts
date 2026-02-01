/**
 * C12 Monthly Payment Report Models (BHXH API Code 137)
 *
 * Contains hierarchical financial statement structure with sections A through Đ.
 * Each section represents different aspects of payment obligation and status.
 */

/**
 * Raw C12 line item from BHXH API Code 137
 * Represents a single line in the financial statement
 */
export interface C12LineItem {
  /** Unit name */
  tenDonVi: string;
  /** Unit code */
  maDonVi: string;
  /** Unit address */
  diaChi: string;
  /** Section/Line code (e.g., "A", "B.1", "D.1", "D.1.1") */
  stt: string;
  /** Line item description */
  noiDung: string;
  /** Social Insurance amount */
  bhxh: string;
  /** Health Insurance amount */
  bhyt: string;
  /** Unemployment Insurance amount */
  bhtn: string;
  /** Labor Accident Insurance amount */
  bhtnld: string;
  /** Total amount (sum of all insurance types) */
  cong: string;
}

/**
 * Raw C12 report response from BHXH API
 */
export interface C12ReportRawResponse {
  /** BHXH agency code */
  maCqBhxh: string;
  /** BHXH agency name */
  tenCqBhxh: string;
  /** Array of line items (complete financial statement) */
  c12s: C12LineItem[];
}

/**
 * Parsed C12 Section A: Previous Period Balance (Kỳ trước mang sang)
 * Amounts carried over from previous months
 */
export interface C12SectionA {
  /** Section code */
  stt: string;
  /** Section description */
  noiDung: string;
  /** Total carried over */
  total: number;
  /** Number of employees */
  employeeCount: number;
  /** Amount due */
  amountDue: number;
  /** Overpayment amount */
  overpayment: number;
  /** Underpayment amount */
  underpayment: number;
  /** Interest on underpayment */
  interest: number;
}

/**
 * Parsed C12 Section B: Current Period Activity (Phát sinh trong kỳ)
 * All changes and obligations for the current month
 */
export interface C12SectionB {
  /** Section code */
  stt: string;
  /** Section description */
  noiDung: string;
  /** Total current period obligation */
  total: number;
  /** Employees added */
  employeesAdded: number;
  /** Employees removed */
  employeesRemoved: number;
  /** Total salary fund */
  salaryFundTotal: number;
  /** Salary increase */
  salaryFundIncrease: number;
  /** Salary decrease */
  salaryFundDecrease: number;
  /** Amount due for current period */
  amountDue: number;
  /** Increase in obligation */
  amountDueIncrease: number;
  /** Decrease in obligation */
  amountDueDecrease: number;
  /** Net adjustment */
  adjustment: number;
  /** Prior year adjustment */
  priorYearAdjustment: number;
  /** Principal for interest calculation */
  interestPrincipal: number;
  /** Interest rate (as decimal, e.g., 0.0644 = 0.644%) */
  interestRate: number;
  /** Total interest */
  interestTotal: number;
  /** 2% mandatory reserve */
  mandatoryReserve: number;
}

/**
 * Parsed C12 Section C: Payments Made (Số tiền đã nộp trong kỳ)
 * Payments received during the period
 */
export interface C12SectionC {
  /** Section code */
  stt: string;
  /** Section description */
  noiDung: string;
  /** Total payments received */
  total: number;
  /** Individual payment transactions */
  payments: C12Payment[];
}

/**
 * Individual payment record in Section C
 * Represents a single payment transaction
 */
export interface C12Payment {
  /** Payment reference number (UNC) */
  reference: string;
  /** Payment date (DD/MM/YYYY format) */
  date: string;
  /** Payment amount */
  amount: number;
}

/**
 * Parsed C12 Section D: Payment Allocation (Phân bổ tiền đóng)
 * How payments are allocated across obligations
 */
export interface C12SectionD {
  /** Section code */
  stt: string;
  /** Section description */
  noiDung: string;
  /** Amount allocated to obligations */
  allocatedToObligations: number;
  /** Amount allocated to interest */
  allocatedToInterest: number;
}

/**
 * Parsed C12 Section Đ: Carried Forward (Chuyển kỳ sau)
 * Balance to carry to next period
 */
export interface C12SectionDau {
  /** Section code */
  stt: string;
  /** Section description */
  noiDung: string;
  /** Total carried forward */
  total: number;
  /** Employee count carried forward */
  employeeCount: number;
  /** Amount due carried forward */
  amountDue: number;
  /** Overpayment carried forward */
  overpayment: number;
  /** Underpayment carried forward */
  underpayment: number;
  /** Interest on underpayment carried forward */
  interestOnUnderpayment: number;
}

/**
 * Fully parsed C12 report with structured sections
 * Note: Empty sections are represented as objects with default values
 */
export interface C12ReportParsed {
  /** BHXH agency code */
  agencyCode: string;
  /** BHXH agency name */
  agencyName: string;
  /** Section A: Previous Period Balance */
  sectionA: C12SectionA;
  /** Section B: Current Period Activity */
  sectionB: C12SectionB;
  /** Section C: Payments Made */
  sectionC: C12SectionC;
  /** Section D: Payment Allocation */
  sectionD: C12SectionD;
  /** Section Đ: Carried Forward */
  sectionDau: C12SectionDau;
}

/**
 * Combined C12 report response with both raw and parsed data
 */
export interface C12ReportResponse {
  /** Success flag */
  success: boolean;
  /** Report data */
  data: {
    /** Raw response from BHXH API */
    raw: C12ReportRawResponse;
    /** Parsed structured sections */
    parsed: C12ReportParsed;
  };
  /** Response metadata */
  meta?: {
    /** Report month (1-12) */
    month: number;
    /** Report year (optional) */
    year?: number;
    /** Unit code */
    unitCode: string;
  };
}

/**
 * Query parameters for C12 report request
 */
export interface C12ReportQueryParams {
  /** Month (1-12) */
  thang: number;
  /** Year (optional, defaults to current) */
  nam?: number;
}
