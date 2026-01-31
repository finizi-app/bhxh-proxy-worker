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
import {
  EmployeeListResponse,
  EmployeesQueryParams,
  EmployeeDetailResponse,
  EmployeeBulkUploadResponse,
  EmployeeUpdateRequest,
  EmployeeUpdateResponse,
  EmployeeSyncResponse,
} from "../models/employee.model";
import { getValidSession } from "../services/session.service";
import { fetchEmployees, updateEmployee, syncEmployee, getEmployeeDetail } from "../services/bhxh.service";

/**
 * Employees controller for fetching employee data
 */
@Route("/api/v1/employees")
export class EmployeesController extends Controller {
  /**
   * Get all employees for current unit
   * @param username - BHXH username for per-request authentication
   * @param password - BHXH password for per-request authentication
   * @param maNguoiLaoDong - Filter by employee code
   * @param ten - Filter by name
   * @param maPhongBan - Filter by department
   * @param maTinhTrang - Filter by status
   * @param MaSoBhxh - Filter by BHXH number
   * @param PageIndex - Page number (default 1)
   * @param PageSize - Page size (default 100)
   * @returns Employee list with pagination info
   */
  @Get("/")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to fetch employees")
  public async getEmployees(
    @Query() username?: string,
    @Query() password?: string,
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
      const session = await getValidSession(username, password);
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
   * @param employeeId Employee ID (internal record ID)
   * @param username BHXH username for authentication
   * @param password BHXH password for authentication
   * @returns Employee detail or error message
   */
  @Get("{employeeId}")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(404, "Employee not found")
  @Response<{ error: string; message: string }>(500, "Failed to fetch employee")
  public async getEmployeeById(
    @Path() employeeId: string,
    @Query() username?: string,
    @Query() password?: string
  ): Promise<EmployeeDetailResponse> {
    try {
      const session = await getValidSession(username, password);
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
   * Bulk upload employees from Excel file (Code 112)
   * Note: Requires multipart/form-data with Excel file
   * @param request Express request for file upload
   * @param username BHXH username for authentication
   * @param password BHXH password for authentication
   * @returns Upload result with processed count and any errors
   */
  @Post("upload")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to upload employees")
  public async uploadEmployees(
    @Request() request: ExpressRequest,
    @Query() username?: string,
    @Query() password?: string
  ): Promise<EmployeeBulkUploadResponse> {
    try {
      const session = await getValidSession(username, password);

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
   * @param employeeId Employee ID
   * @param request Full employee update data
   * @param username BHXH username for authentication
   * @param password BHXH password for authentication
   * @returns Update result
   */
  @Put("{employeeId}")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(404, "Employee not found")
  @Response<{ error: string; message: string }>(500, "Failed to update employee")
  public async updateEmployee(
    @Path() employeeId: string,
    @Body() request: EmployeeUpdateRequest,
    @Query() username?: string,
    @Query() password?: string
  ): Promise<EmployeeUpdateResponse> {
    try {
      const session = await getValidSession(username, password);

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
   * @param employeeId Employee ID (for route consistency)
   * @param masoBhxh 10-digit Social Security Number
   * @param maCqbh Social Security Agency code
   * @param username BHXH username for authentication
   * @param password BHXH password for authentication
   * @returns Official employee data from central system
   */
  @Get("{employeeId}/sync")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(400, "Invalid sync parameters")
  @Response<{ error: string; message: string }>(500, "Failed to sync employee")
  public async syncEmployeeById(
    @Path() employeeId: string,
    @Query("masoBhxh") masoBhxh: string,
    @Query("maCqbh") maCqbh: string,
    @Query() username?: string,
    @Query() password?: string
  ): Promise<EmployeeSyncResponse> {
    try {
      const session = await getValidSession(username, password);

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
