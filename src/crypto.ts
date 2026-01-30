/**
 * BHXH API Encryption Utilities
 * Ports the AES encryption logic from headless_login_script.js
 */
import CryptoJS from "crypto-js";

/**
 * Encrypt the client ID for X-CLIENT header
 * Uses AES encryption and replaces '+' with 'teca' for URL safety
 */
export function encryptXClient(clientId: string, encryptionKey: string): string {
    const payload = JSON.stringify(clientId);
    const encrypted = CryptoJS.AES.encrypt(payload, encryptionKey).toString();
    return encrypted.replace(/\+/g, "teca");
}
