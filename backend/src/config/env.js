"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
var zod_1 = require("zod");
var schema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    HOST: zod_1.z.string().default("0.0.0.0"),
    PORT: zod_1.z.coerce.number().int().positive().default(3333),
    LOG_LEVEL: zod_1.z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
    DATABASE_URL: zod_1.z.string().min(1),
    JWT_ACCESS_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default("7d"),
    CORS_ORIGIN: zod_1.z.string().default("http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174")
});
var parsed = schema.safeParse(process.env);
if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Configuração de ambiente inválida.");
}
exports.env = parsed.data;
