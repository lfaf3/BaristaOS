"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeCashSchema = exports.openCashSchema = void 0;
var zod_1 = require("zod");
exports.openCashSchema = zod_1.z.object({
    openingAmount: zod_1.z.coerce.number().min(0).max(999999.99),
    note: zod_1.z.string().trim().max(300).optional()
});
exports.closeCashSchema = zod_1.z.object({
    closingAmount: zod_1.z.coerce.number().min(0).max(999999.99),
    note: zod_1.z.string().trim().max(300).optional()
});
