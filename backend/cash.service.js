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
exports.listTables = listTables;
exports.getTable = getTable;
exports.openTable = openTable;
exports.setTableStatus = setTableStatus;
var app_error_js_1 = require("../../shared/errors/app-error.js");
function mapTable(table) {
    var _a, _b, _c;
    var order = table.orders[0];
    var openedAt = (_a = order === null || order === void 0 ? void 0 : order.openedAt) !== null && _a !== void 0 ? _a : table.openedAt;
    return {
        id: table.id,
        number: table.number,
        name: table.name,
        status: table.status,
        seats: table.seats,
        people: (_b = order === null || order === void 0 ? void 0 : order.guestCount) !== null && _b !== void 0 ? _b : 0,
        items: (_c = order === null || order === void 0 ? void 0 : order.items.reduce(function (sum, item) { return sum + item.quantity; }, 0)) !== null && _c !== void 0 ? _c : 0,
        total: order ? Number(order.total) : 0,
        minutesOpen: openedAt
            ? Math.max(0, Math.floor((Date.now() - openedAt.getTime()) / 60000))
            : 0
    };
}
var includeOpenOrder = {
    orders: {
        where: { status: { in: ["OPEN", "PAID"] } },
        take: 1,
        orderBy: { openedAt: "desc" },
        select: {
            openedAt: true,
            guestCount: true,
            total: true,
            items: { select: { quantity: true } }
        }
    }
};
function listTables(app, storeId) {
    return __awaiter(this, void 0, void 0, function () {
        var tables;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, app.prisma.cafeTable.findMany({
                        where: { storeId: storeId, active: true },
                        include: includeOpenOrder,
                        orderBy: { number: "asc" }
                    })];
                case 1:
                    tables = _a.sent();
                    return [2 /*return*/, tables.map(mapTable)];
            }
        });
    });
}
function getTable(app, storeId, id) {
    return __awaiter(this, void 0, void 0, function () {
        var table;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, app.prisma.cafeTable.findFirst({
                        where: { id: id, storeId: storeId, active: true },
                        include: includeOpenOrder
                    })];
                case 1:
                    table = _a.sent();
                    if (!table) {
                        throw new app_error_js_1.AppError("Mesa não encontrada.", 404, "TABLE_NOT_FOUND");
                    }
                    return [2 /*return*/, mapTable(table)];
            }
        });
    });
}
function openTable(app, storeId, id) {
    return __awaiter(this, void 0, void 0, function () {
        var table, updated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, app.prisma.cafeTable.findFirst({
                        where: { id: id, storeId: storeId, active: true },
                        select: { id: true, status: true }
                    })];
                case 1:
                    table = _a.sent();
                    if (!table) {
                        throw new app_error_js_1.AppError("Mesa não encontrada.", 404, "TABLE_NOT_FOUND");
                    }
                    if (table.status !== "FREE") {
                        throw new app_error_js_1.AppError("A mesa não está disponível para abertura.", 409, "TABLE_NOT_FREE");
                    }
                    return [4 /*yield*/, app.prisma.cafeTable.updateMany({
                            where: { id: id, storeId: storeId, active: true, status: "FREE" },
                            data: { status: "OPEN", openedAt: new Date() }
                        })];
                case 2:
                    updated = _a.sent();
                    if (updated.count === 0) {
                        throw new app_error_js_1.AppError("A mesa foi alterada por outro operador. Atualize o mapa de mesas.", 409, "TABLE_CONCURRENT_UPDATE");
                    }
                    return [2 /*return*/, getTable(app, storeId, id)];
            }
        });
    });
}
function setTableStatus(app, storeId, id, status) {
    return __awaiter(this, void 0, void 0, function () {
        var openOrder, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTable(app, storeId, id)];
                case 1:
                    _a.sent();
                    if (!(status === "FREE")) return [3 /*break*/, 3];
                    return [4 /*yield*/, app.prisma.order.findFirst({
                            where: { storeId: storeId, tableId: id, status: "OPEN" }
                        })];
                case 2:
                    openOrder = _a.sent();
                    if (openOrder) {
                        throw new app_error_js_1.AppError("A mesa possui pedido aberto e não pode ser liberada manualmente.", 409, "TABLE_HAS_OPEN_ORDER");
                    }
                    _a.label = 3;
                case 3:
                    data = { status: status };
                    if (status === "FREE")
                        data.openedAt = null;
                    return [4 /*yield*/, app.prisma.cafeTable.update({
                            where: { id: id },
                            data: data
                        })];
                case 4:
                    _a.sent();
                    return [2 /*return*/, getTable(app, storeId, id)];
            }
        });
    });
}
