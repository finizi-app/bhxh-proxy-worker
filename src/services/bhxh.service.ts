/**
 * BHXH API service for interacting with Vietnam Social Insurance API
 */
import axios from "axios";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";
import { createAxios } from "./proxy.service";
import {
  Employee,
  EmployeeListResponse,
  EmployeesQueryParams,
} from "../models/employee.model";
import type {
  FullEmployeeDetailsRequest,
  FullEmployeeDetailsResponse,
  Code600SubmitRequest,
  Code600SubmitResponse,
} from "../models/code-600.model";
import type { D02TSNguoiLaoDong } from "../models/d02-ts-nguoi-lao-dong.model";
import { CaptchaResponse, CaptchaSolveRequest, CaptchaSolveResponse } from "../models/proxy.model";
import { Session } from "../models/session.model";

dotenv.config({ path: ".dev.vars" });

/** Configuration from environment */
const CONFIG = {
  baseUrl: process.env.BHXH_BASE_URL || "https://dichvucong.baohiemxahoi.gov.vn",
  encryptionKey: process.env.BHXH_ENCRYPTION_KEY || "S6|d'qc1GG,'rx&xn0XC",
  aiEndpoint: process.env.AI_CAPTCHA_ENDPOINT || "http://34.126.156.34:4000/api/v1/captcha/solve",
  aiApiKey: process.env.AI_CAPTCHA_API_KEY,
  maxCaptchaRetries: 3,
  tokenTtlSeconds: 3600,
};

/**
 * Encrypt client ID for X-CLIENT header
 * @param clientId - Client ID to encrypt
 * @returns Encrypted string with special character replacement
 */
export function encryptXClient(clientId: string): string {
  const payload = JSON.stringify(clientId);
  const encrypted = CryptoJS.AES.encrypt(payload, CONFIG.encryptionKey).toString();
  return encrypted.replace(/\+/g, "teca");
}

/**
 * Solve CAPTCHA using AI service
 * @param imageBase64 - Base64 encoded captcha image
 * @returns Solved captcha text
 */
