/**
 * Master Data Controller
 *
 * Named endpoints for BHXH master data lookup resources.
 * Replaces generic /api/v1/lookup/{code} with discoverable endpoints.
 */
import {
  Controller,
  Get,
  Route,
  SuccessResponse,
  Response,
} from "tsoa";
import {
  MasterDataResponse,
  PaperType,
  Country,
  Ethnicity,
  LaborPlanType,
  Benefit,
  Relationship,
} from "../models/master-data.model";
import { getValidSession } from "../services/session.service";
import { lookup } from "../services/bhxh.service";

/**
 * Master data controller for fetching reference/metadata
 */
@Route("/api/v1/master-data")
export class MasterDataController extends Controller {
  /**
   * Get paper types (Code 071)
   * Document types: Sổ hộ khẩu, CCCD/ĐDCN, etc.
   * @returns List of paper types
   */
  @Get("/paper-types")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to fetch paper types")
  public async getPaperTypes(): Promise<MasterDataResponse<PaperType>> {
    try {
      const session = await getValidSession();
      const data = (await lookup(session, "071")) as PaperType[];
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Paper types fetch error:", message);
      throw {
        error: "Failed to fetch paper types",
        message,
      };
    }
  }

  /**
   * Get countries (Code 072)
   * ISO country codes with Vietnamese names
   * @returns List of countries
   */
  @Get("/countries")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to fetch countries")
  public async getCountries(): Promise<MasterDataResponse<Country>> {
    try {
      const session = await getValidSession();
      const data = (await lookup(session, "072")) as Country[];
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Countries fetch error:", message);
      throw {
        error: "Failed to fetch countries",
        message,
      };
    }
  }

  /**
   * Get ethnicities (Code 073)
   * Vietnamese ethnic groups: Kinh, Tày, Thái, etc.
   * @returns List of ethnicities
   */
  @Get("/ethnicities")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to fetch ethnicities")
  public async getEthnicities(): Promise<MasterDataResponse<Ethnicity>> {
    try {
      const session = await getValidSession();
      const data = (await lookup(session, "073")) as Ethnicity[];
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Ethnicities fetch error:", message);
      throw {
        error: "Failed to fetch ethnicities",
        message,
      };
    }
  }

  /**
   * Get labor plan types (Code 086)
   * Employment change categories: Tăng lao động, Giảm lao động, etc.
   * @returns List of labor plan types
   */
  @Get("/labor-plan-types")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to fetch labor plan types")
  public async getLaborPlanTypes(): Promise<MasterDataResponse<LaborPlanType>> {
    try {
      const session = await getValidSession();
      const data = (await lookup(session, "086")) as LaborPlanType[];
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Labor plan types fetch error:", message);
      throw {
        error: "Failed to fetch labor plan types",
        message,
      };
    }
  }

  /**
   * Get benefits (Code 098)
   * Social insurance benefit types (Chế độ): Dưỡng sức, ốm đau, etc.
   * @returns List of benefit types
   */
  @Get("/benefits")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to fetch benefits")
  public async getBenefits(): Promise<MasterDataResponse<Benefit>> {
    try {
      const session = await getValidSession();
      const data = (await lookup(session, "098")) as Benefit[];
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Benefits fetch error:", message);
      throw {
        error: "Failed to fetch benefits",
        message,
      };
    }
  }

  /**
   * Get relationships (Code 099)
   * Family/household relationships: Chủ hộ, Vợ, Chồng, Con, etc.
   * @returns List of relationships
   */
  @Get("/relationships")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(500, "Failed to fetch relationships")
  public async getRelationships(): Promise<MasterDataResponse<Relationship>> {
    try {
      const session = await getValidSession();
      const data = (await lookup(session, "099")) as Relationship[];
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Relationships fetch error:", message);
      throw {
        error: "Failed to fetch relationships",
        message,
      };
    }
  }
}
