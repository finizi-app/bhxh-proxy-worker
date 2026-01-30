const axios = require('axios');
const { login, BASE_URL } = require('./headless_login_script');

async function main() {
    try {
        console.log("--- STARTING EMPLOYEE FETCH SCRIPT (Code 067 Only) ---");

        // 1. Perform Login
        const session = await login();
        if (!session) {
            console.error("Login failed or returned no session.");
            process.exit(1);
        }

        const { token, xClient, currentDonVi } = session;
        console.log("\n--- SESSION ESTABLISHED ---");
        console.log("Token:", token.substring(0, 15) + "...");
        console.log("Unit:", currentDonVi.Ten);

        // --- HELPER: Call API ---
        const callApi = async (code, dataObj) => {
            try {
                return await axios.post(`${BASE_URL}/CallApiWithCurrentUser`, {
                    code: code,
                    data: JSON.stringify(dataObj)
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-CLIENT': xClient
                    }
                });
            } catch (e) {
                console.error(`   [API ${code} Error]`, e.message);
                if (e.response) console.error("   Response:", e.response.data);
                return null;
            }
        };

        // --- FETCH EMPLOYEE LIST (Code 067) ---
        console.log("\n2. Fetching Employee List (Code 067)...");

        const employeePayload = {
            maNguoiLaoDong: "",
            ten: "",
            maPhongBan: "",
            maTinhTrang: "",
            MaSoBhxh: "",
            maDonVi: currentDonVi.Ma, // REQUIRED
            maCoquan: currentDonVi.MaCoquan, // REQUIRED
            PageIndex: 1, // PascalCase
            PageSize: 100, // PascalCase
            masobhxhuser: currentDonVi.Ma,
            macoquanuser: currentDonVi.MaCoquan,
            loaidoituonguser: currentDonVi.LoaiDoiTuong || "1"
        };

        const res = await callApi("067", employeePayload);

        if (res && res.data) {
            // Direct object response for 067 as discovered
            const d = res.data;
            const list = d.dsLaoDong || [];
            const count = d.TotalRecords || list.length || 0;

            console.log(`   Total Employees: ${count}`);

            if (count > 0 && list.length > 0) {
                console.log(`   [!!! SUCCESS !!!] Found ${list.length} employees.`);

                console.log("\n   --- Employee Summary ---");
                list.forEach((emp, idx) => {
                    console.log(`   ${idx + 1}. ${emp.Hoten} (BHXH: ${emp.Masobhxh})`);
                    console.log(`      Position: ${emp.chucVu} | Salary: ${emp.mucLuong?.toLocaleString()} | Status: ${emp.tinhTrang}`);
                });
            } else {
                console.log("   No employees found.");
            }
        } else {
            console.log("   Failed to fetch employee list.");
        }

    } catch (e) {
        console.error("Fatal Error:", e.message);
    }
}

main();
