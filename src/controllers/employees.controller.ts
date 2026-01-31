/**
 * Employees Controller
 *
 * REST endpoints for employee data operations using BHXH API.
 *
 * **Authentication:**
 * - `X-API-Key`: Required for all endpoints
 * - `X-Username`: BHXH username (optional if default credentials configured)
 * - `X-Password`: BHXH password (optional if default credentials configured)
 *
 * Headers take priority over query parameters for backward compatibility.
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Route,
  SuccessResponse,
  Response,
  Query,
  Path,
  Body,
  Request,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import type {
  EmployeeListResponse,
  EmployeesQueryParams,
  EmployeeDetailResponse,
  EmployeeBulkUploadResponse,
  EmployeeUpdateRequest,
  EmployeeUpdateResponse,
  EmployeeSyncResponse,
  EmployeeOfficialData,
  Employee,
} from "../models/employee.model";
import type {
  FullEmployeeDetailsResponse,
} from "../models/code-600.model";
import { getValidSession } from "../services/session.service";
import { fetchEmployees, updateEmployee, syncEmployee, getEmployeeDetail, fetchFullEmployeeDetails } from "../services/bhxh.service";

/**
 * Employees controller for fetching employee data
 */
@Route("/api/v1/employees")
export class EmployeesController extends Controller {
  /**
   * Get all employees for current unit
   * @param req Express request with auth headers
   * @param maNguoiLaoDong Filter by employee code
   * @param ten Filter by name
   * @param maPhongBan Filter by department
   * @param maTinhTrang Filter by status
   * @param MaSoBhxh Filter by BHXH number
   * @param PageIndex Page number (default 1)
   * @param PageSize Page size (default 100)
   * @returns Employee list with pagination info
   */
  @Get("/")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to fetch employees")
  public async getEmployees(
    @Request() req: any,
    @Query() maNguoiLaoDong?: string,
    @Query() ten?: string,
    @Query() maPhongBan?: string,
    @Query() maTinhTrang?: string,
    @Query() MaSoBhxh?: string,
    @Query() PageIndex?: number,
    @Query() PageSize?: number
  ): Promise<EmployeeListResponse> {
    const t0 = Date.now();

    try {
      const session = await getValidSession(req?.request);
      const params: EmployeesQueryParams = {
        maNguoiLaoDong,
        ten,
        maPhongBan,
        maTinhTrang,
        MaSoBhxh,
        PageIndex,
        PageSize,
      };

      console.log("Fetching employees for unit:", session.currentDonVi.Ma);
      const result = await fetchEmployees(session, params);

      const totalMs = Date.now() - t0;
      console.log(`[TIMING] Employees fetch: ${totalMs}ms`);

      return {
        ...result,
        timing: {
          sessionMs: 0,
          fetchMs: totalMs,
          totalMs,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Employees fetch error:", message);
      throw {
        error: "Failed to fetch employees",
        message,
      };
    }
  }

  /**
   * Get employee by ID (Code 172)
   * Fetches employee detail from internal record by ID
   * @param req Express request with auth headers
   * @param employeeId Employee ID (internal record ID)
   * @returns Employee detail or error message
   */
  @Get("{employeeId}")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(404, "Employee not found")
  @Response<{ error: string; message: string }>(500, "Failed to fetch employee")
  public async getEmployeeById(
    @Request() req: any,
    @Path() employeeId: string
  ): Promise<EmployeeDetailResponse> {
    try {
      const session = await getValidSession(req?.request);
      const id = parseInt(employeeId, 10);

      // Use Code 172 API directly
      const data = await getEmployeeDetail(id, session);

      if (!data) {
        return {
          success: false,
          message: `Employee not found with ID: ${employeeId}`,
        };
      }

      return {
        success: true,
        data: data as Employee,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Employee detail fetch error:", message);
      throw {
        error: "Failed to fetch employee detail",
        message,
      };
    }
  }

  /**
   * Get full employee details by IDs (Code 117)
   * Fetches comprehensive employee data including contracts, salary, family, history
   * @param req Express request with auth headers
   * @param requestBody Employee IDs and optional credentials
   * @returns Full employee details with contracts, salary, family members, history
   */
  @Post("details")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(400, "Invalid request")
  @Response<{ error: string; message: string }>(500, "Failed to fetch employee details")
  public async getFullEmployeeDetails(
    @Request() req: any,
    @Body() requestBody: { listNldid: number[] }
  ): Promise<FullEmployeeDetailsResponse> {
    const t0 = Date.now();

    try {
      const session = await getValidSession(req?.request);

      if (!requestBody.listNldid || requestBody.listNldid.length === 0) {
        return {
          success: false,
          message: "listNldid is required and must not be empty",
        };
      }

      console.log(`Fetching details for ${requestBody.listNldid.length} employees`);
      const result = await fetchFullEmployeeDetails(session, requestBody.listNldid);

      const totalMs = Date.now() - t0;
      console.log(`[TIMING] Code 117 fetch: ${totalMs}ms`);

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Code 117 fetch error:", message);
      throw {
        error: "Failed to fetch employee details",
        message,
      };
    }
  }

  /**
   * Bulk upload employees from Excel file (Code 112)
   * Note: Requires multipart/form-data with Excel file
   * @param request Express request for file upload
   * @returns Upload result with processed count and any errors
   */
  @Post("upload")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to upload employees")
  public async uploadEmployees(
    @Request() request: ExpressRequest
  ): Promise<EmployeeBulkUploadResponse> {
    try {
      const session = await getValidSession((request as any).request);

      // Check if file exists in request
      const files = request.files as Record<string, Express.Multer.File[]> | undefined;
      const file = files?.file?.[0];

      if (!file) {
        return {
          success: false,
          message: "No file uploaded. Please provide an Excel file with 'file' field name.",
        };
      }

      // Validate file type (Excel)
      const allowedMimes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (!allowedMimes.includes(file.mimetype)) {
        return {
          success: false,
          message: `Invalid file type: ${file.mimetype}. Please upload an Excel file (.xls or .xlsx).`,
        };
      }

      // Forward to BHXH API Code 112
      const FormData = (await import("formdata-node")).FormData;
      const { default: fetch } = await import("node-fetch");

      const formData = new FormData();
      formData.append("file", new Blob([file.buffer]), file.originalname);

      const response = await fetch(`${process.env.BHXH_BASE_URL}/CallApiWithCurrentUser`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
          "X-CLIENT": session.xClient,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`BHXH API returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        message: "Employee bulk upload completed successfully",
        processed: result.processed || 0,
        errors: result.errors || [],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Employee bulk upload error:", message);
      throw {
        error: "Failed to upload employees",
        message,
      };
    }
  }

  /**
   * Update employee (Code 068)
   * Note: Requires full employee data structure - use GET /employees/{id} first to retrieve current data
   * @param req Express request with auth headers
   * @param employeeId Employee ID
   * @param request Full employee update data
   * @returns Update result
   */
  @Put("{employeeId}")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(404, "Employee not found")
  @Response<{ error: string; message: string }>(500, "Failed to update employee")
  public async updateEmployee(
    @Request() req: any,
    @Path() employeeId: string,
    @Body() request: EmployeeUpdateRequest
  ): Promise<EmployeeUpdateResponse> {
    try {
      const session = await getValidSession(req?.request);

      // Ensure ID matches path parameter
      const employeeData = { ...request, id: parseInt(employeeId, 10) || request.id };

      const result = await updateEmployee(employeeData, session);

      return {
        success: true,
        message: "Employee updated successfully",
        data: result as Employee,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Employee update error:", message);
      throw {
        error: "Failed to update employee",
        message,
      };
    }
  }

  /**
   * Sync employee with central BHXH system (Code 156)
   * Fetches official employee data from central BHXH using Social Security Number
   * @param req Express request with auth headers
   * @param employeeId Employee ID (for route consistency)
   * @param masoBhxh 10-digit Social Security Number
   * @param maCqbh Social Security Agency code
   * @returns Official employee data from central system
   */
  @Get("{employeeId}/sync")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(400, "Invalid sync parameters")
  @Response<{ error: string; message: string }>(500, "Failed to sync employee")
  public async syncEmployeeById(
    @Request() req: any,
    @Path() employeeId: string,
    @Query("masoBhxh") masoBhxh: string,
    @Query("maCqbh") maCqbh: string
  ): Promise<EmployeeSyncResponse> {
    try {
      const session = await getValidSession(req?.request);

      const result = await syncEmployee(
        {
          masoBhxh,
          maCqbh,
          maDonVi: session.currentDonVi.Ma || "",
          isGetAll: false,
        },
        session
      );

      return {
        success: true,
        data: result as EmployeeOfficialData,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Employee sync error:", message);
      throw {
        error: "Failed to sync employee",
        message,
      };
    }
  }
}
