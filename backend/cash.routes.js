"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTableStatusSchema = exports.tableParamsSchema = void 0;
var zod_1 = require("zod");
exports.tableParamsSchema = zod_1.z.object({ id: zod_1.z.string().uuid() });
exports.updateTableStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["FREE", "OPEN", "PAYMENT", "READY_TO_CLOSE", "BLOCKED"])
});
