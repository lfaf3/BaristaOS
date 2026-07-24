"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = exports.productParamsSchema = exports.productListQuerySchema = void 0;
var zod_1 = require("zod");
exports.productListQuerySchema = zod_1.z.object({
    q: zod_1.z.string().trim().max(100).optional(),
    categoryId: zod_1.z.string().uuid().optional(),
    favorites: zod_1.z.coerce.boolean().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(200).default(50)
});
exports.productParamsSchema = zod_1.z.object({ id: zod_1.z.string().uuid() });
exports.createProductSchema = zod_1.z.object({
    categoryId: zod_1.z.string().uuid(),
    code: zod_1.z.string().trim().min(1).max(30),
    name: zod_1.z.string().trim().min(2).max(120),
    description: zod_1.z.string().trim().max(500).optional(),
    price: zod_1.z.coerce.number().positive().max(999999.99),
    aliases: zod_1.z.array(zod_1.z.string().trim().min(1).max(50)).max(20).default([]),
    favorite: zod_1.z.boolean().default(false)
});
exports.updateProductSchema = exports.createProductSchema.partial().refine(function (value) { return Object.keys(value).length > 0; }, "Informe ao menos um campo para atualização.");
