/**
 * Proxy service for configuring HTTP/HTTPS proxy agents
 */
import axios, { AxiosInstance } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import dotenv from "dotenv";
import { ProxyConfig } from "../models/proxy.model";

dotenv.config({ path: ".dev.vars" });

/** Configuration from environment */
const CONFIG = {
  baseUrl: process.env.BHXH_BASE_URL || "https://dichvucong.baohiemxahoi.gov.vn",
  useProxy: process.env.USE_PROXY === "true",
  proxyUrl: process.env.EXTERNAL_PROXY_URL,
  proxyUsername: process.env.EXTERNAL_PROXY_USERNAME,
  proxyPassword: process.env.EXTERNAL_PROXY_PASSWORD,
};

/**
 * Get HTTPS agent with optional proxy configuration
 * @returns HttpsProxyAgent instance or undefined if no proxy
 */
export function getHttpsAgent(): HttpsProxyAgent | undefined {
  if (!CONFIG.useProxy || !CONFIG.proxyUrl) {
    return undefined;
  }

  const auth = CONFIG.proxyUsername && CONFIG.proxyPassword
    ? `${CONFIG.proxyUsername}:${CONFIG.proxyPassword}@`
    : "";
  const proxyFullUrl = `http://${auth}${new URL(CONFIG.proxyUrl).host}`;

  return new HttpsProxyAgent(proxyFullUrl);
}

/**
 * Create configured axios instance with optional proxy
 * @returns Configured Axios instance
 */
export function createAxios(): AxiosInstance {
  return axios.create({
    httpsAgent: getHttpsAgent(),
  });
}

/**
 * Get current proxy configuration
 * @returns ProxyConfig object
 */
export function getProxyConfig(): ProxyConfig {
  return {
    enabled: CONFIG.useProxy,
    url: CONFIG.proxyUrl,
    credentials: CONFIG.proxyUsername && CONFIG.proxyPassword
      ? { username: CONFIG.proxyUsername, password: CONFIG.proxyPassword }
      : undefined,
  };
}

export default {
  getHttpsAgent,
  createAxios,
  getProxyConfig,
};
