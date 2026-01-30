/**
 * BHXH HTTP Utilities
 * HTTP helpers, retry logic, and proxy configuration
 */

export const DEFAULT_TIMEOUT = 15000; // 15 seconds
export const MAX_PAGE_SIZE = 500;

export function createTimeoutSignal(timeout: number = DEFAULT_TIMEOUT): AbortSignal {
    return AbortSignal.timeout(timeout);
}

export async function fetchWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (i < maxRetries - 1) {
                const delay = Math.pow(2, i) * 1000;
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }
    throw lastError;
}

export const STANDARD_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
};

/**
 * Make HTTP request with optional proxy
 */
export async function bhxhFetch(
    baseUrl: string,
    path: string,
    init: RequestInit = {},
    proxyUrl?: string
): Promise<Response> {
    const targetUrl = `${baseUrl}${path}`;

    if (!proxyUrl) {
        return fetch(targetUrl, {
            ...init,
            headers: { ...STANDARD_HEADERS, ...init.headers },
        });
    }

    // Route through simple forward proxy
    const proxyEndpoint = `${proxyUrl}/proxy?url=${encodeURIComponent(targetUrl)}`;
    return fetch(proxyEndpoint, {
        method: init.method || "GET",
        headers: { ...STANDARD_HEADERS, ...init.headers },
        body: init.body,
    });
}
