"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSchema = exports.loginSchema = void 0;
var zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email().transform(function (v) { return v.toLowerCase(); }),
    password: zod_1.z.string().min(4),
    storeId: zod_1.z.string().uuid().optional()
});
exports.refreshSchema = zod_1.z.object({ refreshToken: zod_1.z.string().min(20) });
