
import { performLogin } from '../src/services/session.service';
import dotenv from 'dotenv';

import fs from 'fs';

// Ensure env vars are loaded from .dev.vars if available, or fall back to .env
if (fs.existsSync(".dev.vars")) {
    dotenv.config({ path: ".dev.vars" });
} else {
    dotenv.config();
}

async function verify() {
    console.log("----------------------------------------");
    console.log("🔐 Verifying BHXH Credentials");
    console.log("   Username:", process.env.BHXH_USERNAME);
    console.log("   Password:", process.env.BHXH_PASSWORD ? "******" : "(missing)");
    console.log("----------------------------------------");

    try {
        const session = await performLogin();
        console.log("\n✅ SUCCESS: Login achieved.");
        console.log("----------------------------------------");
        console.log("Token:", session.token.substring(0, 15) + "...");
        console.log("Unit :", session.currentDonVi.Ten);
        console.log("Code :", session.currentDonVi.MaDonVi);
        console.log("----------------------------------------");
    } catch (error) {
        console.error("\n❌ FAILURE: Login failed.");
        console.error("Error:", error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

verify();
