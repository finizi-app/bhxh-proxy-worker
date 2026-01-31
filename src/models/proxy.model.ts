/**
 * Proxy configuration model
 */
export interface ProxyConfig {
  /** Whether proxy is enabled */
  enabled: boolean;
  /** Proxy URL */
  url?: string;
  /** Authentication credentials */
  credentials?: ProxyCredentials;
}

/**
 * Proxy authentication credentials
 */
export interface ProxyCredentials {
  username: string;
  password: string;
}

/**
 * Captcha response from BHXH API
 */
export interface CaptchaResponse {
  /** Captcha image data (base64) */
  image: string;
  /** Captcha token */
  code: string;
}

/**
 * Captcha solution request
 */
export interface CaptchaSolveRequest {
  image_data: string;
  provider: string;
  timeout: number;
}

/**
 * Captcha solution response from AI service
 */
export interface CaptchaSolveResponse {
  success: boolean;
  captcha_code?: string;
  detail?: {
    detail?: string;
  };
}

/**
 * AI CAPTCHA solver configuration
 */
export interface CaptchaSolverConfig {
  endpoint: string;
  apiKey?: string;
  provider: string;
  timeout: number;
}
