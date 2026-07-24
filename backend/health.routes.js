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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = listProducts;
exports.getProduct = getProduct;
exports.addProduct = addProduct;
exports.editProduct = editProduct;
var app_error_js_1 = require("../../shared/errors/app-error.js");
var repository = require("./products.repository.js");
function normalize(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function serialize(product) {
    if (!product)
        return null;
    return __assign(__assign({}, product), { price: Number(product.price) });
}
function listProducts(app, companyId, input) {
    return __awaiter(this, void 0, void 0, function () {
        var products, query, filtered, start;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, repository.findProducts(app, companyId, input)];
                case 1:
                    products = _a.sent();
                    query = input.q ? normalize(input.q) : undefined;
                    filtered = query
                        ? products.filter(function (product) { return normalize(__spreadArray([
                            product.code, product.name, product.category.name
                        ], product.aliases, true).join(" ")).includes(query); })
                        : products;
                    start = (input.page - 1) * input.pageSize;
                    return [2 /*return*/, {
                            data: filtered.slice(start, start + input.pageSize).map(function (product) { return (__assign(__assign({}, product), { price: Number(product.price) })); }),
                            meta: { page: input.page, pageSize: input.pageSize, total: filtered.length }
                        }];
            }
        });
    });
}
function getProduct(app, companyId, id) {
    return __awaiter(this, void 0, void 0, function () {
        var product;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, repository.findProductById(app, companyId, id)];
                case 1:
                    product = _a.sent();
                    if (!product)
                        throw new app_error_js_1.AppError("Produto não encontrado.", 404, "PRODUCT_NOT_FOUND");
                    return [2 /*return*/, serialize(product)];
            }
        });
    });
}
function addProduct(app, companyId, input) {
    return __awaiter(this, void 0, void 0, function () {
        var product, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, repository.findCategory(app, companyId, input.categoryId)];
                case 1:
                    if (!(_a.sent())) {
                        throw new app_error_js_1.AppError("Categoria não encontrada.", 404, "CATEGORY_NOT_FOUND");
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, repository.createProduct(app, companyId, input)];
                case 3:
                    product = _a.sent();
                    return [2 /*return*/, __assign(__assign({}, product), { price: Number(product.price) })];
                case 4:
                    error_1 = _a.sent();
                    if (typeof error_1 === "object" && error_1 && "code" in error_1 && error_1.code === "P2002") {
                        throw new app_error_js_1.AppError("Já existe um produto com esse código.", 409, "PRODUCT_CODE_EXISTS");
                    }
                    throw error_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function editProduct(app, companyId, id, input) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, product, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getProduct(app, companyId, id)];
                case 1:
                    _b.sent();
                    _a = typeof input.categoryId === "string";
                    if (!_a) return [3 /*break*/, 3];
                    return [4 /*yield*/, repository.findCategory(app, companyId, input.categoryId)];
                case 2:
                    _a = !(_b.sent());
                    _b.label = 3;
                case 3:
                    if (_a) {
                        throw new app_error_js_1.AppError("Categoria não encontrada.", 404, "CATEGORY_NOT_FOUND");
                    }
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, repository.updateProduct(app, id, input)];
                case 5:
                    product = _b.sent();
                    return [2 /*return*/, __assign(__assign({}, product), { price: Number(product.price) })];
                case 6:
                    error_2 = _b.sent();
                    if (typeof error_2 === "object" && error_2 && "code" in error_2 && error_2.code === "P2002") {
                        throw new app_error_js_1.AppError("Já existe um produto com esse código.", 409, "PRODUCT_CODE_EXISTS");
                    }
                    throw error_2;
                case 7: return [2 /*return*/];
            }
        });
    });
}
