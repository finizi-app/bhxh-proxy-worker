/**
 * Master Data Test Fixtures
 *
 * Reusable fixtures for master data endpoints (codes 071-073, 086, 098-099)
 * Simplified structures matching BHXH API response format
 */

import type {
  PaperType,
  Country,
  Ethnicity,
  LaborPlanType,
  Benefit,
  Relationship,
  MasterDataItem,
} from "../../src/models/master-data.model";

/**
 * Paper types fixture (Code 071)
 */
export const paperTypesFixture: PaperType[] = [
  { id: 1, ma: "01", ten: "Sổ hộ khẩu" },
  { id: 2, ma: "02", ten: "CCCD" },
  { id: 3, ma: "03", ten: "CMND" },
  { id: 4, ma: "04", ten: "Hộ chiếu" },
  { id: 5, ma: "05", ten: "Giấy khai sinh" },
];

/**
 * Countries fixture (Code 072)
 */
export const countriesFixture: Country[] = [
  { id: 1, ma: "VN", ten: "Việt Nam" },
  { id: 2, ma: "US", ten: "United States" },
  { id: 3, ma: "CN", ten: "China" },
  { id: 4, ma: "JP", ten: "Japan" },
  { id: 5, ma: "KR", ten: "South Korea" },
];

/**
 * Ethnicities fixture (Code 073)
 */
export const ethnicitiesFixture: Ethnicity[] = [
  { id: 1, ma: "01", ten: "Kinh" },
  { id: 2, ma: "02", ten: "Tày" },
  { id: 3, ma: "03", ten: "Thái" },
  { id: 4, ma: "04", ten: "Mường" },
  { id: 5, ma: "05", ten: "Khmer" },
  { id: 6, ma: "06", ten: "Hoa" },
  { id: 7, ma: "07", ten: "Nùng" },
  { id: 8, ma: "08", ten: "H'Mông" },
];

/**
 * Labor plan types fixture (Code 086)
 */
export const laborPlanTypesFixture: LaborPlanType[] = [
  { id: 1, ma: "01", ten: "Tăng quy mô lao động" },
  { id: 2, ma: "02", ten: "Giảm quy mô lao động" },
  { id: 3, ma: "03", ten: "Thay đổi vị trí công việc" },
  { id: 4, ma: "04", ten: "Thôi việc" },
  { id: 5, ma: "05", ten: "Nghỉ hưu" },
  { id: 6, ma: "06", ten: "Thai sản" },
  { id: 7, ma: "07", ten: "Điều chuyển" },
];

/**
 * Benefits fixture (Code 098)
 */
export const benefitsFixture: Benefit[] = [
  { id: 1, ma_chedo: "01", ten_nhomhuong: "Hưu hưởng tháng" },
  { id: 2, ma_chedo: "02", ten_nhomhuong: "Hưu hưởng một lần" },
  { id: 3, ma_chedo: "03", ten_nhomhuong: "Bảo hiểm y tế" },
  { id: 4, ma_chedo: "04", ten_nhomhuong: "Bảo hiểm thất nghiệp" },
  { id: 5, ma_chedo: "05", ten_nhomhuong: "Tai nạn lao động" },
  { id: 6, ma_chedo: "06", ten_nhomhuong: "Bệnh nghề nghiệp" },
];

/**
 * Relationships fixture (Code 099)
 */
export const relationshipsFixture: Relationship[] = [
  { id: 1, ma: "01", ten: "Vợ/chồng" },
  { id: 2, ma: "02", ten: "Con" },
  { id: 3, ma: "03", ten: "Cha" },
  { id: 4, ma: "04", ten: "Mẹ" },
  { id: 5, ma: "05", ten: "Anh" },
  { id: 6, ma: "06", ten: "Chị" },
  { id: 7, ma: "07", ten: "Em" },
  { id: 8, ma: "08", ten: "Ông" },
  { id: 9, ma: "09", ten: "Bà" },
];

/**
 * Empty master data fixture for no results case
 */
export const emptyMasterDataFixture: MasterDataItem[] = [];

/**
 * Get master data fixture by type
 */
export function getMasterDataFixture(
  type: "paper" | "country" | "ethnicity" | "laborPlan" | "benefit" | "relationship",
): (PaperType | Country | Ethnicity | LaborPlanType | Benefit | Relationship)[] {
  switch (type) {
    case "paper":
      return paperTypesFixture;
    case "country":
      return countriesFixture;
    case "ethnicity":
      return ethnicitiesFixture;
    case "laborPlan":
      return laborPlanTypesFixture;
    case "benefit":
      return benefitsFixture;
    case "relationship":
      return relationshipsFixture;
    default:
      return [];
  }
}
