/**
 * Payments Controller
 *
 * REST endpoints for BHXH payment operations.
 *
 * **Authentication:**
 * - `X-API-Key`: Required for all endpoints
 * - `X-Username`: BHXH username (optional if default credentials configured)
 * - `X-Password`: BHXH password (optional if default credentials configured)
 *
 * Query parameters provide per-request authentication for backward compatibility.
 */
import {
  Controller,
  Route,
  Get,
  Query,
  SuccessResponse,
  Response,
  Request,
} from "tsoa";
import type { Request as ExpressRequest } from "express";
import { getValidSession } from "../services/session.service.js";
import * as PaymentService from "../services/payment.service.js";
import type {
  C12ReportResponse,
  C12ReportQueryParams,
  PaymentHistoryResponse,
  PaymentHistoryQueryParams,
  BankAccountsResponse,
  PaymentUnitInfoResponse,
  PaymentReferenceResponse,
  PaymentReferenceParams,
} from "../models/payment/index.js";

interface ErrorResponse {
  error: string;
  message: string;
}

/**
 * Payments controller for BHXH payment operations
 */
@Route("/api/v1/payments")
export class PaymentsController extends Controller {
  /**
   * Get C12 monthly payment obligation report
   * Returns both raw hierarchical data and parsed structured sections
   * @param req Express request with auth headers
   * @param username BHXH username for per-request authentication
   * @param password BHXH password for per-request authentication
   * @param thang Month number (1-12, required)
   * @param nam Year (optional, defaults to current year)
   * @returns C12 report with raw and parsed data
   */
  @Get("/c12-report")
  @SuccessResponse(200, "OK")
  @Response<ErrorResponse>(400, "Bad Request - Invalid month parameter")
  @Response<ErrorResponse>(401, "Unauthorized - Missing credentials")
  @Response<ErrorResponse>(500, "Failed to fetch C12 report")
  public async getC12Report(
    @Request() req: any,
    @Query() username?: string,
    @Query() password?: string,
    @Query() thang?: number,
    @Query() nam?: number
  ): Promise<C12ReportResponse> {
    const t0 = Date.now();

    try {
      // Validate month parameter
      if (!thang || thang < 1 || thang > 12) {
        this.setStatus(400);
        throw {
          error: "Bad Request",
          message: "Invalid month parameter. Must be between 1 and 12.",
        };
      }

      // Get session
      const session = await getValidSession(req?.request, username, password);

      // Fetch C12 report
      const params: C12ReportQueryParams = { thang, nam };
      const { raw, parsed } = await PaymentService.fetchC12Report(session, params);

      const totalMs = Date.now() - t0;
      console.log(`[TIMING] C12 report fetch: ${totalMs}ms`);

      return {
        success: true,
        data: { raw, parsed },
        meta: {
          month: thang,
          year: nam || new Date().getFullYear(),
          unitCode: session.currentDonVi.Ma || "",
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("C12 report fetch error:", message);

      this.setStatus(500);
      throw {
        error: "Failed to fetch C12 report",
        message,
      };
    }
  }

  /**
   * Get payment transaction history
   * Returns electronic payment records with pagination
   * @param req Express request with auth headers
   * @param username BHXH username for per-request authentication
   * @param password BHXH password for per-request authentication
   * @param PageIndex Page number (default: 1)
   * @param PageSize Page size (default: 10)
   * @param Filter Optional filter string
   * @returns Payment history with pagination metadata
   */
  @Get("/history")
  @SuccessResponse(200, "OK")
  @Response<ErrorResponse>(401, "Unauthorized - Missing credentials")
  @Response<ErrorResponse>(500, "Failed to fetch payment history")
  public async getPaymentHistory(
    @Request() req: any,
    @Query() username?: string,
    @Query() password?: string,
    @Query() PageIndex?: number,
    @Query() PageSize?: number,
    @Query() Filter?: string
  ): Promise<PaymentHistoryResponse> {
    const t0 = Date.now();

    try {
      // Get session
      const session = await getValidSession(req?.request, username, password);

      // Fetch payment history
      const params: PaymentHistoryQueryParams = {
        PageIndex: PageIndex || 1,
        PageSize: PageSize || 10,
        Filter,
      };

      const { transactions, total } = await PaymentService.fetchPaymentHistory(
        session,
        params
      );

      const totalMs = Date.now() - t0;
      console.log(`[TIMING] Payment history fetch: ${totalMs}ms`);

      return {
        success: true,
        data: transactions,
        meta: {
          total,
          count: transactions.length,
          pageIndex: params.PageIndex || 1,
          pageSize: params.PageSize || 10,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Payment history fetch error:", message);

      this.setStatus(500);
      throw {
        error: "Failed to fetch payment history",
        message,
      };
    }
  }

  /**
   * Get BHXH beneficiary bank accounts
   * Returns list of valid bank accounts for BHXH payments
   * @param req Express request with auth headers
   * @param username BHXH username for per-request authentication
   * @param password BHXH password for per-request authentication
   * @returns List of beneficiary bank accounts
   */
  @Get("/bank-accounts")
  @SuccessResponse(200, "OK")
  @Response<ErrorResponse>(401, "Unauthorized - Missing credentials")
  @Response<ErrorResponse>(500, "Failed to fetch bank accounts")
  public async getBankAccounts(
    @Request() req: any,
    @Query() username?: string,
    @Query() password?: string
  ): Promise<BankAccountsResponse> {
    try {
      // Get session
      const session = await getValidSession(req?.request, username, password);

      // Fetch bank accounts
      const accounts = await PaymentService.fetchBankAccounts(session);

      return {
        success: true,
        data: accounts,
        meta: {
          agencyCode: session.currentDonVi.MaCoquan || "",
          count: accounts.length,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Bank accounts fetch error:", message);

      this.setStatus(500);
      throw {
        error: "Failed to fetch bank accounts",
        message,
      };
    }
  }

  /**
   * Get unit payment information for payment initialization
   * @param req Express request with auth headers
   * @param username BHXH username for per-request authentication
   * @param password BHXH password for per-request authentication
   * @returns Unit payment information
   */
  @Get("/unit-info")
  @SuccessResponse(200, "OK")
  @Response<ErrorResponse>(401, "Unauthorized - Missing credentials")
  @Response<ErrorResponse>(500, "Failed to fetch unit info")
  public async getPaymentUnitInfo(
    @Request() req: any,
    @Query() username?: string,
    @Query() password?: string
  ): Promise<PaymentUnitInfoResponse> {
    try {
      // Get session
      const session = await getValidSession(req?.request, username, password);

      // Fetch unit info
      const unitInfo = await PaymentService.fetchPaymentUnitInfo(session);

      return {
        success: true,
        data: unitInfo,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Unit info fetch error:", message);

      this.setStatus(500);
      throw {
        error: "Failed to fetch unit info",
        message,
      };
    }
  }

  /**
   * Generate payment reference string
   * Creates standardized BHXH payment reference format
   * @param req Express request with auth headers
   * @param username BHXH username for per-request authentication
   * @param password BHXH password for per-request authentication
   * @param type Transaction type (default: "103" for payment)
   * @param description Payment description (default: "dong BHXH")
   * @param unitCode Unit code (optional, uses session default if not provided)
   * @param agencyCode Agency code (optional, uses session default if not provided)
   * @returns Generated payment reference string with components
   */
  @Get("/reference")
  @SuccessResponse(200, "OK")
  @Response<ErrorResponse>(400, "Bad Request - Missing unit/agency codes")
  @Response<ErrorResponse>(401, "Unauthorized - Missing credentials")
  @Response<ErrorResponse>(500, "Failed to generate payment reference")
  public async getPaymentReference(
    @Request() req: any,
    @Query() username?: string,
    @Query() password?: string,
    @Query() type?: string,
    @Query() description?: string,
    @Query() unitCode?: string,
    @Query() agencyCode?: string
  ): Promise<PaymentReferenceResponse> {
    try {
      // Get session (for default unit/agency codes)
      const session = await getValidSession(req?.request, username, password);

      // Use session values if not provided
      const finalUnitCode = unitCode || session.currentDonVi.Ma || "";
      const finalAgencyCode = agencyCode || session.currentDonVi.MaCoquan || "";

      if (!finalUnitCode || !finalAgencyCode) {
        this.setStatus(400);
        throw {
          error: "Bad Request",
          message: "Unit code and agency code are required",
        };
      }

      // Generate reference
      const params: PaymentReferenceParams = {
        type,
        description,
        unitCode: finalUnitCode,
        agencyCode: finalAgencyCode,
      };

      const { reference, components } =
        PaymentService.generatePaymentReference(params);

      return {
        success: true,
        data: {
          reference,
          components: components as {
            prefix: string;
            type: string;
            reserved: string;
            unitCode: string;
            agencyCode: string;
            description: string;
          },
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Payment reference generation error:", message);

      this.setStatus(500);
      throw {
        error: "Failed to generate payment reference",
        message,
      };
    }
  }
}
