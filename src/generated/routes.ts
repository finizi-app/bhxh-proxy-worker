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
import { EmployeesController } from './../controllers/employees.controller';
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
    "Employee": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string"},
            "Hoten": {"dataType":"string"},
            "Masobhxh": {"dataType":"string"},
            "NgaySinh": {"dataType":"string"},
            "GioiTinh": {"dataType":"string"},
            "DiaChi": {"dataType":"string"},
            "maPhongBan": {"dataType":"string"},
            "maTinhTrang": {"dataType":"string"},
            "NgayBatDau": {"dataType":"string"},
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
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsSessionController_getSessionStatus: Record<string, TsoaRoute.ParameterSchema> = {
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
        const argsEmployeesController_getEmployees: Record<string, TsoaRoute.ParameterSchema> = {
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

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
