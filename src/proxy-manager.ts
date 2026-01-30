
import { ProxyAgent, fetch as undiciFetch } from 'undici';
import { Env } from './auth';

export interface ProxyConfig {
    url: string;
    lastChecked: number;
    isValid: boolean;
}

const PROXY_LIST_URL = 'https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&country=vn&proxy_format=protocolipport&format=text&timeout=20000';
const TARGET_URL = 'https://dichvucong.baohiemxahoi.gov.vn';

export class ProxyManager {
    /**
     * Get a working proxy: from KV, or Env, or fetch new list
     */
    static async getWorkingProxy(env: Env): Promise<string | null> {
        // 1. Check cached valid proxy in KV
        if (env.BHXH_SESSION) {
            const cachedProxy = await env.BHXH_SESSION.get<string>("valid_proxy");
            if (cachedProxy) {
                console.log(`[ProxyManager] Using cached proxy: ${cachedProxy}`);
                return cachedProxy;
            }
        }

        // 2. Check configured proxy in Env
        if (env.EXTERNAL_PROXY_URL) {
            console.log(`[ProxyManager] Checking configured proxy: ${env.EXTERNAL_PROXY_URL}`);
            if (await this.checkProxy(env.EXTERNAL_PROXY_URL)) {
                await this.cacheProxy(env, env.EXTERNAL_PROXY_URL);
                return env.EXTERNAL_PROXY_URL;
            }
            console.log(`[ProxyManager] Configured proxy failed.`);
        }

        // 3. Search for new proxy
        console.log(`[ProxyManager] Searching for new proxy...`);
        const newProxy = await this.findNewProxy();
        if (newProxy) {
            await this.cacheProxy(env, newProxy);
            return newProxy;
        }

        return null;
    }

    /**
     * Cache the proxy in KV
     */
    static async cacheProxy(env: Env, proxyUrl: string) {
        if (!env.BHXH_SESSION) return;
        // Cache for 1 hour
        await env.BHXH_SESSION.put("valid_proxy", proxyUrl, { expirationTtl: 3600 });
        console.log(`[ProxyManager] Cached proxy: ${proxyUrl}`);
    }

    /**
     * Fetch list and find first working proxy
     */
    static async findNewProxy(): Promise<string | null> {
        try {
            const response = await fetch(PROXY_LIST_URL);
            if (!response.ok) {
                console.warn(`[ProxyManager] Failed to fetch list: ${response.status}`);
                return null;
            }
            const text = await response.text();
            // Parse lines
            const proxies = text.split('\n')
                .map(l => l.trim())
                .filter(l => l && l.length > 0)
                // Filter for likely HTTP/HTTPS ports or add protocol
                .map(l => l.startsWith('http') ? l : `http://${l}`);

            console.log(`[ProxyManager] Got ${proxies.length} candidates.`);

            // Test in chunks
            for (const proxy of proxies) {
                if (await this.checkProxy(proxy)) {
                    console.log(`[ProxyManager] Found working: ${proxy}`);
                    return proxy;
                }
            }
        } catch (e) {
            console.error(`[ProxyManager] Error searching proxies:`, e);
        }
        return null;
    }

    /**
     * Check if a proxy works using undici ProxyAgent
     */
    static async checkProxy(proxyUrl: string): Promise<boolean> {
        const result = await this.checkProxyDetailed(proxyUrl);
        return result.success;
    }

    /**
     * Detailed check for debugging
     */
    static async checkProxyDetailed(proxyUrl: string): Promise<{ success: boolean; error?: string; status?: number }> {
        try {
            const dispatcher = new ProxyAgent({
                uri: proxyUrl,
                connect: {
                    rejectUnauthorized: false, // Allow self-signed or invalid certs on proxy
                    timeout: 10000
                }
            });
            const response = await undiciFetch(TARGET_URL, {
                dispatcher,
                method: 'GET',
                signal: AbortSignal.timeout(15000)
            });

            if (response.status < 500) {
                return { success: true, status: response.status };
            } else {
                return { success: false, status: response.status, error: `HTTP ${response.status}` };
            }
        } catch (e: any) {
            console.warn(`[ProxyManager] Check ${proxyUrl} failed: ${e.message}`);
            return { success: false, error: e.message || String(e) };
        }
    }
}
