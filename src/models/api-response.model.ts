/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

/**
 * Lookup API response
 */
export interface LookupResponse {
  success: boolean;
  data: unknown;
}

/**
 * Error response format
 */
export interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
}

/**
 * Generic timing metrics
 */
export interface TimingMetrics {
  sessionMs: number;
  fetchMs: number;
  totalMs: number;
}
