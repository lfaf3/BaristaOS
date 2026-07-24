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
exports.registerOrderPayments = registerOrderPayments;
var app_error_js_1 = require("../../shared/errors/app-error.js");
function cents(value) {
    return Math.round(value * 100);
}
function registerOrderPayments(app, storeId, orderId, payments) {
    return __awaiter(this, void 0, void 0, function () {
        var tableId, getTableOrder;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, app.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                        var order, alreadyPaid, total, remaining, incoming, updatedOrder, updatedTable;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.order.findFirst({
                                        where: { id: orderId, storeId: storeId },
                                        select: {
                                            id: true,
                                            status: true,
                                            total: true,
                                            tableId: true,
                                            table: { select: { status: true } },
                                            payments: {
                                                where: { status: "APPROVED" },
                                                select: { amount: true }
                                            }
                                        }
                                    })];
                                case 1:
                                    order = _a.sent();
                                    if (!order) {
                                        throw new app_error_js_1.AppError("Comanda não encontrada.", 404, "ORDER_NOT_FOUND");
                                    }
                                    if (!order.tableId || !order.table) {
                                        throw new app_error_js_1.AppError("A comanda não está vinculada a uma mesa.", 409, "ORDER_WITHOUT_TABLE");
                                    }
                                    if (order.status !== "OPEN" || order.table.status !== "PAYMENT") {
                                        throw new app_error_js_1.AppError("A comanda precisa estar aguardando pagamento.", 409, "ORDER_NOT_AWAITING_PAYMENT");
                                    }
                                    alreadyPaid = order.payments.reduce(function (sum, payment) { return sum + cents(Number(payment.amount)); }, 0);
                                    total = cents(Number(order.total));
                                    remaining = total - alreadyPaid;
                                    incoming = payments.reduce(function (sum, payment) { return sum + cents(payment.amount); }, 0);
                                    if (remaining <= 0) {
                                        throw new app_error_js_1.AppError("A comanda já foi paga.", 409, "ORDER_ALREADY_PAID");
                                    }
                                    if (incoming > remaining) {
                                        throw new app_error_js_1.AppError("O valor informado é maior que o saldo da conta.", 422, "PAYMENT_EXCEEDS_BALANCE");
                                    }
                                    if (incoming < remaining) {
                                        throw new app_error_js_1.AppError("O pagamento precisa quitar todo o saldo. Para pagamento misto, informe todas as formas antes de confirmar.", 422, "PAYMENT_BELOW_BALANCE");
                                    }
                                    return [4 /*yield*/, tx.payment.createMany({
                                            data: payments.map(function (payment) { return ({
                                                orderId: order.id,
                                                method: payment.method,
                                                amount: payment.amount,
                                                status: "APPROVED",
                                                approvedAt: new Date()
                                            }); })
                                        })];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, tx.order.updateMany({
                                            where: { id: order.id, storeId: storeId, status: "OPEN" },
                                            data: { status: "PAID", closedAt: new Date() }
                                        })];
                                case 3:
                                    updatedOrder = _a.sent();
                                    if (updatedOrder.count === 0) {
                                        throw new app_error_js_1.AppError("A comanda foi alterada por outro operador.", 409, "ORDER_CONCURRENT_UPDATE");
                                    }
                                    return [4 /*yield*/, tx.cafeTable.updateMany({
                                            where: { id: order.tableId, storeId: storeId, status: "PAYMENT" },
                                            data: { status: "READY_TO_CLOSE" }
                                        })];
                                case 4:
                                    updatedTable = _a.sent();
                                    if (updatedTable.count === 0) {
                                        throw new app_error_js_1.AppError("A mesa foi alterada por outro operador.", 409, "TABLE_CONCURRENT_UPDATE");
                                    }
                                    return [2 /*return*/, order.tableId];
                            }
                        });
                    }); })];
                case 1:
                    tableId = _a.sent();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../tables/tables.order.service.js"); })];
                case 2:
                    getTableOrder = (_a.sent()).getTableOrder;
                    return [2 /*return*/, getTableOrder(app, storeId, tableId)];
            }
        });
    });
}
