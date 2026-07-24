"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
var fastify_1 = require("fastify");
var cors_1 = require("@fastify/cors");
var sensible_1 = require("@fastify/sensible");
var zod_1 = require("zod");
var env_js_1 = require("./config/env.js");
var auth_plugin_js_1 = require("./plugins/auth.plugin.js");
var database_plugin_js_1 = require("./plugins/database.plugin.js");
var app_error_js_1 = require("./shared/errors/app-error.js");
var auth_routes_js_1 = require("./modules/auth/auth.routes.js");
var health_routes_js_1 = require("./modules/health/health.routes.js");
var users_routes_js_1 = require("./modules/users/users.routes.js");
var categories_routes_js_1 = require("./modules/categories/categories.routes.js");
var products_routes_js_1 = require("./modules/products/products.routes.js");
var tables_routes_js_1 = require("./modules/tables/tables.routes.js");
var cash_routes_js_1 = require("./modules/cash/cash.routes.js");
var payments_routes_js_1 = require("./modules/payments/payments.routes.js");
function buildApp() {
    return __awaiter(this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = (0, fastify_1.default)({
                        logger: { level: env_js_1.env.LOG_LEVEL, redact: ["req.headers.authorization", "body.password", "body.refreshToken"] },
                        trustProxy: true
                    });
                    return [4 /*yield*/, app.register(sensible_1.default)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, app.register(cors_1.default, {
                            origin: env_js_1.env.CORS_ORIGIN.split(",").map(function (value) { return value.trim(); }),
                            credentials: true,
                            methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                            allowedHeaders: ["Content-Type", "Authorization"],
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, app.register(database_plugin_js_1.default)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, app.register(auth_plugin_js_1.default)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, app.register(health_routes_js_1.healthRoutes, { prefix: "/api/v1" })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, app.register(auth_routes_js_1.authRoutes, { prefix: "/api/v1/auth" })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, app.register(users_routes_js_1.usersRoutes, { prefix: "/api/v1/users" })];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, app.register(categories_routes_js_1.categoriesRoutes, { prefix: "/api/v1/categories" })];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, app.register(products_routes_js_1.productsRoutes, { prefix: "/api/v1/products" })];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, app.register(tables_routes_js_1.tablesRoutes, { prefix: "/api/v1/tables" })];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, app.register(cash_routes_js_1.cashRoutes, { prefix: "/api/v1/cash" })];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, app.register(payments_routes_js_1.paymentsRoutes, { prefix: "/api/v1/orders" })];
                case 12:
                    _a.sent();
                    app.setErrorHandler(function (error, request, reply) {
                        if (error instanceof zod_1.ZodError)
                            return reply.code(422).send({ error: { code: "VALIDATION_ERROR", message: "Dados inválidos.", details: error.flatten() } });
                        if (error instanceof app_error_js_1.AppError)
                            return reply.code(error.statusCode).send({ error: { code: error.code, message: error.message } });
                        request.log.error(error);
                        return reply.code(500).send({ error: { code: "INTERNAL_SERVER_ERROR", message: "Ocorreu um erro interno." } });
                    });
                    app.setNotFoundHandler(function (_req, reply) { return reply.code(404).send({ error: { code: "ROUTE_NOT_FOUND", message: "Rota não encontrada." } }); });
                    return [2 /*return*/, app];
            }
        });
    });
}
