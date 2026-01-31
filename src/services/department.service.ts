/**
 * Department service for BHXH API CRUD operations
 * Uses API codes: 077 (Create/Update), 079 (List), 080 (Delete)
 */
import { createAxios } from "./proxy.service";
import type { Session } from "../models/session.model";
import type {
  Department,
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
  DepartmentListQueryParams,
} from "../models/department.model";

/** BHXH base URL from environment */
const BASE_URL = process.env.BHXH_BASE_URL || "https://dichvucong.baohiemxahoi.gov.vn";

/**
 * Build department list payload for API call 079
 */
function buildDepartmentListPayload(
  session: Session,
  query?: DepartmentListQueryParams
): Record<string, unknown> {
  return {
    ma: query?.ma || "",
    ten: query?.ten || "",
    madonvi: session.currentDonVi.Ma || "",
    macoquan: session.currentDonVi.MaCoquan || "",
    masobhxhuser: session.currentDonVi.Ma || "",
    macoquanuser: session.currentDonVi.MaCoquan || "",
    loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
    PageIndex: query?.PageIndex || 1,
    PageSize: query?.PageSize || 50,
  };
}

/**
 * Create a new department (Code 077)
 */
export async function createDepartment(
  request: DepartmentCreateRequest,
  session: Session
): Promise<Department> {
  const api = createAxios();
  const payload = {
    ...request,
    id: null,
    madonvi: session.currentDonVi.Ma || "",
    macoquan: session.currentDonVi.MaCoquan || "",
    masobhxhuser: session.currentDonVi.Ma || "",
    macoquanuser: session.currentDonVi.MaCoquan || "",
    loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
  };

  const response = await api.post(
    `${BASE_URL}/CallApiWithCurrentUser`,
    { code: "077", data: JSON.stringify(payload) },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "X-CLIENT": session.xClient,
      },
    }
  );

  return response.data as Department;
}

/**
 * Update existing department (Code 077)
 */
export async function updateDepartment(
  id: number,
  request: DepartmentUpdateRequest,
  session: Session
): Promise<Department> {
  const api = createAxios();
  const payload = {
    ...request,
    id,
    madonvi: session.currentDonVi.Ma || "",
    macoquan: session.currentDonVi.MaCoquan || "",
    masobhxhuser: session.currentDonVi.Ma || "",
    macoquanuser: session.currentDonVi.MaCoquan || "",
    loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
  };

  const response = await api.post(
    `${BASE_URL}/CallApiWithCurrentUser`,
    { code: "077", data: JSON.stringify(payload) },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "X-CLIENT": session.xClient,
      },
    }
  );

  return response.data as Department;
}

/**
 * List departments with pagination (Code 079)
 */
export async function listDepartments(
  query?: DepartmentListQueryParams,
  session?: Session
): Promise<{ data: Department[]; total: number }> {
  if (!session) {
    return { data: [], total: 0 };
  }

  const api = createAxios();
  const payload = buildDepartmentListPayload(session, query);

  const response = await api.post(
    `${BASE_URL}/CallApiWithCurrentUser`,
    { code: "079", data: JSON.stringify(payload) },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "X-CLIENT": session.xClient,
      },
    }
  );

  const data = response.data as { dsPhongBan?: Department[]; TotalRecords?: number };
  return {
    data: data.dsPhongBan || [],
    total: data.TotalRecords || 0,
  };
}

/**
 * Delete department by ID (Code 080)
 */
export async function deleteDepartment(
  id: number,
  session: Session
): Promise<void> {
  const api = createAxios();
  const payload = {
    id,
    madonvi: session.currentDonVi.Ma || "",
    macoquan: session.currentDonVi.MaCoquan || "",
    masobhxhuser: session.currentDonVi.Ma || "",
    macoquanuser: session.currentDonVi.MaCoquan || "",
    loaidoituonguser: session.currentDonVi.LoaiDoiTuong || "1",
  };

  await api.post(
    `${BASE_URL}/CallApiWithCurrentUser`,
    { code: "080", data: JSON.stringify(payload) },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "X-CLIENT": session.xClient,
      },
    }
  );
}
