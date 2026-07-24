"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPaymentsSchema = exports.orderPaymentParamsSchema = void 0;
var zod_1 = require("zod");
exports.orderPaymentParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid()
});
var paymentSchema = zod_1.z.object({
    method: zod_1.z.enum(["CASH", "PIX", "TEF_CREDIT", "TEF_DEBIT", "COURTESY"]),
    amount: zod_1.z.coerce.number().positive().max(999999.99)
});
exports.registerPaymentsSchema = zod_1.z.object({
    payments: zod_1.z.array(paymentSchema).min(1).max(10)
});
