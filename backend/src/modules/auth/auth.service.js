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
exports.login = login;
exports.refreshAccessToken = refreshAccessToken;
exports.revokeRefreshToken = revokeRefreshToken;
var node_crypto_1 = require("node:crypto");
var env_js_1 = require("../../config/env.js");
var app_error_js_1 = require("../../shared/errors/app-error.js");
var password_js_1 = require("../../shared/security/password.js");
var token_hash_js_1 = require("../../shared/security/token-hash.js");
function durationMs(value) {
    var _a;
    var match = /^(\d+)([smhd])$/.exec(value);
    if (!match)
        throw new Error("Dura\u00E7\u00E3o inv\u00E1lida: ".concat(value));
    var amount = Number(match[1]);
    return amount * ((_a = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]]) !== null && _a !== void 0 ? _a : 0);
}
function login(app, input) {
    return __awaiter(this, void 0, void 0, function () {
        var user, _a, available, store, accessToken, refreshToken;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, app.prisma.user.findFirst({
                        where: { email: input.email, status: "ACTIVE" },
                        include: { role: true, stores: { include: { store: true } } }
                    })];
                case 1:
                    user = _e.sent();
                    _a = !user;
                    if (_a) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, password_js_1.verifyPassword)(input.password, user.passwordHash)];
                case 2:
                    _a = !(_e.sent());
                    _e.label = 3;
                case 3:
                    if (_a) {
                        throw new app_error_js_1.AppError("E-mail ou senha inválidos.", 401, "INVALID_CREDENTIALS");
                    }
                    available = user.stores.filter(function (x) { return x.store.active; });
                    store = (_c = (_b = available.find(function (x) { return x.storeId === input.storeId; })) === null || _b === void 0 ? void 0 : _b.store) !== null && _c !== void 0 ? _c : (_d = available[0]) === null || _d === void 0 ? void 0 : _d.store;
                    if (!store)
                        throw new app_error_js_1.AppError("Usuário sem loja ativa vinculada.", 403, "NO_ACTIVE_STORE");
                    accessToken = app.jwt.sign({
                        sub: user.id, companyId: user.companyId, storeId: store.id, role: user.role.code, type: "access"
                    }, { expiresIn: env_js_1.env.JWT_ACCESS_EXPIRES_IN });
                    refreshToken = (0, node_crypto_1.randomUUID)() + (0, node_crypto_1.randomUUID)();
                    return [4 /*yield*/, app.prisma.refreshToken.create({
                            data: {
                                userId: user.id,
                                tokenHash: (0, token_hash_js_1.hashToken)(refreshToken),
                                expiresAt: new Date(Date.now() + durationMs(env_js_1.env.JWT_REFRESH_EXPIRES_IN))
                            }
                        })];
                case 4:
                    _e.sent();
                    return [4 /*yield*/, app.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })];
                case 5:
                    _e.sent();
                    return [2 /*return*/, {
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                            expiresIn: env_js_1.env.JWT_ACCESS_EXPIRES_IN,
                            user: {
                                id: user.id, name: user.name, email: user.email, role: user.role.code,
                                companyId: user.companyId,
                                store: { id: store.id, name: store.name, code: store.code },
                                availableStores: available.map(function (x) { return ({ id: x.store.id, name: x.store.name, code: x.store.code }); })
                            }
                        }];
            }
        });
    });
}
function refreshAccessToken(app, raw) {
    return __awaiter(this, void 0, void 0, function () {
        var token, store, accessToken;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, app.prisma.refreshToken.findUnique({
                        where: { tokenHash: (0, token_hash_js_1.hashToken)(raw) },
                        include: { user: { include: { role: true, stores: { include: { store: true } } } } }
                    })];
                case 1:
                    token = _b.sent();
                    if (!token || token.revokedAt || token.expiresAt <= new Date() || token.user.status !== "ACTIVE") {
                        throw new app_error_js_1.AppError("Refresh token inválido ou expirado.", 401, "INVALID_REFRESH_TOKEN");
                    }
                    store = (_a = token.user.stores.find(function (x) { return x.store.active; })) === null || _a === void 0 ? void 0 : _a.store;
                    if (!store)
                        throw new app_error_js_1.AppError("Usuário sem loja ativa vinculada.", 403, "NO_ACTIVE_STORE");
                    accessToken = app.jwt.sign({
                        sub: token.user.id, companyId: token.user.companyId, storeId: store.id,
                        role: token.user.role.code, type: "access"
                    }, { expiresIn: env_js_1.env.JWT_ACCESS_EXPIRES_IN });
                    return [2 /*return*/, { accessToken: accessToken, expiresIn: env_js_1.env.JWT_ACCESS_EXPIRES_IN }];
            }
        });
    });
}
function revokeRefreshToken(app, raw) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, app.prisma.refreshToken.updateMany({
                        where: { tokenHash: (0, token_hash_js_1.hashToken)(raw), revokedAt: null }, data: { revokedAt: new Date() }
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
