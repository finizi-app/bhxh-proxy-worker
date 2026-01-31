/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SessionController } from './../controllers/session.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MasterDataController } from './../controllers/master-data.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { HealthController } from './../controllers/health.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GeographicController } from './../controllers/geographic.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { EmployeesController } from './../controllers/employees.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DepartmentController } from './../controllers/department.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DeclarationsController } from './../controllers/declarations.controller';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "SessionStatusResponse": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"string","required":true},
            "expiresIn": {"dataType":"double","required":true},
            "unit": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SessionRefreshResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "unit": {"dataType":"string","required":true},
            "expiresIn": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RefreshRequestBody": {
        "dataType": "refObject",
        "properties": {
            "force": {"dataType":"boolean"},
            "username": {"dataType":"string"},
            "password": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaperType": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "ma": {"dataType":"string","required":true},
            "ten": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MasterDataResponse_PaperType_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"PaperType"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Country": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "ma": {"dataType":"string","required":true},
            "ten": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MasterDataResponse_Country_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"Country"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Ethnicity": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "ma": {"dataType":"string","required":true},
            "ten": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MasterDataResponse_Ethnicity_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"Ethnicity"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LaborPlanType": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "ma": {"dataType":"string","required":true},
            "ten": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MasterDataResponse_LaborPlanType_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"LaborPlanType"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Benefit": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "ma_chedo": {"dataType":"string","required":true},
            "ten_nhomhuong": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MasterDataResponse_Benefit_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"Benefit"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Relationship": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "ma": {"dataType":"string","required":true},
            "ten": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MasterDataResponse_Relationship_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"Relationship"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HealthResponse": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"string","required":true},
            "service": {"dataType":"string","required":true},
            "timestamp": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HealthError": {
        "dataType": "refObject",
        "properties": {
            "error": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "District": {
        "dataType": "refObject",
        "properties": {
            "ma": {"dataType":"string","required":true},
            "ten": {"dataType":"string","required":true},
            "cap": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GeographicListResponse_District_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"District"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Employee": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"}]},
            "Hoten": {"dataType":"string"},
            "Masobhxh": {"dataType":"string"},
            "NgaySinh": {"dataType":"string"},
            "GioiTinh": {"dataType":"string"},
            "DiaChi": {"dataType":"string"},
            "maPhongBan": {"dataType":"string"},
            "maTinhTrang": {"dataType":"string"},
            "NgayBatDau": {"dataType":"string"},
            "chucVu": {"dataType":"string"},
            "mucLuong": {"dataType":"string"},
            "soDienThoai": {"dataType":"string"},
            "email": {"dataType":"string"},
            "ghiChu": {"dataType":"string"},
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmployeeListResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "timing": {"dataType":"nestedObjectLiteral","nestedProperties":{"totalMs":{"dataType":"double","required":true},"fetchMs":{"dataType":"double","required":true},"sessionMs":{"dataType":"double","required":true}},"required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"Employee"},"required":true},
            "meta": {"dataType":"nestedObjectLiteral","nestedProperties":{"unit":{"dataType":"string","required":true},"count":{"dataType":"double","required":true},"total":{"dataType":"double","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmployeeDetailResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"Employee"},
            "message": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmployeeFamilyMember": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double"},
            "Nldid": {"dataType":"double"},
            "Hoten": {"dataType":"string"},
            "Masobhxh": {"dataType":"string"},
            "Ngaysinh": {"dataType":"string"},
            "Gioitinh": {"dataType":"string"},
            "maTinhKS": {"dataType":"string"},
            "maHuyenKS": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "maXaKS": {"dataType":"string"},
            "noiCapKS": {"dataType":"string"},
            "Tentinh": {"dataType":"string"},
            "Tenhuyen": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "Tenxa": {"dataType":"string"},
            "moiQuanHeChuHo": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "soCMND": {"dataType":"string"},
            "ghiChu": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "Ccns": {"dataType":"string"},
            "nguoiThamGia": {"dataType":"boolean"},
            "tenMoiQuanHe": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "NgaysinhPicker": {"dataType":"string"},
            "quocTich": {"dataType":"string"},
            "danToc": {"dataType":"string"},
            "diaChi_ks": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FullEmployeeDetails": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "Hoten": {"dataType":"string"},
            "Masobhxh": {"dataType":"string"},
            "soHopDong": {"dataType":"string"},
            "loaiHopDong": {"dataType":"string"},
            "ngayHieuLuc": {"dataType":"string"},
            "ngayKy": {"dataType":"string"},
            "heSoLuong": {"dataType":"double"},
            "mucLuong": {"dataType":"string"},
            "phuCapCV": {"dataType":"string"},
            "phuCapTNNghe": {"dataType":"string"},
            "phuCapTNVK": {"dataType":"string"},
            "listThanhVien": {"dataType":"array","array":{"dataType":"refObject","ref":"EmployeeFamilyMember"}},
            "lichSu": {"dataType":"array","array":{"dataType":"any"}},
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FullEmployeeDetailsResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"FullEmployeeDetails"}},
            "message": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmployeeBulkUploadResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "processed": {"dataType":"double"},
            "errors": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"message":{"dataType":"string","required":true},"row":{"dataType":"double","required":true}}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmployeeUpdateResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"ref":"Employee"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmployeeUpdateRequest": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "soHopDong": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "loaiHopDong": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "ngayHieuLuc": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "ngayKy": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "heSoLuong": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},
            "mucLuong": {"dataType":"string"},
            "phuCapCV": {"dataType":"string"},
            "phuCapTNNghe": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "phuCapTNVK": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "phuCapLuong": {"dataType":"string"},
            "phuCapBoSung": {"dataType":"string"},
            "phuCapKhac": {"dataType":"string"},
            "noiDKKCB": {"dataType":"string"},
            "Matinhbenhvien": {"dataType":"string"},
            "Mabenhvien": {"dataType":"string"},
            "ghiChu": {"dataType":"string"},
            "listThanhVien": {"dataType":"array","array":{"dataType":"refObject","ref":"EmployeeFamilyMember"}},
            "hoTenChuHo": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "maSo_HoGiaDinh": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "dienThoaiChuHo": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "diaChi_HK": {"dataType":"string"},
            "tinh_hokhau": {"dataType":"string"},
            "huyen_hokhau": {"dataType":"string"},
            "xa_hokhau": {"dataType":"string"},
            "loaiGiayTo": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "soGiayTo": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "diaChiGiaDinh": {"dataType":"string"},
            "maTinhGiaDinh": {"dataType":"string"},
            "maHuyenGiaDinh": {"dataType":"string"},
            "maXaGiaDinh": {"dataType":"string"},
            "Tentinh": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "Tenhuyen": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "Tenxa": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "diaChi_HK_full": {"dataType":"string"},
            "diaChi_ks": {"dataType":"string"},
            "Hoten": {"dataType":"string"},
            "tinhTrang": {"dataType":"string"},
            "Ngaysinh": {"dataType":"string"},
            "email": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "maSoThue": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "maPhongBan": {"dataType":"string"},
            "Masobhxh": {"dataType":"string"},
            "maNLD": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "quocTich": {"dataType":"string"},
            "Gioitinh": {"dataType":"string"},
            "soDienThoai": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "danToc": {"dataType":"string"},
            "taiKhoan": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "chucVu": {"dataType":"string"},
            "maSoBHYT": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "nganHang": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "Manganhang": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "Matinhnganhang": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "soCMND": {"dataType":"string"},
            "noiCapCMND": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "ngayCapCMND": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "noiCapKS": {"dataType":"string"},
            "maTinhKS": {"dataType":"string"},
            "maHuyenKS": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "maXaKS": {"dataType":"string"},
            "nghiViec": {"dataType":"boolean"},
            "diaChiNN": {"dataType":"string"},
            "maTinhNN": {"dataType":"string"},
            "maHuyenNN": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "maXaNN": {"dataType":"string"},
            "dcCuTheNN": {"dataType":"string"},
            "Ccns": {"dataType":"string"},
            "maHoGiaDinh": {"dataType":"string"},
            "maVungSS": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "NgaysinhPicker": {"dataType":"string"},
            "diaChiCuThe_dangSS": {"dataType":"string"},
            "maTinh_dangSS": {"dataType":"string"},
            "maHuyen_dangSS": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "maXa_dangSS": {"dataType":"string"},
            "diaChi_dangSS": {"dataType":"string"},
            "noiLamViec": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "masobhxhuser": {"dataType":"string"},
            "macoquanuser": {"dataType":"string"},
            "loaidoituonguser": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmployeeOfficialData": {
        "dataType": "refObject",
        "properties": {
            "masoBhxh": {"dataType":"string"},
            "trangThaiBaoHiem": {"dataType":"string"},
            "quyTrinhThamGia": {"dataType":"any"},
            "hoten": {"dataType":"string"},
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmployeeSyncResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"EmployeeOfficialData"},
            "message": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Department": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "ma": {"dataType":"string","required":true},
            "ten": {"dataType":"string","required":true},
            "maDonVi": {"dataType":"string"},
            "ghiChu": {"dataType":"string"},
            "ngayTao": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_Department_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"ref":"Department","required":true},
            "error": {"dataType":"string"},
            "message": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DepartmentCreateRequest": {
        "dataType": "refObject",
        "properties": {
            "ma": {"dataType":"string","required":true},
            "ten": {"dataType":"string","required":true},
            "ghiChu": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginatedResponse_Department_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"Department"},"required":true},
            "meta": {"dataType":"nestedObjectLiteral","nestedProperties":{"count":{"dataType":"double","required":true},"total":{"dataType":"double","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_Department-or-null_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"union","subSchemas":[{"ref":"Department"},{"dataType":"enum","enums":[null]}],"required":true},
            "error": {"dataType":"string"},
            "message": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DepartmentUpdateRequest": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double","required":true},
            "ma": {"dataType":"string","required":true},
            "ten": {"dataType":"string","required":true},
            "ghiChu": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Code600SubmitResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "thuTucId": {"dataType":"double"},
            "data": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Code600ThuTuc": {
        "dataType": "refObject",
        "properties": {
            "thuTucId": {"dataType":"double"},
            "Trangthai": {"dataType":"double"},
            "maThuTuc": {"dataType":"enum","enums":["600"],"required":true},
            "kyKeKhai": {"dataType":"string","required":true},
            "dot": {"dataType":"string"},
            "maCoQuan": {"dataType":"string","required":true},
            "maDonVi": {"dataType":"string"},
            "tenThuTuc": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Code600ToKhai": {
        "dataType": "refObject",
        "properties": {
            "maToKhai": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["D02-TS"]},{"dataType":"enum","enums":["TK1-TS"]},{"dataType":"enum","enums":["D01-TS"]}],"required":true},
            "tenToKhai": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "D02MethodCode": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["TM"]},{"dataType":"enum","enums":["DC"]},{"dataType":"enum","enums":["TT"]},{"dataType":"enum","enums":["AD"]},{"dataType":"enum","enums":["GH"]},{"dataType":"enum","enums":["KL"]},{"dataType":"enum","enums":["OF"]},{"dataType":"enum","enums":["TS"]},{"dataType":"enum","enums":["NC"]},{"dataType":"enum","enums":["TBHYT"]},{"dataType":"enum","enums":["TBHTN"]},{"dataType":"enum","enums":["TNLD"]},{"dataType":"enum","enums":["BNN"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "D02StatusCode": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["01"]},{"dataType":"enum","enums":["02"]},{"dataType":"enum","enums":["03"]},{"dataType":"enum","enums":["04"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "D02TSNguoiLaoDong": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"double"},
            "Nldid": {"dataType":"double"},
            "Manld": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "pa": {"ref":"D02MethodCode","required":true},
            "Tinhtrang": {"ref":"D02StatusCode","required":true},
            "Hoten": {"dataType":"string","required":true},
            "Masobhxh": {"dataType":"string","required":true},
            "chucVu": {"dataType":"string","required":true},
            "tienLuong": {"dataType":"string","required":true},
            "phuCapCV": {"dataType":"string","required":true},
            "phuCapTNVK": {"dataType":"string","required":true},
            "phuCapTNNghe": {"dataType":"string","required":true},
            "phuCapLuong": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "phuCapBoSung": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "tyLeDong": {"dataType":"string","required":true},
            "tuThang": {"dataType":"string","required":true},
            "denThang": {"dataType":"string","required":true},
            "tinhLai": {"dataType":"double","required":true},
            "daCoSo": {"dataType":"double","required":true},
            "mucHuong": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "Maphongban": {"dataType":"string","required":true},
            "maVungSS": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "maVungLTT": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "stt": {"dataType":"double"},
            "loai": {"dataType":"double"},
            "ghiChu": {"dataType":"string"},
            "Refid": {"dataType":"double"},
            "thuTucId": {"dataType":"double"},
            "soToBiaSoBhxh": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "soToRoiSoBhxh": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "soTheBHYT": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "Gioitinh": {"dataType":"string","required":true},
            "Cogiamchet": {"dataType":"double"},
            "Ngaychet": {"dataType":"string"},
            "noiLamViec": {"dataType":"string"},
            "VtvlKhacTungay": {"dataType":"string"},
            "VtvlKhacDenngay": {"dataType":"string"},
            "VtvlNqlTungay": {"dataType":"string"},
            "VtvlNqlDenngay": {"dataType":"string"},
            "VtvlCmktbcTungay": {"dataType":"string"},
            "VtvlCmktbcDenngay": {"dataType":"string"},
            "VtvlCmktbtTungay": {"dataType":"string"},
            "VtvlCmktbtDenngay": {"dataType":"string"},
            "NndhTungay": {"dataType":"string"},
            "NndhDenngay": {"dataType":"string"},
            "HdldTungay": {"dataType":"string"},
            "HdldXdthTungay": {"dataType":"string"},
            "HdldXdthDenngay": {"dataType":"string"},
            "HdldKhacTungay": {"dataType":"string"},
            "HdldKhacDenngay": {"dataType":"string"},
            "Ngaysinh": {"dataType":"string"},
            "Cmnd": {"dataType":"string"},
            "Tenphuongan": {"dataType":"string"},
            "Tenphongban": {"dataType":"string"},
            "Tenloai": {"dataType":"string"},
            "Tenvungltt": {"dataType":"string"},
            "editable": {"dataType":"boolean"},
            "Stt": {"dataType":"double"},
            "maNLD": {"dataType":"string"},
            "tinhTrang": {"dataType":"string"},
            "VtvlActive": {"dataType":"double"},
            "HdldActive": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Code600D02FormSection": {
        "dataType": "refObject",
        "properties": {
            "nguoiLaoDong": {"dataType":"array","array":{"dataType":"refObject","ref":"D02TSNguoiLaoDong"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Code600FormSection": {
        "dataType": "refObject",
        "properties": {
            "nguoiLaoDong": {"dataType":"array","array":{"dataType":"any"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_string.unknown_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Code600TK1Employee": {
        "dataType": "refObject",
        "properties": {
            "Stt": {"dataType":"double"},
            "nhan_Bangiay": {"dataType":"double"},
            "nhan_BanDientu": {"dataType":"double"},
            "Hoten": {"dataType":"string","required":true},
            "Ngaysinh": {"dataType":"string"},
            "Gioitinh": {"dataType":"string"},
            "Tengioitinh": {"dataType":"string"},
            "quocTich": {"dataType":"string"},
            "Tenquoctich": {"dataType":"string"},
            "danToc": {"dataType":"string"},
            "Tendantoc": {"dataType":"string"},
            "Diachiks": {"dataType":"string"},
            "maXa_KS": {"dataType":"string"},
            "maTinh_KS": {"dataType":"string"},
            "diaChi_NN": {"dataType":"string"},
            "Diachinnhs": {"dataType":"string"},
            "maXa_NN": {"dataType":"string"},
            "maHuyen_NN": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "maTinh_NN": {"dataType":"string"},
            "Masobhxh": {"dataType":"string"},
            "dienThoai_LH": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "cmnd": {"dataType":"string"},
            "ThTreEmDuoi6": {"dataType":"boolean"},
            "ten_ChaMe_GiamHo": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "maHo_GiaDinh": {"dataType":"string"},
            "Muctien": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "Phuongthuc": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "Noidkkcb": {"dataType":"string"},
            "Matinhbenhvien": {"dataType":"string"},
            "Tentinhbenhvien": {"dataType":"string"},
            "Mabenhvien": {"dataType":"string"},
            "noiDung_ThayDoi": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "hoSoKemTheo": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "dangKyNhanTai": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "Ccns": {"dataType":"string"},
            "Nldid": {"dataType":"double"},
            "id": {"dataType":"double"},
            "thongTinHoGiaDinh": {"ref":"Record_string.unknown_"},
            "Refid": {"dataType":"double"},
            "email_LH": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "diaChi_ks2": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "nhan_Bangiay_chk": {"dataType":"boolean"},
            "nhan_BanDientu_chk": {"dataType":"boolean"},
            "Tinh_NhanBangiay": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "Huyen_NhanBangiay": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "Xa_NhanBangiay": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "DiaChiNhanBangiay": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "editable": {"dataType":"boolean"},
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Code600TK1FormSection": {
        "dataType": "refObject",
        "properties": {
            "nguoiLaoDong": {"dataType":"array","array":{"dataType":"refObject","ref":"Code600TK1Employee"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Code600D01FormSection": {
        "dataType": "refObject",
        "properties": {
            "nguoiLaoDong": {"dataType":"array","array":{"dataType":"any"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Code600SubmitRequest": {
        "dataType": "refObject",
        "properties": {
            "thuTucId": {"dataType":"double"},
            "nguoiLaoDong": {"dataType":"enum","enums":[null]},
            "thuTuc": {"ref":"Code600ThuTuc","required":true},
            "listToKhai": {"dataType":"array","array":{"dataType":"refObject","ref":"Code600ToKhai"}},
            "refIdForm": {"dataType":"array","array":{"dataType":"any"}},
            "scanFile": {"dataType":"nestedObjectLiteral","nestedProperties":{"otherFile":{"dataType":"array","array":{"dataType":"any"},"required":true},"listFile":{"dataType":"array","array":{"dataType":"any"},"required":true}}},
            "D02-TS": {"dataType":"union","subSchemas":[{"ref":"Code600D02FormSection"},{"ref":"Code600FormSection"}]},
            "TK1-TS": {"dataType":"union","subSchemas":[{"ref":"Code600TK1FormSection"},{"ref":"Code600FormSection"}]},
            "D01-TS": {"dataType":"union","subSchemas":[{"ref":"Code600D01FormSection"},{"ref":"Code600FormSection"}]},
            "masobhxhuser": {"dataType":"string"},
            "macoquanuser": {"dataType":"string"},
            "loaidoituonguser": {"dataType":"string"},
            "username": {"dataType":"string"},
            "password": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsSessionController_getSessionStatus: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/v1/session/status',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.getSessionStatus)),

            async function SessionController_getSessionStatus(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionController_getSessionStatus, request, response });

                const controller = new SessionController();

              await templateService.apiHandler({
                methodName: 'getSessionStatus',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSessionController_refresh: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","ref":"RefreshRequestBody"},
        };
        app.post('/api/v1/session/refresh',
            ...(fetchMiddlewares<RequestHandler>(SessionController)),
            ...(fetchMiddlewares<RequestHandler>(SessionController.prototype.refresh)),

            async function SessionController_refresh(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSessionController_refresh, request, response });

                const controller = new SessionController();

              await templateService.apiHandler({
                methodName: 'refresh',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMasterDataController_getPaperTypes: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/v1/master-data/paper-types',
            ...(fetchMiddlewares<RequestHandler>(MasterDataController)),
            ...(fetchMiddlewares<RequestHandler>(MasterDataController.prototype.getPaperTypes)),

            async function MasterDataController_getPaperTypes(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMasterDataController_getPaperTypes, request, response });

                const controller = new MasterDataController();

              await templateService.apiHandler({
                methodName: 'getPaperTypes',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMasterDataController_getCountries: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/v1/master-data/countries',
            ...(fetchMiddlewares<RequestHandler>(MasterDataController)),
            ...(fetchMiddlewares<RequestHandler>(MasterDataController.prototype.getCountries)),

            async function MasterDataController_getCountries(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMasterDataController_getCountries, request, response });

                const controller = new MasterDataController();

              await templateService.apiHandler({
                methodName: 'getCountries',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMasterDataController_getEthnicities: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/v1/master-data/ethnicities',
            ...(fetchMiddlewares<RequestHandler>(MasterDataController)),
            ...(fetchMiddlewares<RequestHandler>(MasterDataController.prototype.getEthnicities)),

            async function MasterDataController_getEthnicities(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMasterDataController_getEthnicities, request, response });

                const controller = new MasterDataController();

              await templateService.apiHandler({
                methodName: 'getEthnicities',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMasterDataController_getLaborPlanTypes: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/v1/master-data/labor-plan-types',
            ...(fetchMiddlewares<RequestHandler>(MasterDataController)),
            ...(fetchMiddlewares<RequestHandler>(MasterDataController.prototype.getLaborPlanTypes)),

            async function MasterDataController_getLaborPlanTypes(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMasterDataController_getLaborPlanTypes, request, response });

                const controller = new MasterDataController();

              await templateService.apiHandler({
                methodName: 'getLaborPlanTypes',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMasterDataController_getBenefits: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/v1/master-data/benefits',
            ...(fetchMiddlewares<RequestHandler>(MasterDataController)),
            ...(fetchMiddlewares<RequestHandler>(MasterDataController.prototype.getBenefits)),

            async function MasterDataController_getBenefits(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMasterDataController_getBenefits, request, response });

                const controller = new MasterDataController();

              await templateService.apiHandler({
                methodName: 'getBenefits',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMasterDataController_getRelationships: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/v1/master-data/relationships',
            ...(fetchMiddlewares<RequestHandler>(MasterDataController)),
            ...(fetchMiddlewares<RequestHandler>(MasterDataController.prototype.getRelationships)),

            async function MasterDataController_getRelationships(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMasterDataController_getRelationships, request, response });

                const controller = new MasterDataController();

              await templateService.apiHandler({
                methodName: 'getRelationships',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsHealthController_getHealth: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/health',
            ...(fetchMiddlewares<RequestHandler>(HealthController)),
            ...(fetchMiddlewares<RequestHandler>(HealthController.prototype.getHealth)),

            async function HealthController_getHealth(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsHealthController_getHealth, request, response });

                const controller = new HealthController();

              await templateService.apiHandler({
                methodName: 'getHealth',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGeographicController_getDistricts: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                maTinh: {"in":"query","name":"maTinh","required":true,"dataType":"string"},
        };
        app.get('/api/v1/geographic/districts',
            ...(fetchMiddlewares<RequestHandler>(GeographicController)),
            ...(fetchMiddlewares<RequestHandler>(GeographicController.prototype.getDistricts)),

            async function GeographicController_getDistricts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGeographicController_getDistricts, request, response });

                const controller = new GeographicController();

              await templateService.apiHandler({
                methodName: 'getDistricts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEmployeesController_getEmployees: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                maNguoiLaoDong: {"in":"query","name":"maNguoiLaoDong","dataType":"string"},
                ten: {"in":"query","name":"ten","dataType":"string"},
                maPhongBan: {"in":"query","name":"maPhongBan","dataType":"string"},
                maTinhTrang: {"in":"query","name":"maTinhTrang","dataType":"string"},
                MaSoBhxh: {"in":"query","name":"MaSoBhxh","dataType":"string"},
                PageIndex: {"in":"query","name":"PageIndex","dataType":"double"},
                PageSize: {"in":"query","name":"PageSize","dataType":"double"},
        };
        app.get('/api/v1/employees',
            ...(fetchMiddlewares<RequestHandler>(EmployeesController)),
            ...(fetchMiddlewares<RequestHandler>(EmployeesController.prototype.getEmployees)),

            async function EmployeesController_getEmployees(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmployeesController_getEmployees, request, response });

                const controller = new EmployeesController();

              await templateService.apiHandler({
                methodName: 'getEmployees',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEmployeesController_getEmployeeById: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                employeeId: {"in":"path","name":"employeeId","required":true,"dataType":"string"},
        };
        app.get('/api/v1/employees/:employeeId',
            ...(fetchMiddlewares<RequestHandler>(EmployeesController)),
            ...(fetchMiddlewares<RequestHandler>(EmployeesController.prototype.getEmployeeById)),

            async function EmployeesController_getEmployeeById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmployeesController_getEmployeeById, request, response });

                const controller = new EmployeesController();

              await templateService.apiHandler({
                methodName: 'getEmployeeById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEmployeesController_getFullEmployeeDetails: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"listNldid":{"dataType":"array","array":{"dataType":"double"},"required":true}}},
        };
        app.post('/api/v1/employees/details',
            ...(fetchMiddlewares<RequestHandler>(EmployeesController)),
            ...(fetchMiddlewares<RequestHandler>(EmployeesController.prototype.getFullEmployeeDetails)),

            async function EmployeesController_getFullEmployeeDetails(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmployeesController_getFullEmployeeDetails, request, response });

                const controller = new EmployeesController();

              await templateService.apiHandler({
                methodName: 'getFullEmployeeDetails',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEmployeesController_uploadEmployees: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/api/v1/employees/upload',
            ...(fetchMiddlewares<RequestHandler>(EmployeesController)),
            ...(fetchMiddlewares<RequestHandler>(EmployeesController.prototype.uploadEmployees)),

            async function EmployeesController_uploadEmployees(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmployeesController_uploadEmployees, request, response });

                const controller = new EmployeesController();

              await templateService.apiHandler({
                methodName: 'uploadEmployees',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEmployeesController_updateEmployee: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                employeeId: {"in":"path","name":"employeeId","required":true,"dataType":"string"},
                request: {"in":"body","name":"request","required":true,"ref":"EmployeeUpdateRequest"},
        };
        app.put('/api/v1/employees/:employeeId',
            ...(fetchMiddlewares<RequestHandler>(EmployeesController)),
            ...(fetchMiddlewares<RequestHandler>(EmployeesController.prototype.updateEmployee)),

            async function EmployeesController_updateEmployee(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmployeesController_updateEmployee, request, response });

                const controller = new EmployeesController();

              await templateService.apiHandler({
                methodName: 'updateEmployee',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsEmployeesController_syncEmployeeById: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                employeeId: {"in":"path","name":"employeeId","required":true,"dataType":"string"},
                masoBhxh: {"in":"query","name":"masoBhxh","required":true,"dataType":"string"},
                maCqbh: {"in":"query","name":"maCqbh","required":true,"dataType":"string"},
        };
        app.get('/api/v1/employees/:employeeId/sync',
            ...(fetchMiddlewares<RequestHandler>(EmployeesController)),
            ...(fetchMiddlewares<RequestHandler>(EmployeesController.prototype.syncEmployeeById)),

            async function EmployeesController_syncEmployeeById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsEmployeesController_syncEmployeeById, request, response });

                const controller = new EmployeesController();

              await templateService.apiHandler({
                methodName: 'syncEmployeeById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDepartmentController_createDepartment: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                request: {"in":"body","name":"request","required":true,"ref":"DepartmentCreateRequest"},
        };
        app.post('/api/v1/departments',
            ...(fetchMiddlewares<RequestHandler>(DepartmentController)),
            ...(fetchMiddlewares<RequestHandler>(DepartmentController.prototype.createDepartment)),

            async function DepartmentController_createDepartment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDepartmentController_createDepartment, request, response });

                const controller = new DepartmentController();

              await templateService.apiHandler({
                methodName: 'createDepartment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDepartmentController_listDepartments: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                ma: {"in":"query","name":"ma","dataType":"string"},
                ten: {"in":"query","name":"ten","dataType":"string"},
                PageIndex: {"in":"query","name":"PageIndex","dataType":"double"},
                PageSize: {"in":"query","name":"PageSize","dataType":"double"},
        };
        app.get('/api/v1/departments',
            ...(fetchMiddlewares<RequestHandler>(DepartmentController)),
            ...(fetchMiddlewares<RequestHandler>(DepartmentController.prototype.listDepartments)),

            async function DepartmentController_listDepartments(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDepartmentController_listDepartments, request, response });

                const controller = new DepartmentController();

              await templateService.apiHandler({
                methodName: 'listDepartments',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDepartmentController_getDepartmentById: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.get('/api/v1/departments/:id',
            ...(fetchMiddlewares<RequestHandler>(DepartmentController)),
            ...(fetchMiddlewares<RequestHandler>(DepartmentController.prototype.getDepartmentById)),

            async function DepartmentController_getDepartmentById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDepartmentController_getDepartmentById, request, response });

                const controller = new DepartmentController();

              await templateService.apiHandler({
                methodName: 'getDepartmentById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDepartmentController_updateDepartment: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
                request: {"in":"body","name":"request","required":true,"ref":"DepartmentUpdateRequest"},
        };
        app.put('/api/v1/departments/:id',
            ...(fetchMiddlewares<RequestHandler>(DepartmentController)),
            ...(fetchMiddlewares<RequestHandler>(DepartmentController.prototype.updateDepartment)),

            async function DepartmentController_updateDepartment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDepartmentController_updateDepartment, request, response });

                const controller = new DepartmentController();

              await templateService.apiHandler({
                methodName: 'updateDepartment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDepartmentController_deleteDepartment: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"double"},
        };
        app.delete('/api/v1/departments/:id',
            ...(fetchMiddlewares<RequestHandler>(DepartmentController)),
            ...(fetchMiddlewares<RequestHandler>(DepartmentController.prototype.deleteDepartment)),

            async function DepartmentController_deleteDepartment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDepartmentController_deleteDepartment, request, response });

                const controller = new DepartmentController();

              await templateService.apiHandler({
                methodName: 'deleteDepartment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDeclarationsController_submitDeclaration: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                submitRequest: {"in":"body","name":"submitRequest","required":true,"ref":"Code600SubmitRequest"},
        };
        app.post('/api/v1/declarations/submit',
            ...(fetchMiddlewares<RequestHandler>(DeclarationsController)),
            ...(fetchMiddlewares<RequestHandler>(DeclarationsController.prototype.submitDeclaration)),

            async function DeclarationsController_submitDeclaration(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDeclarationsController_submitDeclaration, request, response });

                const controller = new DeclarationsController();

              await templateService.apiHandler({
                methodName: 'submitDeclaration',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
