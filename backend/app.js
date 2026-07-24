"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
require("dotenv/config");
var adapter_pg_1 = require("@prisma/adapter-pg");
var client_js_1 = require("../src/generated/prisma/client.js");
var password_js_1 = require("../src/shared/security/password.js");
if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL não definida.");
var prisma = new client_js_1.PrismaClient({ adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }) });
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var company, store, _i, _a, role, adminRole, user, _b, _c, cats, _d, cats_1, category, cafes, salgados, _e, _f, p, number;
        var _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0: return [4 /*yield*/, prisma.company.upsert({
                        where: { document: "34322244000102" }, update: {},
                        create: { name: "DM Caffe Ltda", tradeName: "DM Caffè", document: "34322244000102" }
                    })];
                case 1:
                    company = _j.sent();
                    return [4 /*yield*/, prisma.store.upsert({
                            where: { companyId_code: { companyId: company.id, code: "JP-01" } }, update: {},
                            create: { companyId: company.id, name: "DM Caffè — Loja Principal", code: "JP-01" }
                        })];
                case 2:
                    store = _j.sent();
                    _i = 0, _a = [
                        { code: client_js_1.RoleCode.ADMIN, name: "Administrador" },
                        { code: client_js_1.RoleCode.MANAGER, name: "Gerente" },
                        { code: client_js_1.RoleCode.CASHIER, name: "Caixa" },
                        { code: client_js_1.RoleCode.BARISTA, name: "Barista" }
                    ];
                    _j.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    role = _a[_i];
                    return [4 /*yield*/, prisma.role.upsert({ where: { code: role.code }, update: { name: role.name }, create: role })];
                case 4:
                    _j.sent();
                    _j.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, prisma.role.findUniqueOrThrow({ where: { code: client_js_1.RoleCode.ADMIN } })];
                case 7:
                    adminRole = _j.sent();
                    _c = (_b = prisma.user).upsert;
                    _g = {
                        where: { companyId_email: { companyId: company.id, email: "admin@dmcaffe.com.br" } }, update: {}
                    };
                    _h = {
                        companyId: company.id, roleId: adminRole.id, name: "Luis F.",
                        email: "admin@dmcaffe.com.br"
                    };
                    return [4 /*yield*/, (0, password_js_1.hashPassword)("BaristaOS@123")];
                case 8: return [4 /*yield*/, _c.apply(_b, [(_g.create = (_h.passwordHash = _j.sent(),
                            _h),
                            _g)])];
                case 9:
                    user = _j.sent();
                    return [4 /*yield*/, prisma.userStore.upsert({
                            where: { userId_storeId: { userId: user.id, storeId: store.id } }, update: {},
                            create: { userId: user.id, storeId: store.id }
                        })];
                case 10:
                    _j.sent();
                    cats = [
                        { code: "CAFES", name: "Cafés", sortOrder: 1 },
                        { code: "SALGADOS", name: "Salgados", sortOrder: 2 },
                        { code: "DOCES", name: "Doces", sortOrder: 3 },
                        { code: "BEBIDAS", name: "Bebidas", sortOrder: 4 }
                    ];
                    _d = 0, cats_1 = cats;
                    _j.label = 11;
                case 11:
                    if (!(_d < cats_1.length)) return [3 /*break*/, 14];
                    category = cats_1[_d];
                    return [4 /*yield*/, prisma.category.upsert({
                            where: { companyId_code: { companyId: company.id, code: category.code } },
                            update: category, create: __assign({ companyId: company.id }, category)
                        })];
                case 12:
                    _j.sent();
                    _j.label = 13;
                case 13:
                    _d++;
                    return [3 /*break*/, 11];
                case 14: return [4 /*yield*/, prisma.category.findUniqueOrThrow({ where: { companyId_code: { companyId: company.id, code: "CAFES" } } })];
                case 15:
                    cafes = _j.sent();
                    return [4 /*yield*/, prisma.category.findUniqueOrThrow({ where: { companyId_code: { companyId: company.id, code: "SALGADOS" } } })];
                case 16:
                    salgados = _j.sent();
                    _e = 0, _f = [
                        { code: "1001", name: "Espresso", categoryId: cafes.id, price: "5.00", aliases: ["expresso", "cafe curto"], favorite: true },
                        { code: "1003", name: "Cappuccino", categoryId: cafes.id, price: "9.00", aliases: ["cap", "capp"], favorite: true },
                        { code: "2001", name: "Pão de Queijo", categoryId: salgados.id, price: "7.00", aliases: ["pq", "pao", "queijo"], favorite: true },
                        { code: "2002", name: "Croissant", categoryId: salgados.id, price: "14.00", aliases: ["croa"], favorite: true }
                    ];
                    _j.label = 17;
                case 17:
                    if (!(_e < _f.length)) return [3 /*break*/, 20];
                    p = _f[_e];
                    return [4 /*yield*/, prisma.product.upsert({
                            where: { companyId_code: { companyId: company.id, code: p.code } },
                            update: p, create: __assign({ companyId: company.id }, p)
                        })];
                case 18:
                    _j.sent();
                    _j.label = 19;
                case 19:
                    _e++;
                    return [3 /*break*/, 17];
                case 20:
                    number = 1;
                    _j.label = 21;
                case 21:
                    if (!(number <= 16)) return [3 /*break*/, 24];
                    return [4 /*yield*/, prisma.cafeTable.upsert({
                            where: { storeId_number: { storeId: store.id, number: number } }, update: {},
                            create: { storeId: store.id, number: number, seats: 4 }
                        })];
                case 22:
                    _j.sent();
                    _j.label = 23;
                case 23:
                    number++;
                    return [3 /*break*/, 21];
                case 24:
                    console.log("Seed concluído.");
                    console.log("Login: admin@dmcaffe.com.br");
                    console.log("Senha: BaristaOS@123");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (e) { console.error(e); process.exitCode = 1; }).finally(function () { return prisma.$disconnect(); });
