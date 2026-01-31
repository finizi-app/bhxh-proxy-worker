import {
  Controller,
  Get,
  Route,
  SuccessResponse,
  Response,
  Query,
} from "tsoa";
import { EmployeeListResponse } from "../models/employee.model";
import { getValidSession } from "../services/session.service";
import { fetchEmployees } from "../services/bhxh.service";
import { EmployeesQueryParams } from "../models/employee.model";

/**
 * Employees controller for fetching employee data
 */
@Route("/api/v1/employees")
export class EmployeesController extends Controller {
  /**
   * Get all employees for current unit
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
      const session = await getValidSession();
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
}
