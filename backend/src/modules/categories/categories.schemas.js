"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategorySchema = void 0;
var zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(80),
    code: zod_1.z.string().trim().min(2).max(30).transform(function (value) { return value.toUpperCase(); }),
    sortOrder: zod_1.z.coerce.number().int().min(0).default(0)
});
