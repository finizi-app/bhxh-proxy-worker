/**
 * Geographic data service for BHXH API
 * Handles province, ward, and medical facility lookups
 */
import { createAxios } from "./proxy.service";
import type { Session } from "../models/session.model";
import type { MedicalFacility, Province, Ward } from "../models/geographic.model";

/** BHXH base URL */
const BASE_URL = process.env.BHXH_BASE_URL || "https://dichvucong.baohiemxahoi.gov.vn";

/**
 * Get all provinces (Tinh/Thanh pho)
 * Direct call to /api/getDmtinhthanh with is_public header
 * @param session - Valid session
 * @returns Array of provinces
 */
export async function getProvinces(session: Session): Promise<Province[]> {
  const api = createAxios();

  const response = await api.post(
    `${BASE_URL}/api/getDmtinhthanh`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "is_public": "true",
      },
    }
  );

  return (response.data as Province[]) || [];
}

/**
 * Get wards by province and district
 * Direct call to /api/getDmphuongxa with is_public header
 * @param matinh - Province code (2-digit)
 * @param mahuyen - District code (optional, if empty returns all wards in province)
 * @param session - Valid session
 * @returns Array of wards
 */
export async function getWards(
  matinh: string,
  mahuyen: string | undefined,
  session: Session
): Promise<Ward[]> {
  const api = createAxios();

  const response = await api.post(
    `${BASE_URL}/api/getDmphuongxa`,
    { matinh, mahuyen: mahuyen || "" },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "is_public": "true",
      },
    }
  );

  return (response.data as Ward[]) || [];
}

/**
 * Get medical facilities by province (Cơ Sở Khám Chữa Bệnh - Code 063)
 * Uses /GetValues endpoint with X-CLIENT header
 * @param maTinh - Province code (2-digit). If undefined, fetches all facilities.
 * @param session - Valid session
 * @returns Array of medical facilities
 */
export async function getMedicalFacilities(
  maTinh: string | undefined,
  session: Session
): Promise<MedicalFacility[]> {
  const api = createAxios();

  const response = await api.post(
    `${BASE_URL}/GetValues`,
    {
      code: "063",
      data: { maTinh: maTinh || "" },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        "X-CLIENT": session.xClient,
      },
    }
  );

  return (response.data as MedicalFacility[]) || [];
}

/**
 * @deprecated Use getMedicalFacilities instead - Code 063 returns medical facilities, not districts
 * Get districts by province (Code 063)
 * This function is kept for backward compatibility but returns medical facilities
 */
export async function getDistricts(
  maTinh: string | undefined,
  session: Session
): Promise<MedicalFacility[]> {
  return getMedicalFacilities(maTinh, session);
}

export default {
  getProvinces,
  getWards,
  getMedicalFacilities,
  getDistricts,
};
