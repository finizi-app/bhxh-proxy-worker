/**
 * Session controller for managing BHXH authentication state
 *
 * **Authentication:**
 * - `X-API-Key`: Required for all endpoints
 * - `X-Username`: BHXH username (optional if default credentials configured)
 * - `X-Password`: BHXH password (optional if default credentials configured)
 *
 * Headers take priority over query/body parameters for backward compatibility.
 */
import {
  Controller,
  Get,
  Post,
  Route,
  SuccessResponse,
  Response,
  Body,
  Query,
  Request,
} from "tsoa";
import {
  SessionStatusResponse,
  SessionRefreshResponse,
} from "../models/session.model";
import {
  getSessionStatus,
  refreshSession,
} from "../services/session.service";

interface RefreshRequestBody {
  force?: boolean;
  username?: string;
  password?: string;
}

@Route("/api/v1/session")
export class SessionController extends Controller {
  /**
   * Get current session status
   * @param req Express request with auth headers
   * @returns Session status with expiration info
   */
  @Get("/status")
  @SuccessResponse(200, "OK")
  public async getSessionStatus(
    @Request() req: any
  ): Promise<SessionStatusResponse> {
    return await getSessionStatus(req?.request);
  }

  /**
   * Refresh session token
   * @param req Express request with auth headers
   * @param body Optional request body with force flag
   * @returns Session refresh response
   */
  @Post("/refresh")
  @SuccessResponse(200, "Session refreshed")
  @Response<{ error: string; message: string }>(500, "Refresh failed")
  public async refresh(
    @Request() req: any,
    @Body() body?: RefreshRequestBody
  ): Promise<SessionRefreshResponse> {
    try {
      const session = await refreshSession(req?.request);
      return {
        success: true,
        message: "Session refreshed",
        unit: session.currentDonVi.Ten || session.currentDonVi.TenDonVi || "Unknown",
        expiresIn: 3600,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Session refresh error:", message);
      throw {
        error: "Refresh failed",
        message,
      };
    }
  }
}
