/**
 * Geographic Data Controller
 *
 * REST endpoints for geographic data: provinces, districts, wards
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
  Route,
  SuccessResponse,
  Response,
  Query,
  Request,
} from "tsoa";
import { getDistricts } from "../services/geographic.service";
import { getValidSession } from "../services/session.service";
import type {
  District,
  GeographicListResponse,
} from "../models";

/**
 * Geographic controller for provinces, districts, wards
 */
@Route("/api/v1/geographic")
export class GeographicController extends Controller {
  /**
   * Get districts by province (Code 063)
   * @param req Express request with auth headers
   * @param maTinh Province code (2-digit, e.g., "79" for Ho Chi Minh City)
   * @returns List of districts
   */
  @Get("/districts")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to fetch districts")
  public async getDistricts(
    @Request() req: any,
    @Query("maTinh") maTinh: string
  ): Promise<GeographicListResponse<District>> {
    try {
      const session = await getValidSession(req?.request);
      const data = await getDistricts(maTinh, session);
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Districts fetch error:", message);
      throw {
        error: "Failed to fetch districts",
        message,
      };
    }
  }
}
