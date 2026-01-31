/**
 * Department Controller
 *
 * RESTful CRUD endpoints for Department management using BHXH API codes 077, 079, 080.
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
   * @param request Department creation data
   * @param username BHXH username for authentication
   * @param password BHXH password for authentication
   * @returns Created department
   */
  @Post()
  @SuccessResponse(201, "Created")
  @Response<{ error: string; message: string }>(500, "Failed to create department")
  public async createDepartment(
    @Body() request: DepartmentCreateRequest,
    @Query() username?: string,
    @Query() password?: string
  ): Promise<ApiResponse<Department>> {
    try {
      const session: Session = await getValidSession(username, password);
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
   * @param ma Filter by department code
   * @param ten Filter by department name
   * @param PageIndex Page number (default 1)
   * @param PageSize Page size (default 50)
   * @param username BHXH username for authentication
   * @param password BHXH password for authentication
   * @returns Paginated department list
   */
  @Get()
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to fetch departments")
  public async listDepartments(
    @Query("ma") ma?: string,
    @Query("ten") ten?: string,
    @Query("PageIndex") PageIndex?: number,
    @Query("PageSize") PageSize?: number,
    @Query() username?: string,
    @Query() password?: string
  ): Promise<PaginatedResponse<Department>> {
    try {
      const session: Session = await getValidSession(username, password);
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
   * @param id Department ID
   * @param username BHXH username for authentication
   * @param password BHXH password for authentication
   * @returns Department data or 404
   */
  @Get("{id}")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(404, "Department not found")
  @Response<{ error: string; message: string }>(500, "Failed to fetch department")
  public async getDepartmentById(
    @Path() id: number,
    @Query() username?: string,
    @Query() password?: string
  ): Promise<ApiResponse<Department | null>> {
    try {
      const session: Session = await getValidSession(username, password);
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
   * @param id Department ID to update
   * @param request Department update data
   * @param username BHXH username for authentication
   * @param password BHXH password for authentication
   * @returns Updated department
   */
  @Put("{id}")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(404, "Department not found")
  @Response<{ error: string; message: string }>(500, "Failed to update department")
  public async updateDepartment(
    @Path() id: number,
    @Body() request: DepartmentUpdateRequest,
    @Query() username?: string,
    @Query() password?: string
  ): Promise<ApiResponse<Department>> {
    try {
      const session: Session = await getValidSession(username, password);
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
   * @param id Department ID to delete
   * @param username BHXH username for authentication
   * @param password BHXH password for authentication
   * @returns Success message
   */
  @Delete("{id}")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to delete department")
  public async deleteDepartment(
    @Path() id: number,
    @Query() username?: string,
    @Query() password?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const session: Session = await getValidSession(username, password);
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
