/**
 * Declarations Controller
 *
 * REST endpoints for BHXH Code 600 declaration operations.
 *
 * **Authentication:**
 * - `X-API-Key`: Required for all endpoints
 * - Query params `username`/`password`: Optional BHXH credentials
 */
import {
  Controller,
  Route,
  Post,
  SuccessResponse,
  Response,
  Request,
  Body,
} from "tsoa";
import type {
  Code600SubmitRequest,
  Code600SubmitResponse,
} from "../models/code-600.model";
import { getValidSession } from "../services/session.service";
import { submitCode600Form } from "../services/bhxh.service";

/**
 * Declarations controller for Code 600 operations
 */
@Route("/api/v1/declarations")
export class DeclarationsController extends Controller {
  /**
   * Submit Code 600 declaration form (Code 084)
   * Submits D02-TS (registration/adjustment), TK1-TS (summary), or D01-TS (termination) forms
   *
   * **Form Types:**
   * - D02-TS: Employee registration/adjustment (Đăng ký, điều chỉnh đóng BHXH)
   * - TK1-TS: Summary report (Tờ khai tổng hợp)
   * - D01-TS: Employee termination (Giảm lao động)
   *
   * **Method Codes (phuongAn):**
   * - TM: Tăng mới (New Registration)
   * - DC: Điều chỉnh (Adjustment)
   * - TT: Tăng thêm (Additional Increase)
   *
   * @param req Express request with auth headers
   * @param submitRequest Declaration form data with thuTuc metadata and form sections
   * @returns Submission result with thuTucId for reference
   */
  @Post("/submit")
  @SuccessResponse(200, "OK")
  @Response<{ error: string; message: string }>(400, "Invalid request")
  @Response<{ error: string; message: string }>(500, "Failed to submit declaration")
  public async submitDeclaration(
    @Request() req: any,
    @Body() submitRequest: Code600SubmitRequest
  ): Promise<Code600SubmitResponse> {
    const t0 = Date.now();

    try {
      const session = await getValidSession(
        req?.request,
        submitRequest.username,
        submitRequest.password
      );

      // Remove username/password before sending to service
      const { username, password, ...formData } = submitRequest;

      console.log(`Submitting Code 600 form for period: ${formData.thuTuc.kyKeKhai}`);
      const result = await submitCode600Form(session, formData);

      const totalMs = Date.now() - t0;
      console.log(`[TIMING] Code 084 submit: ${totalMs}ms`);

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Code 084 submit error:", message);
      throw {
        error: "Failed to submit declaration",
        message,
      };
    }
  }
}
