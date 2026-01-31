/**
 * Geographic data service for BHXH API
 * Handles province, district, ward lookups
 */
import { createAxios } from "./proxy.service";
import type { Session } from "../models/session.model";
import type { District } from "../models/geographic.model";

/** BHXH base URL */
const BASE_URL = process.env.BHXH_BASE_URL || "https://dichvucong.baohiemxahoi.gov.vn";

/**
 * Get districts by province (Code 063)
 * @param maTinh - Province code (2-digit)
 * @param session - Valid session
 * @returns Array of districts
 */
export async function getDistricts(
  maTinh: string,
  session: Session
): Promise<District[]> {
  const api = createAxios();

  const response = await api.post(
    `${BASE_URL}/CallApiWithCurrentUser`,
    {
      code: "063",
      data: JSON.stringify({ maTinh }),
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "X-CLIENT": session.xClient,
      },
    }
  );

  return (response.data as District[]) || [];
}

export default {
  getDistricts,
};
