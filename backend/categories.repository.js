"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeTableOrderSchema = exports.updateOrderItemSchema = exports.addOrderItemSchema = exports.orderItemParamsSchema = void 0;
var zod_1 = require("zod");
exports.orderItemParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    itemId: zod_1.z.string().uuid()
});
exports.addOrderItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    quantity: zod_1.z.coerce.number().int().min(1).max(99),
    notes: zod_1.z.string().trim().max(300).optional()
});
exports.updateOrderItemSchema = zod_1.z
    .object({
    quantity: zod_1.z.coerce.number().int().min(1).max(99).optional(),
    notes: zod_1.z.string().trim().max(300).nullable().optional()
})
    .refine(function (input) { return input.quantity !== undefined || input.notes !== undefined; }, {
    message: "Informe a quantidade ou a observação."
});
exports.closeTableOrderSchema = zod_1.z.object({
    discount: zod_1.z.coerce.number().min(0).max(999999.99).default(0),
    serviceChargePercentage: zod_1.z.coerce.number().min(0).max(100).default(10)
});
