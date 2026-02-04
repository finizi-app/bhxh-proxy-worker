# Migration Guide: BHXH Proxy Worker

This folder contains the **verified Proof of Concept** scripts and documentation for the BHXH API. Use this to initialize your new Cloudflare Worker repository.

## 1. Create New Repository (Terminal)

```bash
# 1. Create directory
mkdir bhxh-proxy-worker
cd bhxh-proxy-worker

# 2. Initialize Worker (Interactive)
npm create cloudflare@latest .
# > Type: "Hello World" Worker
# > TypeScript: Yes
# > Deploy: No

# 3. Install Utilities
npm install crypto-js
npm install --save-dev @types/crypto-js
```

## 2. Porting Logic

You will need to port the logic from [fetch_employees.js] to `src/index.ts`.

### Key Differences for Workers:
1.  **Networking**: Replace `axios` with native `fetch()`.
    *   *Old*: `axios.post(url, data, { headers })`
    *   *New*: `fetch(url, { method: "POST", body: JSON.stringify(data), headers })`
2.  **Encryption**: `crypto-js` works as-is. Just import it.
3.  **Environment**: Store credentials in `wrangler.toml` or Secrets, not hardcoded strings.

## 3. Files to Reference

| File | Purpose |
|------|---------|
| [api_reference.md] | **The Bible**. Contains all the endpoints, payloads, and response structures you need to implement. |
| [fetch_employees.js]| **Reference Implementation**. Contains the working logic flow (Login -> Token -> Fetch). |
| [headless_login_script.js] | Contains the AES handshake details. |

## 4. Architecture (Recap)

Implement the **Autonomous Login Flow**:
1.  **Check KV**: `await env.BHXH_SESSION.get("token")`
2.  **If Missing**:
    *   Fetch Captcha from BHXH.
    *   Send to AI Core.
    *   Login to BHXH.
    *   Save Token to KV (`put`).
3.  **Fetch Data**: Use valid token to call API (Code 067).
