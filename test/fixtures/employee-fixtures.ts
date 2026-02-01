/**
 * Employee Test Fixtures
 *
 * Reusable fixtures for employee endpoints (codes 067, 156, 172)
 */

import type { Employee, EmployeeOfficialData } from "../../src/models/employee.model";

/**
 * Employee list fixture
 */
export const employeeListFixture: Employee[] = [
  {
    id: "1",
    Hoten: "Nguyen Van A",
    Masobhxh: "1234567890",
    NgaySinh: "1990-01-15",
    GioiTinh: "1",
    DiaChi: "123 Nguyen Trai, Ha Noi",
    maPhongBan: "PB001",
    maTinhTrang: "1",
    NgayBatDau: "2020-01-01",
    chucVu: "Nhan vien",
    mucLuong: "10000000",
    soDienThoai: "0912345678",
    email: "nguyenvana@example.com",
    ghiChu: "Nhan vien chinh thuc",
  },
  {
    id: "2",
    Hoten: "Tran Thi B",
    Masobhxh: "0987654321",
    NgaySinh: "1995-05-20",
    GioiTinh: "0",
    DiaChi: "456 Tran Hung Dao, Ha Noi",
    maPhongBan: "PB002",
    maTinhTrang: "1",
    NgayBatDau: "2021-03-15",
    chucVu: "Ke toan",
    mucLuong: "12000000",
    soDienThoai: "0987654321",
    email: "tranthib@example.com",
    ghiChu: "Nhan vien chinh thuc",
  },
  {
    id: "3",
    Hoten: "Le Van C",
    Masobhxh: "1122334455",
    NgaySinh: "1988-08-10",
    GioiTinh: "1",
    DiaChi: "789 Ba Trieu, Ha Noi",
    maPhongBan: "PB003",
    maTinhTrang: "2",
    NgayBatDau: "2019-06-01",
    chucVu: "Truong phong",
    mucLuong: "15000000",
    soDienThoai: "0911223344",
    email: "levanc@example.com",
    ghiChu: "Nghi viec",
  },
];

/**
 * Single employee detail fixture
 */
export const employeeDetailFixture: Employee = {
  id: "1",
  Hoten: "Nguyen Van A",
  Masobhxh: "1234567890",
  NgaySinh: "1990-01-15",
  GioiTinh: "1",
  DiaChi: "123 Nguyen Trai, Ha Noi",
  maPhongBan: "PB001",
  maTinhTrang: "1",
  NgayBatDau: "2020-01-01",
  chucVu: "Nhan vien",
  mucLuong: "10000000",
  soDienThoai: "0912345678",
  email: "nguyenvana@example.com",
  ghiChu: "Nhan vien chinh thuc",
};

/**
 * Employee sync data fixture (official BHXH data)
 */
export const employeeSyncFixture: EmployeeOfficialData = {
  masoBhxh: "1234567890",
  trangThaiBaoHiem: "Dang bao hiem",
  hoten: "Nguyen Van A",
  NgaySinh: "1990-01-15",
  GioiTinh: "1",
  DiaChi: "123 Nguyen Trai, Ha Noi",
};

/**
 * Empty employee list fixture
 */
export const emptyEmployeeListFixture: Employee[] = [];

/**
 * Paginated employee list fixture (for pagination tests)
 */
export const paginatedEmployeeListFixture = {
  data: employeeListFixture.slice(0, 2),
  meta: {
    total: 3,
    count: 2,
    unit: "DV001",
  },
};

/**
 * Employee with minimal data (for edge cases)
 */
export const minimalEmployeeFixture: Employee = {
  id: "999",
  Hoten: "Test Minimal",
};