export async function solveCaptcha(imageBase64: string): Promise<string> {
  const imageData = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/png;base64,${imageBase64}`;

  const requestBody: CaptchaSolveRequest = {
    image_data: imageData,
    provider: "gemini",
    timeout: 30,
  };

  try {
    const response = await axios.post<CaptchaSolveResponse>(
      CONFIG.aiEndpoint,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          ...(CONFIG.aiApiKey && { Authorization: `Bearer ${CONFIG.aiApiKey}` }),
        },
      }
    );

    if (response.data.success && response.data.captcha_code) {
      return response.data.captcha_code;
    }

    throw new Error("Failed to solve CAPTCHA: no captcha_code in response");
  } catch (error: unknown) {
    // Handle 422 validation error - extract 4-character captcha code
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      const detail = error.response.data?.detail?.detail;
      if (detail) {
        const match = (detail as string).match(/input_value='([A-Z0-9a-z]+)'/);
        if (match && match[1]) {
          console.log("Extracted captcha from validation error:", match[1]);
          return match[1];
        }
      }
    }
    throw error;
  }
}

/**
 * Get client ID from BHXH OAuth endpoint
 * @returns Client ID string
 */
export async function getClientId(): Promise<string> {
  const api = createAxios();
  const response = await api.get<string>(`${CONFIG.baseUrl}/oauth2/GetClientId`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/json",
    },
  });
  return response.data;
}

/**
 * Fetch captcha image from BHXH API
 * @param xClient - Encrypted X-CLIENT header
 * @returns Captcha response with image and token
 */
export async function getCaptcha(xClient: string): Promise<CaptchaResponse> {
  const api = createAxios();
  const response = await api.post<CaptchaResponse>(
    `${CONFIG.baseUrl}/api/getCaptchaImage`,
    { height: 60, width: 300 },
    {
      headers: {
        "Content-Type": "application/json",
        "X-CLIENT": xClient,
        is_public: "true",
      },
    }
  );
  return response.data;
}

/**
 * Perform login to BHXH API
 * @param captchaSolution - Solved captcha text
 * @param captchaToken - Captcha token from API
 * @param clientId - Client ID from OAuth
 * @param username - BHXH username (overrides env)
 * @param password - BHXH password (overrides env)
 * @returns Login response with access token and unit data
 */
export async function login(
  captchaSolution: string,
  captchaToken: string,
  clientId: string,
  username?: string,
  password?: string
): Promise<{ access_token: string; dsDonVi: unknown }> {
  const api = createAxios();
  const response = await api.post(
    `${CONFIG.baseUrl}/token`,
    new URLSearchParams({
      grant_type: "password",
      username: username || process.env.BHXH_USERNAME || "",
      password: password || process.env.BHXH_PASSWORD || "",
      loaidoituong: "1",
      text: captchaSolution,
      code: captchaToken,
      clientId,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        not_auth_token: "false",
      },
    }
  );
  return response.data;
}

/**
 * Build employee query payload for API call 067
 * @param session - Valid session with currentDonVi
 * @param params - Query parameters
 * @returns API payload object
 */
function buildEmployeePayload(
  session: Session,
  params?: EmployeesQueryParams
): Record<string, unknown> {
  return {
    maNguoiLaoDong: params?.maNguoiLaoDong || "",
    ten: params?.ten || "",
    maPhongBan: params?.maPhongBan || "",
    maTinhTrang: params?.maTinhTrang || "",
    MaSoBhxh: params?.MaSoBhxh || "",
    maDonVi: session.currentDonVi.Ma || "",
    maCoquan: session.currentDonVi.MaCoquan || "",
    PageIndex: params?.PageIndex || 1,
    PageSize: params?.PageSize || 100,
    masobhxhuser: session.currentDonVi.Ma || "",
    macoquanuser: session.currentDonVi.MaCoquan || "",
    loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
  };
}

/**
 * Fetch employees for current unit using API code 067
 * @param session - Valid session with token and unit info
 * @param params - Optional query parameters
 * @returns Employee list response
 */
export async function fetchEmployees(
  session: Session,
  params?: EmployeesQueryParams
): Promise<EmployeeListResponse> {
  const t0 = Date.now();
  const payload = buildEmployeePayload(session, params);

  const api = createAxios();
  const response = await api.post(
    `${CONFIG.baseUrl}/CallApiWithCurrentUser`,
    { code: "067", data: JSON.stringify(payload) },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "X-CLIENT": session.xClient,
      },
    }
  );

  const tTotal = Date.now() - t0;
  const data = response.data as { dsLaoDong?: Employee[]; TotalRecords?: number };

  return {
    success: true,
    timing: { sessionMs: 0, fetchMs: tTotal, totalMs: tTotal },
    data: data.dsLaoDong || [],
    meta: {
      total: data.TotalRecords || 0,
      count: (data.dsLaoDong || []).length,
      unit: session.currentDonVi.Ten || session.currentDonVi.TenDonVi || "Unknown",
    },
  };
}

/**
 * Lookup data by API code
 * @param session - Valid session with token and unit info
 * @param code - API code to call
 * @returns Lookup data from API
 */
export async function lookup(
  session: Session,
  code: string
): Promise<unknown> {
  const api = createAxios();
  const payload = {
    masobhxhuser: session.currentDonVi.Ma || "",
    macoquanuser: session.currentDonVi.MaCoquan || "",
    loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
  };

  const response = await api.post(
    `${CONFIG.baseUrl}/CallApiWithCurrentUser`,
    { code, data: JSON.stringify(payload) },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "X-CLIENT": session.xClient,
      },
    }
  );

  return response.data;
}

/**
 * Update employee (Code 068)
 * @param employeeData - Full employee data with required fields
 * @param session - Valid session with token and unit info
 * @returns Update result
 */
export async function updateEmployee(
  employeeData: Record<string, unknown>,
  session: Session
): Promise<unknown> {
  const api = createAxios();

  // Ensure required API context fields are set
  const payload = {
    ...employeeData,
    masobhxhuser: session.currentDonVi.Ma || "",
    macoquanuser: session.currentDonVi.MaCoquan || "",
    loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
  };

  const response = await api.post(
    `${CONFIG.baseUrl}/CallApiWithCurrentUser`,
    { code: "068", data: JSON.stringify(payload) },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "X-CLIENT": session.xClient,
      },
    }
  );

  return response.data;
}

/**
 * Sync employee with central BHXH system (Code 156)
 * @param syncRequest - Sync parameters with SSN
 * @param session - Valid session
 * @returns Official employee data from central system
 */
export async function syncEmployee(
  syncRequest: {
    masoBhxh: string;
    maCqbh: string;
    maDonVi: string;
    isGetAll?: boolean;
  },
  session: Session
): Promise<unknown> {
  const api = createAxios();

  const payload = {
    ...syncRequest,
    masobhxhuser: session.currentDonVi.Ma || "",
    macoquanuser: session.currentDonVi.MaCoquan || "",
    loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
  };

  const response = await api.post(
    `${CONFIG.baseUrl}/CallApiWithCurrentUser`,
    { code: "156", data: JSON.stringify(payload) },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "X-CLIENT": session.xClient,
      },
    }
  );

  return response.data;
}

/**
 * Get employee detail by internal ID (Code 172)
 * @param employeeId - Internal record ID
 * @param session - Valid session
 * @returns Full employee detail object
 */
export async function getEmployeeDetail(
  employeeId: number,
  session: Session
): Promise<unknown> {
  const api = createAxios();

  const payload = {
    id: employeeId,
    masobhxhuser: session.currentDonVi.Ma || "",
    macoquanuser: session.currentDonVi.MaCoquan || "",
    loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
  };

  const response = await api.post(
    `${CONFIG.baseUrl}/CallApiWithCurrentUser`,
    { code: "172", data: JSON.stringify(payload) },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "X-CLIENT": session.xClient,
      },
    }
  );

  return response.data;
}

/**
 * Fetch full employee details by IDs (Code 117)
 * Returns comprehensive employee data including contracts, salary, family, history
 * @param session - Valid session with token and unit info
 * @param listNldid - Array of employee IDs to fetch
 * @returns Full employee details response
 */
export async function fetchFullEmployeeDetails(
  session: Session,
  listNldid: number[]
): Promise<FullEmployeeDetailsResponse> {
  const api = createAxios();

  const payload: FullEmployeeDetailsRequest = {
    listNldid,
    masobhxhuser: session.currentDonVi.Ma || "",
    macoquanuser: session.currentDonVi.MaCoquan || "",
    loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
  };

  try {
    const response = await api.post(
      `${CONFIG.baseUrl}/CallApiWithCurrentUser`,
      { code: "117", data: JSON.stringify(payload) },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
          "X-CLIENT": session.xClient,
        },
      }
    );

    return {
      success: true,
      data: response.data as FullEmployeeDetailsResponse["data"],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Code 117 fetch error:", message);
    throw new Error(`Failed to fetch full employee details: ${message}`);
  }
}

/**
 * Normalize D02-TS employee data for API submission
 * Ensures tienLuong is always string (required by BHXH API)
 * @param employee - Raw employee data
 * @returns Normalized employee data
 */
function normalizeD02Employee(employee: D02TSNguoiLaoDong): D02TSNguoiLaoDong {
  return {
    ...employee,
    // Ensure tienLuong is always string (BHXH API requirement)
    tienLuong: typeof employee.tienLuong === 'number'
      ? String(employee.tienLuong)
      : employee.tienLuong,
  };
}

/**
 * Submit Code 600 declaration form (Code 084)
 * Submits D02-TS, TK1-TS, or D01-TS forms for monthly contributions
 * @param session - Valid session with token and unit info
 * @param submitRequest - Declaration form data with thuTuc and form sections
 * @returns Submission result with thuTucId
 */
export async function submitCode600Form(
  session: Session,
  submitRequest: Omit<Code600SubmitRequest, "username" | "password">
): Promise<Code600SubmitResponse> {
  const api = createAxios();

  // Normalize D02-TS employee data
  const normalizedD02 = submitRequest["D02-TS"]?.nguoiLaoDong
    ? {
        ...submitRequest["D02-TS"],
        nguoiLaoDong: submitRequest["D02-TS"].nguoiLaoDong.map(normalizeD02Employee),
      }
    : undefined;

  // Build payload with session context and normalized data
  const payload = {
    ...submitRequest,
    // Override with normalized D02-TS data
    ...(normalizedD02 && { "D02-TS": normalizedD02 }),
    // Ensure thuTuc has session context
    thuTuc: {
      ...submitRequest.thuTuc,
      maDonVi: session.currentDonVi.Ma || submitRequest.thuTuc.maDonVi,
      maCoQuan: session.currentDonVi.MaCoquan || submitRequest.thuTuc.maCoQuan,
    },
  };

  try {
    const response = await api.post(
      `${CONFIG.baseUrl}/CallApiWithCurrentUser`,
      { code: "084", data: JSON.stringify(payload) },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
          "X-CLIENT": session.xClient,
        },
      }
    );

    const result = response.data as { success?: boolean; message?: string; thuTucId?: number };

    return {
      success: result.success ?? true,
      message: result.message || "Form submitted successfully",
      thuTucId: result.thuTucId,
      data: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Code 084 submit error:", message);
    throw new Error(`Failed to submit declaration form: ${message}`);
  }
}

export default {
  encryptXClient,
  solveCaptcha,
  getClientId,
  getCaptcha,
  login,
  fetchEmployees,
  lookup,
  updateEmployee,
  syncEmployee,
  getEmployeeDetail,
  fetchFullEmployeeDetails,
  submitCode600Form,
};
