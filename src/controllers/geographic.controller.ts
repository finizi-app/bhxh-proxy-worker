/**
 * Geographic Data Controller
 *
 * REST endpoints for geographic data: provinces, districts, wards
 */
import {
  Controller,
  Get,
  Route,
  SuccessResponse,
  Response,
  Query,
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
   * @param maTinh Province code (2-digit, e.g., "79" for Ho Chi Minh City)
   * @param username BHXH username for authentication
   * @param password BHXH password for authentication
   * @returns List of districts
   */
  @Get("/districts")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to fetch districts")
  public async getDistricts(
    @Query("maTinh") maTinh: string,
    @Query() username?: string,
    @Query() password?: string
  ): Promise<GeographicListResponse<District>> {
    try {
      const session = await getValidSession(username, password);
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
