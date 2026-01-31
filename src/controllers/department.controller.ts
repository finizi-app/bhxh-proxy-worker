/**
 * Department Controller
 *
 * RESTful CRUD endpoints for Department management using BHXH API codes 077, 079, 080.
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
  Route,
  Get,
  Post,
  Put,
  Delete,
  Path,
  Body,
  Query,
  SuccessResponse,
  Response,
  Request,
} from "tsoa";
import {
  createDepartment as createDept,
  updateDepartment as updateDept,
  listDepartments as listDepts,
  deleteDepartment as deleteDept,
} from "../services/department.service";
import { getValidSession } from "../services/session.service";
import type { Session } from "../models/session.model";
import type {
  Department,
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
  DepartmentListQueryParams,
  ApiResponse,
} from "../models";

/**
 * Paginated response wrapper
 */
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    count: number;
  };
}

/**
 * Department controller for CRUD operations
 */
@Route("/api/v1/departments")
export class DepartmentController extends Controller {
  /**
   * Create a new department (Code 077)
   * @param req Express request with auth headers
   * @param request Department creation data
   * @returns Created department
   */
  @Post()
  @SuccessResponse(201, "Created")
  @Response<{ error: string; message: string }>(500, "Failed to create department")
  public async createDepartment(
    @Request() req: any,
    @Body() request: DepartmentCreateRequest
  ): Promise<ApiResponse<Department>> {
    try {
      const session: Session = await getValidSession(req?.request);
      const data = await createDept(request, session);
      this.setStatus(201);
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Department create error:", message);
      throw {
        error: "Failed to create department",
        message,
      };
    }
  }

  /**
   * List departments with optional filters (Code 079)
   * @param request Express request with auth headers
   * @param ma Filter by department code
   * @param ten Filter by department name
   * @param PageIndex Page number (default 1)
   * @param PageSize Page size (default 50)
   * @returns Paginated department list
   */
  @Get()
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to fetch departments")
  public async listDepartments(
    @Request() request: any,
    @Query("ma") ma?: string,
    @Query("ten") ten?: string,
    @Query("PageIndex") PageIndex?: number,
    @Query("PageSize") PageSize?: number
  ): Promise<PaginatedResponse<Department>> {
    try {
      const session: Session = await getValidSession(request?.request);
      const query: DepartmentListQueryParams = {
        ma,
        ten,
        PageIndex: PageIndex ?? 1,
        PageSize: PageSize ?? 50,
      };
      const { data, total } = await listDepts(query, session);
      return {
        success: true,
        data,
        meta: { total, count: data.length },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Department list error:", message);
      throw {
        error: "Failed to fetch departments",
        message,
      };
    }
  }

  /**
   * Get department by ID (via list + filter)
   * Note: BHXH API doesn't have direct get-by-id, so we filter the list
   * @param req Express request with auth headers
   * @param id Department ID
   * @returns Department data or 404
   */
  @Get("{id}")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(404, "Department not found")
  @Response<{ error: string; message: string }>(500, "Failed to fetch department")
  public async getDepartmentById(
    @Request() req: any,
    @Path() id: number
  ): Promise<ApiResponse<Department | null>> {
    try {
      const session: Session = await getValidSession(req?.request);
      const { data } = await listDepts({}, session);
      const dept = data.find((d) => d.id === id);

      if (!dept) {
        this.setStatus(404);
        return {
          success: false,
          data: null,
          error: "Department not found",
          message: `No department found with ID ${id}`,
        };
      }

      return { success: true, data: dept };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Department get error:", message);
      throw {
        error: "Failed to fetch department",
        message,
      };
    }
  }

  /**
   * Update existing department (Code 077)
   * @param req Express request with auth headers
   * @param id Department ID to update
   * @param request Department update data
   * @returns Updated department
   */
  @Put("{id}")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(404, "Department not found")
  @Response<{ error: string; message: string }>(500, "Failed to update department")
  public async updateDepartment(
    @Request() req: any,
    @Path() id: number,
    @Body() request: DepartmentUpdateRequest
  ): Promise<ApiResponse<Department>> {
    try {
      const session: Session = await getValidSession(req?.request);
      const data = await updateDept(id, request, session);
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Department update error:", message);
      throw {
        error: "Failed to update department",
        message,
      };
    }
  }

  /**
   * Delete department by ID (Code 080)
   * @param req Express request with auth headers
   * @param id Department ID to delete
   * @returns Success message
   */
  @Delete("{id}")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to delete department")
  public async deleteDepartment(
    @Request() req: any,
    @Path() id: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const session: Session = await getValidSession(req?.request);
      await deleteDept(id, session);
      return { success: true, message: "Department deleted successfully" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Department delete error:", message);
      throw {
        error: "Failed to delete department",
        message,
      };
    }
  }
}
