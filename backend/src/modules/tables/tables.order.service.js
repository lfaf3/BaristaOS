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
exports.getTableOrder = getTableOrder;
exports.addTableOrderItem = addTableOrderItem;
exports.updateTableOrderItem = updateTableOrderItem;
exports.deleteTableOrderItem = deleteTableOrderItem;
exports.closeTableOrder = closeTableOrder;
var app_error_js_1 = require("../../shared/errors/app-error.js");
function getTableOrder(app, storeId, tableId) {
    return __awaiter(this, void 0, void 0, function () {
        var table, order, openedAt;
        var _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, app.prisma.cafeTable.findFirst({
                        where: { id: tableId, storeId: storeId, active: true },
                        select: {
                            id: true,
                            number: true,
                            name: true,
                            status: true,
                            seats: true,
                            openedAt: true
                        }
                    })];
                case 1:
                    table = _g.sent();
                    if (!table) {
                        throw new app_error_js_1.AppError("Mesa não encontrada.", 404, "TABLE_NOT_FOUND");
                    }
                    if (table.status === "FREE" || table.status === "BLOCKED") {
                        throw new app_error_js_1.AppError("A mesa não possui uma comanda disponível.", 409, "TABLE_HAS_NO_ACTIVE_ORDER");
                    }
                    return [4 /*yield*/, app.prisma.order.findFirst({
                            where: { storeId: storeId, tableId: tableId, status: { in: ["OPEN", "PAID"] } },
                            orderBy: { openedAt: "desc" },
                            select: {
                                id: true,
                                status: true,
                                guestCount: true,
                                subtotal: true,
                                discount: true,
                                serviceChargeRate: true,
                                serviceCharge: true,
                                total: true,
                                openedAt: true,
                                notes: true,
                                payments: {
                                    where: { status: "APPROVED" },
                                    orderBy: { createdAt: "asc" },
                                    select: {
                                        id: true,
                                        method: true,
                                        amount: true,
                                        approvedAt: true
                                    }
                                },
                                items: {
                                    orderBy: { createdAt: "asc" },
                                    select: {
                                        id: true,
                                        quantity: true,
                                        unitPrice: true,
                                        totalPrice: true,
                                        notes: true,
                                        product: {
                                            select: {
                                                id: true,
                                                code: true,
                                                name: true
                                            }
                                        }
                                    }
                                }
                            }
                        })];
                case 2:
                    order = _g.sent();
                    openedAt = (_a = order === null || order === void 0 ? void 0 : order.openedAt) !== null && _a !== void 0 ? _a : table.openedAt;
                    return [2 /*return*/, {
                            table: {
                                id: table.id,
                                number: table.number,
                                name: table.name,
                                status: table.status,
                                seats: table.seats,
                                people: (_b = order === null || order === void 0 ? void 0 : order.guestCount) !== null && _b !== void 0 ? _b : 0,
                                openedAt: (_c = openedAt === null || openedAt === void 0 ? void 0 : openedAt.toISOString()) !== null && _c !== void 0 ? _c : null,
                                minutesOpen: openedAt
                                    ? Math.max(0, Math.floor((Date.now() - openedAt.getTime()) / 60000))
                                    : 0
                            },
                            order: order
                                ? {
                                    id: order.id,
                                    guestCount: order.guestCount,
                                    openedAt: order.openedAt.toISOString(),
                                    notes: order.notes,
                                    subtotal: Number(order.subtotal),
                                    discount: Number(order.discount),
                                    serviceChargePercentage: Number(order.serviceChargeRate),
                                    serviceCharge: Number(order.serviceCharge),
                                    total: Number(order.total),
                                    status: order.status
                                }
                                : null,
                            payments: (_d = order === null || order === void 0 ? void 0 : order.payments.map(function (payment) {
                                var _a, _b;
                                return ({
                                    id: payment.id,
                                    method: payment.method,
                                    amount: Number(payment.amount),
                                    approvedAt: (_b = (_a = payment.approvedAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null
                                });
                            })) !== null && _d !== void 0 ? _d : [],
                            paidAmount: (_e = order === null || order === void 0 ? void 0 : order.payments.reduce(function (sum, payment) { return sum + Number(payment.amount); }, 0)) !== null && _e !== void 0 ? _e : 0,
                            balance: order
                                ? Math.max(0, Number(order.total) - order.payments.reduce(function (sum, payment) { return sum + Number(payment.amount); }, 0))
                                : 0,
                            items: (_f = order === null || order === void 0 ? void 0 : order.items.map(function (item) { return ({
                                id: item.id,
                                productId: item.product.id,
                                code: item.product.code,
                                name: item.product.name,
                                quantity: item.quantity,
                                unitPrice: Number(item.unitPrice),
                                totalPrice: Number(item.totalPrice),
                                notes: item.notes
                            }); })) !== null && _f !== void 0 ? _f : [],
                            subtotal: order ? Number(order.subtotal) : 0,
                            discount: order ? Number(order.discount) : 0,
                            serviceChargePercentage: order ? Number(order.serviceChargeRate) : 0,
                            serviceCharge: order ? Number(order.serviceCharge) : 0,
                            total: order ? Number(order.total) : 0
                        }];
            }
        });
    });
}
function addTableOrderItem(app, companyId, storeId, operatorId, tableId, input) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, app.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                        var table, product, cashSession, order, unitPrice, normalizedNotes, existingItem, quantity, aggregate, subtotal, discount, total;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, tx.cafeTable.findFirst({
                                        where: { id: tableId, storeId: storeId, active: true },
                                        select: { id: true, status: true }
                                    })];
                                case 1:
                                    table = _c.sent();
                                    if (!table) {
                                        throw new app_error_js_1.AppError("Mesa não encontrada.", 404, "TABLE_NOT_FOUND");
                                    }
                                    if (table.status !== "OPEN") {
                                        throw new app_error_js_1.AppError("A mesa precisa estar em atendimento para receber produtos.", 409, "TABLE_NOT_OPEN");
                                    }
                                    return [4 /*yield*/, tx.product.findFirst({
                                            where: { id: input.productId, companyId: companyId, active: true },
                                            select: { id: true, price: true }
                                        })];
                                case 2:
                                    product = _c.sent();
                                    if (!product) {
                                        throw new app_error_js_1.AppError("Produto não encontrado ou inativo.", 404, "PRODUCT_NOT_FOUND");
                                    }
                                    return [4 /*yield*/, tx.cashSession.findFirst({
                                            where: { storeId: storeId, status: "OPEN" },
                                            orderBy: { openedAt: "desc" },
                                            select: { id: true }
                                        })];
                                case 3:
                                    cashSession = _c.sent();
                                    if (!cashSession) {
                                        throw new app_error_js_1.AppError("Abra o caixa antes de incluir produtos na comanda.", 409, "CASH_NOT_OPEN");
                                    }
                                    return [4 /*yield*/, tx.order.findFirst({
                                            where: { storeId: storeId, tableId: tableId, status: "OPEN" },
                                            orderBy: { openedAt: "desc" },
                                            select: { id: true, discount: true }
                                        })];
                                case 4:
                                    order = _c.sent();
                                    if (!!order) return [3 /*break*/, 6];
                                    return [4 /*yield*/, tx.order.create({
                                            data: {
                                                storeId: storeId,
                                                tableId: tableId,
                                                cashSessionId: cashSession.id,
                                                operatorId: operatorId,
                                                status: "OPEN"
                                            },
                                            select: { id: true, discount: true }
                                        })];
                                case 5:
                                    order = _c.sent();
                                    _c.label = 6;
                                case 6:
                                    unitPrice = Number(product.price);
                                    normalizedNotes = ((_a = input.notes) === null || _a === void 0 ? void 0 : _a.trim()) || null;
                                    return [4 /*yield*/, tx.orderItem.findFirst({
                                            where: {
                                                orderId: order.id,
                                                productId: product.id,
                                                notes: normalizedNotes
                                            },
                                            select: { id: true, quantity: true, unitPrice: true }
                                        })];
                                case 7:
                                    existingItem = _c.sent();
                                    if (!(existingItem && Number(existingItem.unitPrice) === unitPrice)) return [3 /*break*/, 9];
                                    quantity = existingItem.quantity + input.quantity;
                                    return [4 /*yield*/, tx.orderItem.update({
                                            where: { id: existingItem.id },
                                            data: { quantity: quantity, totalPrice: unitPrice * quantity }
                                        })];
                                case 8:
                                    _c.sent();
                                    return [3 /*break*/, 11];
                                case 9: return [4 /*yield*/, tx.orderItem.create({
                                        data: {
                                            orderId: order.id,
                                            productId: product.id,
                                            quantity: input.quantity,
                                            unitPrice: unitPrice,
                                            totalPrice: unitPrice * input.quantity,
                                            notes: normalizedNotes
                                        }
                                    })];
                                case 10:
                                    _c.sent();
                                    _c.label = 11;
                                case 11: return [4 /*yield*/, tx.orderItem.aggregate({
                                        where: { orderId: order.id },
                                        _sum: { totalPrice: true }
                                    })];
                                case 12:
                                    aggregate = _c.sent();
                                    subtotal = Number((_b = aggregate._sum.totalPrice) !== null && _b !== void 0 ? _b : 0);
                                    discount = Number(order.discount);
                                    total = Math.max(0, subtotal - discount);
                                    return [4 /*yield*/, tx.order.update({
                                            where: { id: order.id },
                                            data: { subtotal: subtotal, total: total }
                                        })];
                                case 13:
                                    _c.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, getTableOrder(app, storeId, tableId)];
            }
        });
    });
}
function recalculateOrderTotals(tx, orderId, discount) {
    return __awaiter(this, void 0, void 0, function () {
        var aggregate, subtotal, total;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, tx.orderItem.aggregate({
                        where: { orderId: orderId },
                        _sum: { totalPrice: true }
                    })];
                case 1:
                    aggregate = _b.sent();
                    subtotal = Number((_a = aggregate._sum.totalPrice) !== null && _a !== void 0 ? _a : 0);
                    total = Math.max(0, subtotal - discount);
                    return [4 /*yield*/, tx.order.update({
                            where: { id: orderId },
                            data: { subtotal: subtotal, total: total }
                        })];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function updateTableOrderItem(app, storeId, tableId, itemId, input) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, app.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                        var item, data;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, tx.orderItem.findFirst({
                                        where: {
                                            id: itemId,
                                            order: { tableId: tableId, storeId: storeId, status: "OPEN", table: { status: "OPEN" } }
                                        },
                                        select: {
                                            id: true,
                                            orderId: true,
                                            unitPrice: true,
                                            order: { select: { discount: true } }
                                        }
                                    })];
                                case 1:
                                    item = _b.sent();
                                    if (!item) {
                                        throw new app_error_js_1.AppError("Item não encontrado na comanda aberta desta mesa.", 404, "ORDER_ITEM_NOT_FOUND");
                                    }
                                    data = {};
                                    if (input.quantity !== undefined) {
                                        data.quantity = input.quantity;
                                        data.totalPrice = Number(item.unitPrice) * input.quantity;
                                    }
                                    if (input.notes !== undefined) {
                                        data.notes = ((_a = input.notes) === null || _a === void 0 ? void 0 : _a.trim()) || null;
                                    }
                                    return [4 /*yield*/, tx.orderItem.update({ where: { id: item.id }, data: data })];
                                case 2:
                                    _b.sent();
                                    return [4 /*yield*/, recalculateOrderTotals(tx, item.orderId, Number(item.order.discount))];
                                case 3:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, getTableOrder(app, storeId, tableId)];
            }
        });
    });
}
function deleteTableOrderItem(app, storeId, tableId, itemId) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, app.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                        var item;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.orderItem.findFirst({
                                        where: {
                                            id: itemId,
                                            order: { tableId: tableId, storeId: storeId, status: "OPEN", table: { status: "OPEN" } }
                                        },
                                        select: {
                                            id: true,
                                            orderId: true,
                                            order: { select: { discount: true } }
                                        }
                                    })];
                                case 1:
                                    item = _a.sent();
                                    if (!item) {
                                        throw new app_error_js_1.AppError("Item não encontrado na comanda aberta desta mesa.", 404, "ORDER_ITEM_NOT_FOUND");
                                    }
                                    return [4 /*yield*/, tx.orderItem.delete({ where: { id: item.id } })];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, recalculateOrderTotals(tx, item.orderId, Number(item.order.discount))];
                                case 3:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, getTableOrder(app, storeId, tableId)];
            }
        });
    });
}
function roundCurrency(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
function closeTableOrder(app, storeId, tableId, input) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, app.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                        var table, order, aggregate, subtotal, serviceCharge, maximumDiscount, discount, total, updatedTable;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, tx.cafeTable.findFirst({
                                        where: { id: tableId, storeId: storeId, active: true },
                                        select: { id: true, status: true }
                                    })];
                                case 1:
                                    table = _b.sent();
                                    if (!table) {
                                        throw new app_error_js_1.AppError("Mesa não encontrada.", 404, "TABLE_NOT_FOUND");
                                    }
                                    if (table.status !== "OPEN") {
                                        throw new app_error_js_1.AppError("A mesa precisa estar em atendimento para fechar a conta.", 409, "TABLE_NOT_OPEN");
                                    }
                                    return [4 /*yield*/, tx.order.findFirst({
                                            where: { storeId: storeId, tableId: tableId, status: "OPEN" },
                                            orderBy: { openedAt: "desc" },
                                            select: { id: true }
                                        })];
                                case 2:
                                    order = _b.sent();
                                    if (!order) {
                                        throw new app_error_js_1.AppError("A mesa não possui uma comanda aberta.", 409, "ORDER_NOT_FOUND");
                                    }
                                    return [4 /*yield*/, tx.orderItem.aggregate({
                                            where: { orderId: order.id },
                                            _sum: { totalPrice: true },
                                            _count: { id: true }
                                        })];
                                case 3:
                                    aggregate = _b.sent();
                                    if (aggregate._count.id === 0) {
                                        throw new app_error_js_1.AppError("Adicione ao menos um item antes de fechar a conta.", 409, "ORDER_HAS_NO_ITEMS");
                                    }
                                    subtotal = roundCurrency(Number((_a = aggregate._sum.totalPrice) !== null && _a !== void 0 ? _a : 0));
                                    serviceCharge = roundCurrency(subtotal * (input.serviceChargePercentage / 100));
                                    maximumDiscount = roundCurrency(subtotal + serviceCharge);
                                    if (input.discount > maximumDiscount) {
                                        throw new app_error_js_1.AppError("O desconto não pode ser maior que o valor da conta.", 422, "INVALID_DISCOUNT");
                                    }
                                    discount = roundCurrency(input.discount);
                                    total = roundCurrency(Math.max(0, subtotal + serviceCharge - discount));
                                    return [4 /*yield*/, tx.cafeTable.updateMany({
                                            where: { id: tableId, storeId: storeId, active: true, status: "OPEN" },
                                            data: { status: "PAYMENT" }
                                        })];
                                case 4:
                                    updatedTable = _b.sent();
                                    if (updatedTable.count === 0) {
                                        throw new app_error_js_1.AppError("A mesa foi alterada por outro operador. Atualize a comanda.", 409, "TABLE_CONCURRENT_UPDATE");
                                    }
                                    return [4 /*yield*/, tx.order.update({
                                            where: { id: order.id },
                                            data: {
                                                subtotal: subtotal,
                                                discount: discount,
                                                serviceChargeRate: input.serviceChargePercentage,
                                                serviceCharge: serviceCharge,
                                                total: total
                                            }
                                        })];
                                case 5:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, getTableOrder(app, storeId, tableId)];
            }
        });
    });
}
