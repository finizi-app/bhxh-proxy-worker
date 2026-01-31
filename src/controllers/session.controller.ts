import {
  Controller,
  Get,
  Post,
  Route,
  SuccessResponse,
  Response,
  Body,
  Query,
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

/**
 * Session controller for managing BHXH authentication state
 */
@Route("/api/v1/session")
export class SessionController extends Controller {
  /**
   * Get current session status
   * @param username - Optional BHXH username for per-request authentication
   * @param password - Optional BHXH password for per-request authentication
   * @returns Session status with expiration info
   */
  @Get("/status")
  @SuccessResponse(200, "OK")
  public async getSessionStatus(
    @Query() username?: string,
    @Query() password?: string
  ): Promise<SessionStatusResponse> {
    return await getSessionStatus(username, password);
  }

  /**
   * Refresh session token
   * @param body - Optional request body with force flag and credentials
   * @returns Session refresh response
   */
  @Post("/refresh")
  @SuccessResponse(200, "Session refreshed")
  @Response<{ error: string; message: string }>(500, "Refresh failed")
  public async refresh(
    @Body() body?: RefreshRequestBody
  ): Promise<SessionRefreshResponse> {
    try {
      const session = await refreshSession(body?.username, body?.password);
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
