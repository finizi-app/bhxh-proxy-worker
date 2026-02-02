/**
 * Geographic Data Controller
 *
 * REST endpoints for geographic data: provinces, wards
 *
 * **Authentication:**
 * - `X-API-Key`: Required for protected endpoints
 * - `X-Username`: BHXH username (optional if default credentials configured)
 * - `X-Password`: BHXH password (optional if default credentials configured)
 *
 * **Public Access:**
 * - `/api/v1/geographic/provinces` - Public, no auth required
 * - `/api/v1/geographic/wards` - Public, no auth required
 *
 * Public endpoints use internal session (environment credentials) for BHXH authentication.
 *
 * **Note:** Medical facilities (Cơ Sở Khám Chữa Bệnh) are now available at
 * `/api/v1/master-data/medical-facilities` (Code 063, public access)
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
import { getProvinces, getWards, getDistricts } from "../services/geographic.service";
import { getValidSession } from "../services/session.service";
import type {
  MedicalFacility,
  Province,
  Ward,
  GeographicListResponse,
} from "../models";

/**
 * Geographic controller for provinces, wards
 */
@Route("/api/v1/geographic")
export class GeographicController extends Controller {
  /**
   * Get all provinces (Tinh/Thanh pho)
   * Public endpoint - no authentication required
   * @returns List of all provinces
   */
  @Get("/provinces")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to fetch provinces")
  public async getProvinces(): Promise<GeographicListResponse<Province>> {
    try {
      const session = await getValidSession();
      const data = await getProvinces(session);
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Provinces fetch error:", message);
      throw {
        error: "Failed to fetch provinces",
        message,
      };
    }
  }

  /**
   * Get wards by province and district
   * Public endpoint - no authentication required
   * @param matinh Province code (2-digit, required)
   * @param mahuyen District code (optional)
   * @returns List of wards
   */
  @Get("/wards")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(400, "Missing matinh parameter")
  @Response<{ error: string; message: string }>(500, "Failed to fetch wards")
  public async getWards(
    @Query("matinh") matinh?: string,
    @Query("mahuyen") mahuyen?: string
  ): Promise<GeographicListResponse<Ward>> {
    if (!matinh) {
      throw {
        error: "Bad Request",
        message: "matinh parameter is required",
      };
    }

    try {
      const session = await getValidSession();
      const data = await getWards(matinh, mahuyen, session);
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Wards fetch error:", message);
      throw {
        error: "Failed to fetch wards",
        message,
      };
    }
  }

  /**
   * @deprecated Use GET /api/v1/master-data/medical-facilities instead
   * This endpoint was incorrectly named - Code 063 returns medical facilities, not districts
   * Kept for backward compatibility only
   * Public endpoint - no authentication required
   * @param req Express request with auth headers
   * @param maTinh Province code (2-digit, e.g., "79" for Ho Chi Minh City). If omitted, returns all.
   * @returns List of medical facilities (not districts)
   */
  @Get("/districts")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to fetch medical facilities")
  public async getDistricts(
    @Request() req: any,
    @Query("maTinh") maTinh?: string
  ): Promise<GeographicListResponse<MedicalFacility>> {
    try {
      const session = await getValidSession(req?.request);
      const data = await getDistricts(maTinh, session);
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Medical facilities fetch error:", message);
      throw {
        error: "Failed to fetch medical facilities",
        message,
      };
    }
  }
}
