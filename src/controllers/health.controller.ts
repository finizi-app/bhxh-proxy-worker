import { Controller, Get, Route, SuccessResponse, Response } from "tsoa";

interface HealthResponse {
  status: string;
  service: string;
  timestamp?: string;
}

interface HealthError {
  error: string;
  message: string;
}

/**
 * Health controller for monitoring service status
 */
@Route("/health")
export class HealthController extends Controller {
  /**
   * Check service health status
   * @returns Health status response
   */
  @Get("/")
  @SuccessResponse(200, "OK")
  @Response<HealthError>(503, "Service unavailable")
  public async getHealth(): Promise<HealthResponse> {
    return {
      status: "ok",
      service: "bhxh-api",
      timestamp: new Date().toISOString(),
    };
  }
}
