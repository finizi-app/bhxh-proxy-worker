/**
 * Model exports barrel file
 */

// API Response types
export type {
  ApiResponse,
  LookupResponse,
  ErrorResponse,
  TimingMetrics,
} from "./api-response.model";

// Master Data types
export type {
  MasterDataItem,
  MasterDataResponse,
  PaperType,
  Country,
  Ethnicity,
  LaborPlanType,
  Benefit,
  Relationship,
} from "./master-data.model";

// Department types
export type {
  Department,
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
  DepartmentListQueryParams,
  DepartmentListResponse,
  DepartmentDetailResponse,
  DepartmentDeleteResponse,
} from "./department.model";

// Employee types
export type {
  Employee,
  EmployeeListResponse,
  EmployeesQueryParams,
  EmployeeDetailResponse,
  EmployeeBulkUploadResponse,
  EmployeeUpdateRequest,
  EmployeeUpdateResponse,
  EmployeeFamilyMember,
  EmployeeSyncRequest,
  EmployeeSyncResponse,
  EmployeeOfficialData,
  EmployeeDetailRequest,
} from "./employee.model";

// Proxy types
export type {
  CaptchaResponse,
  CaptchaSolveRequest,
  CaptchaSolveResponse,
} from "./proxy.model";

// Session types
export type {
  Session,
  SessionCacheData,
} from "./session.model";

// Geographic types
export type {
  District,
  Province,
  Ward,
  DistrictListQueryParams,
  GeographicListResponse,
} from "./geographic.model";

// Code 600 Declaration types
export type {
  FullEmployeeDetailsRequest,
  FullEmployeeDetailsResponse,
  FullEmployeeDetails,
  Code600ThuTuc,
  Code600FormSection,
  Code600D02FormSection,
  Code600TK1FormSection,
  Code600D01FormSection,
  Code600TK1Employee,
  Code600ToKhai,
  Code600SubmitRequest,
  Code600SubmitResponse,
} from "./code-600.model";

// D02-TS NguoiLaoDong types (actual API structure)
export type {
  D02MethodCode,
  D02StatusCode,
  D02TSNguoiLaoDong,
  D02TSFormSection,
  D02TSEmployeeMinimal,
} from "./d02-ts-nguoi-lao-dong.model";
