/**
 * BHXH API Client
 * Implements the API calls using native fetch()
 * Supports optional proxy mode to bypass SSL restrictions
 */

import type { Env } from "./auth";
import { getValidSession } from "./auth";
import type { CaptchaResponse, LoginResponse, Session, EmployeeListResponse } from "./bhxh-types";
import { bhxhFetch, fetchWithRetry, createTimeoutSignal, MAX_PAGE_SIZE } from "./bhxh-http-utils";

/**
 * BHXH API Client class
 * If proxyUrl is provided, all requests are routed through the proxy
 */
export class BHXHClient {
    constructor(
        private baseUrl: string,
        private proxyUrl?: string
    ) { }

    /**
     * Get Client ID for session initialization
     */
    async getClientId(): Promise<string> {
        return fetchWithRetry(async () => {
            const response = await bhxhFetch(this.baseUrl, "/oauth2/GetClientId", {
                signal: createTimeoutSignal(),
            }, this.proxyUrl);
            if (!response.ok) {
                throw new Error(`Failed to get client ID: ${response.status}`);
            }
            return response.text();
        });
    }

    /**
     * Get CAPTCHA image and token
     */
    async getCaptcha(xClient: string): Promise<CaptchaResponse> {
        return fetchWithRetry(async () => {
            const response = await bhxhFetch(this.baseUrl, "/api/getCaptchaImage", {
                signal: createTimeoutSignal(),
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CLIENT": xClient,
                    "is_public": "true",
                },
                body: JSON.stringify({ height: 60, width: 300 }),
            }, this.proxyUrl);

            if (!response.ok) {
                throw new Error(`Failed to get captcha: ${response.status}`);
            }

            return response.json();
        });
    }

    /**
     * Perform login with credentials and solved captcha
     */
    async login(
        username: string,
        password: string,
        captchaSolution: string,
        captchaToken: string,
        clientId: string
    ): Promise<LoginResponse> {
        const params = new URLSearchParams();
        params.append("grant_type", "password");
        params.append("username", username);
        params.append("password", password);
        params.append("loaidoituong", "1"); // Organization
        params.append("text", captchaSolution);
        params.append("code", captchaToken);
        params.append("clientId", clientId);

        const response = await bhxhFetch(this.baseUrl, "/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "not_auth_token": "false",
            },
            body: params.toString(),
        }, this.proxyUrl);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Login failed: ${response.status} - ${errorText}`);
        }

        return response.json();
    }

    /**
     * Generic API call wrapper
     */
    async callApi<T>(
        code: string,
        data: Record<string, unknown>,
        token: string,
        xClient: string,
        env?: Env
    ): Promise<T> {
        const response = await bhxhFetch(this.baseUrl, "/CallApiWithCurrentUser", {
            signal: createTimeoutSignal(),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-CLIENT": xClient,
            },
            body: JSON.stringify({ code, data: JSON.stringify(data) }),
        }, this.proxyUrl);

        if (response.status === 401 && env) {
            await env.BHXH_SESSION.delete("session");
            const session = await getValidSession(env);
            return this.callApi(code, data, session.token, session.xClient, env);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API ${code} failed: ${response.status} - ${errorText}`);
        }

        return response.json();
    }

    /**
     * Fetch employee list (Code 067)
     */
    async fetchEmployees(
        session: Session,
        pageIndex: number = 1,
        pageSize: number = 100
    ): Promise<EmployeeListResponse> {
        const safePageSize = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);
        const { currentDonVi } = session;

        const payload = {
            maNguoiLaoDong: "",
            ten: "",
            maPhongBan: "",
            maTinhTrang: "",
            MaSoBhxh: "",
            maDonVi: currentDonVi.Ma,
            maCoquan: currentDonVi.MaCoquan,
            PageIndex: pageIndex,
            PageSize: safePageSize,
            masobhxhuser: currentDonVi.Ma,
            macoquanuser: currentDonVi.MaCoquan,
            loaidoituonguser: currentDonVi.LoaiDoiTuong || "1",
        };

        return this.callApi<EmployeeListResponse>(
            "067",
            payload,
            session.token,
            session.xClient
        );
    }

    /**
     * Fetch lookup data (Code 071, 072, 073, etc.)
     */
    async fetchLookupData(
        session: Session,
        code: string
    ): Promise<any> {
        const { currentDonVi } = session;

        const payload = {
            masobhxhuser: currentDonVi.Ma,
            macoquanuser: currentDonVi.MaCoquan,
            loaidoituonguser: currentDonVi.LoaiDoiTuong || "1",
        };

        return this.callApi<any>(
            code,
            payload,
            session.token,
            session.xClient
        );
    }
}
